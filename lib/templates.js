import nunjucks from 'nunjucks';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Format a date
 */
function dateFilter(date, format = 'long') {
  if (!date) return '';
  
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return '';
  
  const formats = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    iso: null,
    rss: null,
    year: { year: 'numeric' },
    month: { month: 'long', year: 'numeric' },
    time: { hour: 'numeric', minute: '2-digit' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    full_time: { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }
  };
  
  if (format === 'iso') {
    return d.toISOString().split('T')[0];
  }
  
  // RSS date format (RFC 822)
  if (format === 'rss') {
    return d.toUTCString();
  }
  
  const options = formats[format] || formats.long;
  return d.toLocaleDateString('en-US', options);
}

/**
 * Generate a slug from a string
 */
function slugFilter(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get excerpt from content
 */
function excerptFilter(content, length = 200) {
  if (!content) return '';
  
  // Strip HTML tags
  const text = content.replace(/<[^>]+>/g, '');
  
  if (text.length <= length) return text;
  
  // Find last space before limit
  const truncated = text.substring(0, length);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace) + '...';
}

/**
 * Limit array items
 */
function limitFilter(arr, count) {
  if (!Array.isArray(arr)) return arr;
  return arr.slice(0, count);
}

/**
 * Skip array items
 */
function skipFilter(arr, count) {
  if (!Array.isArray(arr)) return arr;
  return arr.slice(count);
}

/**
 * Get word count
 */
function wordCountFilter(content) {
  if (!content) return 0;
  const text = content.replace(/<[^>]+>/g, '');
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Estimate reading time
 */
function readingTimeFilter(content, wordsPerMinute = 200) {
  const words = wordCountFilter(content);
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes === 1 ? '1 min read' : `${minutes} min read`;
}

/**
 * Group items by a property
 */
function groupByFilter(arr, key) {
  if (!Array.isArray(arr)) return {};
  
  return arr.reduce((groups, item) => {
    const value = item[key];
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(item);
    return groups;
  }, {});
}

/**
 * Sort array by property
 */
function sortByFilter(arr, key, order = 'asc') {
  if (!Array.isArray(arr)) return arr;
  
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal instanceof Date && bVal instanceof Date) {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    }
    
    return order === 'asc' ? aVal - bVal : bVal - aVal;
  });
}

/**
 * Filter items where property matches value
 */
function whereFilter(arr, key, value) {
  if (!Array.isArray(arr)) return arr;
  return arr.filter(item => item[key] === value);
}

/**
 * Filter items that have a tag
 */
function withTagFilter(arr, tag) {
  if (!Array.isArray(arr)) return arr;
  const normalizedTag = tag.toLowerCase();
  return arr.filter(item => 
    item.tags && item.tags.some(t => t.toLowerCase() === normalizedTag)
  );
}

/**
 * JSON stringify for debugging
 */
function jsonFilter(obj, spaces = 2) {
  return JSON.stringify(obj, null, spaces);
}

/**
 * Create a URL filter that prepends the basePath
 */
function createUrlFilter(basePath) {
  return function urlFilter(path) {
    if (!path) return basePath || '/';
    // If path is already absolute with protocol, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : '/' + path;
    return (basePath || '') + normalizedPath;
  };
}

/**
 * Create and configure the Nunjucks environment
 */
export function createTemplateEngine(config) {
  // Set up template paths - user layouts first, then defaults
  const templatePaths = [];
  
  // User's custom layouts
  if (existsSync(config.layoutsDir)) {
    templatePaths.push(config.layoutsDir);
  }
  
  // User's custom includes
  if (existsSync(config.includesDir)) {
    templatePaths.push(config.includesDir);
  }
  
  // Default templates from the selected theme
  const themeName = config.theme || 'main';
  const themeDir = join(__dirname, '..', 'themes', themeName);
  templatePaths.push(join(themeDir, 'layouts'));
  templatePaths.push(join(themeDir, 'includes'));
  templatePaths.push(join(themeDir, 'pages'));
  
  // Shared includes available to all themes
  const sharedIncludesDir = join(__dirname, '..', 'themes', '_shared', 'includes');
  templatePaths.push(sharedIncludesDir);
  
  // Create the environment
  const env = nunjucks.configure(templatePaths, {
    autoescape: true,
    noCache: true,
    throwOnUndefined: false
  });
  
  // Add custom filters
  env.addFilter('date', dateFilter);
  env.addFilter('slug', slugFilter);
  env.addFilter('excerpt', excerptFilter);
  env.addFilter('limit', limitFilter);
  env.addFilter('skip', skipFilter);
  env.addFilter('wordCount', wordCountFilter);
  env.addFilter('readingTime', readingTimeFilter);
  env.addFilter('groupBy', groupByFilter);
  env.addFilter('sortBy', sortByFilter);
  env.addFilter('where', whereFilter);
  env.addFilter('withTag', withTagFilter);
  env.addFilter('json', jsonFilter);
  
  // Add URL filter with basePath support
  env.addFilter('url', createUrlFilter(config.site.basePath));
  
  return env;
}

/**
 * Render a template with data
 */
export function renderTemplate(env, templateName, data) {
  try {
    return env.render(templateName, data);
  } catch (err) {
    console.error(`Error rendering template "${templateName}":`, err.message);
    throw err;
  }
}

/**
 * Render a string template (for content with Nunjucks syntax)
 */
export function renderString(env, content, data) {
  try {
    return env.renderString(content, data);
  } catch (err) {
    console.error('Error rendering string template:', err.message);
    throw err;
  }
}

export default {
  createTemplateEngine,
  renderTemplate,
  renderString
};

