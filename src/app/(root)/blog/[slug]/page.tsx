import MainContainer from "@/components/layout/main-container";
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  content_preview: string;
  created_at: string;
  slug: string;
  tags: string; // Add the tags field to the BlogPost interface
}

export const revalidate = 3600 * 2; // Revalidate every 2 hours

export async function generateStaticParams() {
  const { data, error } = await supabase.from("blog_posts").select("slug");

  if (error) {
    console.error("Error fetching blog post slugs:", error);
    return [];
  }

  return data?.map((post) => ({ slug: post.slug })) || [];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { data: blogPost } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!blogPost) {
    return {
      title: "Blog Post Not Found",
    };
  }

  return {
    title: `${blogPost?.meta_title}`,
    description: blogPost?.meta_description,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (error) {
    console.error("Error fetching blog post:", error);
    return (
      <MainContainer>
        <main className="prose mx-auto flex-1 w-full max-w-4xl relative z-10">
          <h1 className="text-xl font-bold">Error</h1>
          <p>Failed to fetch the blog post.</p>
        </main>
      </MainContainer>
    );
  }

  const blogPost = data as BlogPost;

  // // Split the tags string into an array
  // const tags = blogPost.tags
  //   ? blogPost.tags.split(",").map((tag) => tag.trim())
  //   : [];

  return (
    <MainContainer>
      <main className="prose mx-auto flex-1 w-full max-w-3xl fobol py-4 sm:p-8 relative z-10">
        <header className="my-8">
          {new Date(blogPost?.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}{" "}
          by <Link href="/">Abhinav Baldha</Link>
        </header>
        <h1 className="text-4xl font-extrabold">{blogPost.title}</h1>
        <div
          className="mt-4"
          dangerouslySetInnerHTML={{ __html: blogPost.content }}
        />

        {/* Display tags at the end */}
        {/* {tags.length > 0 && (
          <footer className="mt-8">
            <h2 className="text-2xl font-semibold">Tags:</h2>
            <ul className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <li key={index}>
                  <Link
                    href={`/tags/${tag}`}
                    className=""
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          </footer>
        )} */}
      </main>
    </MainContainer>
  );
}
