import MainContainer from "@/components/layout/main-container";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/router";
import { Spinner } from "@/components/ui/spinner";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  content_preview: string;
  created_at: string;
}

const BlogPostPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof id === "string") {
      fetchBlogPost(id);
    }
  }, [id]);

  const fetchBlogPost = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", postId)
        .single();
      if (error) {
        setError("Failed to fetch blog post");
        console.error(error);
      } else {
        setBlogPost(data);
      }
    } catch (err) {
      setError("An error occurred while fetching the blog post");
      console.error(err);
    }
  };

  return (
    <MainContainer>
      <main className="prose mx-auto flex-1 w-full max-w-4xl relative z-10">
        {error ? (
          <div>
            <h1 className="text-xl font-bold">Error</h1>
            <p>{error}</p>
          </div>
        ) : blogPost ? (
          <>
            <h1 className="text-2xl font-bold">{blogPost.title}</h1>
            <div className="mt-4">{blogPost.content}</div>
          </>
        ) : (
          <Spinner />
        )}
      </main>
    </MainContainer>
  );
};

export default BlogPostPage;
