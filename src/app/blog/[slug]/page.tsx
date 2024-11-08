"use client";

import MainContainer from "@/components/layout/main-container";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  content_preview: string;
  created_at: string;
  slug: string;
}

const BlogPostPage: React.FC = () => {
  const params = useParams();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!params.slug) {
        setError("No blog post slug provided");
        return;
      }

      const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
      console.log("Blog post slug:", slug);

      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .single();

        if (error) {
          setError("Failed to fetch blog post");
          console.error(error);
        } else if (data) {
          setBlogPost(data);
        } else {
          setError("Blog post not found");
        }
      } catch (err) {
        setError("An error occurred while fetching the blog post");
        console.error(err);
      }
    };

    fetchBlogPost();
  }, [params.slug]);

  if (error) {
    return (
      <MainContainer>
        <main className="prose mx-auto flex-1 w-full max-w-4xl relative z-10">
          <h1 className="text-xl font-bold">Error</h1>
          <p>{error}</p>
        </main>
      </MainContainer>
    );
  }

  if (!blogPost) {
    return (
      <MainContainer>
        <Spinner />
      </MainContainer>
    );
  }

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
};

export default BlogPostPage;