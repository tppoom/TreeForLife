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
import { useDemoCopy, fill } from "@/lib/i18n/demo";
import { chatTh } from "@/lib/i18n/demo/chat";

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
  keywords: string[];
  chipLabel: string;
  fullQuestion: string;
  answerText: string;
  suggestedPlants: SuggestedPlant[];
}

export const PROMPT_PRESETS: PromptPreset[] = chatTh.presets;

export function AssistantChatPrototype() {
  const c = useDemoCopy().chat;
  const presets: PromptPreset[] = c.presets;
  // The welcome bubble is derived from copy, not stored, so it follows language changes
  const welcome: ChatMessage = {
    id: "initial-welcome",
    sender: "bot",
    text: c.welcome,
    timestamp: c.now,
  };
  const [conversation, setMessages] = useState<ChatMessage[]>([]);
  const messages = [welcome, ...conversation];
  const [inputValue, setInputValue] = useState("");

  const handleSelectPrompt = (prompt: PromptPreset) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: prompt.fullQuestion,
      timestamp: c.now,
    };

    const botMsg: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: "bot",
      text: prompt.answerText,
      timestamp: c.now,
      suggestedPlants: prompt.suggestedPlants,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputValue.trim();
    if (!query) return;

    // Answer with the preset whose keywords appear in the question
    const lowered = query.toLowerCase();
    const matchedPrompt = presets.find((p) => p.keywords.some((k) => lowered.includes(k.toLowerCase())));

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: c.now,
    };

    const botMsg: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: "bot",
      text: matchedPrompt ? matchedPrompt.answerText : fill(c.fallback_answer, { query }),
      timestamp: c.now,
      suggestedPlants: matchedPrompt?.suggestedPlants || [c.fallback_plant],
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputValue("");
  };

  const handleClearChat = () => {
    setMessages([]);
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
              {c.title}
            </h3>
            <p className="text-xs sm:text-sm text-sand-700 dark:text-sand-300">
              {c.subtitle}
            </p>
          </div>
          <button
            onClick={handleClearChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-sand-100 dark:bg-forest-800 text-forest-800 dark:text-sand-200 hover:bg-sand-200 dark:hover:bg-forest-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{c.clear}</span>
          </button>
        </div>

        {/* Quick Prompt Chips */}
        <div className="mt-4 space-y-2">
          <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300">
            {c.popular}
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, index) => (
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
                      <span>{c.related}</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.suggestedPlants.map((plant, idx) => (
                        <Link
                          key={idx}
                          href={`/plants/${plant.slug}`}
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
          placeholder={c.placeholder}
          className="flex-1 px-4 py-2 rounded-xl text-xs sm:text-sm bg-sand-50 dark:bg-forest-950 border border-sand-200 dark:border-forest-800 text-forest-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-sand-50 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{c.send}</span>
        </button>
      </form>
    </div>
  );
}
