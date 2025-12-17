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
 */
export function copyDefaultStyles(config, defaultsDir) {
  const defaultStylesDir = join(defaultsDir, 'styles');
  const outputStylesDir = join(config.outputDir, 'styles');
  
  // Check if user has custom styles (must actually have CSS files)
  const userStylesDir = join(config.rootDir, 'styles');
  
  if (hasCssFiles(userStylesDir)) {
    // Copy user styles
    const copied = copyAssets(userStylesDir, outputStylesDir);
    console.log(`🎨 Copied ${copied.length} custom style files`);
    return copied;
  }
  
  // Copy default styles from the package
  if (existsSync(defaultStylesDir)) {
    const copied = copyAssets(defaultStylesDir, outputStylesDir);
    console.log(`🎨 Copied ${copied.length} default style files`);
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
  writeFile,
  cleanDir
};

