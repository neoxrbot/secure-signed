export async function recordHit(db, extraStats = {}) {
   const today = new Date().toISOString().split('T')[0]
   const query = `
    INSERT INTO stats (key, value) VALUES (?1, ?2)
    ON CONFLICT(key) DO UPDATE SET value = CAST(CAST(stats.value AS INTEGER) + CAST(excluded.value AS INTEGER) AS TEXT)
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

export async function createShortUrl(db, id, url) {
   const createdAt = Math.floor(Date.now() / 1000)

   await db.prepare(
      'INSERT INTO urls (id, url, views, created_at) VALUES (?1, ?2, 0, ?3)'
   ).bind(id, url, createdAt).run()

   await recordHit(db, { 'stats:total_shorts': 1 })
}

export async function getShortUrl(db, id) {
   return db.prepare('SELECT url FROM urls WHERE id = ?1').bind(id).first()
}

export async function incrementShortUrlView(db, id) {
   await db.prepare('UPDATE urls SET views = views + 1 WHERE id = ?1').bind(id).run()
   await recordHit(db, { 'stats:total_views': 1 })
}

export async function createSignedCdn(db, { token, targetUrl, filename, customHeaders, maxBytes, expiredAt }) {
   const now = Math.floor(Date.now() / 1000)
   const exp = expiredAt > 1e11 ? Math.floor(expiredAt / 1000) : expiredAt

   await db.prepare(
      `INSERT INTO signed_cdn (token, target_url, filename, custom_headers, max_bytes, created_at, expired_at) 
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
   ).bind(
      token,
      targetUrl,
      filename || '',
      customHeaders ? JSON.stringify(customHeaders) : '',
      maxBytes,
      now,
      exp
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

export async function cleanExpiredCdn(db) {
   const now = Math.floor(Date.now() / 1000)
   return db.prepare('DELETE FROM signed_cdn WHERE expired_at <= ?1').bind(now).run()
}

export async function cleanOldUrls(db, retentionDays = 30) {
   const cutoffTime = Math.floor(Date.now() / 1000) - (retentionDays * 86400)
   return db.prepare('DELETE FROM urls WHERE created_at <= ?1').bind(cutoffTime).run()
}

export async function cleanDatabase(db, urlRetentionDays = 30) {
   const cdnRes = await cleanExpiredCdn(db)
   const urlRes = await cleanOldUrls(db, urlRetentionDays)
   await cleanOldStats(db)

   return {
      deletedCdn: cdnRes.meta?.changes || 0,
      deletedUrls: urlRes.meta?.changes || 0
   }
}

export async function createNote(db, { id, title, content, isPrivate }) {
   const now = Math.floor(Date.now() / 1000)
   await db.prepare(
      'INSERT INTO notes (id, title, content, is_private, reads, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, 0, ?5, ?5)'
   ).bind(id, title, content, isPrivate ? 1 : 0, now).run()
   return getNoteById(db, id)
}

export async function listNotes(db, { includePrivate = false, limit = 20, offset = 0 } = {}) {
   const query = includePrivate
      ? 'SELECT id, title, content, is_private, reads, created_at, updated_at FROM notes ORDER BY created_at DESC LIMIT ?1 OFFSET ?2'
      : 'SELECT id, title, content, is_private, reads, created_at, updated_at FROM notes WHERE is_private = 0 ORDER BY created_at DESC LIMIT ?1 OFFSET ?2'
   const { results } = await db.prepare(query).bind(limit, offset).all()
   return results || []
}

export async function countNotes(db, { includePrivate = false } = {}) {
   const query = includePrivate
      ? 'SELECT COUNT(*) AS total FROM notes'
      : 'SELECT COUNT(*) AS total FROM notes WHERE is_private = 0'
   const row = await db.prepare(query).first()
   return Number(row?.total || 0)
}

export async function getNoteById(db, id) {
   return db.prepare('SELECT id, title, content, is_private, reads, created_at, updated_at FROM notes WHERE id = ?1').bind(id).first()
}

export async function updateNote(db, id, { title, content, isPrivate }) {
   const now = Math.floor(Date.now() / 1000)
   await db.prepare(
      'UPDATE notes SET title = ?1, content = ?2, is_private = ?3, updated_at = ?4 WHERE id = ?5'
   ).bind(title, content, isPrivate ? 1 : 0, now, id).run()
   return getNoteById(db, id)
}

export async function deleteNote(db, id) {
   return db.prepare('DELETE FROM notes WHERE id = ?1').bind(id).run()
}

export async function incrementNoteReads(db, id) {
   return db.prepare('UPDATE notes SET reads = reads + 1 WHERE id = ?1').bind(id).run()
}

export async function getWeeklyStats(db) {
   const { results } = await db.prepare(
      "SELECT key, value FROM stats WHERE key LIKE 'stats:hits:%'"
   ).all()

   const statsMap = {}
      (results || []).forEach(r => { statsMap[r.key] = parseInt(r.value || '0', 10) })

   const days = []
   const now = new Date()

   for (let i = 7; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
      const key = `stats:hits:${dateStr}`

      days.push({
         date: dateStr,
         day: dayName,
         hits: statsMap[key] || 0
      })
   }

   return days
}

export async function cleanOldStats(db) {
   const cutoff = new Date()
   cutoff.setDate(cutoff.getDate() - 8)
   const cutoffStr = `stats:hits:${cutoff.toISOString().split('T')[0]}`

   return db.prepare(
      "DELETE FROM stats WHERE key LIKE 'stats:hits:%' AND key < ?"
   ).bind(cutoffStr).run()
}