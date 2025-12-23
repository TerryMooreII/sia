import { 
  readdirSync, 
  statSync, 
  existsSync, 
  mkdirSync, 
  copyFileSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  rmdirSync
} from 'fs';
import { join, dirname, relative, extname } from 'path';
import { resolveTheme, getBuiltInThemesDir } from './theme-resolver.js';

// Supported asset extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.avif'];
const STATIC_EXTENSIONS = ['.css', '.js', '.json', '.xml', '.txt', '.pdf', '.woff', '.woff2', '.ttf', '.eot'];
const ALL_ASSET_EXTENSIONS = [...IMAGE_EXTENSIONS, ...STATIC_EXTENSIONS];

/**
 * Check if a file is an asset
 */
export function isAsset(filePath) {
  const ext = extname(filePath).toLowerCase();
  return ALL_ASSET_EXTENSIONS.includes(ext);
}

/**
 * Check if a file is an image
 */
export function isImage(filePath) {
  const ext = extname(filePath).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dir, fileList = []) {
  if (!existsSync(dir)) {
    return fileList;
  }
  
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  
  return fileList;
}

/**
 * Ensure a directory exists
 */
export function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Copy a single file
 */
export function copyFile(src, dest) {
  ensureDir(dirname(dest));
  copyFileSync(src, dest);
}

/**
 * Copy all assets from source to destination
 */
export function copyAssets(srcDir, destDir) {
  const copied = [];
  
  if (!existsSync(srcDir)) {
    return copied;
  }
  
  const files = getAllFiles(srcDir);
  
  for (const file of files) {
    if (isAsset(file)) {
      const relativePath = relative(srcDir, file);
      const destPath = join(destDir, relativePath);
      
      copyFile(file, destPath);
      copied.push(relativePath);
    }
  }
  
  return copied;
}

/**
 * Copy images from the images folder
 */
export function copyImages(config) {
  const imagesDir = join(config.inputDir, 'images');
  const outputImagesDir = join(config.outputDir, 'images');
  
  const copied = copyAssets(imagesDir, outputImagesDir);
  
  if (copied.length > 0) {
    console.log(`🖼️  Copied ${copied.length} images`);
  }
  
  return copied;
}

/**
 * Check if directory has CSS files
 */
function hasCssFiles(dir) {
  if (!existsSync(dir)) return false;
  
  const files = getAllFiles(dir);
  return files.some(f => extname(f).toLowerCase() === '.css');
}

/**
 * Copy default styles to output
 * 
 * @param {object} config - Site configuration
 * @param {object} [resolvedTheme] - Pre-resolved theme info from resolveTheme()
 */
export function copyDefaultStyles(config, resolvedTheme = null) {
  const outputStylesDir = join(config.outputDir, 'styles');
  
  // Check if user has custom styles (must actually have CSS files)
  const userStylesDir = join(config.rootDir, 'styles');
  
  if (hasCssFiles(userStylesDir)) {
    // Copy user styles
    const copied = copyAssets(userStylesDir, outputStylesDir);
    console.log(`🎨 Copied ${copied.length} custom style files`);
    return copied;
  }
  
  // Resolve theme if not already resolved
  const themeName = config.theme?.name || 'main';
  const theme = resolvedTheme || resolveTheme(themeName, config.rootDir);
  const themeStylesDir = join(theme.themeDir, 'styles');
  
  if (existsSync(themeStylesDir)) {
    const copied = copyAssets(themeStylesDir, outputStylesDir);
    if (!theme.isExternal) {
      console.log(`🎨 Using "${theme.themeName}" theme`);
    }
    return copied;
  }
  
  // Fallback to main theme if theme styles not found
  const fallbackStylesDir = join(getBuiltInThemesDir(), 'main', 'styles');
  if (existsSync(fallbackStylesDir)) {
    console.log(`⚠️  Theme "${themeName}" styles not found, using "main" theme styles`);
    const copied = copyAssets(fallbackStylesDir, outputStylesDir);
    return copied;
  }
  
  console.log('⚠️  No styles found');
  return [];
}

/**
 * Copy all static assets (non-image files from root)
 */
