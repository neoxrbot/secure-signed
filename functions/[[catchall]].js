export async function onRequest(context) {
   const { request, env, params } = context
   const db = env.DB
   const validityStr = env.VALIDITY || '30m'
   const url = new URL(request.url)
   const pathname = url.pathname

   if (pathname === '/' || pathname === '/index.html') {
      return env.ASSETS.fetch(request)
   }

   const hasExtension = pathname.includes('.')
   if (hasExtension) {
      const response = await env.ASSETS.fetch(request)
      if (response.status !== 404) {
         return response
      }
   }

   const path = params.catchall || []

   if (path.length === 2) {
      const [token, sign] = path

      try {
         const record = await db.prepare(
            'SELECT url, headers, created_at, filename FROM downloads WHERE token = ? AND sign = ?'
         )
            .bind(token, sign)
            .first()

         if (record) {
            const validityMs = parseValidity(validityStr)
            const isExpired = Date.now() - record.created_at > validityMs

            if (isExpired) {
               context.waitUntil(
                  db.prepare('DELETE FROM downloads WHERE token = ?').bind(token).run()
               )
            } else {
               let customHeaders = {}
               try {
                  customHeaders = JSON.parse(record.headers)
               } catch (e) {
               }

               const targetResponse = await fetch(record.url, {
                  headers: {
                     ...customHeaders,
                     'Host': new URL(record.url).host
                  }
               })

               const responseHeaders = new Headers()
               const headersToForward = [
                  'content-type',
                  'content-length',
                  'accept-ranges',
                  'cache-control'
               ]

               for (const header of headersToForward) {
                  if (targetResponse.headers.has(header)) {
                     responseHeaders.set(header, targetResponse.headers.get(header))
                  }
               }

               let disposition = ''
               if (record.filename) {
                  disposition = `attachment; filename="${record.filename}"`
               } else if (targetResponse.headers.has('content-disposition')) {
                  disposition = targetResponse.headers.get('content-disposition')
               } else {
                  const urlObj = new URL(record.url)
                  const fileName = urlObj.pathname.split('/').pop() || 'download'
                  disposition = `attachment; filename="${fileName}"`
               }
               responseHeaders.set('content-disposition', disposition)

               return new Response(targetResponse.body, {
                  status: targetResponse.status,
                  statusText: targetResponse.statusText,
                  headers: responseHeaders
               })
            }
         }
      } catch (err) {
         return new Response(`Proxy Error: ${err.message}`, { status: 500 })
      }
   }

   const custom404 = `<!DOCTYPE html>
<html lang="en">

<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>404 - Not Found</title>
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
   <style>
      @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap");

      :root {
         --bg-body: #fafafa;
         --bg-card: #ffffff;
         --text-main: #111111;
         --text-muted: #666666;
         --border: #e5e5e5;
         --primary: #111111;
         --primary-hover: #222222;
         --primary-text: #ffffff;
         --generate-bg: #fafafa;
         --generate-hover: #f4f4f5;
         --success: #10b981;
         --error: #ef4444;
         --error-bg: rgba(239, 68, 68, 0.08);
         --pattern-color: rgba(17, 17, 17, 0.04);
      }

      body.dark {
         --bg-body: #09090b;
         --bg-card: #18181b;
         --text-main: #f4f4f5;
         --text-muted: #a1a1aa;
         --border: #27272a;
         --primary: #fafafa;
         --primary-hover: #e4e4e7;
         --primary-text: #09090b;
         --generate-bg: #18181b;
         --generate-hover: #27272a;
         --success: #34d399;
         --error: #f87171;
         --error-bg: rgba(248, 113, 113, 0.08);
         --pattern-color: rgba(250, 250, 250, 0.03);
      }

      * {
         box-sizing: border-box;
         margin: 0;
         padding: 0;
         transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
      }

      html,
      body {
         overflow: hidden;
         height: 100vh;
         width: 100vw;
         margin: 0;
      }

      body {
         font-family: "Space Grotesk", sans-serif;
         background-color: var(--bg-body);
         background-image: radial-gradient(var(--pattern-color) 1.5px, transparent 1.5px);
         background-size: 24px 24px;
         color: var(--text-main);
         display: flex;
         align-items: center;
         justify-content: center;
         padding: 1.5rem;
      }

      .container {
         background-color: var(--bg-card);
         padding: 2.5rem 2rem;
         border: 1px solid var(--border);
         border-radius: 12px;
         width: 100%;
         max-width: 440px;
         text-align: center;
         position: relative;
         z-index: 10;
      }

      .theme-switch-container {
         position: absolute;
         top: 1.25rem;
         right: 1.25rem;
         z-index: 20;
      }

      .theme-toggle-btn {
         background: transparent;
         border: 1px solid var(--border);
         cursor: pointer;
         color: var(--text-muted);
         padding: 0.5rem;
         border-radius: 6px;
         display: flex;
         align-items: center;
         justify-content: center;
      }

      .theme-toggle-btn:hover:not(:disabled) {
         background-color: var(--generate-hover);
         color: var(--text-main);
         border-color: var(--text-muted);
      }

      .theme-toggle-btn:disabled {
         opacity: 0.5;
         cursor: not-allowed;
         pointer-events: none;
         }

      .theme-toggle-btn i {
         font-size: 18px;
         display: block;
         line-height: 1;
      }

      .theme-toggle-btn .sun-icon {
         display: none;
      }

      .theme-toggle-btn .moon-icon {
         display: block;
      }

      body.dark .theme-toggle-btn .sun-icon {
         display: block;
      }

      body.dark .theme-toggle-btn .moon-icon {
         display: none;
      }

      header {
         margin-bottom: 2rem;
         padding-top: 0.5rem;
      }

      h1 {
         color: var(--text-main);
         font-size: 1.6rem;
         font-weight: 700;
         margin-bottom: 0.4rem;
         letter-spacing: -0.03em;
      }

      .subtitle {
         color: var(--text-muted);
         font-size: 0.85rem;
         font-weight: 400;
      }

      .generate-area {
         border: 1.5px dashed var(--border);
         border-radius: 8px;
         padding: 2.5rem 1.5rem;
         background-color: var(--generate-bg);
         display: flex;
         flex-direction: column;
         align-items: center;
         justify-content: center;
         min-height: 180px;
      }

      .dropzone-prompt {
         display: flex;
         flex-direction: column;
         align-items: center;
         justify-content: center;
         pointer-events: none;
         width: 100%;
      }

      .generate-icon {
         font-size: 44px;
         color: var(--error);
         margin-bottom: 1rem;
         line-height: 1;
      }

      #fileLabel {
         font-weight: 600;
         font-size: 0.9rem;
         margin-bottom: 0.25rem;
         color: var(--text-main);
         letter-spacing: -0.01em;
      }

      .max-size-info {
         font-size: 0.75rem;
         color: var(--text-muted);
         margin-top: 0.25rem;
      }

      .btn {
         font-family: "Space Grotesk", sans-serif;
         background-color: var(--primary);
         color: var(--primary-text);
         border: 1px solid var(--border);
         padding: 0.8rem 1.5rem;
         border-radius: 6px;
         font-weight: 600;
         font-size: 0.95rem;
         cursor: pointer;
         margin-top: 1.25rem;
         width: 100%;
         transition: background-color 0.15s, transform 0.1s;
         text-decoration: none;
         display: block;
      }

      .btn:hover {
         background-color: var(--primary-hover);
      }

      .btn:active {
         transform: scale(0.99);
      }
   </style>
</head>

<body>
   <div class="container">
      <div class="theme-switch-container">
         <button id="themeToggle" class="theme-toggle-btn" aria-label="Toggle Theme">
            <i class="bi bi-moon-stars moon-icon"></i>
            <i class="bi bi-sun sun-icon"></i>
         </button>
      </div>

      <header>
         <h1>404 - Not Found</h1>
         <p class="subtitle">The page you are looking for does not exist</p>
      </header>

      <div class="generate-area">
         <div class="dropzone-prompt">
            <i class="bi bi bi-x-circle generate-icon"></i>
            <span id="fileLabel">Oops! Access Denied or Missing</span>
            <span class="max-size-info">Make sure the URL is correct</span>
         </div>
      </div>

      <a href="/" class="btn">Go Back Home</a>
   </div>

   <script>
      const themeToggle = document.getElementById('themeToggle')
      const savedTheme = localStorage.getItem('theme')
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

      if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
         document.body.classList.add('dark')
      } else {
         document.body.classList.remove('dark')
      }

      themeToggle.addEventListener('click', () => {
         document.body.classList.toggle('dark')
         const isDark = document.body.classList.contains('dark')
         localStorage.setItem('theme', isDark ? 'dark' : 'light')
      })
   </script>
</body>

</html>`

   return new Response(custom404, {
      status: 404,
      headers: { 'Content-Type': 'text/html' }
   })
}

function parseValidity(validityStr) {
   const matches = validityStr.match(/^(\d+)([smhd])$/)
   if (!matches) return 30 * 60 * 1000
   const value = parseInt(matches[1], 10)
   const unit = matches[2]
   switch (unit) {
      case 's': return value * 1000
      case 'm': return value * 60 * 1000
      case 'h': return value * 60 * 60 * 1000
      case 'd': return value * 24 * 60 * 60 * 1000
      default: return 30 * 60 * 1000
   }
}