/**
 * Sia - A simple, powerful static site generator
 */

export { loadConfig, getDefaultConfig } from './config.js';
export { 
  parseContent, 
  slugify, 
  getSlugFromFilename, 
  loadCollection, 
  loadAllCollections 
} from './content.js';
export { 
  buildTagCollections, 
  getAllTags, 
  paginate, 
  buildSiteData, 
  getRecentItems, 
  getRelatedItems 
} from './collections.js';
export { 
  createTemplateEngine, 
  renderTemplate, 
  renderString 
} from './templates.js';
export { 
  copyImages, 
  copyAssets, 
  copyStaticAssets, 
  writeFile, 
  ensureDir 
} from './assets.js';
export { build, buildCommand } from './build.js';
export { startServer, devCommand } from './server.js';
export { newCommand } from './new.js';
export { initSite, initCommand } from './init.js';

// Default export with version
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let version = '1.0.0';
try {
  const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
  version = pkg.version;
} catch (e) {
  // Ignore error
}

export default {
  version
};

