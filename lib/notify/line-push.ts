export interface LinePushTaskItem {
  type: string; // water | fertilize | repot | prune | pest_check
  plantNickname: string;
  speciesName: string;
}

export interface LineCareDigestOptions {
  toUserId: string;
  dateStr: string; // YYYY-MM-DD
  tasks: LinePushTaskItem[];
  shopTip?: string;
  siteUrl?: string;
}

export async function sendLineCareDigest(
  opts: LineCareDigestOptions
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const channelAccessToken = process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN;
  if (!channelAccessToken) {
    // If LINE Messaging token not set (e.g. dev/test), simulate success
    return { success: true };
  }

  const siteUrl = opts.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://treeforlife-app.vercel.app";
  const displayedTasks = opts.tasks.slice(0, 5);
  const remainingCount = opts.tasks.length - displayedTasks.length;

  const taskTypeIcons: Record<string, string> = {
    water: "💧 รดน้ำ",
    fertilize: "💊 ใส่ปุ๋ย",
    repot: "🪴 เปลี่ยนกระถาง",
    prune: "✂️ ตัดแต่งกิ่ง",
    pest_check: "🔍 ตรวจเช็กแมลง",
  };

  const bodyContents = displayedTasks.map((t) => ({
    type: "box",
    layout: "horizontal",
    contents: [
      {
        type: "text",
        text: taskTypeIcons[t.type] || "🌿 ดูแล",
        size: "sm",
        color: "#166534",
        weight: "bold",
        flex: 3,
      },
      {
        type: "text",
        text: `${t.plantNickname} (${t.speciesName})`,
        size: "sm",
        color: "#1f2937",
        flex: 5,
        align: "end",
      },
    ],
    margin: "md",
  }));

  if (remainingCount > 0) {
    bodyContents.push({
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "text",
          text: `...และอีก ${remainingCount} งาน`,
          size: "xs",
          color: "#6b7280",
          align: "center",
          flex: 1,
        },
      ],
      margin: "md",
    });
  }

  const flexMessage = {
    type: "flex",
    altText: `วันนี้มี ${opts.tasks.length} งานดูแลต้นไม้ของคุณ 🌿`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#166534",
        paddingAll: "lg",
        contents: [
          {
            type: "text",
            text: "TreeForLife — งานดูแลวันนี้ 🌿",
            color: "#ffffff",
            weight: "bold",
            size: "md",
          },
          {
            type: "text",
            text: `วันที่ ${opts.dateStr} · ถึงรอบ ${opts.tasks.length} รายการ`,
            color: "#dcfce7",
            size: "xs",
            margin: "sm",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          ...bodyContents,
          ...(opts.shopTip
            ? [
                {
                  type: "separator",
                  margin: "xl",
                },
                {
                  type: "box",
                  layout: "vertical",
                  margin: "md",
                  backgroundColor: "#f4f1ea",
                  paddingAll: "md",
                  cornerRadius: "md",
                  contents: [
                    {
                      type: "text",
                      text: "💡 ที่ร้านบอกว่า:",
                      size: "xs",
                      weight: "bold",
                      color: "#854d0e",
                    },
                    {
                      type: "text",
                      text: opts.shopTip,
                      size: "xs",
                      color: "#374151",
                      wrap: true,
                      margin: "xs",
                    },
                  ],
                },
              ]
            : []),
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#06C755",
            height: "sm",
            action: {
              type: "postback",
              label: "✅ บันทึกรดครบแล้ว",
              data: `action=done_all&d=${opts.dateStr}`,
            },
          },
          {
            type: "button",
            style: "secondary",
            height: "sm",
            action: {
              type: "uri",
              label: "เปิดดูรายละเอียดในเว็บ",
              uri: `${siteUrl}/today?src=line`,
            },
          },
        ],
      },
    },
  };

  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to: opts.toUserId,
        messages: [flexMessage],
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        statusCode: res.status,
        error: `LINE push error (${res.status}): ${errorText}`,
      };
    }

    return { success: true, statusCode: 200 };
  } catch (err: any) {
    return {
      success: false,
      statusCode: 500,
      error: err.message || "Failed to dispatch LINE push",
    };
  }
}
