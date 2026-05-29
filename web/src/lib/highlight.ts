// Minimal highlight.js setup — only the grammars we actually use in snippets
// (xmake.lua + xrepo bash invocations). Tree-shaking the language list keeps
// the bundle under ~15KB gzipped instead of the 100KB+ "common" bundle.

import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import lua from 'highlight.js/lib/languages/lua'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('lua', lua)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('shell', bash)

// Escape so unknown / missing languages still render safely as plain text.
function escape(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)
}

export function highlight(code: string, lang?: string): string {
  if (lang && hljs.getLanguage(lang)) {
    return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
  }
  return escape(code)
}
