import { NextResponse } from "next/server";
import { createInquiry, CreateInquiryInput } from "@/lib/services/inquiryService";

export async function POST(req: Request) {
  try {
    const body: CreateInquiryInput = await req.json();
    if (!body.sourcePage || !body.intent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await createInquiry(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
