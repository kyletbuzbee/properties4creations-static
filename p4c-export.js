#!/usr/bin/env node
/**
 * P4C Export Script
 * Converts Next.js app to fully static HTML website in P4C/ directory
 * Maintains all interactivity while creating separate HTML files
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const WEB_DIR = path.join(ROOT_DIR, 'web');
const OUT_DIR = path.join(WEB_DIR, 'out');
const P4C_DIR = __dirname; // P4C directory

async function fileExists(p) {
  try {
    await fsp.access(p);
    return true;
  } catch (e) {
    return false;
  }
}

async function copyFile(src, dest) {
  const dirname = path.dirname(dest);
  await fsp.mkdir(dirname, { recursive: true });
  await fsp.copyFile(src, dest);
}

async function copyDir(src, dest) {
  await fsp.mkdir(dest, { recursive: true });

  const entries = await fsp.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      // Transform and copy HTML files
      await processHTMLFile(srcPath, destPath);
    } else if (entry.name !== '.' && entry.name !== '..') {
      // Copy non-HTML files
      await copyFile(srcPath, destPath);
    }
  }
}

async function processHTMLFile(srcPath, destPath) {
  let htmlContent = await fsp.readFile(srcPath, 'utf8');

  // Remove server-rendered data and add static interactivity
  htmlContent = htmlContent.replace(
    /<body([^>]*)>/,
    `<body$1>
<div style="display: none;" id="p4c-interactivity-loaded">
  <!-- P4C Static Interactive Framework will load here -->
</div>`
  );

  // Add P4C client-side libraries at the end of body
  htmlContent = htmlContent.replace(
    '</body>',
    `<script>
// Initialize P4C before other scripts
(function(){
  // Ensure P4C object exists
  window.P4C = window.P4C || {};
  window.P4C.isStaticHTML = true;
  window.P4C.basePath = '${path.relative(destPath, P4C_DIR).replace(/\\/g, '/')}';
})();

// Flag to prevent loading from Next.js build
window.P4C_STATIC_MODE = true;
</script>

<!-- P4C Interactive Libraries -->
<script src="./static-html.js"></script>
<script src="./static-navigation.js"></script>
<script src="./static-state.js"></script>
<script src="./static-search.js"></script>
<script src="./static-maps.js"></script>
<script src="./static-forms.js"></script>
<script src="./static-modals.js"></script>

<script>
// Initialize P4C after all libraries load
document.addEventListener('DOMContentLoaded', function() {
  if (window.P4C && window.P4C.init) {
    window.P4C.init();
  }

  // Mark this as P4C static HTML
  document.documentElement.classList.add('p4c-static-html');
  document.body.classList.add('p4c-loaded');

  console.log('🌐 P4C Static HTML loaded successfully');
});
</script>
</body>`
  );

  await fsp.writeFile(destPath, htmlContent, 'utf8');
}

async function updatePackageScripts() {
  const packagePath = path.join(WEB_DIR, 'package.json');

  if (await fileExists(packagePath)) {
    const packageData = JSON.parse(await fsp.readFile(packagePath, 'utf8'));

    // Add P4C export scripts
    if (!packageData.scripts) packageData.scripts = {};
    packageData.scripts['export:p4c'] = 'node ../P4C/p4c-export.js';
    packageData.scripts['build:static'] = 'node ../P4C/p4c-export.js';

    await fsp.writeFile(packagePath, JSON.stringify(packageData, null, 2), 'utf8');
    console.log('✅ Added P4C export scripts to package.json');
  }
}

async function run() {
  console.log('🚀 Starting P4C Static HTML Export...');

  try {
    // Step 1: Build Next.js app
    console.log('🏗️ Building Next.js application...');
    execSync('npm run build', { cwd: WEB_DIR, stdio: 'inherit' });
    console.log('✅ Next.js app built');

    // Step 2: Export static HTML
    console.log('📤 Exporting static HTML...');
    execSync('npm run export:static', { cwd: WEB_DIR, stdio: 'inherit' });
    console.log('✅ Static HTML exported');

    // Step 3: Check if out directory exists
    if (!(await fileExists(OUT_DIR))) {
      console.error('❌ Static export failed - no output directory found');
      process.exit(1);
    }

    // Step 4: Clean P4C directory
    console.log('🧹 Cleaning P4C directory...');
    try {
      await fsp.rm(P4C_DIR, { recursive: true, force: true });
      await fsp.mkdir(P4C_DIR, { recursive: true });
    } catch (e) {
      // Directory didn't exist or couldn't be cleaned
    }
    await fsp.mkdir(P4C_DIR, { recursive: true });

    // Step 5: Copy and transform static files to P4C
    console.log('🔄 Processing and copying files to P4C...');
    await copyDir(OUT_DIR, P4C_DIR);

    // Step 6: Put back the P4C export script
    await copyFile(path.join(P4C_DIR, 'p4c-export.js'), path.join(P4C_DIR, 'p4c-export.js'));

    // Step 7: Update package.json with P4C scripts
    await updatePackageScripts();

    console.log('\n🎉 SUCCESS: P4C Static HTML Website Generated!');
    console.log('================================================');
    console.log(`📁 Location: ${P4C_DIR}`);
    console.log('📄 All pages: Separate HTML files');
    console.log('🎯 Full interactivity: Client-side JavaScript');
    console.log('');
    console.log('🌐 To test: Open P4C/index.html in any web browser');
    console.log('🔄 To update: Run `npm run export:p4c` from web/ directory');
    console.log('🚀 Set this command as build hook when deploying to auto-update');

  } catch (error) {
    console.error('❌ P4C Export failed:', error.message);
    process.exit(1);
  }
}

run();
