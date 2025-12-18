import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, basename, extname, relative } from 'path';
import matter from 'gray-matter';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import { markedEmoji } from 'marked-emoji';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import footnote from 'marked-footnote';
import { markedSmartypants } from 'marked-smartypants';
import markedAlert from 'marked-alert';
import markedLinkifyIt from 'marked-linkify-it';
import hljs from 'highlight.js';

/**
 * Default emoji map for shortcode support
 * Common emojis - extend as needed
 */
const emojis = {
  smile: '😄',
  grinning: '😀',
  joy: '😂',
  heart: '❤️',
  thumbsup: '👍',
  thumbsdown: '👎',
  clap: '👏',
  fire: '🔥',
  rocket: '🚀',
  star: '⭐',
  sparkles: '✨',
  check: '✅',
  x: '❌',
  warning: '⚠️',
  bulb: '💡',
  memo: '📝',
  book: '📖',
  link: '🔗',
  eyes: '👀',
  thinking: '🤔',
  wave: '👋',
  pray: '🙏',
  muscle: '💪',
  tada: '🎉',
  party: '🥳',
  coffee: '☕',
  bug: '🐛',
  wrench: '🔧',
  hammer: '🔨',
  gear: '⚙️',
  lock: '🔒',
  key: '🔑',
  zap: '⚡',
  bomb: '💣',
  gem: '💎',
  trophy: '🏆',
  medal: '🏅',
  crown: '👑',
  sun: '☀️',
  moon: '🌙',
  cloud: '☁️',
  rain: '🌧️',
  snow: '❄️',
  earth: '🌍',
  tree: '🌳',
  flower: '🌸',
  apple: '🍎',
  pizza: '🍕',
  beer: '🍺',
  wine: '🍷',
  cat: '🐱',
  dog: '🐶',
  bird: '🐦',
  fish: '🐟',
  whale: '🐳',
  snake: '🐍',
  turtle: '🐢',
  octopus: '🐙',
  crab: '🦀',
  shrimp: '🦐',
  100: '💯',
  '+1': '👍',
  '-1': '👎',
};

/**
 * Configure marked with syntax highlighting, emoji support, and enhanced markdown features
 */
const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch (err) {
          console.warn(`Highlight.js error for language "${lang}":`, err.message);
        }
      }
      // Auto-detect language if not specified
      try {
        return hljs.highlightAuto(code).value;
      } catch (err) {
        return code;
      }
    }
  }),
  markedEmoji({
    emojis,
    renderer: (token) => token.emoji
  }),
  gfmHeadingId(),
  footnote(),
  markedSmartypants(),
  markedAlert(),
  markedLinkifyIt()
);

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: false
});

/**
 * Generate a URL-friendly slug from a string
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract slug from filename (removes date prefix if present)
 */
export function getSlugFromFilename(filename) {
  // Remove extension
  const name = basename(filename, extname(filename));
  
  // Check for date prefix pattern: YYYY-MM-DD-slug
  const datePattern = /^\d{4}-\d{2}-\d{2}-(.+)$/;
  const match = name.match(datePattern);
  
  if (match) {
    return match[1];
  }
  
  return slugify(name);
}

/**
 * Extract date from filename if present
 */
export function getDateFromFilename(filename) {
  const name = basename(filename, extname(filename));
  const datePattern = /^(\d{4}-\d{2}-\d{2})/;
  const match = name.match(datePattern);
  
  if (match) {
    return new Date(match[1]);
  }
  
  return null;
}

/**
 * Parse a markdown file with front matter
 */
export function parseContent(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const { data: frontMatter, content: markdown } = matter(content);
  
  // Parse markdown to HTML
  const html = marked.parse(markdown);
  
  // Get slug from front matter or filename
  const slug = frontMatter.slug || getSlugFromFilename(filePath);
  
  // Get date from front matter or filename
  let date = frontMatter.date;
  if (date) {
    date = new Date(date);
  } else {
    date = getDateFromFilename(filePath) || new Date();
  }
  
  // Extract excerpt (first paragraph or custom excerpt)
  let excerpt = frontMatter.excerpt;
  if (!excerpt) {
    const firstParagraph = markdown.split('\n\n')[0];
    excerpt = firstParagraph.replace(/^#+\s+.+\n?/, '').trim();
    // Limit excerpt length
    if (excerpt.length > 200) {
      excerpt = excerpt.substring(0, 197) + '...';
    }
  }
  
  // Normalize tags to array
  let tags = frontMatter.tags || [];
  if (typeof tags === 'string') {
    tags = tags.split(',').map(t => t.trim());
  }
  
  return {
    ...frontMatter,
    slug,
    date,
    excerpt,
    tags,
    content: html,
    rawContent: markdown,
    filePath,
    draft: frontMatter.draft || false
  };
}

/**
 * Recursively get all markdown files in a directory
 */
export function getMarkdownFiles(dir) {
  const files = [];
  
  if (!existsSync(dir)) {
    return files;
  }
  
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getMarkdownFiles(fullPath));
    } else if (item.endsWith('.md') || item.endsWith('.markdown')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Load all content from a collection directory
 */
export function loadCollection(config, collectionName) {
  const collectionConfig = config.collections[collectionName];
  
  if (!collectionConfig) {
    console.warn(`Collection "${collectionName}" not found in config`);
    return [];
  }
  
  const collectionDir = join(config.inputDir, collectionConfig.path);
  const files = getMarkdownFiles(collectionDir);
  
  const items = files
    .map(filePath => {
      try {
        const item = parseContent(filePath);
        
        // Add collection-specific metadata
        item.collection = collectionName;
        item.layout = item.layout || collectionConfig.layout;
        
        // Generate permalink
        let permalink = item.permalink || collectionConfig.permalink || '/:slug/';
        permalink = permalink
          .replace(':slug', item.slug)
          .replace(':year', item.date.getFullYear())
          .replace(':month', String(item.date.getMonth() + 1).padStart(2, '0'))
          .replace(':day', String(item.date.getDate()).padStart(2, '0'));
        
        // Prepend basePath for subpath hosting support
        const basePath = config.site.basePath || '';
        item.url = basePath + permalink;
        item.outputPath = join(config.outputDir, permalink, 'index.html');
        
        return item;
      } catch (err) {
        console.error(`Error parsing ${filePath}:`, err.message);
        return null;
      }
    })
    .filter(item => item !== null && !item.draft);
  
  // Sort items
  const sortBy = collectionConfig.sortBy || 'date';
  const sortOrder = collectionConfig.sortOrder || 'desc';
  
  items.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (aVal instanceof Date && bVal instanceof Date) {
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    }
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'desc' 
        ? bVal.localeCompare(aVal) 
        : aVal.localeCompare(bVal);
    }
    
    return 0;
  });
  
  return items;
}

/**
 * Load all collections defined in config
 */
export function loadAllCollections(config) {
  const collections = {};
  
  for (const name of Object.keys(config.collections)) {
    collections[name] = loadCollection(config, name);
    console.log(`📚 Loaded ${collections[name].length} items from "${name}" collection`);
  }
  
  return collections;
}

export default {
  parseContent,
  slugify,
  getSlugFromFilename,
  getDateFromFilename,
  getMarkdownFiles,
  loadCollection,
  loadAllCollections
};

