import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  let filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json(
      { error: "Filename is required" },
      { status: 400 }
    );
  }

  // Add the folder structure to the filename
  filename = `images/${filename}`;

  const file = await request.blob();

  try {
    const blob = await put(filename, file, {
      access: "public",
    });

    // If you want to use a custom domain, you'll need to modify the URL here
    const customUrl = new URL(blob.url);
    customUrl.hostname = "abhinav-baldha.vercel.app";

    return NextResponse.json({
      ...blob,
      customUrl: customUrl.toString(),
    });
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
