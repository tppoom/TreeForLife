"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Send,
  User,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Leaf,
  MessageSquare,
} from "lucide-react";

export interface SuggestedPlant {
  name: string;
  slug: string;
  price: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  suggestedPlants?: SuggestedPlant[];
}

export interface PromptPreset {
  chipLabel: string;
  fullQuestion: string;
  answerText: string;
  suggestedPlants: SuggestedPlant[];
}

export const PROMPT_PRESETS: PromptPreset[] = [
  {
    chipLabel: "ห้องนอนเปิดแอร์ทั้งคืน ปลูกต้นอะไรดี?",
    fullQuestion: "ห้องนอนเปิดแอร์ทั้งคืน ปลูกต้นอะไรดี?",
    answerText:
      "สำหรับห้องนอนที่เปิดเครื่องปรับอากาศทั้งคืน อุณหภูมิจะอยู่ที่ประมาณ 22-25°C และความชื้นสัมพัทธ์ในอากาศค่อนข้างต่ำ แนะนำให้เลือกพันธุ์ไม้ที่มีกระบวนการสังเคราะห์แสงแบบ CAM (Crassulacean Acid Metabolism) ซึ่งจะปิดปากใบในเวลากลางวันเพื่อลดการสูญเสียน้ำ และเปิดปากใบในเวลากลางคืนเพื่อดูดซับก๊าซคาร์บอนไดออกไซด์พร้อมปล่อยออกซิเจนบริสุทธิ์\n\n🌿 พันธุ์ไม้แนะนำอันดับ 1: ลิ้นมังกร (Sansevieria Trifasciata) ทนต่อลมแห้งจากแอร์ ดูแลง่ายมาก รดน้ำเพียง 10-14 วันครั้ง\n🌿 ทางเลือกเสริม: กวักมรกต (ZZ Plant) หรือ พลูด่าง ช่วยฟอกสารอินทรีย์ระเหยง่าย (VOCs)",
    suggestedPlants: [
      { name: "ลิ้นมังกร (Sansevieria)", slug: "sansevieria-trifasciata", price: "250฿" },
      { name: "กวักมรกต (ZZ Plant)", slug: "zamioculcas-zamiifolia", price: "290฿" },
    ],
  },
  {
    chipLabel: "สูตรผสมดินโปร่งสำหรับมอนสเตอร่า?",
    fullQuestion: "สูตรผสมดินโปร่งสำหรับมอนสเตอร่า?",
    answerText:
      "มอนสเตอร่าเป็นพืชในตระกูล Araceae ที่มีถิ่นกำเนิดในป่าดิบชื้น รากต้องการทั้งความชื้นและออกซิเจนสูง ดินปลูกที่ดีจึงต้องระบายน้ำและอากาศได้อย่างรวดเร็ว (High Aeration & Drainage) เพื่อป้องกันรากเน่า\n\n🌱 สูตรผสมดินโปร่งแนะนำ (สัดส่วน 40:30:20:10):\n1. กาบมะพร้าวสับเล็ก (แช่น้ำ 3 คืนล้างแทนนิน): 40%\n2. หินภูเขาไฟ หรือ เพอร์ไลต์: 30% (สร้างช่องว่างให้ออกซิเจนแทรกซึม)\n3. ใบก้ามปูหมักร่อนละเอียด: 20% (ให้ธาตุอาหารไนโตรเจนธรรมชาติ)\n4. มูลไส้เดือน + ปุ๋ยละลายช้า Osmocote: 10% (บำรุงต่อเนื่อง 3 เดือน)",
    suggestedPlants: [
      { name: "มอนสเตอร่าเดลิซิโอซา", slug: "monstera-deliciosa", price: "450฿" },
      { name: "มอนสเตอร่าด่าง (Albo)", slug: "monstera-albo-variegata", price: "1,800฿" },
    ],
  },
  {
    chipLabel: "ใบม้วนตอนบ่ายเป็นสัญญาณอะไรไหม?",
    fullQuestion: "ใบม้วนตอนบ่ายเป็นสัญญาณอะไรไหม?",
    answerText:
      "อาการใบม้วนเข้าด้านใน (Inward Leaf Curling) ในช่วงบ่าย เป็นกลไกการปรับตัวตามธรรมชาติของพืชในการลดพื้นที่ผิวสัมผัสความร้อนและชะลออัตราการคายน้ำ (Transpiration Stress)\n\n☀️ สาเหตุที่พบบ่อย:\n1. ได้รับความร้อนหรือแดดบ่ายตรงแรงเกินไป จนรากดูดน้ำส่งขึ้นมาเลี้ยงไม่ทัน\n2. ความชื้นในดินไม่พอ ตรวจสอบโดยใช้ไม้จิ้มฟันหรือนิ้วมือตรวจลึก 2 นิ้ว\n3. โดนลมแอร์เป่าลงใบโดยตรง\n\n💡 วิธีแก้ไข: ย้ายหลบแดดตรง หรือฉีดละอองน้ำรอบทรงพุ่มเพื่อเพิ่มความชื้นสัมพัทธ์ในอากาศ",
    suggestedPlants: [
      { name: "ยางอินเดีย (Rubber Tree)", slug: "ficus-elastica-burgundy", price: "390฿" },
      { name: "ไทรใบสัก (Ficus Lyrata)", slug: "ficus-lyrata", price: "550฿" },
    ],
  },
  {
    chipLabel: "รดน้ำแล้วน้ำขังจานรองทำยังไง?",
    fullQuestion: "รดน้ำแล้วน้ำขังจานรองทำยังไง?",
    answerText:
      "น้ำที่ขังในจานรองเกิน 15-30 นาทีเป็นสาเหตุอันดับหนึ่งของโรครากเน่า (Root Rot) ในไม้กระถางในร่ม!\n\n🚿 แนวทางปฏิบัติที่ถูกต้อง:\n1. เทน้ำทิ้งเสมอ: หลังรดน้ำ 15-20 นาที ให้นำน้ำที่ซึมลงจานรองไปเททิ้งทุกครั้ง\n2. ใช้ก้อนกรวดรองก้นจาน: ใส่เม็ดดินเผาหรือหินกรวดลงในจานรอง เพื่อยกระดับก้นกระถางไม่ให้สัมผัสน้ำโดยตรง\n3. ตรวจสอบรูระบายก้นกระถางไม่ให้อุดตัน",
    suggestedPlants: [
      { name: "ลิ้นมังกร (Sansevieria)", slug: "sansevieria-trifasciata", price: "250฿" },
    ],
  },
];

