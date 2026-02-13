import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST() {
  const session = await getSession();
  session.isLoggedIn = false;
  session.userId = undefined;
  session.username = undefined;
  session.role = undefined;
  session.mustChangePassword = undefined;
  await session.save();

  return NextResponse.json({ success: true });
}
