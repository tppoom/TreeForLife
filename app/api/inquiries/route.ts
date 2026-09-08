import { NextResponse } from "next/server";
import { createInquiry, getInquiries, CreateInquiryInput } from "@/lib/services/inquiryService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const guestToken = searchParams.get("guestToken");
    const refCode = searchParams.get("refCode");
    const limit = searchParams.get("limit");

    const inquiries = await getInquiries({
      userId: userId || undefined,
      guestToken: guestToken || undefined,
      refCode: refCode || undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return NextResponse.json({ inquiries });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch inquiries";
    console.error("Error fetching inquiries:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: CreateInquiryInput = await req.json();
    if (!body.sourcePage || !body.intent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await createInquiry(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error creating inquiry:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
