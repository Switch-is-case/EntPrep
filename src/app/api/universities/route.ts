import { NextRequest, NextResponse } from "next/server";
import { universitiesService } from "@/lib/container";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;

  try {
    const allUniversities = await universitiesService.getAllUniversities(search);
    return NextResponse.json({ universities: allUniversities });
  } catch (error) {
    console.error("Public universities GET error:", error);
    return NextResponse.json({ error: "Failed to load universities" }, { status: 500 });
  }
}
