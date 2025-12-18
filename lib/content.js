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
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - VIDEO_ID (if it's just an 11-character alphanumeric string)
 */
function extractYouTubeId(url) {
  if (!url) return null;
  
  // If it's just a video ID (11 characters, alphanumeric)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }
  
  // Match various YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Convert YouTube URLs in HTML to responsive embeds
 */
function embedYouTubeVideos(html) {
  if (!html) return html;
  
  // Pattern to match YouTube links in HTML
  // Matches: <a href="...youtube...">...</a>
  const linkPattern = /<a\s+[^>]*href=["']([^"']*youtube[^"']*)["'][^>]*>([^<]*)<\/a>/gi;
  
  return html.replace(linkPattern, (match, url, linkText) => {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      // Return responsive YouTube embed
      return `<div class="youtube-embed"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    }
    return match; // Return original if not a valid YouTube URL
  });
}

/**
 * Extract Giphy GIF ID from various URL formats
 * Supports:
 * - https://giphy.com/gifs/ID
 * - https://gph.is/g/ID
 * - https://giphy.com/embed/ID
 * - https://media.giphy.com/media/ID/giphy.gif (extracts ID)
 */
function extractGiphyId(url) {
  if (!url) return null;
  
  // Match Giphy URL patterns
  const patterns = [
    /giphy\.com\/gifs\/([a-zA-Z0-9]+)/,
    /giphy\.com\/embed\/([a-zA-Z0-9]+)/,
    /gph\.is\/g\/([a-zA-Z0-9]+)/,
    /media\.giphy\.com\/media\/([a-zA-Z0-9]+)\//
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Convert Giphy URLs in HTML to responsive embeds
 */
function embedGiphyGifs(html) {
  if (!html) return html;
  
  // Pattern to match Giphy links in HTML
  const linkPattern = /<a\s+[^>]*href=["']([^"']*giphy[^"']*)["'][^>]*>([^<]*)<\/a>/gi;
  
  return html.replace(linkPattern, (match, url, linkText) => {
    const gifId = extractGiphyId(url);
    if (gifId) {
      // Return responsive Giphy embed
      return `<div class="giphy-embed"><iframe src="https://giphy.com/embed/${gifId}" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div>`;
    }
    return match;
  });
}

// Override the link renderer to handle YouTube and Giphy URLs
marked.use({
  renderer: {
    link(href, s, text) {
      const videoId = extractYouTubeId(href);
      
      if (videoId) {
        // Return responsive YouTube embed instead of a link
        return `<div class="youtube-embed"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      }
      
      const gifId = extractGiphyId(href);
      
      if (gifId) {
        // Return responsive Giphy embed instead of a link
        return `<div class="giphy-embed"><iframe src="https://giphy.com/embed/${gifId}" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div>`;
      }
      
      // Use default link rendering for non-YouTube/Giphy links
      text = text || href;
      const title = text ? ` title="${text}"` : '';
      return `<a href="${href}"${title}>${text}</a>`;
    }
  }
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
  let html = marked.parse(markdown);
  
  // Convert any remaining YouTube/Giphy links to embeds (handles autolinked URLs)
  html = embedYouTubeVideos(html);
  html = embedGiphyGifs(html);
  
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
    .filter(item => {
      if (item === null) return false;
      // Include drafts if showDrafts is enabled in server config
      if (item.draft && config.server?.showDrafts) {
        return true;
      }
      // Otherwise, exclude drafts
      return !item.draft;
    });
  
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

