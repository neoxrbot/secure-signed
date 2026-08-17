import { getWebRequest } from '../utils/index.js'
import appConfig from '../utils/app-config.js'

function getIpVersion(ip) {
   if (!ip) return 'Unknown'
   if (ip.includes(':')) return 'IPv6'
   if (ip.includes('.')) return 'IPv4'
   return 'Unknown'
}

function getCountryName(countryCode) {
   if (!countryCode || countryCode === 'Unknown') return 'Unknown'
   try {
      const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
      return regionNames.of(countryCode) || countryCode
   } catch {
      return countryCode
   }
}

function parseDeviceInfo(userAgent, secChModel) {
   let rawModel = secChModel ? secChModel.replace(/"/g, '').trim() : ''
   let os = 'Unknown'
   let deviceType = 'Desktop'
   let model = 'Unknown'

   const ua = userAgent || ''

   if (/Android/i.test(ua)) {
      os = 'Android'
      deviceType = 'Mobile'
      const androidMatch = ua.match(/Android\s+[\d.]+;\s*([^;)]+)/i)
      if (androidMatch && androidMatch[1]) {
         model = androidMatch[1].trim()
      }
   } else if (/iPhone/i.test(ua)) {
      os = 'iOS'
      deviceType = 'Mobile'
      model = 'Apple iPhone'
   } else if (/iPad/i.test(ua)) {
      os = 'iOS'
      deviceType = 'Tablet'
      model = 'Apple iPad'
   } else if (/Macintosh|Mac OS X/i.test(ua)) {
      os = 'macOS'
      deviceType = 'Desktop'
      model = 'Apple Mac'
   } else if (/Windows NT/i.test(ua)) {
      os = 'Windows'
      deviceType = 'Desktop'
      model = 'Windows PC'
   } else if (/Linux/i.test(ua)) {
      os = 'Linux'
      deviceType = 'Desktop'
      model = 'Linux PC'
   }

   if (rawModel && rawModel !== 'Unknown') {
      model = rawModel
   }

   if (model.includes('Build/')) {
      model = model.split('Build/')[0].trim()
   }

   return {
      device_type: deviceType,
      operating_system: os,
      device_model: model
   }
}

async function getReverseDns(ip) {
   if (!ip || ip === '127.0.0.1' || ip === '::1') return 'localhost'
   try {
      let ptrName = ''
      if (ip.includes('.')) {
         ptrName = ip.split('.').reverse().join('.') + '.in-addr.arpa'
      } else if (ip.includes(':')) {
         const cleanHex = ip.split(':').map(part => part.padStart(4, '0')).join('')
         if (cleanHex.length === 32) {
            ptrName = cleanHex.split('').reverse().join('.') + '.ip6.arpa'
         }
      }

      if (!ptrName) return null

      const res = await $fetch(`https://1.1.1.1/dns-query?name=${ptrName}&type=PTR`, {
         headers: { Accept: 'application/dns-json' }
      })
      return res?.Answer?.[0]?.data?.replace(/\.$/, '') || null
   } catch {
      return null
   }
}

function detectProxy(event, cf) {
   const viaHeader = getHeader(event, 'via')
   const proxyHeader = getHeader(event, 'proxy-connection') || getHeader(event, 'x-proxy-id')
   const forwardedFor = getHeader(event, 'x-forwarded-for')
   const isMultiForwarded = forwardedFor && forwardedFor.includes(',')

   const org = (cf.asOrganization || '').toLowerCase()
   const datacenterKeywords = [
      'hosting', 'datacenter', 'data center', 'cloud', 'digitalocean',
      'amazon', 'aws', 'google', 'microsoft', 'azure', 'm247', 'leaseweb',
      'vultr', 'hetzner', 'ovh', 'alicloud', 'linode', 'choopa', 'fly.io',
      'fastly', 'cdn', 'proxy', 'vpn', 'tor'
   ]

   const isDatacenter = datacenterKeywords.some(kw => org.includes(kw))
   const hasProxyHeaders = !!(viaHeader || proxyHeader || isMultiForwarded)
   const isBot = cf.botManagement?.isKnownBot || cf.verifiedBot || false

   const isProxy = isDatacenter || hasProxyHeaders || isBot

   return {
      is_proxy: isProxy,
      proxy_type: isProxy ? (isDatacenter ? 'Datacenter / Hosting / VPN' : 'HTTP Proxy') : 'Residential / Consumer',
      has_proxy_headers: hasProxyHeaders,
      is_datacenter: isDatacenter,
      is_known_bot: isBot
   }
}

export default defineEventHandler(async (event) => {
   const request = getWebRequest(event)
   const cf = request.cf || event.context.cloudflare?.request?.cf || event.node?.req?.cf || {}

   const ip = getHeader(event, 'cf-connecting-ip')
      || getHeader(event, 'x-real-ip')
      || getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
      || '127.0.0.1'

   const userAgent = getHeader(event, 'user-agent') || ''
   const secChModel = getHeader(event, 'sec-ch-ua-model') || ''

   const ipVersion = getIpVersion(ip)
   const countryCode = cf.country || 'Unknown'
   const countryName = getCountryName(countryCode)
   const deviceInfo = parseDeviceInfo(userAgent, secChModel)

   const ipv4 = ipVersion === 'IPv4' ? ip : null
   const ipv6 = ipVersion === 'IPv6' ? ip : null

   const [reverseDns, proxyInfo] = await Promise.all([
      getReverseDns(ip),
      Promise.resolve(detectProxy(event, cf))
   ])

   const responseData = {
      creator: appConfig?.watermark?.creator || '@neoxr.js - Wildan Izzudin',
      status: true,
      data: {
         ip,
         ipv4,
         ipv6,
         ip_version: ipVersion,
         device: deviceInfo,
         hostname_reverse_dns: reverseDns || 'No PTR record',
         proxy: proxyInfo,
         asn: cf.asn || null,
         asn_organization: cf.asOrganization || 'Unknown',
         country: countryCode,
         country_name: countryName,
         continent: cf.continent || 'Unknown',
         region: cf.region || cf.regionCode || 'Unknown',
         city: cf.city || 'Unknown',
         postal_code: cf.postalCode || 'Unknown',
         latitude: cf.latitude || null,
         longitude: cf.longitude || null,
         timezone: cf.timezone || 'UTC',
         datacenter_colo: cf.colo || 'Unknown',
         http_protocol: cf.httpProtocol || 'HTTP/1.1',
         tls_version: cf.tlsVersion || 'Unknown',
         tls_cipher: cf.tlsCipher || 'Unknown',
         user_agent: userAgent
      }
   }

   setHeader(event, 'Content-Type', 'application/json; charset=utf-8')
   return JSON.stringify(responseData, null, 2)
})