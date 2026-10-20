"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sprout, Sparkles, Copy, Loader2, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

interface ExistingSpeciesOption {
  id: string;
  nameTh: string;
  nameEn: string;
}

interface NewSpeciesWizardClientProps {
  existingSpecies: ExistingSpeciesOption[];
}

export function NewSpeciesWizardClient({ existingSpecies = [] }: NewSpeciesWizardClientProps) {
  const router = useRouter();
  const { t, locale } = useApp();

  const [nameTh, setNameTh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [copyFromId, setCopyFromId] = useState<string>("");
  const [isSlugCustom, setIsSlugCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto generate slug from English name unless manually modified
  const handleNameEnChange = (val: string) => {
    setNameEn(val);
    if (!isSlugCustom) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nameTh.trim()) {
      setError(t("cms.wizard.error_name_th"));
      return;
    }
    if (!nameEn.trim()) {
      setError(t("cms.wizard.error_name_en"));
      return;
    }
    if (!slug.trim()) {
      setError(t("cms.wizard.error_slug"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/species", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameTh: nameTh.trim(),
          nameEn: nameEn.trim(),
          slug: slug.trim(),
          copyFromId: copyFromId || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || t("cms.wizard.error_create"));
      }

      const newId = json.data?.id;
      if (newId) {
        router.push(`/admin/species/${newId}`);
      } else {
        router.push("/admin/species");
      }
    } catch (err: any) {
      console.error("Create species error:", err);
      setError(err.message || t("cms.wizard.error_create"));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href="/admin/species"
          className="p-2 -ml-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
          title={t("cms.back_to_list")}
          aria-label={t("cms.back_to_list")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-600" />
            <span>{t("cms.wizard.title")}</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {t("cms.wizard.subtitle")}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
      >
        {/* Step 1: Copy Template (Optional) */}
        <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-2">
          <label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
            <Copy className="w-3.5 h-3.5" />
            <span>{t("cms.wizard.copy_label")}</span>
          </label>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {t("cms.wizard.copy_help")}
          </p>
          <select
            value={copyFromId}
            onChange={(e) => setCopyFromId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 min-h-[44px]"
          >
            <option value="">{t("cms.wizard.copy_blank")}</option>
            {existingSpecies.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {locale === "en" ? sp.nameEn : `${sp.nameTh} (${sp.nameEn})`}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Basic Info */}
        <div className="space-y-4">
          {/* Name TH */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t("cms.name_th")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nameTh}
              onChange={(e) => setNameTh(e.target.value)}
              placeholder={t("cms.wizard.name_th_placeholder")}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            />
          </div>

          {/* Name EN */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t("cms.name_en")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nameEn}
              onChange={(e) => handleNameEnChange(e.target.value)}
              placeholder={t("cms.wizard.name_en_placeholder")}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                URL Slug <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-zinc-400">
                {t("cms.wizard.slug_help")}
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setIsSlugCustom(true);
                  setSlug(e.target.value);
                }}
                placeholder="homalomena-rubescens"
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              />
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              {t("cms.wizard.storefront_link")} /plants/{slug || "..."}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-end border-t border-zinc-100 dark:border-zinc-800">
          <Link
            href="/admin/species"
            className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-center transition min-h-[44px] flex items-center justify-center"
          >
            {t("cms.cancel")}
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition shadow-sm active:scale-95 disabled:opacity-50 min-h-[44px] cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t("cms.wizard.creating")}</span>
              </>
            ) : (
              <>
                <span>{t("cms.wizard.submit")}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
