import { getCloudflareEnv } from '../utils/cloudflare.js'
import YouTube from '../utils/scraper/youtube.js'

export default defineEventHandler(async (event) => {
   try {
      const env = getCloudflareEnv(event)
      const query = getQuery(event)
      const url = query.url

      if (!url) {
         return { status: false, msg: 'URL parameter is required' }
      }

      const yt = new YouTube(env.GOOGLE_API, 'HSID=AD7AZ635tdW5mmUtE;SSID=Aa2uGUTzntIapKjbu;APISID=fAgLXx7wgfbwwsGE/Azw1ugwz3UW8oTy9Y;SAPISID=h7YdKe-SxtZQYOUM/A4AzyJfYuGVf5csTi;__Secure-1PAPISID=h7YdKe-SxtZQYOUM/A4AzyJfYuGVf5csTi;__Secure-3PAPISID=h7YdKe-SxtZQYOUM/A4AzyJfYuGVf5csTi;LOGIN_INFO=AFmmF2swRgIhAN3QO1F3JWyEUv8j5vP_y5PRHttCwHbYEZHBTGUQLDG3AiEAmf_Aa67SxS7HEeqylYiBDQqzQpCzp7wjnX7zVDFVSMA:QUQ3MjNmenFxRi1rbXFCZWd4MU1zTThVSmpjYXBTaFJRYTZSLWEzUGtBdTFqY1N2ZUY0WHZVQ0k3aVBhX3BzdDh4cnhXNzUyLUdfdERFM2RsZ2hxNEt3VkxIWGFMNHNkZFZtOXphWllpYU5MWWVHZjdYbnlYaHdwLTZtLVRvejVyQWRoSjhPZnNsblJBOERpbXhjei1RZjhrRnhpbWZ5MmRB;SID=g.a000AwkLQw5t-UcDunacU606BEXxyHyiHy-LMKoldu9dx4KYqhQL53We2PEQqo82QktvLKzzpAACgYKAfsSARcSFQHGX2MiatAry7f1OA8YiWiwKV8MVxoVAUF8yKpByXDGPr_wWhH0wu0PqQNd0076;__Secure-1PSID=g.a000AwkLQw5t-UcDunacU606BEXxyHyiHy-LMKoldu9dx4KYqhQLjYrDGyJ6lqcDUZ-Vs7P4NAACgYKASwSARcSFQHGX2MidPXs86kwCH9K4tJPAPZ0ABoVAUF8yKo2fXNDloO9x6uKrFAfZaMW0076;__Secure-3PSID=g.a000AwkLQw5t-UcDunacU606BEXxyHyiHy-LMKoldu9dx4KYqhQLsFBand9aMPexXjDZq4BpMQACgYKAVASARcSFQHGX2MieBvNpkyojqIyHL32WZkwDRoVAUF8yKrW97mM6ZCElfqV6HFwCDZj0076;PREF=tz=Asia.Jakarta&f6=40000000&f7=100&f5=30000;__Secure-1PSIDTS=sidts-CjEBPWEu2Ts3UQLAz8PhVXtBY_2f3lNVFxMjtw6_jFbTQ5jmIo6QysXG7NWSV_wuL3sMEAA;__Secure-3PSIDTS=sidts-CjEBPWEu2Ts3UQLAz8PhVXtBY_2f3lNVFxMjtw6_jFbTQ5jmIo6QysXG7NWSV_wuL3sMEAA;SIDCC=AKEyXzWGamKNU9VgeFT0LYMRcH2915oZRvwxdRINEBSTIfvX24ZDV9kJweOe-Ma3ebrE8hgBBqQ;__Secure-1PSIDCC=AKEyXzWpZKwxWRC56v9prj-ye1tnTts4TnZj9GBL00EULfnJRhJ4FbIC1ef-4FY29U7rmqVCww;__Secure-3PSIDCC=AKEyXzWUS3X_olMcjsoMk-h1DazrYXjdzrcIHoq0j0jnIwEsM9g78X9_l0Momdlv5tNJzP023A')

      const result = await yt.getInfo(url)

      return result
   } catch (err) {
      return { status: false, msg: err.message }
   }
})