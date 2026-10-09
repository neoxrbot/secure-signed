/**
 * Cloudflare Firewall integration for automatic IP blocking (anti-spam).
 * Adapted from the webapi project to run inside Nitro / Cloudflare Workers
 * using the global fetch API instead of axios.
 */
export class CloudflareIPBlocker {
   /**
    * @param {string} apiToken - API token with firewall write permission.
    * @param {string} zoneId - Cloudflare Zone ID where rules are applied.
    */
   constructor(apiToken, zoneId) {
      this.apiToken = apiToken
      this.zoneId = zoneId
      this.apiBase = `https://api.cloudflare.com/client/v4/zones/${zoneId}/firewall/access_rules/rules`
   }

   /**
    * Whether the blocker has enough credentials to talk to Cloudflare.
    * @returns {boolean}
    */
   isConfigured() {
      return !!(this.apiToken && this.zoneId)
   }

   /**
    * Blocks an IP address using Cloudflare's firewall API.
    * @param {string} ip
    * @param {string} [note]
    * @returns {Promise<Object|undefined>}
    */
   async blockIP(ip, note = 'Blocked due to spam') {
      try {
         const res = await fetch(this.apiBase, {
            method: 'POST',
            headers: {
               Authorization: `Bearer ${this.apiToken}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               mode: 'block',
               configuration: {
                  target: 'ip',
                  value: ip
               },
               notes: note
            })
         })

         const data = await res.json().catch(() => ({}))

         if (!data.success) {
            console.error('Failed to block IP:', data.errors)
         } else {
            console.log(`Blocked IP: ${ip}`)
         }

         return data
      } catch (error) {
         console.error('Request error:', error?.message || error)
      }
   }

   /**
    * Detects potential spam activity based on request frequency per IP
    * within a rolling 1 minute window.
    * @param {string} ip
    * @param {Object<string, {count:number, resetAt:number}>} requestMap
    * @param {number} [threshold]
    * @returns {boolean} true if the request count exceeds the threshold.
    */
   detectSpam(ip, requestMap, threshold) {
      const now = Date.now()
      const limit = parseInt(threshold || process.env.REQUEST_LIMIT || 60, 10)
      const windowMs = 60000

      const record = requestMap[ip]

      if (!record || now > record.resetAt) {
         requestMap[ip] = { count: 1, resetAt: now + windowMs }
         return false
      }

      record.count++
      return record.count > limit
   }
}
