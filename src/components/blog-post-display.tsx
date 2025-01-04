"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { navigation } from "@/lib/constants";
import { handleError } from "@/lib/helper";
import { BlogPost, TabType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Content } from "@tiptap/react";
import { Loader2, Menu, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import triggerPurge from "../lib/trigger-purge";
import BlogPostItem from "./blog-post-item";
import BlogPostSearch from "./blog-post-search";
import BlogPostStats from "./blog-post-stats";
import DeleteConfirmationDialog from "./delete-confirmation";
import FullScreenEditor from "./fullscreen-editor";
import { ImportExportData } from "./import-export";
import { useAuth } from "./providers/auth-context";

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
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [stats, setStats] = useState({
    published: 0,
    drafts: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    fetchStats();
  }, [posts]);

  const fetchStats = () => {
    const publishedCount = posts.filter((post) => !post.is_draft).length;
    const draftsCount = posts.filter((post) => post.is_draft).length;
    setStats({ published: publishedCount, drafts: draftsCount });
  };

  const {
    register,
    handleSubmit,
    reset,
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
      const response = await fetch("/api/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      handleError(error, toast);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPost = async (data: BlogPost, isDraft: boolean = false) => {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          content: content,
          content_preview: content?.toString().slice(0, 200),
          is_draft: isDraft,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const newPost = await response.json();

      const purgeSuccess = await triggerPurge(
        `/blog/${data.slug}`,
        "blog-posts"
      );

      await triggerPurge("/", "blog-posts");

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

      const response = await fetch(`/api/posts/${currentPost.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...updatedData,
          content: content,
          content_preview: content?.toString().slice(0, 200),
          is_draft: isDraft,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      const purgeSuccess = await triggerPurge(
        `/blog/${updatedData.slug}`,
        "blog-posts"
      );

      await triggerPurge("/", "blog-posts");

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

  const handlePublishDraft = async (post: BlogPost) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/posts/${post.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...post,
          is_draft: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to publish draft");
      }

      const purgeSuccess = await triggerPurge(
        `/blog/${post.slug}`,
        "blog-posts"
      );

      await triggerPurge("/", "blog-posts");
      toast({
        title: "Success",
        description: `Post published successfully${
          !purgeSuccess ? " (cache purge failed)" : ""
        }`,
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

      const response = await fetch(`/api/posts/${deleteConfirmation.slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      const purgeSuccess = await triggerPurge(
        `/blog/${deleteConfirmation.slug}`,
        "blog-posts"
      );

      await triggerPurge("/", "blog-posts");
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

  const filteredPosts = useMemo(() => {
    return posts.filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [posts, searchTerm]);

  const renderPostItem = (post: BlogPost, isDraft: boolean = false) => (
    <BlogPostItem
      post={post}
      isDraft={isDraft}
      onEdit={() => openEditorForEdit(post)}
      onDelete={() => initiateDelete(post.slug)}
      onPublish={() => handlePublishDraft(post)}
    />
  );

  const renderDashboard = () => (
    <div className="space-y-8">
      <BlogPostStats published={stats.published} drafts={stats.drafts} />
      <Card className="h-full shadow-none border-none">
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPosts
              .slice(0, 5)
              .map((post) => renderPostItem(post, post.is_draft))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "posts":
      case "drafts":
        return (
          <Card className="h-full shadow-none border-none space-y-3">
            <CardHeader>
              <CardTitle className="mb-2">
                {activeTab === "posts" ? "Published Posts" : "Draft Posts"}
              </CardTitle>
              <BlogPostSearch
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-340px)]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPosts
                      .filter((post) =>
                        activeTab === "posts" ? !post.is_draft : post.is_draft
                      )
                      .map((post) =>
                        renderPostItem(post, activeTab === "drafts")
                      )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        );
      case "settings":
        return (
          <Card className="h-full shadow-none border-none">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <ImportExportData />
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] bg-background">
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 pt-8 h-[100vh] w-64 transform bg-background transition-transform duration-200 ease-in-out border-r",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col p-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl pl-3 font-bold">Blog Manager</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <nav className="space-y-2">
            {navigation.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  return setActiveTab(item.id), setIsSidebarOpen(false);
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </nav>
          <div className="border-t mt-auto mb-6 pt-4 space-y-2">
            <Link href="/">
              <Button className="w-full" variant="secondary">
                View Site
              </Button>
            </Link>
            {isAuthenticated && (
              <Button onClick={logout} className="w-full">
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-full pt-8 flex-1 flex-col">
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
            <h1 className="ml-4 text-lg font-semibold">
              {navigation.find((item) => item.id === activeTab)?.name}
            </h1>
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
        <main className="flex-1 overflow-auto py-4 sm:p-8">
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
            renderContent()
          )}
        </main>
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleDeleteCancelled();
        }}
        isSubmitting={isSubmitting}
        onDeleteConfirmed={handleDeleteConfirmed}
        onDeleteCancelled={handleDeleteCancelled}
      />
    </div>
  );
}
