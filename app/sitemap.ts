import type { MetadataRoute } from "next";
import { getAllSpecies } from "@/lib/services/speciesService";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://treeforlife.shop";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/garden`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/today`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  try {
    const speciesList = await getAllSpecies({ stockStatus: "all" });
    const dynamicSpeciesRoutes: MetadataRoute.Sitemap = speciesList.map((s) => ({
      url: `${baseUrl}/plants/${s.slug}`,
      lastModified: s.createdAt ? new Date(s.createdAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...dynamicSpeciesRoutes];
  } catch (err) {
    console.error("Failed to generate dynamic sitemap routes:", err);
    return staticRoutes;
  }
}
