import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COLLECTIONS, getCollectionBySlug } from "@/lib/collections";
import { getAllSpecies } from "@/lib/services/speciesService";
import { CollectionDetailClient } from "@/components/collections/CollectionDetailClient";

export const revalidate = 3600;

interface CollectionDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: CollectionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return {
      title: "ไม่พบคอลเลกชัน | Collection Not Found — TreeForLife",
    };
  }

  const cleanDescription =
    collection.introTh.length > 150
      ? `${collection.introTh.slice(0, 147)}...`
      : collection.introTh;

  return {
    title: `${collection.titleTh} (${collection.titleEn}) — คอลเลกชันพันธุ์ไม้ TreeForLife`,
    description: cleanDescription,
    keywords: [
      collection.titleTh,
      collection.titleEn,
      collection.badge,
      "ต้นไม้ตกแต่งบ้าน",
      "คอลเลกชันต้นไม้",
      "TreeForLife",
    ],
    alternates: {
      canonical: `https://treeforlife.shop/collections/${collection.slug}`,
    },
    openGraph: {
      title: `${collection.titleTh} (${collection.titleEn}) — TreeForLife`,
      description: cleanDescription,
      url: `https://treeforlife.shop/collections/${collection.slug}`,
      siteName: "TreeForLife",
      locale: "th_TH",
      type: "website",
      images: [
        {
          url: "https://treeforlife.shop/og-image.jpg",
          width: 1200,
          height: 800,
          alt: collection.titleTh,
        },
      ],
    },
  };
}

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  // Fetch species matching collection filter, prioritized by in-stock first
  const species = await getAllSpecies({
    ...collection.filter,
    sort: "in_stock_first",
  });

  // Schema.org Structured Data: BreadcrumbList, ItemList, FAQPage
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "หน้าแรก",
        item: "https://treeforlife.shop",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "คอลเลกชัน",
        item: "https://treeforlife.shop/collections",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: collection.titleTh,
        item: `https://treeforlife.shop/collections/${collection.slug}`,
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: collection.titleTh,
    description: collection.introTh,
    numberOfItems: species.length,
    itemListElement: species.map((sp, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: `${sp.nameTh} (${sp.nameEn})`,
      url: `https://treeforlife.shop/plants/${sp.slug}`,
      image: sp.primaryImage || undefined,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: collection.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.qTh,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.aTh,
      },
    })),
  };

  const jsonLdData = [breadcrumbSchema, itemListSchema, faqSchema];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdData).replace(/</g, "\\u003c"),
        }}
      />
      <CollectionDetailClient collection={collection} species={species} />
    </>
  );
}
