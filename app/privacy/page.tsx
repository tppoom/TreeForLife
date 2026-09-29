import React from "react";
import fs from "fs";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ShieldCheck,
  ArrowLeft,
  Database,
  Globe2,
  Clock,
  UserCheck,
  MessageCircle,
  Mail,
  ExternalLink,
} from "lucide-react";

interface PrivacyPageProps {
  searchParams?: Promise<{ lang?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PrivacyPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const isEn = sp?.lang === "en";

  return {
    title: isEn
      ? "Privacy Policy (PDPA Compliance) | TreeForLife"
      : "นโยบายความเป็นส่วนตัว (PDPA) | TreeForLife",
    description: isEn
      ? "TreeForLife's Privacy Policy adhering to Thailand Personal Data Protection Act B.E. 2562 (PDPA). Transparent data collection, 180-day retention, and complete user rights."
      : "นโยบายความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ร้าน TreeForLife โปร่งใส จัดเก็บ 180 วัน และสิทธิของผู้ใช้ครบถ้วน",
  };
}

interface MarkdownBlock {
  type: "h1" | "h2" | "h3" | "p" | "blockquote" | "ul" | "ol" | "table" | "hr";
  text?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
}

function parseMarkdown(md: string): MarkdownBlock[] {
  const lines = md.split(/\r?\n/);
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed === "---") {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "h3", text: trimmed.slice(4).trim() });
      i++;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "h2", text: trimmed.slice(3).trim() });
      i++;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      blocks.push({ type: "h1", text: trimmed.slice(2).trim() });
      i++;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith(">") ||
          (lines[i].trim() &&
            quoteLines.length > 0 &&
            !lines[i].trim().startsWith("#")))
      ) {
        if (lines[i].trim().startsWith(">")) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        } else if (lines[i].trim() === "") {
          break;
        } else {
          quoteLines.push(lines[i].trim());
        }
        i++;
      }
      blocks.push({ type: "blockquote", text: quoteLines.join("\n") });
      continue;
    }

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const headers = tableLines[0]
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim());
        const rows = tableLines.slice(2).map((line) =>
          line
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim())
        );
        blocks.push({ type: "table", headers, rows });
        continue;
      }
    }

    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      const items: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith("* ") || lines[i].trim().startsWith("- "))
      ) {
        items.push(lines[i].trim().replace(/^[\*\-]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const pLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith("|") &&
      !lines[i].trim().startsWith("* ") &&
      !lines[i].trim().startsWith("- ") &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      lines[i].trim() !== "---"
    ) {
      pLines.push(lines[i].trim());
      i++;
    }
    if (pLines.length > 0) {
      blocks.push({ type: "p", text: pLines.join(" ") });
    }
  }

  return blocks;
}

