import prisma from "@/lib/db";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Metadata } from "next";
import { isNewPost } from "@/lib/helper";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  content_preview: string;
  created_at: Date;
  updated_at: Date;
  slug: string;
  is_draft: boolean;
  label: string;
}

export const metadata: Metadata = {
  title: "My Blog",
  description: "A collection of my blog posts.",
};

export default async function BlogListPage() {
  const blogPosts = await prisma.blogPost.findMany({
    where: { is_draft: false },
    orderBy: { created_at: "desc" },
  });

  return (
    <>
      <main className="prose mx-auto flex-1 w-full max-w-4xl relative z-10">
        {blogPosts.length === 0 ? (
          <Spinner />
        ) : (
          blogPosts.map((post) => (
            <div key={post.id}>
              <h2 className="flex -mt-1 items-center text-lg sm:text-xl">
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-0.5 font-semibold"
                >
                  {post.title}
                </Link>
                {post?.label === "new" &&
                  isNewPost(post?.created_at.toString()) && (
                    <span className="inline-flex items-center rounded-full bg-[#ff6b6b] px-1.5 py-0.5 text-xs font-medium text-white uppercase ml-3 mt-0.5">
                      New
                    </span>
                  )}
                <span className="ml-3 text-sm text-primary/50 font-normal">
                  {post.created_at.toLocaleDateString("en-US", {
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </h2>
            </div>
          ))
        )}
      </main>
    </>
  );
}