export function AssistantChatPrototype() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-welcome",
      sender: "bot",
      text: "สวัสดีครับ! ผมคือผู้ช่วยพฤกษศาสตร์ AI จาก TreeForLife 🌿 ยินดีให้คำแนะนำเรื่องการเลือกพันธุ์ไม้ สูตรผสมดิน และการแก้ปัญหาพืชตลอด 24 ชั่วโมง ลองคลิกเลือกคำถามยอดนิยมด้านล่างหรือพิมพ์คำถามได้เลยครับ",
      timestamp: "ตอนนี้",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSelectPrompt = (prompt: PromptPreset) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: prompt.fullQuestion,
      timestamp: "ตอนนี้",
    };

    const botMsg: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: "bot",
      text: prompt.answerText,
      timestamp: "ตอนนี้",
      suggestedPlants: prompt.suggestedPlants,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputValue.trim();
    if (!query) return;

    // Check if query matches any prompt
    const matchedPrompt = PROMPT_PRESETS.find(
      (p) =>
        query.includes("แอร์") ||
        query.includes("ห้องนอน") ||
        query.includes("ดิน") ||
        query.includes("ม้วน") ||
        query.includes("จานรอง")
    );

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: "ตอนนี้",
    };

    const botResponseText = matchedPrompt
      ? matchedPrompt.answerText
      : `ขอบคุณสำหรับคำถามเรื่อง "${query}" ครับ! สำหรับข้อสงสัยนี้ แนะนำให้สังเกตสภาพแสงและระดับความชื้นในดินเป็นหลัก พืชส่วนใหญ่ในร่มต้องการแสงสว่างทางอ้อม 4-6 ชม. และรดน้ำเมื่อผิวดินแห้ง 1-2 นิ้ว หากต้องการคำแนะนำเจาะจงเพิ่มเติม สามารถทักหาทีมผู้เชี่ยวชาญของร้านผ่าน LINE ได้เลยครับ!`;

    const botMsg: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: "bot",
      text: botResponseText,
      timestamp: "ตอนนี้",
      suggestedPlants: matchedPrompt?.suggestedPlants || [
        { name: "มอนสเตอร่าเดลิซิโอซา", slug: "monstera-deliciosa", price: "450฿" },
      ],
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputValue("");
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "initial-welcome",
        sender: "bot",
        text: "สวัสดีครับ! ผมคือผู้ช่วยพฤกษศาสตร์ AI จาก TreeForLife 🌿 ยินดีให้คำแนะนำเรื่องการเลือกพันธุ์ไม้ สูตรผสมดิน และการแก้ปัญหาพืชตลอด 24 ชั่วโมง ลองคลิกเลือกคำถามยอดนิยมด้านล่างหรือพิมพ์คำถามได้เลยครับ",
        timestamp: "ตอนนี้",
      },
    ]);
  };

  return (
    <div className="rounded-2xl border border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900 shadow-soft overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-sand-200 dark:border-forest-800 bg-sand-50/50 dark:bg-forest-950/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
              <Bot className="w-3.5 h-3.5" />
              <span>Phase 2 AI Prototype</span>
            </div>
            <h3 className="text-xl font-bold font-serif text-forest-900 dark:text-sand-100">
              💬 ผู้ช่วยตอบคำถาม 24 ชม. (AI Botanical Assistant)
            </h3>
            <p className="text-xs sm:text-sm text-sand-700 dark:text-sand-300">
              ถาม-ตอบปัญหาการปลูก การดูแล และสูตรผสมดินด้วยระบบ AI ผู้เชี่ยวชาญพฤกษศาสตร์
            </p>
          </div>
          <button
            onClick={handleClearChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-sand-100 dark:bg-forest-800 text-forest-800 dark:text-sand-200 hover:bg-sand-200 dark:hover:bg-forest-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ล้างบทสนทนา</span>
          </button>
        </div>

        {/* Quick Prompt Chips */}
        <div className="mt-4 space-y-2">
          <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300">
            คำถามยอดนิยม (คลิกเพื่อทดสอบตอบทันที):
          </label>
          <div className="flex flex-wrap gap-2">
            {PROMPT_PRESETS.map((preset, index) => (
              <button
                key={index}
                role="button"
                onClick={() => handleSelectPrompt(preset)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-sand-100 hover:bg-emerald-100 dark:bg-forest-800 dark:hover:bg-forest-700 text-forest-900 dark:text-sand-200 border border-sand-200 dark:border-forest-700 transition"
              >
                💡 {preset.chipLabel}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="p-4 sm:p-6 space-y-4 max-h-[460px] overflow-y-auto bg-sand-50/20 dark:bg-forest-950/20">
        {messages.map((msg) => {
          const isBot = msg.sender === "bot";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs sm:text-sm ${
                isBot ? "justify-start" : "justify-end"
              }`}
            >
              {isBot && (
                <div className="w-8 h-8 rounded-full bg-forest-800 dark:bg-emerald-600 text-sand-50 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm space-y-2 ${
                  isBot
                    ? "bg-white dark:bg-forest-900 border border-sand-200 dark:border-forest-800 text-forest-900 dark:text-sand-100"
                    : "bg-forest-800 text-sand-50 dark:bg-emerald-700"
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                {/* Suggested Plant Link Chips */}
                {isBot && msg.suggestedPlants && msg.suggestedPlants.length > 0 && (
                  <div className="pt-2 border-t border-sand-200/60 dark:border-forest-800">
                    <span className="text-[11px] font-semibold text-sand-600 dark:text-sand-400 block mb-1.5 flex items-center gap-1">
                      <Leaf className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>พันธุ์ไม้ที่เกี่ยวข้องในร้าน:</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.suggestedPlants.map((plant, idx) => (
                        <Link
                          key={idx}
                          href={`/plants`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium transition"
                        >
                          <span>{plant.name}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {plant.price}
                          </span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!isBot && (
                <div className="w-8 h-8 rounded-full bg-sand-300 dark:bg-forest-700 text-forest-900 dark:text-sand-100 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input Box Footer */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-sand-200 dark:border-forest-800 bg-white dark:bg-forest-900 flex gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="พิมพ์คำถามเกี่ยวกับการดูแลต้นไม้ สูตรผสมดิน หรืออาการใบ..."
          className="flex-1 px-4 py-2 rounded-xl text-xs sm:text-sm bg-sand-50 dark:bg-forest-950 border border-sand-200 dark:border-forest-800 text-forest-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-sand-50 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition"
        >
          <Send className="w-3.5 h-3.5" />
          <span>ส่งคำถาม</span>
        </button>
      </form>
    </div>
  );
}
