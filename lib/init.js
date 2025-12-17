import prompts from 'prompts';
import { existsSync, mkdirSync, writeFileSync, readFileSync, copyFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Default site configuration
 */
function getDefaultConfig(answers) {
  return {
    site: {
      title: answers.title,
      description: answers.description,
      url: answers.url,
      author: answers.author
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
      port: 3000
    }
  };
}

/**
 * Generate package.json for new site
 */
function getPackageJson(name) {
  return {
    name: name.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'sia dev',
      build: 'sia build',
      new: 'sia new'
    },
    dependencies: {
      sia: '^1.0.0'
    }
  };
}

/**
 * Sample first post content
 */
function getSamplePost(author) {
  const date = new Date().toISOString().split('T')[0];
  return `---
title: "Hello World"
date: ${date}
tags: [welcome, first-post]
---

Welcome to my new blog! This is my first post.

## About This Site

This site is built with [Sia](https://github.com/sia/sia), a simple and powerful static site generator.

## What's Next?

- Write more posts using \`sia new post "My Post Title"\`
- Customize the theme by adding files to \`_layouts/\` and \`_includes/\`
- Deploy to your favorite static hosting

Happy writing! 🚀
`;
}

/**
 * Sample about page content
 */
function getSampleAboutPage(author) {
  return `---
title: "About"
layout: page
---

## About Me

Hello! I'm ${author}. Welcome to my corner of the internet.

## About This Site

This site is built with [Sia](https://github.com/sia/sia), a simple static site generator that supports:

- Markdown with front matter
- Blog posts, pages, and notes
- Tags and pagination
- RSS feeds
- Dark mode

## Contact

You can reach me at:

- Email: your.email@example.com
- Twitter: @yourhandle
- GitHub: @yourusername
`;
}

/**
 * Sample note content
 */
function getSampleNote() {
  return `---
date: ${new Date().toISOString()}
tags: [welcome]
---

Just set up my new site! Excited to start sharing my thoughts here.
`;
}

/**
 * .gitignore content
 */
function getGitignore() {
  return `# Dependencies
node_modules/

# Output
dist/

# OS files
.DS_Store
Thumbs.db

# Editor files
*.swp
*.swo
*~
.idea/
.vscode/

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local
`;
}

/**
 * README content
 */
function getReadme(title, hasGitHubActions = false) {
  let deploymentSection = `## Deployment

After running \`npm run build\`, deploy the \`dist/\` folder to any static hosting:

- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages
`;

  if (hasGitHubActions) {
    deploymentSection = `## Deployment

This site is configured to automatically deploy to GitHub Pages.

### Automatic Deployment

1. Push your code to GitHub
2. Go to your repository Settings → Pages
3. Under "Build and deployment", select "GitHub Actions" as the source
4. Your site will deploy automatically on every push to the main branch

### Manual Deployment

You can also deploy manually:

\`\`\`bash
npm run build
\`\`\`

Then upload the \`dist/\` folder to any static hosting.
`;
  }

  return `# ${title}

A static site built with [Sia](https://github.com/sia/sia).

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## Creating Content

\`\`\`bash
# Create a new blog post
npm run new post "My Post Title"

# Create a new page
npm run new page "Page Title"

# Create a short note
npm run new note "Quick thought"
\`\`\`

## Project Structure

\`\`\`
├── _config.yml      # Site configuration
├── src/
│   ├── posts/       # Blog posts (markdown)
│   ├── pages/       # Static pages
│   ├── notes/       # Short notes
│   └── images/      # Images
├── _layouts/        # Custom layouts (optional)
├── _includes/       # Custom includes (optional)
├── styles/          # Custom styles (optional)
└── dist/            # Generated output
\`\`\`

## Customization

- Edit \`_config.yml\` to change site settings
- Add custom layouts in \`_layouts/\` to override defaults
- Add custom includes in \`_includes/\`
- Add \`styles/main.css\` to override default styles

${deploymentSection}`;
}

/**
 * GitHub Actions workflow for GitHub Pages deployment
 */
