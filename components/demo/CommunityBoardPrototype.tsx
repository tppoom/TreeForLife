"use client";

import React, { useState } from "react";
import {
  Heart,
  MessageSquare,
  Share2,
  Sparkles,
  Calendar,
  Award,
  Send,
  User,
  CheckCircle2,
  TrendingUp,
  Tag,
  Leaf,
} from "lucide-react";
import { useDemoCopy, fill } from "@/lib/i18n/demo";

export interface CommentItem {
  id: string;
  author: string;
  avatarBg: string;
  content: string;
  createdAt: string;
}

export interface PostItem {
  id: string;
  authorName: string;
  authorBadge: string;
  authorLocation: string;
  avatarBg: string;
  title: string;
  plantSpecies: string;
  timeline: string;
  growthStats: string;
  beforeStory: string;
  afterStory: string;
  careTip: string;
  tags: string[];
  likes: number;
  isLiked: boolean;
  comments: CommentItem[];
}

// Language-independent post data; all text lives in lib/i18n/demo/community.ts
const POST_META: Record<string, { avatarBg: string; likes: number; commentBg: Record<string, string> }> = {
  "post-1": { avatarBg: "bg-emerald-600", likes: 24, commentBg: { "c-1": "bg-forest-700", "c-2": "bg-amber-600" } },
  "post-2": { avatarBg: "bg-teal-700", likes: 42, commentBg: { "c-3": "bg-rose-600" } },
};

