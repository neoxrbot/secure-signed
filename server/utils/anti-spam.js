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
 * Rate-limit tracking for visitor statistics. Kept separate from the API
 * request map so that page views are validated independently.
 * @type {Object<string, {count:number, resetAt:number}>}
 */
const visitorMap = {}

/**
 * IPs temporarily excluded from visitor statistics because they flooded.
 * @type {Map<string, number>}
 */
const visitorBlockedIps = new Map()

/**
 * Cached whitelist set loaded from D1 to avoid a DB round-trip per request.
 * @type {{ set: Set<string>, ts: number }}
 */
let whitelistCache = { set: new Set(), ts: 0 }
const WHITELIST_TTL = 30 * 1000
const BLOCK_DURATION_MS = 10 * 60 * 1000

const VISITOR_WINDOW_MS = 60 * 1000
const VISITOR_BLOCK_MS = 10 * 60 * 1000
const DEFAULT_VISITOR_LIMIT = 60
let lastVisitorCleanup = 0

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
 * Removes expired entries from the visitor rate-limit map to keep memory
 * usage bounded.
 * @param {number} now
 */
function cleanupVisitorMap(now) {
   if (now - lastVisitorCleanup < VISITOR_WINDOW_MS) return
   lastVisitorCleanup = now

   for (const [ip, record] of Object.entries(visitorMap)) {
      if (now > record.resetAt) delete visitorMap[ip]
   }

   for (const [ip, expiry] of visitorBlockedIps) {
      if (now > expiry) visitorBlockedIps.delete(ip)
   }
}

/**
 * Checks whether a request from the given IP exceeds the visitor rate limit.
 * @param {string} ip
 * @param {number} limit
 * @returns {boolean} true when the IP is flooding.
 */
function isVisitorRateLimited(ip, limit) {
   const now = Date.now()
   cleanupVisitorMap(now)

   const record = visitorMap[ip]

   if (!record || now > record.resetAt) {
      visitorMap[ip] = { count: 1, resetAt: now + VISITOR_WINDOW_MS }
      return false
   }

   record.count++
   return record.count > limit
}

/**
 * Validates whether a request should be counted as a visitor. Flood requests
 * (and IPs that are already blocked by the API anti-spam gate) return false,
 * so they are never written to the stats table.
 * @param {import('h3').H3Event} event
 * @returns {Promise<boolean>}
 */
export async function isValidVisitor(event) {
   try {
      const ip = getClientIp(event)
      if (!ip) return false

      const now = Date.now()

      // Ignore IPs that are temporarily blocked for flooding.
      const visitorExpiry = visitorBlockedIps.get(ip)
      if (visitorExpiry) {
         if (now < visitorExpiry) return false
         visitorBlockedIps.delete(ip)
      }

      // Ignore IPs blocked by the API anti-spam middleware.
      const apiExpiry = blockedIps.get(ip)
      if (apiExpiry) {
         if (now < apiExpiry) return false
         blockedIps.delete(ip)
      }

      const env = getCloudflareEnv(event) || {}
      const db = env.DB

      // Whitelisted IPs are always considered valid visitors.
      const whitelist = await loadWhitelist(db)
      if (whitelist.has(ip)) return true

      const rawLimit = env.VISITOR_RATE_LIMIT || process.env.VISITOR_RATE_LIMIT || DEFAULT_VISITOR_LIMIT
      const parsedLimit = parseInt(rawLimit, 10)
      const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : DEFAULT_VISITOR_LIMIT

      if (isVisitorRateLimited(ip, limit)) {
         visitorBlockedIps.set(ip, now + VISITOR_BLOCK_MS)
         return false
      }

      return true
   } catch (e) {
      // Never drop legitimate statistics because of an internal error.
      console.error('Error occurred while validating visitor:', e)
      return true
   }
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
