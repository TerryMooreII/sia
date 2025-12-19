# Markdown Guide

Sia supports GitHub Flavored Markdown (GFM) plus several enhanced features through plugins. This guide covers all supported markdown syntax.

## Table of Contents

- [Basic Syntax](#basic-syntax)
- [GitHub Flavored Markdown](#github-flavored-markdown)
- [Syntax Highlighting](#syntax-highlighting)
- [Emoji Shortcodes](#emoji-shortcodes)
- [Heading IDs](#heading-ids)
- [Footnotes](#footnotes)
- [Smart Typography](#smart-typography)
- [Alert Boxes](#alert-boxes)
- [Auto-Linkify](#auto-linkify)
- [YouTube Embeds](#youtube-embeds)
- [Giphy Embeds](#giphy-embeds)

---

## Basic Syntax

### Headings

```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
```

### Paragraphs

Separate paragraphs with a blank line:

```markdown
This is the first paragraph.

This is the second paragraph.
```

### Emphasis

```markdown
*italic* or _italic_
**bold** or __bold__
***bold and italic*** or ___bold and italic___
```

### Links

```markdown
[Link text](https://example.com)
[Link with title](https://example.com "Title")

<!-- Reference-style links -->
[Link text][reference]
[reference]: https://example.com
```

### Images

```markdown
![Alt text](/images/photo.jpg)
![Alt text](/images/photo.jpg "Optional title")
```

### Blockquotes

```markdown
> This is a blockquote.
>
> It can span multiple paragraphs.

> Nested blockquotes
>> Are also supported
```

### Lists

**Unordered:**

```markdown
- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3
```

**Ordered:**

```markdown
1. First item
2. Second item
   1. Nested item
   2. Another nested item
3. Third item
```

### Horizontal Rules

```markdown
---
***
___
```

### Inline Code

```markdown
Use `backticks` for inline code.
```

### Code Blocks

````markdown
```
Plain code block
```

```javascript
// Code block with syntax highlighting
function hello() {
  console.log("Hello!");
}
```
````

---

## GitHub Flavored Markdown

### Tables

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|:--------:|---------:|
| Left     | Center   | Right    |
| aligned  | aligned  | aligned  |
```

Renders as:

| Header 1 | Header 2 | Header 3 |
|----------|:--------:|---------:|
| Left     | Center   | Right    |
| aligned  | aligned  | aligned  |

### Task Lists

```markdown
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task
```

### Strikethrough

```markdown
~~This text is struck through~~
```

### Autolinks

URLs are automatically converted to links:

```markdown
Visit https://example.com for more info.
```

---

## Syntax Highlighting

Code blocks are automatically highlighted using [Highlight.js](https://highlightjs.org/). Specify the language after the opening backticks:

````markdown
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```

```python
def greet(name):
    return f"Hello, {name}!"
```

```css
.container {
  display: flex;
  justify-content: center;
}
```
````

### Supported Languages

Highlight.js supports 190+ languages including:

- `javascript`, `typescript`, `jsx`, `tsx`
- `python`, `ruby`, `php`, `go`, `rust`
- `html`, `css`, `scss`, `less`
- `json`, `yaml`, `xml`, `markdown`
- `bash`, `shell`, `powershell`
- `sql`, `graphql`
- `java`, `kotlin`, `swift`, `c`, `cpp`, `csharp`
- And many more...

If no language is specified, Highlight.js will attempt to auto-detect it.

---

## Emoji Shortcodes

Use emoji shortcodes in your markdown:

```markdown
:smile: :rocket: :heart: :fire:
```

### Available Emojis

| Shortcode | Emoji | Shortcode | Emoji |
|-----------|-------|-----------|-------|
| `:smile:` | 😄 | `:grinning:` | 😀 |
| `:joy:` | 😂 | `:heart:` | ❤️ |
| `:thumbsup:` or `:+1:` | 👍 | `:thumbsdown:` or `:-1:` | 👎 |
| `:clap:` | 👏 | `:fire:` | 🔥 |
| `:rocket:` | 🚀 | `:star:` | ⭐ |
| `:sparkles:` | ✨ | `:check:` | ✅ |
| `:x:` | ❌ | `:warning:` | ⚠️ |
| `:bulb:` | 💡 | `:memo:` | 📝 |
| `:book:` | 📖 | `:link:` | 🔗 |
| `:eyes:` | 👀 | `:thinking:` | 🤔 |
| `:wave:` | 👋 | `:pray:` | 🙏 |
| `:muscle:` | 💪 | `:tada:` | 🎉 |
| `:party:` | 🥳 | `:coffee:` | ☕ |
| `:bug:` | 🐛 | `:wrench:` | 🔧 |
| `:hammer:` | 🔨 | `:gear:` | ⚙️ |
| `:lock:` | 🔒 | `:key:` | 🔑 |
| `:zap:` | ⚡ | `:bomb:` | 💣 |
| `:gem:` | 💎 | `:trophy:` | 🏆 |
| `:medal:` | 🏅 | `:crown:` | 👑 |
| `:sun:` | ☀️ | `:moon:` | 🌙 |
| `:cloud:` | ☁️ | `:rain:` | 🌧️ |
| `:snow:` | ❄️ | `:earth:` | 🌍 |
| `:tree:` | 🌳 | `:flower:` | 🌸 |
| `:apple:` | 🍎 | `:pizza:` | 🍕 |
| `:beer:` | 🍺 | `:wine:` | 🍷 |
| `:cat:` | 🐱 | `:dog:` | 🐶 |
| `:bird:` | 🐦 | `:fish:` | 🐟 |
| `:whale:` | 🐳 | `:snake:` | 🐍 |
| `:turtle:` | 🐢 | `:octopus:` | 🐙 |
| `:crab:` | 🦀 | `:shrimp:` | 🦐 |
| `:100:` | 💯 | | |

---

## Heading IDs

All headings automatically receive URL-friendly ID attributes for anchor linking:

```markdown
## My Section Title
```

Becomes:

```html
<h2 id="my-section-title">My Section Title</h2>
```

### Linking to Headings

Link to headings within the same document:

```markdown
See the [Installation](#installation) section.
Jump to [Getting Started](#getting-started).
```

---

## Footnotes

Add footnotes to provide additional context:

```markdown
This is a statement that needs a citation[^1].

Here's another claim[^note].

[^1]: This is the first footnote.
[^note]: This is a named footnote with more detail.
```

Footnotes are rendered at the bottom of the content with back-references.

### Multi-line Footnotes

```markdown
Here's a complex topic[^complex].

[^complex]: This footnote has multiple paragraphs.

    Indent subsequent paragraphs with 4 spaces.

    You can even include code blocks.
```

---

## Smart Typography

Sia automatically converts plain text punctuation to typographically correct characters:

| Input | Output | Name |
|-------|--------|------|
| `"quoted"` | "quoted" | Curly double quotes |
| `'quoted'` | 'quoted' | Curly single quotes |
| `--` | – | En-dash |
| `---` | — | Em-dash |
| `...` | … | Ellipsis |

### Examples

```markdown
"Hello," she said. "How's it going?"

The years 2020--2024 were interesting...

Wait---I just remembered something!
```

Renders with proper curly quotes, en-dashes, em-dashes, and ellipses.

---

## Alert Boxes

Create GitHub-style alert boxes for callouts:

```markdown
> [!NOTE]
> Useful information that users should know.

> [!TIP]
> Helpful advice for doing things better.

> [!IMPORTANT]
> Key information users need to know.

> [!WARNING]
> Urgent info that needs immediate attention.

> [!CAUTION]
> Advises about risks or negative outcomes.
```

### Alert Types

| Type | Use Case |
|------|----------|
| `NOTE` | General information, highlights, or context |
| `TIP` | Helpful suggestions or best practices |
| `IMPORTANT` | Critical information the reader must know |
| `WARNING` | Potential issues or things to be careful about |
| `CAUTION` | Dangerous actions or serious consequences |

### Multi-line Alerts

```markdown
> [!WARNING]
> This is a warning with multiple lines.
>
> You can include:
> - Lists
> - **Formatting**
> - `Code`
```

---

## Auto-Linkify

Plain URLs are automatically converted to clickable links:

```markdown
Check out https://example.com for more info.
Email us at contact@example.com
```

This works for:
- HTTP/HTTPS URLs
- Email addresses
- Other common URL schemes

---

## YouTube Embeds

YouTube videos are automatically embedded when you include a YouTube link. Sia supports multiple URL formats:

### As a Markdown Link

```markdown
[Watch this video](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
```

### As a Plain URL

```markdown
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### Short URL Format

```markdown
https://youtu.be/dQw4w9WgXcQ
```

### Supported URL Patterns

All of these formats are recognized and converted to responsive embeds:

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

The embed is responsive and will scale properly on all screen sizes.

---

## Giphy Embeds

Giphy GIFs can be embedded in multiple ways:

### Direct Image Link

Use standard markdown image syntax with a Giphy media URL:

```markdown
![Funny GIF](https://media.giphy.com/media/GIPHY_ID/giphy.gif)
```

### Giphy Share URL

Share URLs are automatically converted to responsive embeds:

```markdown
[Check this out](https://giphy.com/gifs/GIPHY_ID)
```

Or just paste the URL:

```markdown
https://giphy.com/gifs/GIPHY_ID
```

### Supported URL Patterns

- `https://giphy.com/gifs/ID`
- `https://giphy.com/embed/ID`
- `https://gph.is/g/ID`
- `https://media.giphy.com/media/ID/giphy.gif`

---

## Complete Example

Here's a markdown file using many of these features:

```markdown
---
title: "My Awesome Post"
date: 2024-12-17
tags: [tutorial, markdown]
---

# Getting Started :rocket:

Welcome to this tutorial! Let's learn about **markdown** features.

## Code Example

Here's some JavaScript:

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```

## Important Notes

> [!TIP]
> Always save your work frequently!

## References

This feature was introduced in version 2.0[^1].

Check out this video for more:
https://www.youtube.com/watch?v=example

[^1]: See the official documentation for details.
```

---

## Escaping Special Characters

To display literal characters that have special meaning in markdown, escape them with a backslash:

```markdown
\*not italic\*
\[not a link\]
\# not a heading
\`not code\`
```

---

## Best Practices

1. **Use headings hierarchically** - Don't skip heading levels (h1 → h3)
2. **Add alt text to images** - Improves accessibility and SEO
3. **Use fenced code blocks** - Specify the language for syntax highlighting
4. **Keep lines reasonable** - Long lines can be hard to read in source
5. **Use blank lines** - Separate different elements for clarity
6. **Preview your content** - Use `sia dev` to see how it renders
