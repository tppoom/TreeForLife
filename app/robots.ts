import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://treeforlife.shop";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/search", "/plants/"],
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
