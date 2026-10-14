import { NextResponse } from "next/server";
import { getStorageProvider } from "@/lib/storage";
import { AdminMediaUploadUrlSchema } from "@/lib/validation/admin";
import { HttpError, toErrorResponse } from "@/lib/http/errors";

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = AdminMediaUploadUrlSchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new HttpError(
        400,
        "VALIDATION_ERROR",
        "ข้อมูลไม่ถูกต้อง",
        parsed.error.flatten()
      );
    }

    const { filename, contentType, speciesId } = parsed.data;
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const path = `species/${speciesId || "misc"}/${Date.now()}-${sanitizedFilename}`;

    const storage = getStorageProvider();
    const { uploadUrl, publicUrl } = await storage.createSignedUploadUrl({
      path,
      contentType,
    });

    return NextResponse.json({
      success: true,
      data: { uploadUrl, publicUrl, path },
    });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}
