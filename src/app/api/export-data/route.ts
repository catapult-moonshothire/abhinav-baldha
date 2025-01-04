import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const posts = await db.query("SELECT * FROM blog_posts");
    return new NextResponse(JSON.stringify(posts), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": "attachment; filename=blog_data.json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
