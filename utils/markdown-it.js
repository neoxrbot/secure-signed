const escapeHtml = (input) => String(input || '')
   .replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;')
   .replace(/'/g, '&#039;')

const processInline = (input, allowHtml = true) => {
   let text = input || ''

   if (allowHtml) {
      text = text.replace(/<video\s+([\s\S]*?)><\/video>/gi, '###VIDEO_START###$1###VIDEO_END###')
   }

   text = escapeHtml(text)

   if (allowHtml) {
      text = text.replace(/###VIDEO_START###([\s\S]*?)###VIDEO_END###/g, '<video $1></video>')
   }

   return text
      .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, '<img alt="$1" src="$2">')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
}

export default class MarkdownIt {
   options = {}

   constructor(options = {}) {
      this.options = { html: true, breaks: true, ...options }
   }

   render(source) {
      const lines = String(source || '').split(/\r?\n/)
      let html = ''
      let listOpen = false
      let codeOpen = false

      const closeList = () => {
         if (listOpen) {
            html += '</ul>'
            listOpen = false
         }
      }

      for (const line of lines) {
         const trimmed = line.trim()

         if (line.startsWith('```')) {
            closeList()
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
            closeList()
            html += '<hr>'
            continue
         }

         if (this.options.html && /^<video\b[^>]*>.*?<\/video>$/i.test(trimmed)) {
            closeList()
            html += `${trimmed}`
            continue
         }

         if (!trimmed) {
            closeList()
            if (this.options.breaks) html += '<br>'
            continue
         }

         const heading = line.match(/^(#{1,3})\s+(.+)$/)
         if (heading) {
            closeList()
            html += `<h${heading[1].length}>${processInline(heading[2], this.options.html)}</h${heading[1].length}>`
            continue
         }

         const item = line.match(/^[-*]\s+(.+)$/)
         if (item) {
            if (!listOpen) {
               html += '<ul>'
               listOpen = true
            }
            html += `<li>${processInline(item[1], this.options.html)}</li>`
            continue
         }

         closeList()
         html += `<p>${processInline(line, this.options.html)}</p>`
      }

      closeList()
      if (codeOpen) {
         html += '</code></pre>'
      }

      return html
   }
}