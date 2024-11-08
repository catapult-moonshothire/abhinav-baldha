"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner"; // Import the Spinner component

interface BlogPost {
  id: string;
  title: string;
  content: string;
  content_preview: string;
  created_at: string;
}

const BlogListPage: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // New loading state

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    setLoading(true); // Set loading to true before fetching data
    try {
      const { data, error } = await supabase.from("blog_posts").select("*");
      if (error) {
        setError("Failed to fetch blog posts");
        console.error(error);
      } else {
        setBlogPosts(data);
      }
    } catch (err) {
      setError("An error occurred while fetching blog posts");
      console.error(err);
    } finally {
      setLoading(false); // Set loading to false once fetching is complete
    }
  };

  return (
    <main className="prose mx-auto flex-1 w-full max-w-4xl relative z-10">
      {error ? (
        <div>
          <h1 className="text-xl font-bold">Error</h1>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="my-8">
            {loading ? (
              <Spinner />
            ) : (
              blogPosts.map((post) => (
                <div key={post.id}>
                  <h2 className="flex -mt-1 items-center text-lg sm:text-xl">
                    <Link href={`/blog/${post.id}`} className="font-bold">
                      {post.title}
                    </Link>
                    {/* <span className="inline-flex items-center rounded-full bg-[#ff6b6b] px-1.5 py-0.5 text-xs font-medium text-white uppercase ml-3 mt-0.5">
                      New
                    </span> */}
                    <span className="ml-3 text-sm text-primary/50 font-normal">
                      {new Date(post.created_at).getFullYear()}
                    </span>
                  </h2>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </main>
  );
};

export default BlogListPage;
