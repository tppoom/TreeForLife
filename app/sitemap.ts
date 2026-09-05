import { MetadataRoute } from "next";
import { getSpeciesList } from "@/lib/services/speciesService";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://treeforlife.shop";
  const speciesList = await getSpeciesList({ stockStatus: "all" });

  const plantUrls = speciesList.map((plant) => ({
    url: `${baseUrl}/plants/${plant.slug}`,
    lastModified: new Date(plant.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    ...plantUrls,
  ];
}
