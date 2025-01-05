import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json(
      { error: "Filename is required" },
      { status: 400 }
    );
  }

  // Remove any path information from the filename
  filename = path.basename(filename);

  const file = await request.blob();

  try {
    // Ensure the images directory exists
    const imagesDir = path.join(process.cwd(), "public", "images");
    await mkdir(imagesDir, { recursive: true });

    // Save the file
    await writeFile(
      path.join(imagesDir, filename),
      Buffer.from(await file.arrayBuffer())
    );

    // Use the Next.js Image Optimization API
    const imageUrl = `/api/images/${filename}`;

    return NextResponse.json({
      url: imageUrl,
    });
  } catch (error) {
    console.error("Error saving image:", error);
    return NextResponse.json(
      { error: "Failed to save image" },
      { status: 500 }
    );
  }
}
