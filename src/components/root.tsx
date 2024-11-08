import { supabase } from "@/lib/supabase";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Metadata } from "next";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  content_preview: string;
  created_at: string;
  slug: string;
}

export const metadata: Metadata = {
  title: "My Blog",
  description: "A collection of my blog posts.",
};

export const revalidate = 3600 * 2; // Revalidate every hour

export default async function BlogListPage() {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching blog posts:", error);
    return (
      <>
        <main className="prose mx-auto flex-1 w-full max-w-4xl relative z-10">
          <h1 className="text-xl font-bold">Error</h1>
          <p>Failed to fetch blog posts.</p>
        </main>
      </>
    );
  }

  const blogPosts = data as BlogPost[];

  const isNewPost = (created_at: string) => {
    const postDate = new Date(created_at);
    const currentDate = new Date();
    const differenceInDays =
      (currentDate.getTime() - postDate.getTime()) / (1000 * 3600 * 24);
    return differenceInDays <= 10;
  };

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
                {isNewPost(post.created_at) && (
                  <span className="inline-flex items-center rounded-full bg-[#ff6b6b] px-1.5 py-0.5 text-xs font-medium text-white uppercase ml-3 mt-0.5">
                    New
                  </span>
                )}
                <span className="ml-3 text-sm text-primary/50 font-normal">
                  {new Date(post.created_at).getFullYear()}
                </span>
              </h2>
            </div>
          ))
        )}
      </main>
    </>
  );
}
