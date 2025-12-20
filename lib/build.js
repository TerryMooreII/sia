import { existsSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadConfig } from './config.js';
import { buildSiteData, paginate, getPaginationUrls } from './collections.js';
import { createTemplateEngine, renderTemplate } from './templates.js';
import { copyImages, copyDefaultStyles, copyStaticAssets, writeFile, ensureDir } from './assets.js';
import { resolveTheme } from './theme-resolver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Clean the output directory
 */
function cleanOutput(config) {
  if (existsSync(config.outputDir)) {
    rmSync(config.outputDir, { recursive: true, force: true });
  }
  mkdirSync(config.outputDir, { recursive: true });
  console.log('🧹 Cleaned output directory');
}

/**
 * Render and write a single content item
 */
function renderContentItem(env, item, siteData) {
  const templateName = `${item.layout}.njk`;
  
  const html = renderTemplate(env, templateName, {
    ...siteData,
    page: item,
    content: item.content,
    title: item.title
  });
  
  writeFile(item.outputPath, html);
}

/**
 * Render paginated listing pages
 */
function renderPaginatedPages(env, siteData, baseUrl, outputBase, templateName, extraData = {}) {
  const { paginatedCollections } = siteData;
  const basePath = siteData.config.site.basePath || '';
  
  // Get all posts for the main blog listing
  const posts = siteData.collections.posts || [];
  const pages = paginate(posts, siteData.config.pagination.size);
  
  for (const page of pages) {
    const pagination = getPaginationUrls(baseUrl, page, basePath);
    
    const html = renderTemplate(env, templateName, {
      ...siteData,
      pagination,
      posts: page.items,
      ...extraData
    });
    
    const outputPath = page.pageNumber === 1
      ? join(outputBase, 'index.html')
      : join(outputBase, 'page', String(page.pageNumber), 'index.html');
    
    writeFile(outputPath, html);
  }
  
  return pages.length;
}

/**
 * Render tag pages
 */
function renderTagPages(env, siteData) {
  const { tags, allTags, config } = siteData;
  const basePath = config.site.basePath || '';
  
  // Render main tags listing page
  const tagsHtml = renderTemplate(env, 'tags.njk', {
    ...siteData,
    title: 'Tags'
  });
  writeFile(join(config.outputDir, 'tags', 'index.html'), tagsHtml);
  
  // Render individual tag pages with pagination
  for (const [, tagData] of Object.entries(tags)) {
    const tagPages = paginate(tagData.items, config.pagination.size);
    const baseUrl = `/tags/${tagData.slug}/`;
    
    for (const page of tagPages) {
      const pagination = getPaginationUrls(baseUrl, page, basePath);
      
      const html = renderTemplate(env, 'tag.njk', {
        ...siteData,
        tag: tagData,
        pagination,
        posts: page.items,
        title: `Tagged: ${tagData.name}`
      });
      
      const outputPath = page.pageNumber === 1
        ? join(config.outputDir, 'tags', tagData.slug, 'index.html')
        : join(config.outputDir, 'tags', tagData.slug, 'page', String(page.pageNumber), 'index.html');
      
      writeFile(outputPath, html);
    }
  }
  
  console.log(`🏷️  Generated ${Object.keys(tags).length} tag pages`);
}

/**
 * Render the homepage
 */
function renderHomepage(env, siteData) {
  const html = renderTemplate(env, 'index.njk', {
    ...siteData,
    title: siteData.site.title
  });
  
  writeFile(join(siteData.config.outputDir, 'index.html'), html);
  console.log('🏠 Generated homepage');
}

/**
 * Render the blog listing with pagination
 */
function renderBlogListing(env, siteData) {
  const { config } = siteData;
  const blogDir = join(config.outputDir, 'blog');
  
  const pageCount = renderPaginatedPages(
    env,
    siteData,
    '/blog/',
    blogDir,
    'blog.njk'
  );
  
  console.log(`📝 Generated ${pageCount} blog listing pages`);
}

/**
 * Render notes listing
 */
function renderNotesListing(env, siteData) {
  const { config, collections } = siteData;
  const notes = collections.notes || [];
  const basePath = config.site.basePath || '';
  
  if (notes.length === 0) return;
  
  const notesDir = join(config.outputDir, 'notes');
  const pages = paginate(notes, config.pagination.size);
  
  for (const page of pages) {
    const pagination = getPaginationUrls('/notes/', page, basePath);
    
    const html = renderTemplate(env, 'notes.njk', {
      ...siteData,
      pagination,
      notes: page.items,
      title: 'Notes'
    });
    
    const outputPath = page.pageNumber === 1
      ? join(notesDir, 'index.html')
      : join(notesDir, 'page', String(page.pageNumber), 'index.html');
    
    writeFile(outputPath, html);
  }
  
  console.log(`📋 Generated ${pages.length} notes listing pages`);
}

/**
 * Generate RSS feed
 */
function renderRSSFeed(env, siteData) {
  const { config, collections } = siteData;
  const posts = collections.posts || [];
  
  const rss = renderTemplate(env, 'feed.njk', {
    ...siteData,
    posts,
    buildDate: new Date().toUTCString()
  });
  
  writeFile(join(config.outputDir, 'feed.xml'), rss);
  console.log('📡 Generated RSS feed');
}

/**
 * Main build function
 */
export async function build(options = {}) {
  const startTime = Date.now();
  
  console.log('\n⚡ Sia - Building site...\n');
  
  // Load configuration
  const config = loadConfig(options.rootDir || process.cwd());
  
  // Only show drafts in dev mode if explicitly enabled in config
  // For production builds, always disable showDrafts
  if (!options.devMode) {
    if (config.server) {
      config.server.showDrafts = false;
    }
  }
  // If devMode is true, use the config value (which defaults to false)
  
  // Clean output directory if requested
  if (options.clean !== false) {
    cleanOutput(config);
  }
  
  // Resolve theme once for both templates and assets
  const themeName = config.theme?.name || 'main';
  const resolvedTheme = resolveTheme(themeName, config.rootDir);
  
  // Build site data (collections, tags, etc.)
  const siteData = buildSiteData(config);
  
  // Create template engine with resolved theme
  const env = createTemplateEngine(config, resolvedTheme);
  
  // Render all content items
  let itemCount = 0;
  
  for (const [collectionName, items] of Object.entries(siteData.collections)) {
    for (const item of items) {
      renderContentItem(env, item, siteData);
      itemCount++;
    }
  }
  
  console.log(`📄 Generated ${itemCount} content pages`);
  
  // Render listing pages
  renderHomepage(env, siteData);
  renderBlogListing(env, siteData);
  renderNotesListing(env, siteData);
  renderTagPages(env, siteData);
  
  // Generate RSS feed
  renderRSSFeed(env, siteData);
  
  // Copy assets
  copyImages(config);
  copyDefaultStyles(config, resolvedTheme);
  copyStaticAssets(config);
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ Build complete in ${duration}s`);
  console.log(`📁 Output: ${config.outputDir}\n`);
  
  return { config, siteData };
}

/**
 * Build command handler for CLI
 */
export async function buildCommand(options) {
  try {
    await build({
      clean: options.clean !== false,
      rootDir: process.cwd()
    });
  } catch (err) {
    console.error('❌ Build failed:', err.message);
    process.exit(1);
  }
}

export default { build, buildCommand };

