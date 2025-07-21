import { toolsMetadata } from './seo-metadata';

export const generateSitemap = (): string => {
  const baseUrl = 'https://your-domain.com'; // Replace with actual domain
  const currentDate = new Date().toISOString().split('T')[0];
  
  const urls = [
    {
      url: baseUrl,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0'
    },
    ...Object.keys(toolsMetadata).map(toolId => ({
      url: `${baseUrl}/${toolId}`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    }))
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, lastmod, changefreq, priority }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

// Generate robots.txt content
export const generateRobotsTxt = (): string => {
  const baseUrl = 'https://your-domain.com'; // Replace with actual domain
  
  return `User-agent: *
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1`;
};
