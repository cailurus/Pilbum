import { NextResponse } from "next/server";
import { isStorageConfigured } from "@/lib/config-check";

export async function GET() {
  return NextResponse.json({
    configured: isStorageConfigured(),
  });
}
