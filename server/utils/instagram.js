import bigInt from 'big-integer'
import axios from 'axios'

export default class Instagram {
   constructor(cookie) {
      this.setCookie(cookie)
   }

   setCookie = cookie => {
      this.COOKIE = cookie
      this.HEADERS = {
         "Accept": "*/*",
         "Accept-Language": "en-US,en;q=0.9",
         "Cache-Control": "no-cache",
         "Cookie": this.COOKIE || "",
         "DNT": "1",
         "Pragma": "no-cache",
         "Priority": "u=1, i",
         "Sec-CH-Prefers-Color-Scheme": "dark",
         "Sec-CH-UA": "\"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"144\", \"Google Chrome\";v=\"144\"",
         "Sec-CH-UA-Full-Version-List": "\"Not(A:Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"144.0.7559.221\", \"Google Chrome\";v=\"144.0.7559.221\"",
         "Sec-CH-UA-Mobile": "?0",
         "Sec-CH-UA-Model": "\"\"",
         "Sec-CH-UA-Platform": "Chrome OS",
         "Sec-CH-UA-Platform-Version": "16503.76.0",
         "Sec-Fetch-Dest": "empty",
         "Sec-Fetch-Mode": "cors",
         "Sec-Fetch-Site": "same-origin",
         "User-Agent": "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
         "X-ASBD-ID": "359341",
         "X-CSRFTOKEN": this.COOKIE?.match(/csrftoken=([^;]+)/)?.[1] || "",
         "X-IG-App-ID": "936619743392459",
         "X-IG-WWW-Claim": "0",
         "X-Requested-With": "XMLHttpRequest",
         "X-Web-Session-ID": "40139v:v1qdbq:giw7ya"
      }
   }

   buildMsg = (message, status = false) => ({
      creator: global.creator,
      status,
      msg: message
   })

   toId = shortcode => {
      const lower = 'abcdefghijklmnopqrstuvwxyz'
      const upper = lower.toUpperCase()
      const numbers = '0123456789'
      const ig_alphabet = upper + lower + numbers + '-_'
      const bigint_alphabet = numbers + lower
      const o = shortcode.replace(/\S/g, m => {
         var c = ig_alphabet.indexOf(m)
         var b = bigint_alphabet.charAt(c)
         return (b != "") ? b : `<${c}>`
      })
      return bigInt(o, 64).toString(10)
   }

   getId = url => {
      const regex = /instagram.com\/(?:[A-Za-z0-9_.]+\/)?(p|reels|reel|stories)\/([A-Za-z0-9-_]+)/
      const match = url.match(regex)
      return match && match[2] ? match[2] : null
   }

   extractValue = (text, startStr, endStr) => {
      const startIndex = text.indexOf(startStr)

      if (startIndex === -1) {
         return null
      }

      const start = startIndex + startStr.length
      const end = text.indexOf(endStr, start)

      if (end === -1) {
         return null
      }

      return text.slice(start, end)
   }

   getCreds = html => ({
      id: this.extractValue(html, '"profile_id":"', '"'),
      lsd: this.extractValue(html, '"LSD",[],{"token":"', '"'),
      app_id: this.extractValue(html, '"app_id":"', '",'),
      csrf_token: this.extractValue(html, '"csrf_token":"', '"},'),
      fb_dtsg: this.extractValue(html, '"DTSGInitialData",[],{"token":"', '"')
   })

   parsing = items => {
      let caption, taken_at, data = []
      items.map(v => {
         taken_at = v.taken_at
         if (v.media_type == 1) {
            data.push({
               type: 'jpg',
               url: v.image_versions2.candidates[0].url
            })
         } else if (v.media_type == 2) {
            data.push({
               type: 'mp4',
               url: v.video_versions[1].url
            })
         } else if (v.media_type == 8) {
            v.carousel_media.map(x => {
               if (x.media_type == 1) {
                  data.push({
                     type: 'jpg',
                     url: x.image_versions2.candidates[0].url
                  })
               } else if (x.media_type == 2) {
                  data.push({
                     type: 'mp4',
                     url: x.video_versions[1].url
                  })
               }
            })
         }
      })
      return ({
         taken_at,
         data
      })
   }

