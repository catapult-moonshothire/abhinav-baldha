"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit, Menu, Plus, Trash, RefreshCw, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/helper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useForm, Controller } from "react-hook-form";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { Content } from "@tiptap/react";
import { toast } from "sonner";
import { BlogPost } from "@/lib/types";
import Sidebar from "./layout/sidebar";
import BlogPostTable from "./blog-post-table";

async function triggerPurge() {
  try {
    const response = await fetch("/api/purge", { method: "POST" });
    if (!response.ok) {
      throw new Error("Failed to purge cache");
    }
    console.log("Cache purged successfully");
  } catch (error) {
    console.error("Error purging cache:", error);
  }
}

export default function BlogPostDisplay() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [content, setContent] = useState<Content>("");
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BlogPost>();

  const title = watch("title");

  useEffect(() => {
    fetchPosts();
    const subscription = supabase
      .channel("blog_posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blog_posts" },
        (payload) => {
          console.log("Change received!", payload);
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", generatedSlug);
    }
  }, [title, setValue]);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPosts(data);
    if (error) console.error(error);
    setIsLoading(false);
  };

  const handleAddPost = async (data: BlogPost) => {
    // Check if slug is unique
    const { data: existingPost } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("slug", data.slug)
      .single();

    if (existingPost) {
      setError("slug", {
        type: "manual",
        message: "This slug is already in use",
      });
      return;
    }

    const { data: newPost, error } = await supabase
      .from("blog_posts")
      .insert([
        {
          ...data,
          content: content,
          content_preview: content?.toString().slice(0, 200),
          views: 0,
          updated_at: new Date().toISOString(),
        },
      ])
      .single();

    if (newPost) {
      toast.success("Post added successfully");
      await triggerPurge();
    }
    if (error) {
      console.error(error);
      toast.error("Failed to add post");
    }
    setIsEditing(false);
    reset();
    setContent("");
    fetchPosts();
  };

  const handleEditPost = async (updatedData: BlogPost) => {
    if (!currentPost) return;

    // Check if slug is unique (excluding the current post)
    if (updatedData.slug !== currentPost.slug) {
      const { data: existingPost } = await supabase
        .from("blog_posts")
        .select("slug")
        .eq("slug", updatedData.slug)
        .single();

      if (existingPost) {
        setError("slug", {
          type: "manual",
          message: "This slug is already in use",
        });
        return;
      }
    }

    const { data: updatedPost, error } = await supabase
      .from("blog_posts")
      .update({
        ...updatedData,
        content: content,
        content_preview: content?.toString().slice(0, 200),
        updated_at: new Date().toISOString(),
      })
      .eq("slug", currentPost.slug)
      .single();

    if (updatedPost) {
      toast.success("Post updated successfully");
      await triggerPurge();
    }
    if (error) {
      console.error(error);
      toast.error("Failed to update post");
    }
    setIsEditing(false);
    setCurrentPost(null);
    reset();
    setContent("");
  };

  const handleDeletePost = async (slug: string) => {
    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("slug", slug);
    if (!error) {
      toast.success("Post deleted successfully");
      await triggerPurge();
    } else {
      console.error(error);
      toast.error("Failed to delete post");
    }
  };

  const openEditorForEdit = (post: BlogPost) => {
    setCurrentPost(post);
    reset(post);
    setContent(post.content);
    setIsEditing(true);
  };

  const openEditorForAdd = () => {
    setCurrentPost(null);
    reset();
    setContent("");
    setIsEditing(true);
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] bg-background">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex w-full flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="ml-4 text-lg font-semibold">Blog Posts Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchPosts}
              className="flex items-center justify-center"
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
            </Button>
            <Button variant="default" onClick={openEditorForAdd}>
              <Plus className="mr-2 h-5 w-5" /> New Post
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
          {isEditing ? (
            <FullScreenEditor
              currentPost={currentPost}
              content={content}
              setContent={setContent}
              onSubmit={handleSubmit(
                currentPost ? handleEditPost : handleAddPost
              )}
              onCancel={() => setIsEditing(false)}
              register={register}
              errors={errors}
              control={control}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Blog Posts</CardTitle>
                <CardDescription>Manage your blog posts here.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-340px)]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <RefreshCw className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <BlogPostTable
                      posts={posts}
                      onEdit={openEditorForEdit}
                      onDelete={handleDeletePost}
                    />
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

interface FullScreenEditorProps {
  currentPost: BlogPost | null;
  content: Content;
  setContent: (content: Content) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  register: any;
  errors: any;
  control: any;
}

function FullScreenEditor({
  currentPost,
  content,
  setContent,
  onSubmit,
  onCancel,
  register,
  errors,
  control,
}: FullScreenEditorProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b p-4">
          <h2 className="text-2xl font-bold">
            {currentPost ? "Edit Post" : "New Post"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-6 w-6" />
          </Button>
        </header>
        <form
          onSubmit={onSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-auto p-4">
            <div className="mb-4 flex space-x-4">
              <div className="flex-1">
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <Input
                      placeholder="Title"
                      className="text-2xl"
                      {...field}
                    />
                  )}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.title.message}
                  </p>
                )}
              </div>
            </div>
            <div className="mb-4 sm:flex sm:space-x-4">
              <div className="sm:w-32 mb-4">
                <Input placeholder="Label (e.g., New)" {...register("label")} />
              </div>
              <div className="mb-4">
                <Input
                  placeholder="Author"
                  {...register("author", { required: "Author is required" })}
                />
                {errors.author && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.author.message}
                  </p>
                )}
              </div>
              <div className="mb-4 flex-1">
                <Controller
                  name="slug"
                  control={control}
                  rules={{
                    required: "Slug is required",
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        "Slug must be lowercase, numbers, and hyphens only",
                    },
                  }}
                  render={({ field }) => (
                    <Input placeholder="Slug" {...field} />
                  )}
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.slug.message}
                  </p>
                )}
              </div>
            </div>
            <MinimalTiptapEditor
              value={content}
              onChange={setContent}
              className="min-h-[500px] border rounded-md"
              editorContentClassName="p-5"
              output="html"
              placeholder="Type your content here..."
              autofocus={true}
              editable={true}
              editorClassName="focus:outline-none prose max-w-full"
            />
          </div>
          <div className="border-t p-4">
            <Button type="submit" className="w-full">
              {currentPost ? "Update Post" : "Add Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
