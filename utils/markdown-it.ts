type MarkdownOptions = { html?: boolean; linkify?: boolean; breaks?: boolean }

const escapeHtml = (input: string) => input
   .replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;')
   .replace(/'/g, '&#039;')

const inline = (input: string) => escapeHtml(input)
   .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, '<img alt="$1" src="$2">')
   .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
   .replace(/`([^`]+)`/g, '<code>$1</code>')
   .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
   .replace(/_([^_]+)_/g, '<em>$1</em>')

export default class MarkdownIt {
   options: MarkdownOptions

   constructor(options: MarkdownOptions = {}) {
      this.options = options
   }

   render(source: string) {
      const lines = String(source || '').split(/\r?\n/)
      let html = ''
      let listOpen = false
      let codeOpen = false
      const closeList = () => { if (listOpen) { html += '</ul>'; listOpen = false } }

      for (const line of lines) {
         if (line.startsWith('```')) {
            closeList()
            html += codeOpen ? '</code></pre>' : '<pre><code>'
            codeOpen = !codeOpen
            continue
         }
         if (codeOpen) {
            html += `${escapeHtml(line)}\n`
            continue
         }
         if (!line.trim()) {
            closeList()
            if (this.options.breaks) html += '<br>'
            continue
         }
         const heading = line.match(/^(#{1,3})\s+(.+)$/)
         if (heading) {
            closeList()
            html += `<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`
            continue
         }
         const item = line.match(/^[-*]\s+(.+)$/)
         if (item) {
            if (!listOpen) { html += '<ul>'; listOpen = true }
            html += `<li>${inline(item[1])}</li>`
            continue
         }
         closeList()
         html += `<p>${inline(line)}</p>`
      }
      closeList()
      if (codeOpen) html += '</code></pre>'
      return html
   }
}
