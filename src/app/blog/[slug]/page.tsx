import MainContainer from "@/components/layout/main-container";
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  content_preview: string;
  created_at: string;
  slug: string;
}

export const revalidate = 3600 * 2; // Revalidate every hour

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
    title: `${blogPost?.title} - My Blog`,
    description: blogPost?.content_preview,
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

  return (
    <MainContainer>
      <main className="prose mx-auto flex-1 w-full max-w-4xl relative z-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">
          {blogPost.title}
        </h1>
        <div
          className="mt-4"
          dangerouslySetInnerHTML={{ __html: blogPost.content }}
        />
      </main>
    </MainContainer>
  );
}
