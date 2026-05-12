import { NextRequest } from "next/server";
import { requireAdmin, createAdminResponse, createErrorResponse } from "@/lib/auth-checks";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    const { allowed } = await checkRateLimit(admin.userId, "ADMIN_UPLOAD");
    if (!allowed) return createErrorResponse("Too many requests", 429);

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return createErrorResponse("No file provided", 400);
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse("Only JPEG, PNG, WebP or GIF images allowed", 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      return createErrorResponse("File too large (max 5MB)", 400);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return createErrorResponse("Supabase storage not configured", 500);
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `questions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/question-images/${fileName}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": file.type,
          "x-upsert": "true",
        },
        body: arrayBuffer,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.error("Supabase upload error:", err);
      return createErrorResponse("Failed to upload image", 500);
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/question-images/${fileName}`;
    return createAdminResponse({ url: publicUrl });
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("Upload error:", error);
    return createErrorResponse("Upload failed", 500);
  }
}
