import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST() {
  try {
    // Revalidate the blog list page
    revalidatePath("/");

    // Revalidate all blog post pages
    revalidatePath("/blog/[slug]");

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({
      revalidated: false,
      now: Date.now(),
      error: "Error revalidating",
    });
  }
}
