import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const posts = await db.query(
      "SELECT * FROM blog_posts ORDER BY created_at DESC"
    );
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, content, content_preview, is_draft, ...rest } = body;
    const result = await db.run(
      `INSERT INTO blog_posts (title, slug, content, content_preview, is_draft, author, category, meta_title, meta_description, label, author_bio, reading_time, featured_image_url, status, images)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        content,
        content_preview,
        is_draft ? 1 : 0,
        rest.author,
        rest.category,
        rest.meta_title,
        rest.meta_description,
        rest.label,
        rest.author_bio,
        rest.reading_time,
        rest.featured_image_url,
        rest.status,
        rest.images,
      ]
    );
    return NextResponse.json({ id: result.lastID, ...body }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
