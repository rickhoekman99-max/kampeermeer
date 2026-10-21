#!/usr/bin/env node
/*
 * Buildscript voor kampeermeer.com — geen dependencies.
 *
 * - Kopieert src/ naar dist/ (behalve src/partials/).
 * - Vervangt in elk .html-bestand <!-- @include naam --> door src/partials/naam.html
 *   (partials mogen zelf ook includes bevatten).
 * - Markeert navigatielinks met data-nav: aria-current="page" op de huidige pagina,
 *   data-current="section" op de bovenliggende sectie (bv. Werkplaats op /werkplaats/apk/).
 * - Zet de iconensprite (src/assets/img/icons.svg) inline in elke pagina die iconen gebruikt,
 *   zodat er geen extra request nodig is en iconen nooit los kunnen wegvallen.
 * - Bundelt de CSS uit src/assets/css/ in vaste volgorde tot dist/assets/css/site.css.
 *
 * Gebruik: node build.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const PARTIALS = path.join(SRC, 'partials');
const CSS_ORDER = ['tokens.css', 'base.css', 'components.css', 'pages.css'];

function readPartial(name, depth = 0) {
  if (depth > 5) throw new Error(`Include-lus bij partial "${name}"`);
  const file = path.join(PARTIALS, `${name}.html`);
  if (!fs.existsSync(file)) throw new Error(`Partial niet gevonden: src/partials/${name}.html`);
  return applyIncludes(fs.readFileSync(file, 'utf8'), depth + 1);
}

function applyIncludes(html, depth = 0) {
  return html.replace(/<!--\s*@include\s+([\w-]+)\s*-->/g, (_, name) => readPartial(name, depth));
}

// URL van een outputbestand: src/werkplaats/apk/index.html -> /werkplaats/apk/
function pageUrl(relPath) {
  const url = '/' + relPath.split(path.sep).join('/');
  return url.replace(/index\.html$/, '');
}

function markNav(html, url) {
  return html.replace(/<a\b([^>]*?)\bdata-nav="([^"]+)"([^>]*)>/g, (tag, before, target, after) => {
    if (target === url) return `<a${before}data-nav="${target}" aria-current="page"${after}>`;
    if (target !== '/' && url.startsWith(target)) return `<a${before}data-nav="${target}" data-current="section"${after}>`;
    return tag;
  });
}

const SPRITE_URL = '/assets/img/icons.svg#';
let sprite = null;
function inlineSprite(html) {
  if (!html.includes(SPRITE_URL)) return html;
  if (sprite === null) {
    sprite = fs.readFileSync(path.join(SRC, 'assets', 'img', 'icons.svg'), 'utf8')
      .replace(/<!--[\s\S]*?-->\s*/g, '')
      .replace('<svg ', '<svg aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden" ');
  }
  return html
    .split(SPRITE_URL).join('#')
    .replace(/<body([^>]*)>/, (m) => `${m}\n${sprite.trim()}`);
}

function bundleCss() {
  const dir = path.join(SRC, 'assets', 'css');
  const parts = CSS_ORDER.filter((f) => fs.existsSync(path.join(dir, f)))
    .map((f) => `/* ==== ${f} ==== */\n` + fs.readFileSync(path.join(dir, f), 'utf8'));
  const out = path.join(DIST, 'assets', 'css', 'site.css');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, parts.join('\n'));
}

function walk(dir, rel = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const srcPath = path.join(dir, entry.name);
    const relPath = path.join(rel, entry.name);
    if (srcPath === PARTIALS) continue;
    const outPath = path.join(DIST, relPath);
    if (entry.isDirectory()) {
      walk(srcPath, relPath);
    } else if (entry.name.endsWith('.html')) {
      const html = inlineSprite(markNav(applyIncludes(fs.readFileSync(srcPath, 'utf8')), pageUrl(relPath)));
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, html);
      pages++;
    } else {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.copyFileSync(srcPath, outPath);
    }
  }
}

let pages = 0;
fs.rmSync(DIST, { recursive: true, force: true });
walk(SRC);
bundleCss();
console.log(`Klaar: ${pages} pagina's naar dist/`);
