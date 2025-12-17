---
title: "Markdown Features Guide"
date: 2024-12-16
tags: [markdown, tutorial]
---

This post demonstrates the markdown features supported by Static Forge.

## Headers

Use `#` for headers. The more `#` symbols, the smaller the header.

## Text Formatting

You can make text **bold**, *italic*, or ***both***. You can also use ~~strikethrough~~.

## Links and Images

[This is a link](https://example.com) and here's how to add images:

```markdown
![Alt text](/images/photo.jpg)
```

## Lists

### Unordered Lists

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered Lists

1. First step
2. Second step
3. Third step

## Blockquotes

> "The best way to predict the future is to create it."
> — Peter Drucker

## Code

Inline `code` looks like this.

Code blocks with syntax highlighting:

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('World'));
```

## Tables

| Feature | Supported |
|---------|-----------|
| Markdown | ✅ |
| Front Matter | ✅ |
| Tags | ✅ |
| Pagination | ✅ |

## Horizontal Rule

Use `---` for a horizontal rule:

---

That's it! Enjoy writing in markdown.

