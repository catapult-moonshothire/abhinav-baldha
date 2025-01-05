import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const imagePath = path.join(
    process.cwd(),
    "public",
    "images",
    ...params.path
  );

  try {
    const imageBuffer = await readFile(imagePath);
    const contentType = getContentType(path.extname(imagePath));

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Image not found", { status: 404 });
  }
}

function getContentType(extension: string): string {
  const contentTypes: { [key: string]: string } = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };

  return contentTypes[extension.toLowerCase()] || "application/octet-stream";
}