   getProfile = async username => {
      try {
         const profileUrl = `https://www.instagram.com/${username}/`
         const { data: html } = await axios.get(profileUrl, {
            headers: this.HEADERS
         })

         const creds = this.getCreds(html)

         if (!creds.id || !creds.fb_dtsg) return this.buildMsg('Failed to extract necessary credentials!')

         const params = new URLSearchParams({
            fb_api_caller_class: 'RelayModern',
            fb_api_req_friendly_name: 'PolarisProfilePageContentQuery',
            fb_dtsg: creds.fb_dtsg,
            lsd: creds.lsd,
            variables: JSON.stringify({
               enable_integrity_filters: true,
               id: creds.id,
               __relay_internal__pv__PolarisCannesGuardianExperienceEnabledrelayprovider: true,
               __relay_internal__pv__PolarisCASB976ProfileEnabledrelayprovider: false,
               __relay_internal__pv__PolarisWebSchoolsEnabledrelayprovider: false,
               __relay_internal__pv__PolarisRepostsConsumptionEnabledrelayprovider: true,
               __relay_internal__pv__PolarisShortDramaEnabledrelayprovider: false,
               __relay_internal__pv__PolarisLongformEnabledrelayprovider: false
            }),
            doc_id: '38611279431804694'
         })

         const { data: json } = await axios.post('https://www.instagram.com/api/graphql', params, {
            headers: {
               ...this.HEADERS,
               'X-Fb-Lsd': creds.lsd,
               'X-Fb-Friendly-Name': 'PolarisProfilePageContentQuery'
            }
         })

         const result = json?.data?.user

         if (!result) return this.buildMsg('Account not found!')

         return {
            creator: global.creator,
            status: true,
            data: result
         }
      } catch (e) {
         console.error(e)
         return this.buildMsg('An error occurred while fetching the profile!')
      }
   }

   getStories = async username => {
      try {
         const user = await this.getProfile(username)
         if (!user.status) return this.buildMsg(user.msg)

         if (user.data.is_private) return this.buildMsg('This account is private!')

         const { data: html } = await axios.get(`https://www.instagram.com/${username}/`, {
            headers: this.HEADERS
         })

         const creds = this.getCreds(html)

         if (!creds.lsd || !creds.fb_dtsg) return this.buildMsg('Failed to extract necessary credentials!')

         const params = new URLSearchParams({
            fb_api_caller_class: 'RelayModern',
            fb_api_req_friendly_name: 'PolarisStoriesV3ReelPageStandaloneQuery',
            fb_dtsg: creds.fb_dtsg,
            lsd: creds.lsd,
            variables: JSON.stringify({
               reel_ids_arr: [user.data.id],
               __relay_internal__pv__PolarisCommunityNoteStoriesLabelEnabledrelayprovider: true
            }),
            doc_id: '28331744683105260'
         })

         const { data: json } = await axios.post('https://www.instagram.com/graphql/query', params, {
            headers: {
               ...this.HEADERS,
               'X-Fb-Lsd': creds.lsd,
               'X-Fb-Friendly-Name': 'PolarisStoriesV3ReelPageStandaloneQuery'
            }
         })

         const items = json?.data?.xdt_api__v1__feed__reels_media?.reels_media?.[0]?.items
         if (!items?.length) return this.buildMsg('Stories empty')

         const stories = this.parsing(items).data

         return {
            creator: global.creator,
            status: true,
            data: stories
         }
      } catch (e) {
         console.error(e)
         return this.buildMsg('An error occurred while fetching the stories!')
      }
   }

