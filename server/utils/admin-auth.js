import { getCloudflareEnv } from './index.js'

const COOKIE_NAME = 'admin_session'

async function sha256(text) {
   const data = new TextEncoder().encode(text)
   const hash = await crypto.subtle.digest('SHA-256', data)
   return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function createAdminSession(event) {
   const env = getCloudflareEnv(event)
   return sha256(`${env.ADMIN_PIN}:secure-signed-admin`)
}

export async function isAdmin(event) {
   const token = getCookie(event, COOKIE_NAME)
   if (!token) return false
   return token === await createAdminSession(event)
}

export async function requireAdmin(event) {
   if (await isAdmin(event)) return true
   throw createError({ statusCode: 401, statusMessage: 'Admin login required' })
}

export async function setAdminCookie(event) {
   setCookie(event, COOKIE_NAME, await createAdminSession(event), {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7
   })
}

export function clearAdminCookie(event) {
   deleteCookie(event, COOKIE_NAME, { path: '/' })
}
