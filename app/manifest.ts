import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TreeForLife — ร้านต้นไม้คัดพิเศษ & ผู้ช่วยดูแล",
    short_name: "TreeForLife",
    description: "ตารางดูแลต้นไม้ 3 ฤดูกาลไทย บันทึกสวน และระบบแจ้งเตือนรดน้ำ",
    start_url: "/today?src=pwa",
    display: "standalone",
    background_color: "#fcfbfa",
    theme_color: "#166534",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
