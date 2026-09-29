import React from "react";
import fs from "fs";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ScrollText,
  ArrowLeft,
  SunMedium,
  Sprout,
  ShieldAlert,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "ข้อกำหนดและเงื่อนไขการใช้งาน (Terms of Service) | TreeForLife",
  description:
    "ข้อกำหนดและเงื่อนไขการใช้งานแพลตฟอร์ม TreeForLife ข้อสงวนสิทธิ์ทางพฤกษศาสตร์ และคำแนะนำการดูแลต้นไม้ตาม 3 ฤดูกาลไทย",
};

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

function TermsMarkdownRenderer({ markdown }: { markdown: string }) {
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
                className="my-5 pl-4 sm:pl-5 py-3 pr-4 rounded-r-2xl border-l-4 border-amber-600 dark:border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 text-forest-900 dark:text-sand-200 text-sm sm:text-base italic shadow-soft"
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

export default function TermsPage() {
  const termsPath = path.join(process.cwd(), "content", "terms.th.md");
  const termsContent = fs.readFileSync(termsPath, "utf-8");

  return (
    <div className="w-full bg-sand-50 dark:bg-forest-950 min-h-screen py-12 transition-colors">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-forest-600 dark:text-sand-400 hover:text-forest-950 dark:hover:text-sand-100 mb-6 font-medium transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>กลับหน้าหลักร้านค้า (Back to Boutique)</span>
        </Link>

        {/* Header Hero */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-forest-100/90 dark:bg-forest-900/80 text-forest-800 dark:text-sand-200 border border-forest-300/70 dark:border-forest-800 mb-3">
            <ScrollText className="w-4 h-4 text-forest-600 dark:text-forest-400" />
            <span>ข้อกำหนดและเงื่อนไขการใช้งานแพลตฟอร์ม</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-950 dark:text-sand-50 tracking-tight">
            ข้อกำหนดการใช้งาน (Terms of Service)
          </h1>

          <p className="mt-2 text-sm sm:text-base text-forest-700/80 dark:text-sand-300 leading-relaxed max-w-2xl">
            ข้อตกลงการใช้บริการ ข้อสงวนสิทธิ์ทางพฤกษศาสตร์ และคำแนะนำการดูแลต้นไม้ที่ปรับตาม 3 ฤดูกาลไทย
          </p>

          <div className="mt-4 flex items-center justify-between text-xs text-forest-600 dark:text-sand-400 font-mono pb-4 border-b border-sand-200 dark:border-forest-800/80">
            <span>ภาษาไทย (TH) · เวอร์ชัน 1.0</span>
            <span>อัปเดตล่าสุด: 29 กันยายน 2569</span>
          </div>
        </div>

        {/* Key Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-forest-900/40 border border-sand-200 dark:border-forest-800/80 shadow-soft">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-2">
              <SunMedium className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-forest-900 dark:text-sand-100">
              3 ฤดูกาลไทย & 5 กระถาง
            </h3>
            <p className="mt-1 text-xs text-forest-700 dark:text-sand-300 leading-relaxed">
              สูตรคำนวณรอบการรดน้ำปรับตามฤดูร้อน ฝน หนาว และวัสดุกระถางจริง
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 dark:bg-forest-900/40 border border-sand-200 dark:border-forest-800/80 shadow-soft">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-700 dark:text-amber-400 mb-2">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-forest-900 dark:text-sand-100">
              สภาพแวดล้อมจริง
            </h3>
            <p className="mt-1 text-xs text-forest-700 dark:text-sand-300 leading-relaxed">
              คำแนะนำเป็นแนวทางปฏิบัติทั่วไป ควรทดสอบความชื้นดินจริงควบคู่เสมอ
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 dark:bg-forest-900/40 border border-sand-200 dark:border-forest-800/80 shadow-soft">
            <div className="w-8 h-8 rounded-lg bg-forest-100 dark:bg-forest-950/80 flex items-center justify-center text-forest-700 dark:text-sand-300 mb-2">
              <Sprout className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-forest-900 dark:text-sand-100">
              ไม่มีการตัดเงินบนเว็บ
            </h3>
            <p className="mt-1 text-xs text-forest-700 dark:text-sand-300 leading-relaxed">
              แคตตาล็อกและผู้ช่วยดูแล สอบถามและสั่งซื้อผ่าน LINE Official Account
            </p>
          </div>
        </div>

        {/* Main Content Container in Botanical Luxury Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white/90 dark:bg-forest-900/50 border border-sand-200 dark:border-forest-800/80 shadow-card backdrop-blur-sm">
          <TermsMarkdownRenderer markdown={termsContent} />
        </div>

        {/* Bottom Contact Footer */}
        <div className="mt-10 p-6 rounded-2xl bg-forest-50/80 dark:bg-forest-900/60 border border-forest-200/70 dark:border-forest-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif font-bold text-base text-forest-950 dark:text-sand-50">
              ต้องการสอบถามเพิ่มเติมเกี่ยวกับข้อกำหนดการใช้งาน?
            </h3>
            <p className="text-xs text-forest-700 dark:text-sand-300">
              ติดต่อทีมงานเนอสเซอรี่ TreeForLife ได้โดยตรงทาง LINE Official Account
            </p>
          </div>

          <a
            href="https://line.me/R/ti/p/@treeforlife"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#06C755] hover:bg-[#05b34c] shadow-sm transition active:scale-95 min-h-[40px] shrink-0"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>ทักคุยกับร้านทาง LINE</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>
        </div>
      </div>
    </div>
  );
}
