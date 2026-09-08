import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSpeciesBySlug, getSimilarSpecies } from "@/lib/services/speciesService";
import { PlantDetailClient } from "@/components/plants/PlantDetailClient";

export const dynamic = "force-dynamic";

interface PlantDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PlantDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const plant = await getSpeciesBySlug(slug);

  if (!plant) {
    return {
      title: "ไม่พบพันธุ์ไม้ | Plant Not Found | TreeForLife",
    };
  }

  const primaryImage = plant.media?.[0]?.blobUrl || "https://treeforlife.shop/og-image.jpg";

  return {
    title: `${plant.nameTh} (${plant.nameEn}) | คู่มือการดูแลและข้อมูลพันธุ์ไม้ | TreeForLife`,
    description: `${plant.nameTh} - ${plant.summary}. ดูตารางรดน้ำตาม 3 ฤดูกาลไทย วิธีรักษาใบ และความต้องการแสง`,
    keywords: [
      plant.nameTh,
      plant.nameEn,
      plant.nameSci,
      plant.family,
      ...(plant.aliases || []),
      "วิธีดูแล",
      "รดน้ำ",
      "ต้นไม้ฟอกอากาศ",
    ],
    openGraph: {
      title: `${plant.nameTh} (${plant.nameEn}) — TreeForLife`,
      description: plant.summary,
      url: `https://treeforlife.shop/plants/${plant.slug}`,
      siteName: "TreeForLife",
      locale: "th_TH",
      type: "website",
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 800,
          alt: plant.nameTh,
        },
      ],
    },
  };
}

export default async function PlantDetailPage({ params }: PlantDetailPageProps) {
  const { slug } = await params;
  const plant = await getSpeciesBySlug(slug);

  if (!plant) {
    notFound();
  }

  const similarSpecies = await getSimilarSpecies(plant.id, plant.light, plant.waterNeed);

  // Structured Data (JSON-LD): Product & FAQPage
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${plant.nameTh} (${plant.nameEn})`,
    description: plant.summary,
    image: plant.media?.map((m) => m.blobUrl) || [],
    brand: {
      "@type": "Brand",
      name: "TreeForLife",
    },
    offers: {
      "@type": "Offer",
      availability:
        plant.stockStatus === "in_stock"
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
      priceCurrency: "THB",
      url: `https://treeforlife.shop/plants/${plant.slug}`,
    },
  };

  const faqSchema =
    plant.problems && plant.problems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: plant.problems.map((prob) => ({
            "@type": "Question",
            name: prob.symptomTh,
            acceptedAnswer: {
              "@type": "Answer",
              text: `สาเหตุ: ${prob.causeTh} วิธีแก้ไข: ${prob.fixTh}`,
            },
          })),
        }
      : null;

  const jsonLdData = faqSchema ? [productSchema, faqSchema] : [productSchema];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <PlantDetailClient plant={plant} similarSpecies={similarSpecies} />
    </>
  );
}
