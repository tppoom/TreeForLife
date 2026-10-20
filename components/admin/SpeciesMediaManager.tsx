"use client";

import React, { useState, useRef } from "react";
import { Star, Trash2, UploadCloud, Link as LinkIcon, Image as ImageIcon, Loader2, Check } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export interface SpeciesMediaItem {
  id: string;
  speciesId: string;
  blobUrl: string;
  altTh: string;
  isPrimary: boolean;
  sortOrder: number;
  credit?: string;
}

interface SpeciesMediaManagerProps {
  speciesId: string;
  media: SpeciesMediaItem[];
  onMediaChange: (updatedList: SpeciesMediaItem[]) => void;
}

export function SpeciesMediaManager({
  speciesId,
  media = [],
  onMediaChange,
}: SpeciesMediaManagerProps) {
  const { t } = useApp();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [directUrl, setDirectUrl] = useState("");
  const [directAlt, setDirectAlt] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Upload via signed upload URL
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      // 1. Get signed upload URL from backend
      const resSign = await fetch("/api/admin/media/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "image/jpeg",
          speciesId,
        }),
      });

      if (!resSign.ok) {
        throw new Error(t("cms.media.error_upload_url"));
      }

      const signJson = await resSign.json();
      const { uploadUrl, publicUrl } = signJson.data;

      // 2. Direct PUT to uploadUrl
      const resPut = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "image/jpeg",
        },
      });

      if (!resPut.ok) {
        throw new Error(t("cms.media.error_storage"));
      }

      // 3. Register media in DB
      const resCreate = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speciesId,
          url: publicUrl,
          alt: file.name.replace(/\.[^/.]+$/, ""),
          isPrimary: media.length === 0,
          sortOrder: media.length,
          credit: "ถ่ายที่ร้าน",
        }),
      });

      if (!resCreate.ok) {
        throw new Error(t("cms.media.error_save"));
      }

      const createJson = await resCreate.json();
      const newMedia = createJson.data;

      // Append to list
      const updated = [...media, newMedia];
      onMediaChange(updated);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || t("cms.media.error_upload"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 2. Direct URL addition
  const handleAddDirectUrl = async () => {
    if (!directUrl.trim()) return;
    setUploading(true);
    setUploadError(null);

    try {
      const resCreate = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speciesId,
          url: directUrl.trim(),
          alt: directAlt.trim() || "รูปถ่ายต้นไม้",
          isPrimary: media.length === 0,
          sortOrder: media.length,
          credit: "ถ่ายที่ร้าน",
        }),
      });

      if (!resCreate.ok) {
        throw new Error(t("cms.media.error_add"));
      }

      const createJson = await resCreate.json();
      onMediaChange([...media, createJson.data]);
      setDirectUrl("");
      setDirectAlt("");
      setShowUrlInput(false);
    } catch (err: any) {
      setUploadError(err.message || t("cms.media.error_add"));
    } finally {
      setUploading(false);
    }
  };

  // 3. Set Primary Cover Photo ⭐
  const handleSetPrimary = async (item: SpeciesMediaItem) => {
    if (item.isPrimary) return;
    setActiveActionId(item.id);

    try {
      const res = await fetch(`/api/admin/media/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });

      if (res.ok) {
        const updated = media.map((m) => ({
          ...m,
          isPrimary: m.id === item.id,
        }));
        onMediaChange(updated);
      }
    } catch (err) {
      console.error("Set primary error:", err);
    } finally {
      setActiveActionId(null);
    }
  };

  // 4. Update Alt text
  const handleUpdateAlt = async (id: string, newAlt: string) => {
    try {
      await fetch(`/api/admin/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ altTh: newAlt }),
      });
      const updated = media.map((m) => (m.id === id ? { ...m, altTh: newAlt } : m));
      onMediaChange(updated);
    } catch (err) {
      console.error("Update alt error:", err);
    }
  };

  // 5. Delete Photo
  const handleDelete = async (id: string) => {
    if (!window.confirm(t("cms.media.delete_confirm"))) return;
    setActiveActionId(id);

    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const updated = media.filter((m) => m.id !== id);
        // If deleted was primary and items remain, make first one primary
        if (updated.length > 0 && !updated.some((m) => m.isPrimary)) {
          updated[0].isPrimary = true;
        }
        onMediaChange(updated);
      }
    } catch (err) {
      console.error("Delete media error:", err);
    } finally {
      setActiveActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Controls Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {t("cms.media.title", { count: media.length })}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {t("cms.media.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Trigger Button */}
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition shadow-sm active:scale-95 min-h-[44px] cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("cms.media.uploading")}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>{t("cms.media.add_photo")}</span>
                </>
              )}
            </button>

            {/* Direct URL toggle button */}
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 font-medium text-xs transition min-h-[44px]"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>{t("cms.media.add_url")}</span>
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
            {uploadError}
          </div>
        )}

        {/* Collapsible Direct URL input */}
        {showUrlInput && (
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Image URL (https://...)
                </label>
                <input
                  type="url"
                  value={directUrl}
                  onChange={(e) => setDirectUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 min-h-[44px]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  {t("cms.media.alt_label")}
                </label>
                <input
                  type="text"
                  value={directAlt}
                  onChange={(e) => setDirectAlt(e.target.value)}
                  placeholder={t("cms.media.alt_placeholder")}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 min-h-[44px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              >
                {t("cms.cancel")}
              </button>
              <button
                type="button"
                onClick={handleAddDirectUrl}
                disabled={uploading || !directUrl.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 disabled:opacity-50 min-h-[44px]"
              >
                {t("cms.media.save_photo")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Media Grid Cards */}
      {media.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-500 space-y-3">
          <ImageIcon className="w-10 h-10 mx-auto text-zinc-400" />
          <p className="text-sm font-medium">{t("cms.media.empty")}</p>
          <p className="text-xs text-zinc-400">
            {t("cms.media.empty_hint")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {media.map((item) => {
            const isActing = activeActionId === item.id;

            return (
              <div
                key={item.id}
                className={`relative rounded-2xl overflow-hidden border bg-white dark:bg-zinc-900 transition shadow-sm ${
                  item.isPrimary
                    ? "border-emerald-500 ring-2 ring-emerald-500/20"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                {/* Image Container */}
                <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <img
                    src={item.blobUrl}
                    alt={item.altTh || t("cms.media.default_alt")}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80";
                    }}
                  />

                  {/* Primary Cover Badge */}
                  {item.isPrimary ? (
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-md">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{t("cms.media.cover")}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => handleSetPrimary(item)}
                      className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-medium flex items-center gap-1 backdrop-blur-sm transition min-h-[36px]"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>{t("cms.media.set_cover")}</span>
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => handleDelete(item.id)}
                    aria-label={t("cms.media.delete")}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-sm transition shadow-md min-h-[40px] min-w-[40px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Alt text edit */}
                <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    defaultValue={item.altTh}
                    onBlur={(e) => {
                      if (e.target.value !== item.altTh) {
                        handleUpdateAlt(item.id, e.target.value);
                      }
                    }}
                    placeholder={t("cms.media.caption_placeholder")}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[36px]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