export function CommunityBoardPrototype() {
  const c = useDemoCopy().community;
  // Interaction state only: likes and comments the visitor adds
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [ownComments, setOwnComments] = useState<Record<string, Array<{ id: string; content: string }>>>({});

  const posts: PostItem[] = c.posts.map((post) => {
    const meta = POST_META[post.id];
    const isLiked = Boolean(liked[post.id]);
    return {
      ...post,
      avatarBg: meta.avatarBg,
      likes: meta.likes + (isLiked ? 1 : 0),
      isLiked,
      comments: [
        ...post.comments.map((cm) => ({ ...cm, avatarBg: meta.commentBg[cm.id] || "bg-forest-700" })),
        ...(ownComments[post.id] || []).map((cm) => ({
          ...cm,
          author: c.you,
          avatarBg: "bg-forest-800",
          createdAt: c.just_now,
        })),
      ],
    };
  });

  const [activeCommentPostId, setActiveCommentPostId] = useState<string>("post-1");
  const [commentInput, setCommentInput] = useState<string>("");

  const handleToggleLike = (postId: string) => {
    setLiked((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;
    const newComment = { id: `c-${Date.now()}`, content: commentInput.trim() };
    setOwnComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), newComment] }));
    setCommentInput("");
  };

  return (
    <div className="bg-white dark:bg-forest-900 border border-sand-200 dark:border-forest-800 rounded-2xl shadow-card overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-forest-800 via-forest-900 to-forest-950 p-5 sm:p-6 text-white relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 3 Platform Feature</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
              <span>{c.title}</span>
            </h3>
            <p className="text-xs sm:text-sm text-sand-200 max-w-2xl">
              {c.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-forest-700/80 rounded-lg text-xs font-medium text-sand-200 flex items-center gap-1.5 border border-forest-600">
              <Award className="w-3.5 h-3.5 text-gold-400" />
              <span>{c.members}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Feed Content */}
      <div className="p-5 sm:p-6 space-y-8">
        {posts.map((post) => (
          <div
            key={post.id}
            className="border border-sand-200 dark:border-forest-800 rounded-2xl bg-sand-50/40 dark:bg-forest-950/40 overflow-hidden shadow-sm"
          >
            {/* Post Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-sand-200/80 dark:border-forest-800/80 bg-white/70 dark:bg-forest-900/70">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${post.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-sm`}
                >
                  {post.authorName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-forest-950 dark:text-sand-100">
                      {post.authorName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {post.authorBadge}
                    </span>
                  </div>
                  <div className="text-[11px] text-sand-500 dark:text-sand-400">
                    {post.authorLocation} • {post.timeline}
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-xs text-forest-700 dark:text-emerald-400 bg-forest-100/60 dark:bg-forest-800 px-3 py-1 rounded-full font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{post.plantSpecies}</span>
              </div>
            </div>

            {/* Post Body */}
            <div className="p-5 space-y-4">
              <h4 className="text-base sm:text-lg font-serif font-bold text-forest-900 dark:text-sand-50">
                {post.title}
              </h4>

              {/* Growth Stats Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-white dark:bg-forest-900 rounded-xl border border-sand-200/80 dark:border-forest-800">
                  <div className="text-[11px] font-semibold text-sand-500 uppercase tracking-wider mb-1">
                    {c.growth}
                  </div>
                  <div className="text-xs font-medium text-forest-800 dark:text-emerald-300">
                    {post.growthStats}
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-forest-900 rounded-xl border border-sand-200/80 dark:border-forest-800">
                  <div className="text-[11px] font-semibold text-sand-500 uppercase tracking-wider mb-1">
                    {c.timeline}
                  </div>
                  <div className="text-xs text-sand-700 dark:text-sand-300">
                    <span className="font-semibold text-forest-800 dark:text-sand-100">{c.start}</span> {post.beforeStory}
                  </div>
                </div>
              </div>

              {/* Care Tip Highlight */}
              <div className="p-4 bg-emerald-50/70 dark:bg-forest-900/90 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{c.owner_tip}</span>
                </div>
                <p className="text-xs text-forest-900 dark:text-sand-200 leading-relaxed">
                  {post.careTip}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] text-forest-700 dark:text-emerald-400 bg-white dark:bg-forest-800/80 px-2 py-0.5 rounded-md border border-sand-200/60 dark:border-forest-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons: Like, Comment count */}
              <div className="flex items-center gap-3 pt-3 border-t border-sand-200/80 dark:border-forest-800/80">
                <button
                  type="button"
                  role="button"
                  onClick={() => handleToggleLike(post.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                    post.isLiked
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                      : "bg-white dark:bg-forest-900 text-sand-700 dark:text-sand-300 hover:bg-sand-100 border border-sand-200 dark:border-forest-800"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${post.isLiked ? "fill-rose-500 text-rose-500" : "text-sand-500"}`}
                  />
                  <span>{fill(c.like, { count: post.likes })}</span>
                </button>

                <div className="text-xs text-sand-600 dark:text-sand-400 flex items-center gap-1 px-3 py-2 bg-white dark:bg-forest-900 rounded-xl border border-sand-200 dark:border-forest-800">
                  <MessageSquare className="w-3.5 h-3.5 text-sand-500" />
                  <span>{fill(c.comment_count, { count: post.comments.length })}</span>
                </div>
              </div>

              {/* Comments Thread */}
              <div className="space-y-3 pt-3 bg-white/60 dark:bg-forest-900/60 p-4 rounded-xl border border-sand-200/60 dark:border-forest-800/60">
                <div className="text-xs font-semibold text-sand-700 dark:text-sand-300">
                  {fill(c.latest_comments, { count: post.comments.length })}
                </div>

                <div className="space-y-2">
                  {post.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-2.5 rounded-lg bg-sand-50 dark:bg-forest-950/50 border border-sand-200/50 dark:border-forest-800/50 text-xs flex items-start gap-2.5"
                    >
                      <div
                        className={`w-6 h-6 rounded-full ${comment.avatarBg} text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5`}
                      >
                        {comment.author.charAt(0)}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-forest-900 dark:text-sand-200">
                            {comment.author}
                          </span>
                          <span className="text-[10px] text-sand-400">
                            {comment.createdAt}
                          </span>
                        </div>
                        <p className="text-sand-700 dark:text-sand-300">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment Input Box */}
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    role="textbox"
                    value={activeCommentPostId === post.id ? commentInput : ""}
                    onFocus={() => setActiveCommentPostId(post.id)}
                    onChange={(e) => {
                      setActiveCommentPostId(post.id);
                      setCommentInput(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddComment(post.id);
                      }
                    }}
                    placeholder={c.comment_placeholder}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-forest-900 dark:text-sand-100 placeholder-sand-400 focus:outline-none focus:ring-2 focus:ring-forest-600 dark:focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    role="button"
                    onClick={() => handleAddComment(post.id)}
                    className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{c.comment_send}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
