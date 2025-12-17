import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import { loadConfig } from './config.js';
import { build } from './build.js';

// MIME types for common file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.pdf': 'application/pdf'
};

// Live reload script to inject into HTML pages
const LIVE_RELOAD_SCRIPT = `
<script>
(function() {
  const ws = new WebSocket('ws://' + window.location.hostname + ':{{WS_PORT}}');
  ws.onmessage = function(event) {
    if (event.data === 'reload') {
      console.log('[Sia] Reloading...');
      window.location.reload();
    }
  };
  ws.onopen = function() {
    console.log('[Sia] Live reload connected');
  };
  ws.onclose = function() {
    console.log('[Sia] Live reload disconnected');
    // Try to reconnect
    setTimeout(function() {
      window.location.reload();
    }, 1000);
  };
})();
</script>
`;

/**
 * Inject live reload script into HTML
 */
function injectLiveReload(html, wsPort) {
  const script = LIVE_RELOAD_SCRIPT.replace('{{WS_PORT}}', wsPort);
  return html.replace('</body>', script + '</body>');
}

/**
 * Create the HTTP server
 */
function createHttpServer(config, wsPort) {
  const server = createServer((req, res) => {
    // Parse URL
    let urlPath = req.url.split('?')[0];
    
    // Handle root and trailing slashes
    if (urlPath.endsWith('/')) {
      urlPath += 'index.html';
    }
    
    // Build the file path
    let filePath = join(config.outputDir, urlPath);
    
    // Check if file exists, try adding .html
    if (!existsSync(filePath)) {
      const htmlPath = filePath + '.html';
      if (existsSync(htmlPath)) {
        filePath = htmlPath;
      } else {
        // Try index.html in directory
        const indexPath = join(filePath, 'index.html');
        if (existsSync(indexPath)) {
          filePath = indexPath;
        }
      }
    }
    
    // 404 if file still doesn't exist
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Not Found</h1>');
      console.log(`  404 ${req.url}`);
      return;
    }
    
    // Get MIME type
    const ext = extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // Read and serve file
    try {
      let content = readFileSync(filePath);
      
      // Inject live reload script into HTML files
      if (ext === '.html') {
        content = injectLiveReload(content.toString(), wsPort);
      }
      
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content);
      console.log(`  200 ${req.url}`);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h1>500 - Internal Server Error</h1>');
      console.error(`  500 ${req.url}: ${err.message}`);
    }
  });
  
  return server;
}

/**
 * Create WebSocket server for live reload
 */
function createWsServer(port) {
  const wss = new WebSocketServer({ port });
  
  wss.on('connection', (ws) => {
    console.log('🔌 Live reload client connected');
  });
  
  return wss;
}

/**
 * Notify all connected clients to reload
 */
function notifyReload(wss) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send('reload');
    }
  });
}

/**
 * Set up file watcher
 */
function setupWatcher(config, wss) {
  // Watch source files and config
  const watchPaths = [
    config.inputDir,
    config.layoutsDir,
    config.includesDir,
    join(config.rootDir, '_config.yml'),
    join(config.rootDir, '_config.json'),
    join(config.rootDir, 'styles')
  ].filter(p => existsSync(p));
  
  const watcher = chokidar.watch(watchPaths, {
    ignored: /(^|[\/\\])\../, // Ignore dot files
    persistent: true,
    ignoreInitial: true
  });
  
  let rebuildTimeout = null;
  
  const triggerRebuild = async (event, path) => {
    // Debounce rapid changes
    if (rebuildTimeout) {
      clearTimeout(rebuildTimeout);
    }
    
    rebuildTimeout = setTimeout(async () => {
      console.log(`\n📝 ${event}: ${path}`);
      console.log('🔄 Rebuilding...\n');
      
      try {
        await build({ clean: false, rootDir: config.rootDir });
        notifyReload(wss);
      } catch (err) {
        console.error('❌ Rebuild failed:', err.message);
      }
    }, 100);
  };
  
  watcher.on('change', (path) => triggerRebuild('Changed', path));
  watcher.on('add', (path) => triggerRebuild('Added', path));
  watcher.on('unlink', (path) => triggerRebuild('Removed', path));
  
  return watcher;
}

/**
 * Start the development server
 */
export async function startServer(options = {}) {
  const config = loadConfig(options.rootDir || process.cwd());
  const httpPort = parseInt(options.port) || config.server.port || 3000;
  const wsPort = httpPort + 1;
  
  console.log('\n⚡ Sia - Development Server\n');
  
  // Initial build
  await build({ clean: true, rootDir: config.rootDir });
  
  // Create servers
  const httpServer = createHttpServer(config, wsPort);
  const wss = createWsServer(wsPort);
  
  // Start HTTP server
  httpServer.listen(httpPort, () => {
    console.log(`\n🚀 Server running at http://localhost:${httpPort}`);
    console.log(`🔄 Live reload on ws://localhost:${wsPort}`);
    console.log('\n👀 Watching for changes...\n');
  });
  
  // Set up file watcher
  const watcher = setupWatcher(config, wss);
  
  // Handle shutdown
  const shutdown = () => {
    console.log('\n\n👋 Shutting down...');
    watcher.close();
    wss.close();
    httpServer.close();
    process.exit(0);
  };
  
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  
  return { httpServer, wss, watcher };
}

/**
 * Dev command handler for CLI
 */
export async function devCommand(options) {
  try {
    await startServer({
      port: options.port,
      rootDir: process.cwd()
    });
  } catch (err) {
    console.error('❌ Server failed to start:', err.message);
    process.exit(1);
  }
}

export default { startServer, devCommand };

