// server/utils/database.js

/**
 * Catat statistik global (hits total, daily hits, total files, total download, dll)
 */
export async function recordHit(db, extraStats = {}) {
   const today = new Date().toISOString().split('T')[0]
   const query = `
    INSERT INTO stats (key, value) VALUES (?1, ?2)
    ON CONFLICT(key) DO UPDATE SET value = CAST(CAST(value AS INTEGER) + ?2 AS TEXT)
  `
   const batch = [
      db.prepare(query).bind('stats:total_hits', '1'),
      db.prepare(query).bind(`stats:hits:${today}`, '1')
   ]

   for (const [key, val] of Object.entries(extraStats)) {
      if (val !== undefined && val !== null) {
         batch.push(db.prepare(query).bind(key, val.toString()))
      }
   }

   return db.batch(batch)
}

/**
 * Ambil semua data statistik global
 */
export async function getGlobalStats(db) {
   const today = new Date().toISOString().split('T')[0]
   const { results } = await db.prepare(
      'SELECT key, value FROM stats WHERE key IN (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)'
   ).bind(
      'stats:total_files',
      'stats:total_files_size',
      'stats:total_shorts',
      'stats:total_views',
      'stats:total_proxied',
      'stats:total_download_size',
      'stats:total_hits',
      `stats:hits:${today}`
   ).all()

   const statsMap = {}
   results.forEach(row => { statsMap[row.key] = row.value })

   return {
      total_files: parseInt(statsMap['stats:total_files'] || '0', 10),
      total_files_size: parseInt(statsMap['stats:total_files_size'] || '0', 10),
      total_shorts: parseInt(statsMap['stats:total_shorts'] || '0', 10),
      total_views: parseInt(statsMap['stats:total_views'] || '0', 10),
      total_proxied: parseInt(statsMap['stats:total_proxied'] || '0', 10),
      total_download_size: parseInt(statsMap['stats:total_download_size'] || '0', 10),
      total_hits: parseInt(statsMap['stats:total_hits'] || '0', 10),
      hits_today: parseInt(statsMap[`stats:hits:${today}`] || '0', 10)
   }
}

// --- URL SHORTENER ---
export async function createShortUrl(db, id, url) {
   await db.prepare(
      'INSERT INTO urls (id, url, views, created_at) VALUES (?1, ?2, 0, ?3)'
   ).bind(id, url, Date.now()).run()

   await recordHit(db, { 'stats:total_shorts': 1 })
}

export async function getShortUrl(db, id) {
   return db.prepare('SELECT url FROM urls WHERE id = ?1').bind(id).first()
}

export async function incrementShortUrlView(db, id) {
   await db.prepare('UPDATE urls SET views = views + 1 WHERE id = ?1').bind(id).run()
   await recordHit(db, { 'stats:total_views': 1 })
}

// --- SIGNED PROXY CDN ---
export async function createSignedCdn(db, { token, targetUrl, filename, customHeaders, maxBytes, expiredAt }) {
   await db.prepare(
      `INSERT INTO signed_cdn (token, target_url, filename, custom_headers, max_bytes, created_at, expired_at) 
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
   ).bind(
      token,
      targetUrl,
      filename || '',
      customHeaders ? JSON.stringify(customHeaders) : '',
      maxBytes,
      Date.now(),
      expiredAt
   ).run()
}

export async function getSignedCdn(db, token) {
   return db.prepare('SELECT * FROM signed_cdn WHERE token = ?1').bind(token).first()
}

export async function recordCdnDownload(db, token, bytes) {
   await db.prepare(
      'UPDATE signed_cdn SET hits = hits + 1, download_bytes = download_bytes + ?1 WHERE token = ?2'
   ).bind(bytes || 0, token).run()

   await recordHit(db, {
      'stats:total_proxied': 1,
      'stats:total_download_size': bytes || 0
   })
}
// --- ADMIN NOTES ---
export async function createNote(db, { id, title, content, isPrivate }) {
   const now = Date.now()
   await db.prepare(
      'INSERT INTO notes (id, title, content, is_private, reads, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, 0, ?5, ?5)'
   ).bind(id, title, content, isPrivate ? 1 : 0, now).run()
   return getNoteById(db, id)
}

export async function listNotes(db, { includePrivate = false, limit = 20 } = {}) {
   const query = includePrivate
      ? 'SELECT id, title, content, is_private, reads, created_at, updated_at FROM notes ORDER BY created_at DESC LIMIT ?1'
      : 'SELECT id, title, content, is_private, reads, created_at, updated_at FROM notes WHERE is_private = 0 ORDER BY created_at DESC LIMIT ?1'
   const { results } = await db.prepare(query).bind(limit).all()
   return results || []
}

export async function getNoteById(db, id) {
   return db.prepare('SELECT id, title, content, is_private, reads, created_at, updated_at FROM notes WHERE id = ?1').bind(id).first()
}

export async function updateNote(db, id, { title, content, isPrivate }) {
   await db.prepare(
      'UPDATE notes SET title = ?1, content = ?2, is_private = ?3, updated_at = ?4 WHERE id = ?5'
   ).bind(title, content, isPrivate ? 1 : 0, Date.now(), id).run()
   return getNoteById(db, id)
}

export async function deleteNote(db, id) {
   return db.prepare('DELETE FROM notes WHERE id = ?1').bind(id).run()
}

export async function incrementNoteReads(db, id) {
   return db.prepare('UPDATE notes SET reads = reads + 1 WHERE id = ?1').bind(id).run()
}
