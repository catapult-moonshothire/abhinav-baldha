import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    const tag = searchParams.get("tag");

    if (path) {
      revalidatePath(path);
    } else if (tag) {
      revalidateTag(tag);
    } else {
      // Revalidate the blog list page
      revalidatePath("/");
      // Revalidate all blog post pages
      revalidateTag("blog-posts");
    }

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({
      revalidated: false,
      now: Date.now(),
      error: "Error revalidating",
    });
  }
}
