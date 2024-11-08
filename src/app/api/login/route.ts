import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sign } from "jsonwebtoken";

const FIXED_USERNAME = process.env.FIXED_USERNAME;
const FIXED_PASSWORD = process.env.FIXED_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (username === FIXED_USERNAME && password === FIXED_PASSWORD) {
    const token = sign({ username }, JWT_SECRET, { expiresIn: "1h" });

    (await cookies()).set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600,
      path: "/",
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
