"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit, Loader2, Menu, Plus, RefreshCw, Trash, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { BlogPost } from "@/lib/types";
import Sidebar from "./layout/sidebar";
// import BlogPostTable from "./blog-post-table";
import { useToast } from "@/hooks/use-toast";
import { Content } from "@tiptap/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import BlogPostTable from "./new-blog-post-table";
import FullScreenEditor from "./fullscreen-editor";
import { handleError } from "@/lib/helper";

async function triggerPurge() {
  try {
    const response = await fetch("/api/purge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to purge cache: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("Error purging cache:", error);
    return false;
  }
}

export default function BlogPostDisplay() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [content, setContent] = useState<Content>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    slug: string | null;
  }>({
    isOpen: false,
    slug: null,
  });
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<BlogPost>({
    mode: "onChange",
  });

  const title = watch("title");

  useEffect(() => {
    fetchPosts();

    // Set up real-time subscription
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
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      handleError(error, toast);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPost = async (data: BlogPost, isDraft: boolean = false) => {
    try {
      setIsSubmitting(true);

      // Check if slug is unique
      const { data: existingPost, error: checkError } = await supabase
        .from("blog_posts")
        .select("slug")
        .eq("slug", data.slug)
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;
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
            is_draft: isDraft,
          },
        ])
        .single();

      if (error) throw error;

      const purgeSuccess = await triggerPurge();

      toast({
        title: "Success",
        description:
          `Post ${isDraft ? "saved as draft" : "published"} successfully` +
          (!purgeSuccess ? " (cache purge failed)" : ""),
        variant: purgeSuccess ? "default" : "destructive",
      });

      setIsEditing(false);
      reset();
      setContent("");
      await fetchPosts();
    } catch (error) {
      handleError(error, toast);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPost = async (
    updatedData: BlogPost,
    isDraft: boolean = false
  ) => {
    if (!currentPost) return;

    try {
      setIsSubmitting(true);

      // Check if slug is unique (excluding the current post)
      if (updatedData.slug !== currentPost.slug) {
        const { data: existingPost, error: checkError } = await supabase
          .from("blog_posts")
          .select("slug")
          .eq("slug", updatedData.slug)
          .single();

        if (checkError && checkError.code !== "PGRST116") throw checkError;
        if (existingPost) {
          setError("slug", {
            type: "manual",
            message: "This slug is already in use",
          });
          return;
        }
      }

      const { error } = await supabase
        .from("blog_posts")
        .update({
          ...updatedData,
          content: content,
          content_preview: content?.toString().slice(0, 200),
          updated_at: new Date().toISOString(),
          is_draft: isDraft,
        })
        .eq("slug", currentPost.slug);

      if (error) throw error;

      const purgeSuccess = await triggerPurge();

      toast({
        title: "Success",
        description:
          `Post ${isDraft ? "saved as draft" : "updated"} successfully` +
          (!purgeSuccess ? " (cache purge failed)" : ""),
        variant: purgeSuccess ? "default" : "destructive",
      });

      setIsEditing(false);
      setCurrentPost(null);
      reset();
      setContent("");
      await fetchPosts();
    } catch (error) {
      handleError(error, toast);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = (data: BlogPost) => {
    if (currentPost) {
      handleEditPost(data, true);
    } else {
      handleAddPost(data, true);
    }
  };

  const handleDeletePost = async (slug: string) => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("slug", slug);

      if (error) throw error;

      const purgeSuccess = await triggerPurge();

      toast({
        title: "Success",
        description:
          "Post deleted successfully" +
          (!purgeSuccess ? " (cache purge failed)" : ""),
        variant: purgeSuccess ? "default" : "destructive",
      });

      await fetchPosts();
    } catch (error) {
      handleError(error, toast);
    } finally {
      setIsSubmitting(false);
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

  const handleCancel = () => {
    if (isSubmitting) return;
    setIsEditing(false);
    setCurrentPost(null);
    reset();
    setContent("");
  };

  const initiateDelete = (slug: string) => {
    setDeleteConfirmation({
      isOpen: true,
      slug: slug,
    });
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirmation.slug) return;

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("slug", deleteConfirmation.slug);

      if (error) throw error;

      const purgeSuccess = await triggerPurge();

      toast({
        title: "Success",
        description:
          "Post deleted successfully" +
          (!purgeSuccess ? " (cache purge failed)" : ""),
        variant: purgeSuccess ? "default" : "destructive",
      });

      await fetchPosts();
    } catch (error) {
      handleError(error, toast);
    } finally {
      setIsSubmitting(false);
      setDeleteConfirmation({ isOpen: false, slug: null });
    }
  };

  const handleDeleteCancelled = () => {
    setDeleteConfirmation({ isOpen: false, slug: null });
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
              disabled={isSubmitting}
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
              disabled={isLoading || isSubmitting}
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4",
                  (isLoading || isSubmitting) && "animate-spin"
                )}
              />
            </Button>
            <Button
              variant="default"
              onClick={openEditorForAdd}
              disabled={isSubmitting}
            >
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
              onSubmit={handleSubmit((data) =>
                currentPost ? handleEditPost(data) : handleAddPost(data)
              )}
              onSaveDraft={handleSubmit(handleSaveDraft)}
              onCancel={handleCancel}
              register={register}
              errors={errors}
              control={control}
              isSubmitting={isSubmitting}
              isValid={isValid}
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
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <BlogPostTable
                      posts={posts}
                      onEdit={openEditorForEdit}
                      onDelete={initiateDelete}
                      isSubmitting={isSubmitting}
                    />
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
      <AlertDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleDeleteCancelled();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              blog post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirmed}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
