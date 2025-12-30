import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

// Default configuration
const defaultConfig = {
  site: {
    title: 'My Site',
    description: 'A static site built with Static Forge',
    url: 'http://localhost:3000',
    author: 'Anonymous'
  },
  theme: {
    name: 'main'  // Theme to use: 'main', 'minimal', 'developer', or 'magazine'
  },
  input: 'src',
  output: 'dist',
  layouts: '_layouts',
  includes: '_includes',
  collections: {
    posts: {
      path: 'posts',
      layout: 'post',
      permalink: '/blog/:slug/',
      sortBy: 'date',
      sortOrder: 'desc'
    },
    pages: {
      path: 'pages',
      layout: 'page',
      permalink: '/:slug/'
    },
    notes: {
      path: 'notes',
      layout: 'note',
      permalink: '/notes/:slug/',
      sortBy: 'date',
      sortOrder: 'desc'
    }
  },
  pagination: {
    size: 10
  },
  server: {
    port: 3000,
    showDrafts: false  // Show draft posts when using dev server
  },
  assets: {
    css: [],  // Array of custom CSS file paths (relative to root)
    js: []    // Array of custom JavaScript file paths (relative to root)
  },
  plugins: {
    enabled: true,  // Master switch for plugins
    strictMode: false,  // Fail build on plugin errors (default: continue)
    order: [],  // Explicit plugin execution order (optional)
    plugins: [],  // Explicit list of plugins to load (optional, empty = all)
    config: {}  // Plugin-specific configuration
  }
};

/**
 * Deep merge two objects
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

/**
 * Load configuration from YAML or JSON file
 */
export function loadConfig(rootDir = process.cwd()) {
  let userConfig = {};
  
  // Try to load _config.yml first, then _config.json
  const yamlPath = join(rootDir, '_config.yml');
  const jsonPath = join(rootDir, '_config.json');
  
  if (existsSync(yamlPath)) {
    try {
      const content = readFileSync(yamlPath, 'utf-8');
      userConfig = yaml.load(content) || {};
      console.log('📄 Loaded configuration from _config.yml');
    } catch (err) {
      console.error('Error parsing _config.yml:', err.message);
    }
  } else if (existsSync(jsonPath)) {
    try {
      const content = readFileSync(jsonPath, 'utf-8');
      userConfig = JSON.parse(content);
      console.log('📄 Loaded configuration from _config.json');
    } catch (err) {
      console.error('Error parsing _config.json:', err.message);
    }
  } else {
    console.log('⚠️  No config file found, using defaults');
  }
  
  // Merge user config with defaults
  const config = deepMerge(defaultConfig, userConfig);
  
  // Extract basePath from site URL (e.g., "https://example.org/test" -> "/test")
  try {
    const siteUrl = new URL(config.site.url);
    config.site.basePath = siteUrl.pathname.replace(/\/$/, '') || '';
  } catch (e) {
    config.site.basePath = '';
  }
  
  // Add computed paths
  config.rootDir = rootDir;
  config.inputDir = join(rootDir, config.input);
  config.outputDir = join(rootDir, config.output);
  config.layoutsDir = join(rootDir, config.layouts);
  config.includesDir = join(rootDir, config.includes);
  
  return config;
}

/**
 * Get the default configuration
 */
export function getDefaultConfig() {
  return { ...defaultConfig };
}

export default { loadConfig, getDefaultConfig };

