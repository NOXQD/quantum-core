import type { MetadataRoute } from "next";

/**
 * robots.txt — fully open by default; the chandelier wants to be seen.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://lumina-quantum.example/sitemap.xml",
  };
}
