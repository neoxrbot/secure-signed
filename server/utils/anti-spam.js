import { getCloudflareEnv } from './index.js'
import { CloudflareIPBlocker } from './cloudflare.js'
import { getWhitelistSet } from './database.js'

/**
 * Local cache of temporarily blocked IPs with their expiration timestamps (TTL).
 * @type {Map<string, number>}
 */
const blockedIps = new Map()

/**
 * Rate-limit tracking per IP: request counters within a rolling window.
 * @type {Object<string, {count:number, resetAt:number}>}
 */
const requestMap = {}

/**
 * Cached whitelist set loaded from D1 to avoid a DB round-trip per request.
 * @type {{ set: Set<string>, ts: number }}
 */
let whitelistCache = { set: new Set(), ts: 0 }
const WHITELIST_TTL = 30 * 1000
const BLOCK_DURATION_MS = 10 * 60 * 1000

/**
 * Reads the real client IP from Cloudflare / proxy headers.
 * @param {import('h3').H3Event} event
 * @returns {string|null}
 */
export function getClientIp(event) {
   const ip = getHeader(event, 'cf-connecting-ip')
      || getHeader(event, 'x-real-ip')
      || getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
      || getHeader(event, 'cf-connecting-ipv6')

   if (!ip) return null
   return String(ip).trim()
}

/**
 * Loads (and caches) the whitelist set from D1.
 * @param {D1Database} db
 * @returns {Promise<Set<string>>}
 */
async function loadWhitelist(db) {
   const now = Date.now()
   if (db && now - whitelistCache.ts < WHITELIST_TTL) {
      return whitelistCache.set
   }
   if (!db) return new Set()

   try {
      const set = await getWhitelistSet(db)
      whitelistCache = { set, ts: now }
      return set
   } catch {
      return whitelistCache.set || new Set()
   }
}

/**
 * Invalidates the in-memory whitelist cache so changes take effect immediately.
 */
export function invalidateWhitelistCache() {
   whitelistCache = { set: new Set(), ts: 0 }
}

/**
 * Main anti-spam gate. Returns a truthy response (blocked) or undefined to continue.
 * @param {import('h3').H3Event} event
 * @returns {Promise<any|undefined>}
 */
export async function antiSpam(event) {
   try {
      const ip = getClientIp(event)
      if (!ip) return

      const env = getCloudflareEnv(event) || {}
      const db = env.DB

      // Local temporary block list
      const expiry = blockedIps.get(ip)
      if (expiry) {
         if (Date.now() < expiry) {
            return {
               status: 403,
               body: {
                  creator: '@neoxr.js - Wildan Izzudin',
                  status: false,
                  msg: 'IP is blocked'
               }
            }
         }
         blockedIps.delete(ip)
      }

      // Whitelist bypass (D1-backed, cached)
      const whitelist = await loadWhitelist(db)
      if (whitelist.has(ip)) return

      // Rate-window spam detection
      const blocker = new CloudflareIPBlocker(env.CF_API_TOKEN, env.CF_ZONE_ID)
      const limit = env.REQUEST_LIMIT || process.env.REQUEST_LIMIT || 60

      if (blocker.detectSpam(ip, requestMap, limit)) {
         blockedIps.set(ip, Date.now() + BLOCK_DURATION_MS)

         if (blocker.isConfigured()) {
            const blockPromise = blocker.blockIP(ip, 'Automatically blocked due to suspicious activity')
               .catch(err => console.error('Failed to trigger Cloudflare block:', err))
            try {
               event.waitUntil(blockPromise)
            } catch {
               // waitUntil not available; fire and forget
            }
         }

         return {
            status: 403,
            body: {
               creator: '@neoxr.js - Wildan Izzudin',
               status: false,
               msg: 'Automatically blocked due to suspicious activity'
            }
         }
      }
   } catch (e) {
      console.error('Error occurred in anti-spam middleware:', e)
   }
}
