import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileContent = await file.text();
    const data = JSON.parse(fileContent);

    // Clear existing data
    await db.run("DELETE FROM blog_posts");

    // Insert new data
    for (const post of data) {
      await db.run(
        `INSERT INTO blog_posts (title, slug, content, content_preview, is_draft, author, category, meta_title, meta_description, label, author_bio, reading_time, featured_image_url, status, images, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          post.title,
          post.slug,
          post.content,
          post.content_preview || null,
          post.is_draft ? 1 : 0,
          post.author,
          post.category || null,
          post.meta_title || null,
          post.meta_description || null,
          post.label || null,
          post.author_bio || null,
          post.reading_time || null,
          post.featured_image_url || null,
          post.status || null,
          JSON.stringify(post.images || []),
          post.created_at || new Date().toISOString(),
          post.updated_at || new Date().toISOString(),
        ]
      );
    }

    return NextResponse.json({ message: "Data imported successfully" });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import data" },
      { status: 500 }
    );
  }
}
