import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("auth_token");

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    verify(token.value, JWT_SECRET);
    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