function renderInline(text: string): React.ReactNode {
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong
          key={keyIndex++}
          className="font-semibold text-forest-950 dark:text-sand-100"
        >
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em
          key={keyIndex++}
          className="italic text-forest-900 dark:text-sand-200"
        >
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={keyIndex++}
          className="px-1.5 py-0.5 rounded bg-sand-200/80 dark:bg-forest-950/80 text-forest-800 dark:text-emerald-400 font-mono text-xs"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("[") && token.includes("](")) {
      const closeBracket = token.indexOf("](");
      const label = token.slice(1, closeBracket);
      const href = token.slice(closeBracket + 2, -1);
      const isExternal = href.startsWith("http");
      parts.push(
        <a
          key={keyIndex++}
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="font-medium text-emerald-700 dark:text-emerald-400 underline underline-offset-4 hover:text-emerald-800 dark:hover:text-emerald-300 transition"
        >
          {label}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts;
}

function LegalMarkdownRenderer({ markdown }: { markdown: string }) {
  const blocks = parseMarkdown(markdown);

  return (
    <div className="space-y-4 text-forest-800 dark:text-sand-300 text-sm sm:text-base leading-relaxed">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "h1":
            return (
              <h1
                key={idx}
                className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-forest-950 dark:text-sand-50 tracking-tight mt-2 mb-4"
              >
                {renderInline(block.text || "")}
              </h1>
            );
          case "h2":
            return (
              <h2
                key={idx}
                className="font-serif text-xl sm:text-2xl font-bold text-forest-900 dark:text-sand-100 mt-10 mb-4 pt-4 pb-2 border-b border-sand-200 dark:border-forest-800/80"
              >
                {renderInline(block.text || "")}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={idx}
                className="font-serif text-base sm:text-lg font-bold text-forest-900 dark:text-sand-100 mt-6 mb-2"
              >
                {renderInline(block.text || "")}
              </h3>
            );
          case "blockquote":
            return (
              <blockquote
                key={idx}
                className="my-5 pl-4 sm:pl-5 py-3 pr-4 rounded-r-2xl border-l-4 border-emerald-600 dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-forest-900 dark:text-sand-200 text-sm sm:text-base italic shadow-soft"
              >
                {block.text?.split("\n").map((line, lIdx) => (
                  <p key={lIdx} className={lIdx > 0 ? "mt-2" : ""}>
                    {renderInline(line)}
                  </p>
                ))}
              </blockquote>
            );
          case "hr":
            return (
              <hr
                key={idx}
                className="my-8 border-sand-200 dark:border-forest-800/80"
              />
            );
          case "ul":
            return (
              <ul key={idx} className="my-3 space-y-2 list-none pl-1">
                {block.items?.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className="flex items-start gap-2.5 text-forest-800/90 dark:text-sand-300 leading-relaxed text-sm sm:text-base"
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-2 shrink-0" />
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol
                key={idx}
                className="my-3 space-y-2 list-decimal pl-6 text-forest-800/90 dark:text-sand-300 leading-relaxed text-sm sm:text-base marker:text-emerald-700 dark:marker:text-emerald-400 marker:font-semibold"
              >
                {block.items?.map((item, itemIdx) => (
                  <li key={itemIdx} className="leading-relaxed">
                    {renderInline(item)}
                  </li>
                ))}
              </ol>
            );
          case "table":
            return (
              <div
                key={idx}
                className="overflow-x-auto my-6 rounded-2xl border border-sand-300 dark:border-forest-800 shadow-soft"
              >
                <table className="w-full text-left text-xs sm:text-sm text-forest-900 dark:text-sand-200">
                  <thead className="bg-sand-100/90 dark:bg-forest-900/90 text-xs uppercase font-serif tracking-wider text-forest-950 dark:text-sand-100 border-b border-sand-300 dark:border-forest-800">
                    <tr>
                      {block.headers?.map((h, hIdx) => (
                        <th
                          key={hIdx}
                          className="px-4 py-3 font-bold whitespace-nowrap"
                        >
                          {renderInline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200 dark:divide-forest-800/60 bg-white/60 dark:bg-forest-950/40">
                    {block.rows?.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-sand-50/80 dark:hover:bg-forest-900/40 transition-colors"
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="px-4 py-3 align-top leading-relaxed"
                          >
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "p":
          default:
            return (
              <p
                key={idx}
                className="my-3 text-forest-800/90 dark:text-sand-300 leading-relaxed text-sm sm:text-base"
              >
                {renderInline(block.text || "")}
              </p>
            );
        }
      })}
    </div>
  );
}

export default async function PrivacyPage({ searchParams }: PrivacyPageProps) {
  const sp = await searchParams;
  const isEn = sp?.lang === "en";
  const activeLang = isEn ? "en" : "th";

  // Read the markdown content files on the server
  const thPath = path.join(process.cwd(), "content", "privacy.th.md");
  const enPath = path.join(process.cwd(), "content", "privacy.en.md");

  const thContent = fs.readFileSync(thPath, "utf-8");
  const enContent = fs.readFileSync(enPath, "utf-8");

  const activeContent = isEn ? enContent : thContent;

  return (
    <div className="w-full bg-sand-50 dark:bg-forest-950 min-h-screen py-12 transition-colors">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-forest-600 dark:text-sand-400 hover:text-forest-950 dark:hover:text-sand-100 mb-6 font-medium transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isEn ? "Back to Boutique Shop" : "กลับหน้าหลักร้านค้า"}</span>
        </Link>

        {/* Header Hero */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/70 dark:border-emerald-800 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              {isEn
                ? "Thailand PDPA B.E. 2562 Compliant"
                : "พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)"}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-950 dark:text-sand-50 tracking-tight">
            {isEn ? "Privacy Policy" : "นโยบายความเป็นส่วนตัว"}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-forest-700/80 dark:text-sand-300 leading-relaxed max-w-2xl">
            {isEn
              ? "Comprehensive disclosure on personal data collection, processing infrastructure, 180-day retention policies, and your legal rights."
              : "คำชี้แจงโปร่งใสเกี่ยวกับการเก็บรวบรวมข้อมูล สถานที่จัดเก็บบนคลาวด์ ระยะเวลาจัดเก็บ 180 วัน และสิทธิของผู้ใช้ตามกฎหมาย"}
          </p>

          {/* Language Switcher Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-sand-200 dark:border-forest-800/80">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest-600 dark:text-sand-400">
                {isEn ? "Language:" : "ภาษา / Language:"}
              </span>
              <div className="inline-flex items-center p-1 rounded-xl bg-sand-200/80 dark:bg-forest-900/90 border border-sand-300/80 dark:border-forest-800 shadow-inner">
                <Link
                  href="/privacy?lang=th"
                  scroll={false}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeLang === "th"
                      ? "bg-white dark:bg-forest-800 text-forest-950 dark:text-sand-50 shadow-sm"
                      : "text-forest-700 dark:text-sand-300 hover:text-forest-950 dark:hover:text-sand-50"
                  }`}
                  aria-current={activeLang === "th" ? "page" : undefined}
                >
                  ไทย (TH)
                </Link>
                <Link
                  href="/privacy?lang=en"
                  scroll={false}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeLang === "en"
                      ? "bg-white dark:bg-forest-800 text-forest-950 dark:text-sand-50 shadow-sm"
                      : "text-forest-700 dark:text-sand-300 hover:text-forest-950 dark:hover:text-sand-50"
                  }`}
                  aria-current={activeLang === "en" ? "page" : undefined}
                >
                  English (EN)
                </Link>
              </div>
            </div>

            <div className="text-xs text-forest-600 dark:text-sand-400 font-mono">
              {isEn ? "Version 1.0 · Sep 29, 2026" : "เวอร์ชัน 1.0 · 29 ก.ย. 2569"}
            </div>
          </div>
        </div>

        {/* Fast Key Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-forest-900/40 border border-sand-200 dark:border-forest-800/80 shadow-soft">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-2">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-forest-900 dark:text-sand-100">
              {isEn ? "Data Collection" : "ข้อมูลที่จัดเก็บ"}
            </h3>
            <p className="mt-1 text-xs text-forest-700 dark:text-sand-300 leading-relaxed">
              {isEn
                ? "Guest token, plant logs, care tasks & consultation tickets."
                : "Guest token, สวนต้นไม้, บันทึกการดูแล และรหัสคำปรึกษา"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 dark:bg-forest-900/40 border border-sand-200 dark:border-forest-800/80 shadow-soft">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-2">
              <Globe2 className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-forest-900 dark:text-sand-100">
              {isEn ? "Cloud Storage" : "สถานที่จัดเก็บ"}
            </h3>
            <p className="mt-1 text-xs text-forest-700 dark:text-sand-300 leading-relaxed">
              {isEn
                ? "Supabase (Singapore), Vercel & LINE (Japan/Thailand)."
                : "Supabase (สิงคโปร์), Vercel และ LINE (ญี่ปุ่น/ไทย)"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 dark:bg-forest-900/40 border border-sand-200 dark:border-forest-800/80 shadow-soft">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-2">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-forest-900 dark:text-sand-100">
              {isEn ? "180-Day Retention" : "การเก็บรักษา 180 วัน"}
            </h3>
            <p className="mt-1 text-xs text-forest-700 dark:text-sand-300 leading-relaxed">
              {isEn
                ? "Inactive guest data auto-purged after 180 days."
                : "Guest ที่ไม่มีกิจกรรมต่อเนื่อง 180 วัน ลบอัตโนมัติ"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 dark:bg-forest-900/40 border border-sand-200 dark:border-forest-800/80 shadow-soft">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-2">
              <UserCheck className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-forest-900 dark:text-sand-100">
              {isEn ? "Your Rights" : "สิทธิของผู้ใช้"}
            </h3>
            <p className="mt-1 text-xs text-forest-700 dark:text-sand-300 leading-relaxed">
              {isEn
                ? "Access, download JSON export, or self-service erase."
                : "สิทธิเข้าถึง ขอดาวน์โหลด JSON และขอลบข้อมูล"}
            </p>
          </div>
        </div>

        {/* Main Content Container in Botanical Luxury Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white/90 dark:bg-forest-900/50 border border-sand-200 dark:border-forest-800/80 shadow-card backdrop-blur-sm">
          <LegalMarkdownRenderer markdown={activeContent} />
        </div>

        {/* Bottom Help & Contact Footer */}
        <div className="mt-10 p-6 rounded-2xl bg-emerald-50/80 dark:bg-forest-900/60 border border-emerald-200/70 dark:border-forest-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif font-bold text-base text-forest-950 dark:text-sand-50">
              {isEn
                ? "Questions about your privacy?"
                : "มีข้อสงสัยเกี่ยวกับข้อมูลส่วนบุคคลของคุณ?"}
            </h3>
            <p className="text-xs text-forest-700 dark:text-sand-300">
              {isEn
                ? "Contact the TreeForLife nursery team directly via LINE OA or email."
                : "ติดต่อทีมงานเนอสเซอรี่ TreeForLife ได้โดยตรงทาง LINE OA หรืออีเมล"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="https://line.me/R/ti/p/@treeforlife"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#06C755] hover:bg-[#05b34c] shadow-sm transition active:scale-95 min-h-[40px]"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>LINE: @treeforlife</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>

            <a
              href="mailto:privacy@treeforlife.shop"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-forest-800 dark:text-sand-200 bg-white dark:bg-forest-800 hover:bg-sand-100 dark:hover:bg-forest-700 border border-sand-300 dark:border-forest-700 shadow-sm transition active:scale-95 min-h-[40px]"
            >
              <Mail className="w-4 h-4 text-forest-600 dark:text-sand-300" />
              <span>privacy@treeforlife.shop</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