   getPostByUsername = async (username, options = {}) => {
      const { first = 12, after = null, getAll = false } = options

      try {
         const user = await this.getProfile(username)
         if (!user.status) return this.buildMsg(user.msg)

         if (user.data.is_private) return this.buildMsg('This account is private!')

         const { data: html } = await axios.get(`https://www.instagram.com/${username}/`, {
            headers: this.HEADERS
         })

         const creds = this.getCreds(html)

         if (!creds.lsd || !creds.app_id || !creds.csrf_token || !creds.fb_dtsg) {
            return this.buildMsg('Failed to extract necessary credentials!')
         }

         let allEdges = []
         let currentAfter = after
         let hasNextPage = true

         do {
            const payload = currentAfter ? {
               fb_api_req_friendly_name: 'PolarisProfilePostsTabContentQuery_connection',
               variables: JSON.stringify({
                  after: currentAfter,
                  before: null,
                  data: {
                     count: getAll ? 12 : first,
                     include_reel_media_seen_timestamp: true,
                     include_relationship_info: true,
                     latest_besties_reel_media: true,
                     latest_reel_media: true
                  },
                  first: getAll ? 12 : first,
                  include_multi_captions: false,
                  last: null,
                  username: username,
                  __relay_internal__pv__PolarisMultiCaptionCarouselEnabledrelayprovider: false,
                  __relay_internal__pv__PolarisShortDramaEnabledrelayprovider: false,
                  __relay_internal__pv__PolarisReelsRecoDebugOverlayEnabledrelayprovider: false
               }),
               doc_id: '27887290207603857'
            } : {
               fb_api_req_friendly_name: 'PolarisProfilePostsQuery',
               variables: JSON.stringify({
                  data: {
                     count: getAll ? 12 : first,
                     include_reel_media_seen_timestamp: true,
                     include_relationship_info: true,
                     latest_besties_reel_media: true,
                     latest_reel_media: true
                  },
                  username: username,
                  __relay_internal__pv__PolarisMultiCaptionCarouselEnabledrelayprovider: false,
                  __relay_internal__pv__PolarisShortDramaEnabledrelayprovider: false,
                  __relay_internal__pv__PolarisReelsRecoDebugOverlayEnabledrelayprovider: false
               }),
               doc_id: '37479489681666464'
            }

            const params = new URLSearchParams({
               fb_api_caller_class: 'RelayModern',
               fb_dtsg: creds.fb_dtsg,
               lsd: creds.lsd,
               ...payload,
               server_timestamps: true
            })

            const { data: body } = await axios.post(`https://www.instagram.com/graphql/query`, params, {
               headers: {
                  ...this.HEADERS,
                  'X-Fb-Lsd': creds.lsd,
                  ...(currentAfter ? {
                     'X-Fb-Friendly-Name': 'PolarisProfilePostsTabContentQuery_connection'
                  } : {
                     'X-Fb-Friendly-Name': 'PolarisProfilePostsQuery',
                  }),
                  'X-Root-Field-Name': 'xdt_api__v1__feed__user_timeline_graphql_connection',
               }
            })

            const result = body?.data?.xdt_api__v1__feed__user_timeline_graphql_connection
            if (!result) {
               if (allEdges.length > 0) break
               return this.buildMsg('No posts found!')
            }

            if (!getAll) return result

            const edges = result.edges || []
            allEdges.push(...edges)

            const pageInfo = result.page_info
            hasNextPage = pageInfo?.has_next_page
            currentAfter = pageInfo?.end_cursor

            if (getAll && hasNextPage) {
               await new Promise(resolve => setTimeout(resolve, 1500))
            }

         } while (getAll && hasNextPage && currentAfter)

         return {
            count: allEdges.length,
            edges: allEdges
         }

      } catch (e) {
         console.error(e)
         return null
      }
   }

   fetch = async url => {
      try {
         const postId = this.getId(url)

         if (!postId) throw new Error('Invalid URL')
         const id = this.toId(postId)

         const { data: body } = await axios.get(`https://www.instagram.com/api/v1/media/${id}/info/`, {
            headers: this.HEADERS
         })

         const result = this.parsing(body.items)
         if (!result?.data?.length) return this.buildMsg('No media found!')

         return {
            creator: global.creator,
            status: true,
            data: result.data
         }
      } catch (e) {
         console.error(e)
         return this.buildMsg('An error occurred while fetching the media!')
      }
   }

   fetchAllPosts = async (username, options = {}) => {
      try {
         const result = await this.getPostByUsername(username, options)

         if (!result?.edges?.length) return this.buildMsg('An error occurred while fetching the posts!')

         const allPosts = result.edges.map(edge => this.parsing([edge.node]))

         return {
            creator: global.creator,
            status: true,
            count: allPosts.length,
            data: allPosts.map(v => v.data).flat()
         }
      } catch (e) {
         console.error(e)
         return this.buildMsg('An error occurred while fetching all posts!')
      }
   }
}


const ig = new Instagram('datr=zd5Iamb80_ySk3g3WnGAxxGI;ig_nrcb=1;ds_user_id=61419416002;csrftoken=j2ml7urpDn1yBBCcnBIm1I;ig_did=E3764B33-7EEE-454A-AA17-5753138C7004;wd=1920x959;mid=akje0gAEAAEqztMEyI_OabhYKN8a;sessionid=61419416002%3A2ClCt0lzBVL52G%3A17%3AAYjadx9Rh05nKBfpHKl3gd3K-QvuRBx2dHH7gd1MHg;rur="CCO614194160021814698004:01ff5f4888c26dada409eca4ff0dcb3b6110cd777a7dad0e8f134dd1d159c1506f0ac1c6"')

// ig.getProfile('akatsukireii').then(console.log).catch(console.error)
// ig.fetch('https://www.instagram.com/p/Db5ihiZE9mG/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==').then(console.log).catch(console.error)
ig.fetchAllPosts('gsl.suou', { getAll: false }).then(console.log).catch(console.error)
// ig.fetchAllPosts(process.argv[2] || 'gsl.suou', { first: 12, after: null, getAll: false }).then(console.log).catch(console.error)


