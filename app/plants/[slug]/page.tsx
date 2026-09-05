import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSpeciesBySlug, getSimilarSpecies } from "@/lib/services/speciesService";
import { PlantDetailClient } from "@/components/plants/PlantDetailClient";

interface PlantPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PlantPageProps): Promise<Metadata> {
  const { slug } = await params;
  const plant = await getSpeciesBySlug(slug);

  if (!plant) {
    return {
      title: "ไม่พบพันธุ์ไม้นี้ | TreeForLife",
    };
  }

  const primaryImage = plant.media.find((m) => m.isPrimary)?.blobUrl || plant.media[0]?.blobUrl;

  return {
    title: `${plant.nameTh} (${plant.nameEn}) วิธีปลูกและดูแล | TreeForLife`,
    description: plant.summary,
    openGraph: {
      title: `${plant.nameTh} (${plant.nameEn}) | TreeForLife`,
      description: plant.summary,
      images: primaryImage ? [{ url: primaryImage, alt: plant.nameTh }] : [],
    },
  };
}

export default async function PlantDetailPage({ params }: PlantPageProps) {
  const { slug } = await params;
  const plant = await getSpeciesBySlug(slug);

  if (!plant) {
    notFound();
  }

  const similarPlants = await getSimilarSpecies(plant.id, plant.light, plant.waterNeed);

  // Structured Data (JSON-LD) for SEO (SPEC §6.3)
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: plant.nameTh,
    alternateName: [plant.nameEn, plant.nameSci, ...(plant.aliases || [])],
    description: plant.summary,
    image: plant.media.map((m) => m.blobUrl),
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
    },
  };

  const faqJsonLd =
    plant.problems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: plant.problems.map((p) => ({
            "@type": "Question",
            name: p.symptomTh,
            acceptedAnswer: {
              "@type": "Answer",
              text: `สาเหตุ: ${p.causeTh} วิธีแก้ไข: ${p.fixTh}`,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <PlantDetailClient plant={plant as any} similarPlants={similarPlants as any} />
    </>
  );
}
