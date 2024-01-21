import config from './readconfig.js'
import markdownit from 'markdown-it'
import hljs from 'highlight.js'

import javascript from 'highlight.js/lib/languages/javascript'
import bash from 'highlight.js/lib/languages/bash'
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('bash', bash)

const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str, lang) {
    if (config?.app?.markdown?.highlightjs && lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }

    return ''
  },
  ...config?.app?.markdown?.markdownitOptions,
})

if (config?.app?.markdown?.plugins) {
  config.app.markdown.plugins.forEach((plugin) => {
    md.use(plugin)
  })
}

export default md