function getGitHubActionsWorkflow() {
  return `name: Deploy to GitHub Pages

on:
  push:
    branches: [main, master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build site
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;
}

/**
 * Ensure a directory exists
 */
function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Initialize a new Sia site
 */
export async function initSite(targetDir, options = {}) {
  const isCurrentDir = !targetDir || targetDir === '.';
  const projectDir = isCurrentDir ? process.cwd() : resolve(process.cwd(), targetDir);
  const projectName = isCurrentDir ? 'my-site' : targetDir;

  console.log('\n🚀 Creating a new Sia site...\n');

  // Check if directory exists and has files
  if (!isCurrentDir && existsSync(projectDir)) {
    const { proceed } = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: `Directory "${targetDir}" already exists. Continue anyway?`,
      initial: false
    });
    
    if (!proceed) {
      console.log('\n❌ Cancelled.\n');
      process.exit(0);
    }
  }

  // Interactive prompts
  let answers;
  
  if (options.yes) {
    // Use defaults for non-interactive mode
    answers = {
      title: projectName,
      description: 'A personal blog',
      author: 'Anonymous',
      url: 'http://localhost:3000',
      sample: true,
      githubActions: options.githubActions || false
    };
  } else {
    answers = await prompts([
      {
        type: 'text',
        name: 'title',
        message: 'Site title:',
        initial: projectName.charAt(0).toUpperCase() + projectName.slice(1).replace(/-/g, ' ')
      },
      {
        type: 'text',
        name: 'description',
        message: 'Site description:',
        initial: 'A personal blog'
      },
      {
        type: 'text',
        name: 'author',
        message: 'Author name:',
        initial: 'Anonymous'
      },
      {
        type: 'text',
        name: 'url',
        message: 'Site URL (for production):',
        initial: 'http://localhost:3000'
      },
      {
        type: 'confirm',
        name: 'sample',
        message: 'Include sample content?',
        initial: true
      },
      {
        type: 'confirm',
        name: 'githubActions',
        message: 'Add GitHub Actions workflow for GitHub Pages deployment?',
        initial: true
      }
    ]);
  }

  // Handle cancelled prompts
  if (!answers.title) {
    console.log('\n❌ Cancelled.\n');
    process.exit(0);
  }

  console.log('\n📁 Creating project structure...');

  // Create directories
  ensureDir(projectDir);
  ensureDir(join(projectDir, 'src', 'posts'));
  ensureDir(join(projectDir, 'src', 'pages'));
  ensureDir(join(projectDir, 'src', 'notes'));
  ensureDir(join(projectDir, 'src', 'images'));
  ensureDir(join(projectDir, '_layouts'));
  ensureDir(join(projectDir, '_includes'));
  ensureDir(join(projectDir, 'styles'));

  // Create _config.yml
  const config = getDefaultConfig(answers);
  writeFileSync(
    join(projectDir, '_config.yml'),
    yaml.dump(config),
    'utf-8'
  );
  console.log('  ✓ _config.yml');

  // Create package.json
  writeFileSync(
    join(projectDir, 'package.json'),
    JSON.stringify(getPackageJson(projectName), null, 2),
    'utf-8'
  );
  console.log('  ✓ package.json');

  // Create .gitignore
  writeFileSync(
    join(projectDir, '.gitignore'),
    getGitignore(),
    'utf-8'
  );
  console.log('  ✓ .gitignore');

  // Create README
  writeFileSync(
    join(projectDir, 'README.md'),
    getReadme(answers.title, answers.githubActions),
    'utf-8'
  );
  console.log('  ✓ README.md');

  // Create GitHub Actions workflow if requested
  if (answers.githubActions) {
    ensureDir(join(projectDir, '.github', 'workflows'));
    writeFileSync(
      join(projectDir, '.github', 'workflows', 'deploy.yml'),
      getGitHubActionsWorkflow(),
      'utf-8'
    );
    console.log('  ✓ .github/workflows/deploy.yml');
  }

  // Create sample content
  if (answers.sample) {
    console.log('\n📝 Creating sample content...');

    // Sample post
    const date = new Date().toISOString().split('T')[0];
    writeFileSync(
      join(projectDir, 'src', 'posts', `${date}-hello-world.md`),
      getSamplePost(answers.author),
      'utf-8'
    );
    console.log('  ✓ src/posts/hello-world.md');

    // Sample about page
    writeFileSync(
      join(projectDir, 'src', 'pages', 'about.md'),
      getSampleAboutPage(answers.author),
      'utf-8'
    );
    console.log('  ✓ src/pages/about.md');

    // Sample note
    writeFileSync(
      join(projectDir, 'src', 'notes', `${date}-first-note.md`),
      getSampleNote(),
      'utf-8'
    );
    console.log('  ✓ src/notes/first-note.md');
  }

  // Create .gitkeep for images
  writeFileSync(
    join(projectDir, 'src', 'images', '.gitkeep'),
    '# Add your images here\n',
    'utf-8'
  );

  // Success message
  console.log('\n✨ Site created successfully!\n');
  
  if (!isCurrentDir) {
    console.log('Next steps:\n');
    console.log(`  cd ${targetDir}`);
    console.log('  npm install');
    console.log('  npm run dev\n');
  } else {
    console.log('Next steps:\n');
    console.log('  npm install');
    console.log('  npm run dev\n');
  }
  
  if (answers.githubActions) {
    console.log('🚀 GitHub Pages deployment:\n');
    console.log('  1. Push your code to GitHub');
    console.log('  2. Go to Settings → Pages');
    console.log('  3. Set source to "GitHub Actions"');
    console.log('  4. Your site will deploy automatically!\n');
  }
  
  console.log('Happy writing! 📝\n');
}

/**
 * Init command handler for CLI
 */
export async function initCommand(targetDir, options) {
  try {
    await initSite(targetDir, options);
  } catch (err) {
    console.error('❌ Failed to create site:', err.message);
    process.exit(1);
  }
}

export default { initSite, initCommand };

