import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '../public');

function loadEnvFile() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return {};

  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function getSiteUrl() {
  const fileEnv = loadEnvFile();
  const fromEnv =
    process.env.VITE_SITE_URL ||
    fileEnv.VITE_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  const siteUrl = (fromEnv || 'https://qbits-partner-hub.vercel.app').replace(/\/$/, '');
  return siteUrl;
}

/** Public routes only — excludes auth-gated admin/dashboard and dynamic /via/:code */
const routes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/auth', changefreq: 'monthly', priority: '0.9' },
];

const siteUrl = getSiteUrl();
const lastmod = new Date().toISOString().slice(0, 10);

const urlEntries = routes
  .map(
    ({ path: routePath, changefreq, priority }) => `  <url>
    <loc>${siteUrl}${routePath === '/' ? '' : routePath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

const robots = `User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8');
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots, 'utf8');

console.log(`Sitemap generated for ${siteUrl}`);
