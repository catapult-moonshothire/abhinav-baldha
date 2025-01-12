import MainContainer from "@/components/layout/main-container";
import db from "@/lib/db";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  content_preview: string;
  created_at: string;
  slug: string;
  is_draft: number;
  meta_title: string;
  meta_description: string;
}

export const revalidate = 3600 * 2; // Revalidate every 2 hours

export async function generateStaticParams() {
  const posts = await db.query(
    "SELECT slug FROM blog_posts WHERE is_draft = 0"
  );
  return posts.map((post: { slug: string }) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const [blogPost] = await db.query("SELECT * FROM blog_posts WHERE slug = ?", [
    params.slug,
  ]);

  if (!blogPost || blogPost.is_draft === 1) {
    return {
      title: "Blog Post Not Found",
    };
  }

  return {
    title: blogPost?.meta_title || blogPost.title,
    description: blogPost?.meta_description,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const [blogPost] = await db.query("SELECT * FROM blog_posts WHERE slug = ?", [
    params.slug,
  ]);

  if (!blogPost || blogPost.is_draft === 1) {
    notFound();
  }

  // Function to replace img tags with Next.js Image components
  const replaceImagesWithNextImage = (content: string) => {
    const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/g;
    return content.replace(imgRegex, (match, src) => {
      return `<Image src="${src}" alt="Blog post image" width={800} height={600} layout="responsive" />`;
    });
  };

  const processedContent = replaceImagesWithNextImage(blogPost.content);

  return (
    <MainContainer>
      <main className="prose mx-auto flex-1 w-full max-w-3xl fobol py-4 sm:p-8 relative z-10">
        <header className="my-8">
          {new Date(blogPost.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}{" "}
          by <Link href="/">Abhinav Baldha</Link>
        </header>
        <h1 className="text-4xl font-extrabold">{blogPost.title}</h1>
        <div
          className="mt-4"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </main>
    </MainContainer>
  );
}

export const dynamic = "force-dynamic";