export function copyStaticAssets(config) {
  const staticDirs = ['assets', 'static', 'public'];
  let totalCopied = 0;
  
  for (const dirName of staticDirs) {
    const srcDir = join(config.rootDir, dirName);
    
    if (existsSync(srcDir)) {
      const destDir = join(config.outputDir, dirName);
      const copied = copyAssets(srcDir, destDir);
      totalCopied += copied.length;
    }
  }
  
  // Also copy favicon if it exists in root
  const faviconSrc = join(config.rootDir, 'favicon.ico');
  if (existsSync(faviconSrc)) {
    copyFile(faviconSrc, join(config.outputDir, 'favicon.ico'));
    totalCopied++;
  }
  
  if (totalCopied > 0) {
    console.log(`📁 Copied ${totalCopied} static assets`);
  }
  
  return totalCopied;
}

/**
 * Copy custom CSS and JavaScript files defined in config
 * 
 * @param {object} config - Site configuration
 * @returns {object} Object with css and js arrays of output paths
 */
export function copyCustomAssets(config) {
  const customAssets = {
    css: [],
    js: []
  };
  
  if (!config.assets) {
    return customAssets;
  }
  
  const outputStylesDir = join(config.outputDir, 'styles');
  const outputScriptsDir = join(config.outputDir, 'scripts');
  
  // Copy CSS files
  if (Array.isArray(config.assets.css) && config.assets.css.length > 0) {
    for (const cssPath of config.assets.css) {
      const srcPath = join(config.rootDir, cssPath);
      
      if (!existsSync(srcPath)) {
        console.warn(`⚠️  Custom CSS file not found: ${cssPath}`);
        continue;
      }
      
      // Preserve directory structure in output
      // e.g., custom/styles.css -> dist/styles/custom/styles.css
      const relativePath = cssPath.startsWith('/') ? cssPath.slice(1) : cssPath;
      const destPath = join(outputStylesDir, relativePath);
      
      copyFile(srcPath, destPath);
      
      // Store output path for template injection (relative to output root)
      const outputPath = `/styles/${relativePath}`;
      customAssets.css.push(outputPath);
    }
    
    if (customAssets.css.length > 0) {
      console.log(`📝 Copied ${customAssets.css.length} custom CSS file(s)`);
    }
  }
  
  // Copy JavaScript files
  if (Array.isArray(config.assets.js) && config.assets.js.length > 0) {
    for (const jsPath of config.assets.js) {
      const srcPath = join(config.rootDir, jsPath);
      
      if (!existsSync(srcPath)) {
        console.warn(`⚠️  Custom JavaScript file not found: ${jsPath}`);
        continue;
      }
      
      // Preserve directory structure in output
      // e.g., custom/script.js -> dist/scripts/custom/script.js
      const relativePath = jsPath.startsWith('/') ? jsPath.slice(1) : jsPath;
      const destPath = join(outputScriptsDir, relativePath);
      
      copyFile(srcPath, destPath);
      
      // Store output path for template injection (relative to output root)
      const outputPath = `/scripts/${relativePath}`;
      customAssets.js.push(outputPath);
    }
    
    if (customAssets.js.length > 0) {
      console.log(`📜 Copied ${customAssets.js.length} custom JavaScript file(s)`);
    }
  }
  
  return customAssets;
}

/**
 * Write a file with directory creation
 */
export function writeFile(filePath, content) {
  ensureDir(dirname(filePath));
  writeFileSync(filePath, content, 'utf-8');
}

/**
 * Clean a directory (remove all contents)
 */
export function cleanDir(dirPath) {
  if (!existsSync(dirPath)) {
    return;
  }
  
  const items = readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = join(dirPath, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      cleanDir(fullPath);
      // Remove empty directory
      try {
        rmdirSync(fullPath);
      } catch (e) {
        // Ignore if directory not empty
      }
    } else {
      unlinkSync(fullPath);
    }
  }
}

export default {
  isAsset,
  isImage,
  ensureDir,
  copyFile,
  copyAssets,
  copyImages,
  copyDefaultStyles,
  copyStaticAssets,
  copyCustomAssets,
  writeFile,
  cleanDir
};

