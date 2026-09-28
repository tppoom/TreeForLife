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

export function CommunityBoardPrototype() {
  const [posts, setPosts] = useState<PostItem[]>([
    {
      id: "post-1",
      authorName: "คุณนลินดา สุขุมวิท",
      authorBadge: "Green Club Gold",
      authorLocation: "กรุงเทพฯ",
      avatarBg: "bg-emerald-600",
      title: "มอนสเตอร่าไจแอนท์ 6 เดือน จากใบเดี่ยวสู่ใบฉลุ 8 แฉก! 🌿",
      plantSpecies: "มอนสเตอร่าไจแอนท์ (Monstera Deliciosa)",
      timeline: "ระยะเวลา 180 วัน (6 เดือน)",
      growthStats: "สูงขึ้น +45 ซม. • แตกใบใหม่ 5 ใบ • ลายฉลุลึกสมบูรณ์",
      beforeStory: "วันแรกที่ซื้อมาจาก TreeForLife เป็นต้นกระถาง 6 นิ้ว มีใบเรียบเพียง 2 ใบ",
      afterStory: "ปัจจุบันย้ายลงกระถางดินเผา 12 นิ้ว วางริมหน้าต่างกรองแสงบ่าย ใบเริ่มฉลุสวยงามสมบูรณ์แบบมาก",
      careTip: "เคล็ดลับสำคัญคือผสมหินภูเขาไฟและกาบมะพร้าวสับ 40% รดน้ำสัปดาห์ละ 2 ครั้ง และเช็ดใบด้วยน้ำมันสะเดาทุกวันอาทิตย์",
      tags: ["#มอนสเตอร่า", "#บันทึกการเติบโต", "#GreenClub"],
      likes: 24,
      isLiked: false,
      comments: [
        {
          id: "c-1",
          author: "คุณธนพล",
          avatarBg: "bg-forest-700",
          content: "ใบเงาสวยมากครับ ใช้ปุ๋ยสูตรไหนเป็นพิเศษไหมครับ?",
          createdAt: "2 ชม. ที่แล้ว",
        },
        {
          id: "c-2",
          author: "ป้านิด สวนในบ้าน",
          avatarBg: "bg-amber-600",
          content: "ยินดีด้วยจ้า ลายฉลุฉ่ำมาก แดดรำไรกำลังพอดีเลย",
          createdAt: "1 ชม. ที่แล้ว",
        },
      ],
    },
    {
      id: "post-2",
      authorName: "คุณกิตติศักดิ์ พืชงาม",
      authorBadge: "Plant Specialist",
      authorLocation: "เชียงใหม่",
      avatarBg: "bg-teal-700",
      title: "กุหลาบอังกฤษ Clair Austin ดอกชุดที่ 3 บานสะพรั่งกลางสายฝน 🌹",
      plantSpecies: "กุหลาบอังกฤษ (English Rose Clair Austin)",
      timeline: "ระยะเวลา 90 วัน",
      growthStats: "ออกดอกรวม 18 ดอก • กลิ่นหอมฟุ้งวนิลา • กิ่งก้านแข็งแรง",
      beforeStory: "ช่วงแรกยอดกิ่งโดนเพลี้ยไฟรบกวนจนใบร่วง",
      afterStory: "หลังใช้สูตรน้ำหมักสะเดาผสมเชื้อไตรโคเดอร์มาของหมอพืช ยอดใหม่แทงดอกตูมแน่นทุกข้อ",
      careTip: "ตัดแต่งกิ่งแขนง 45 องศาหลังดอกโรยทุกครั้ง ใส่ปุ๋ยอินทรีย์อัดเม็ดทุก 14 วันเพื่อสะสมตาดอกใหม่",
      tags: ["#กุหลาบอังกฤษ", "#บำรุงดอก", "#กุหลาบสายหวาน"],
      likes: 42,
      isLiked: false,
      comments: [
        {
          id: "c-3",
          author: "คุณพิมพ์ใจ",
          avatarBg: "bg-rose-600",
          content: "หอมมากแน่นอนพันธุ์นี้ อยากปลูกที่ระเบียงคอนโดบ้างจัง",
          createdAt: "30 นาทีที่แล้ว",
        },
      ],
    },
  ]);

  const [activeCommentPostId, setActiveCommentPostId] = useState<string>("post-1");
  const [commentInput, setCommentInput] = useState<string>("");

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const nextLiked = !post.isLiked;
          return {
            ...post,
            isLiked: nextLiked,
            likes: nextLiked ? post.likes + 1 : post.likes - 1,
          };
        }
        return post;
      })
    );
  };

  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: "คุณ (สมาชิก Green Club)",
      avatarBg: "bg-forest-800",
      content: commentInput.trim(),
      createdAt: "เมื่อสักครู่",
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      })
    );

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
              <span>🌱 ชุมชนคนรักต้นไม้ & บันทึกการเติบโต</span>
            </h3>
            <p className="text-xs sm:text-sm text-sand-200 max-w-2xl">
              พื้นที่แลกเปลี่ยนประสบการณ์ของเหล่านักปลูก แบ่งปันไดอารี่บันทึกพัฒนาการต้นไม้ ภาพเปรียบเทียบก่อน-หลัง และเทคนิคการดูแลจากสวนจริง
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-forest-700/80 rounded-lg text-xs font-medium text-sand-200 flex items-center gap-1.5 border border-forest-600">
              <Award className="w-3.5 h-3.5 text-gold-400" />
              <span>สมาชิก 12,450 คน</span>
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
                    🌱 พัฒนาการเติบโต (Growth Progress)
                  </div>
                  <div className="text-xs font-medium text-forest-800 dark:text-emerald-300">
                    {post.growthStats}
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-forest-900 rounded-xl border border-sand-200/80 dark:border-forest-800">
                  <div className="text-[11px] font-semibold text-sand-500 uppercase tracking-wider mb-1">
                    ⏱️ บันทึกไทม์ไลน์
                  </div>
                  <div className="text-xs text-sand-700 dark:text-sand-300">
                    <span className="font-semibold text-forest-800 dark:text-sand-100">จุดเริ่มต้น:</span> {post.beforeStory}
                  </div>
                </div>
              </div>

              {/* Care Tip Highlight */}
              <div className="p-4 bg-emerald-50/70 dark:bg-forest-900/90 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>เคล็ดลับจากเจ้าของต้นไม้:</span>
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
                  <span>กดไลก์ ({post.likes})</span>
                </button>

                <div className="text-xs text-sand-600 dark:text-sand-400 flex items-center gap-1 px-3 py-2 bg-white dark:bg-forest-900 rounded-xl border border-sand-200 dark:border-forest-800">
                  <MessageSquare className="w-3.5 h-3.5 text-sand-500" />
                  <span>{post.comments.length} ความคิดเห็น</span>
                </div>
              </div>

              {/* Comments Thread */}
              <div className="space-y-3 pt-3 bg-white/60 dark:bg-forest-900/60 p-4 rounded-xl border border-sand-200/60 dark:border-forest-800/60">
                <div className="text-xs font-semibold text-sand-700 dark:text-sand-300">
                  ความคิดเห็นล่าสุด ({post.comments.length})
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
                    placeholder="เขียนความคิดเห็นหรือแลกเปลี่ยนประสบการณ์..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-forest-700 bg-white dark:bg-forest-900 text-forest-900 dark:text-sand-100 placeholder-sand-400 focus:outline-none focus:ring-2 focus:ring-forest-600 dark:focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    role="button"
                    onClick={() => handleAddComment(post.id)}
                    className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ส่งความคิดเห็น</span>
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
