import type { MetadataRoute } from "next";

/**
 * Sitemap — single-page site, but listing the anchored chapters helps
 * search engines preview them as result subsections.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://lumina-quantum.example";
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}#about`, lastModified: now, priority: 0.8 },
    { url: `${base}#technology`, lastModified: now, priority: 0.8 },
    { url: `${base}#capabilities`, lastModified: now, priority: 0.8 },
    { url: `${base}#roadmap`, lastModified: now, priority: 0.7 },
    { url: `${base}#community`, lastModified: now, priority: 0.6 },
  ];
}
