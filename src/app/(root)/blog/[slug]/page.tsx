import MainContainer from "@/components/layout/main-container";
import prisma from "@/lib/db";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  content_preview: string;
  created_at: Date;
  slug: string;
  // tags: string;
  is_draft: boolean;
  meta_title: string;
  meta_description: string;
}

export const revalidate = 3600 * 2; // Revalidate every 2 hours

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { is_draft: false },
    select: { slug: true },
  });

  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const blogPost = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });

  if (!blogPost || blogPost.is_draft) {
    return {
      title: "Blog Post Not Found",
    };
  }

  return {
    title: `${blogPost.meta_title}`,
    description: blogPost.meta_description,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const blogPost = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });

  if (!blogPost || blogPost.is_draft) {
    notFound();
  }

  return (
    <MainContainer>
      <main className="prose mx-auto flex-1 w-full max-w-3xl fobol py-4 sm:p-8 relative z-10">
        <header className="my-8">
          {blogPost.created_at.toLocaleDateString("en-US", {
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
      </main>
    </MainContainer>
  );
}

export const dynamic = "force-dynamic";
