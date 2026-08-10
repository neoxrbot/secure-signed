const escapeHtml = (input) => String(input || '')
   .replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;')
   .replace(/'/g, '&#039;')

const processInline = (input, allowHtml = true) => {
   let text = input || ''

   const placeholders = []
   const store = (htmlTag) => {
      placeholders.push(htmlTag)
      return `###PH_${placeholders.length - 1}###`
   }

   text = text.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, (match, alt, src) => {
      return store(`<img alt="${alt}" src="${src}">`)
   })

   text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+|mailto:[^\s)]+|tel:[^\s)]+)\)/g, (match, t, href) => {
      return store(`<a href="${href}" target="_blank" rel="noopener noreferrer">${t}</a>`)
   })

   if (allowHtml) {
      text = text.replace(/<video\s+([\s\S]*?)><\/video>/gi, (match) => store(match))
      text = text.replace(/<audio\s+([\s\S]*?)><\/audio>/gi, (match) => store(match))
      text = text.replace(/<div\s+([\s\S]*?)>([\s\S]*?)<\/div>/gi, (match) => store(match))
      text = text.replace(/<a\s+([\s\S]*?)>([\s\S]*?)<\/a>/gi, (match) => store(match))
      text = text.replace(/<span\s+([\s\S]*?)>([\s\S]*?)<\/span>/gi, (match) => store(match))
      text = text.replace(/<i\s+([\s\S]*?)><\/i>/gi, (match) => store(match))
      text = text.replace(/<img\s+([\s\S]*?)>/gi, (match) => store(match))
   }

   text = escapeHtml(text)

   text = text
      .replace(/~~([^~]+)~~/g, '<del>$1</del>')
      .replace(/`([^`]+)`/g, (match, code) => store(`<code>${escapeHtml(code)}</code>`))
      .replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')
      .replace(/(\*|_)(.*?)\1/g, '<em>$2</em>')

   placeholders.forEach((tag, idx) => {
      text = text.replace(new RegExp(`###PH_${idx}###`, 'g'), tag)
   })

   return text
}

export default class MarkdownIt {
   options = {}

   constructor(options = {}) {
      this.options = { html: true, breaks: true, ...options }
   }

   render(source) {
      const lines = String(source || '').split(/\r?\n/)
      let html = ''
      let ulOpen = false
      let olOpen = false
      let quoteOpen = false
      let codeOpen = false

      const closeLists = () => {
         if (ulOpen) {
            html += '</ul>'
            ulOpen = false
         }
         if (olOpen) {
            html += '</ol>'
            olOpen = false
         }
      }

      const closeQuote = () => {
         if (quoteOpen) {
            html += '</blockquote>'
            quoteOpen = false
         }
      }

      const closeAll = () => {
         closeLists()
         closeQuote()
      }

      for (const line of lines) {
         const trimmed = line.trim()

         if (line.startsWith('```')) {
            closeAll()
            if (codeOpen) {
               html += '</code></pre>'
               codeOpen = false
            } else {
               const lang = line.slice(3).trim()
               const langClass = lang ? ` class="language-${escapeHtml(lang)}"` : ''
               html += `<pre><code${langClass}>`
               codeOpen = true
            }
            continue
         }

         if (codeOpen) {
            html += `${escapeHtml(line)}\n`
            continue
         }

         if (/^\s*---+\s*$/.test(line) || /^\s*\*\*\*+\s*$/.test(line)) {
            closeAll()
            html += '<hr>'
            continue
         }

         if (this.options.html && /^<\/?(div|video|audio|section|article|table|thead|tbody|tr|th|td|iframe)\b/i.test(trimmed)) {
            closeAll()
            html += `${trimmed}\n`
            continue
         }

         if (/^>\s*(.*)$/.test(line)) {
            closeLists()
            const quoteContent = line.replace(/^>\s*/, '')
            if (!quoteOpen) {
               html += '<blockquote>'
               quoteOpen = true
            }
            if (quoteContent.trim()) {
               html += `<p>${processInline(quoteContent, this.options.html)}</p>`
            }
            continue
         } else {
            closeQuote()
         }

         if (!trimmed) {
            closeLists()
            if (this.options.breaks) html += '<br>'
            continue
         }

         const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/)
         if (heading) {
            closeAll()
            const level = heading[1].length
            html += `<h${level}>${processInline(heading[2], this.options.html)}</h${level}>`
            continue
         }

         const ulItem = line.match(/^[-*]\s+(.+)$/)
         if (ulItem) {
            if (olOpen) {
               html += '</ol>'
               olOpen = false
            }
            if (!ulOpen) {
               html += '<ul>'
               ulOpen = true
            }
            html += `<li>${processInline(ulItem[1], this.options.html)}</li>`
            continue
         }

         const olItem = line.match(/^(\d+)\.\s+(.+)$/)
         if (olItem) {
            if (ulOpen) {
               html += '</ul>'
               ulOpen = false
            }
            if (!olOpen) {
               html += '<ol>'
               olOpen = true
            }
            html += `<li>${processInline(olItem[1], this.options.html)}</li>`
            continue
         }

         closeAll()
         html += `<p>${processInline(line, this.options.html)}</p>`
      }

      closeAll()
      if (codeOpen) {
         html += '</code></pre>'
      }

      return html
   }
}