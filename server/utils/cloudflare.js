export function getCloudflareEnv(event) {
   return event.context?.cloudflare?.env || event.context?.env || globalThis.__env__ || {}
}
