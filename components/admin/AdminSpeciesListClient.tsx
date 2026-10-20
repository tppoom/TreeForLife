"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ExternalLink,
  Edit3,
  Globe,
  FileText,
  Package,
  ArrowLeft,
  Sprout,
  Image as ImageIcon,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export interface AdminSpeciesSummaryItem {
  id: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  nameSci?: string;
  stockStatus: string;
  publishedAt?: Date | string | null;
  createdAt?: Date | string;
  primaryImage?: string;
  mediaCount?: number;
}

interface AdminSpeciesListClientProps {
  initialSpecies: AdminSpeciesSummaryItem[];
}

export function AdminSpeciesListClient({ initialSpecies = [] }: AdminSpeciesListClientProps) {
  const { t, locale } = useApp();
  const [search, setSearch] = useState("");
  const [publishFilter, setPublishFilter] = useState<"all" | "published" | "draft">("all");
  const [stockFilter, setStockFilter] = useState<string>("all");

  const filteredSpecies = useMemo(() => {
    return initialSpecies.filter((s) => {
      // Publish filter
      if (publishFilter === "published" && !s.publishedAt) return false;
      if (publishFilter === "draft" && s.publishedAt) return false;

      // Stock filter
      if (stockFilter !== "all" && s.stockStatus !== stockFilter) return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTh = s.nameTh?.toLowerCase().includes(q);
        const matchEn = s.nameEn?.toLowerCase().includes(q);
        const matchSci = s.nameSci?.toLowerCase().includes(q);
        const matchSlug = s.slug?.toLowerCase().includes(q);
        if (!matchTh && !matchEn && !matchSci && !matchSlug) return false;
      }

      return true;
    });
  }, [initialSpecies, search, publishFilter, stockFilter]);

  const stats = useMemo(() => {
    const total = initialSpecies.length;
    const published = initialSpecies.filter((s) => Boolean(s.publishedAt)).length;
    const drafts = total - published;
    return { total, published, drafts };
  }, [initialSpecies]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 -ml-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              title={t("cms.back_to_dashboard")}
              aria-label={t("cms.back_to_dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <span>{t("cms.list.title")}</span>
                <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {t("cms.list.count", { count: stats.total })}
                </span>
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                {t("cms.list.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/species/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition shadow-sm active:scale-95 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>{t("cms.list.add_new")}</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("cms.list.search_placeholder")}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label={t("cms.list.clear_search")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Publish State Filter */}
          <div className="inline-flex rounded-xl p-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            {[
              { id: "all", label: t("cms.list.filter_all", { count: stats.total }) },
              { id: "published", label: t("cms.list.filter_published", { count: stats.published }) },
              { id: "draft", label: t("cms.list.filter_draft", { count: stats.drafts }) },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setPublishFilter(f.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition min-h-[36px] ${
                  publishFilter === f.id
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 min-h-[44px]"
          >
            <option value="all">{t("cms.list.stock_all")}</option>
            <option value="in_stock">{t("cms.editor.stock_in_stock")}</option>
            <option value="made_to_order">{t("cms.editor.stock_made_to_order")}</option>
            <option value="seasonal">{t("cms.editor.stock_seasonal")}</option>
            <option value="hidden">{t("cms.editor.stock_hidden")}</option>
          </select>
        </div>
      </div>

      {/* Species Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/50 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">{t("cms.list.col_species")}</th>
                <th className="py-3.5 px-4">{t("cms.list.col_publish")}</th>
                <th className="py-3.5 px-4">{t("cms.list.col_stock")}</th>
                <th className="py-3.5 px-4 text-right">{t("cms.list.col_actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
              {filteredSpecies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                    <Sprout className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
                    <p>{t("cms.list.empty")}</p>
                  </td>
                </tr>
              ) : (
                filteredSpecies.map((plant) => {
                  const isPublished = Boolean(plant.publishedAt);

                  return (
                    <tr
                      key={plant.id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition group"
                    >
                      {/* Name & Photo */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              plant.primaryImage ||
                              "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=80"
                            }
                            alt={locale === "en" ? plant.nameEn : plant.nameTh}
                            className="w-12 h-12 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 border border-zinc-200 dark:border-zinc-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=80";
                            }}
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/admin/species/${plant.id}`}
                              className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition truncate block"
                            >
                              {locale === "en" ? plant.nameEn : plant.nameTh}
                            </Link>
                            {/* Secondary name; species data, so the Thai name is marked lang="th" */}
                            <div
                              lang={locale === "en" ? "th" : "en"}
                              className="text-xs text-zinc-500 dark:text-zinc-400 truncate"
                            >
                              {locale === "en" ? plant.nameTh : plant.nameEn}
                            </div>
                            <div className="text-xs italic text-zinc-400 dark:text-zinc-500 font-mono truncate">
                              {plant.nameSci || plant.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Published Badge */}
                      <td className="py-3.5 px-4">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <Globe className="w-3.5 h-3.5" />
                            <span>{t("cms.published")}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{t("cms.draft")}</span>
                          </span>
                        )}
                      </td>

                      {/* Stock Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            plant.stockStatus === "in_stock"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : plant.stockStatus === "made_to_order"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                              : plant.stockStatus === "seasonal"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          {t(`cms.editor.stock_${plant.stockStatus}`)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/plants/${plant.slug}`}
                            target="_blank"
                            className="p-2 rounded-xl text-zinc-500 hover:text-emerald-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title={t("cms.view_storefront")}
                            aria-label={t("cms.view_storefront")}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/admin/species/${plant.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 font-medium text-xs transition min-h-[44px]"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{t("cms.list.edit")}</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
