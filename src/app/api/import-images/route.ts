import { mkdir, writeFile } from "fs/promises";
import JSZip from "jszip";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const zip = new JSZip();
    const contents = await zip.loadAsync(buffer);

    const imagesDir = path.join(process.cwd(), "public", "images");
    await mkdir(imagesDir, { recursive: true });

    for (const [filename, zipEntry] of Object.entries(contents.files)) {
      if (!zipEntry.dir) {
        const content = await zipEntry.async("nodebuffer");
        await writeFile(path.join(imagesDir, filename), content);
      }
    }

    return NextResponse.json({ message: "Images imported successfully" });
  } catch (error) {
    console.error("Error importing images:", error);
    return NextResponse.json(
      { error: "Failed to import images" },
      { status: 500 }
    );
  }
}
