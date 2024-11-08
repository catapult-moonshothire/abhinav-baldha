import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Clear the auth_token cookie by setting it to expire immediately
  (
    await // Clear the auth_token cookie by setting it to expire immediately
    cookies()
  ).set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: -1, // Setting maxAge to -1 to delete the cookie
    path: "/",
  });

  return NextResponse.json({ success: true });
}
