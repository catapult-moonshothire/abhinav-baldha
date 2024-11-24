"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  FileEdit,
  Settings,
  Menu,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Loader2,
  Check,
  Search,
  LinkIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { BlogPost } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Content } from "@tiptap/react";
import { formatDistanceToNow } from "date-fns";
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
import FullScreenEditor from "./fullscreen-editor";
import { handleError } from "@/lib/helper";
import { useAuth } from "./providers/auth-context";
import Link from "next/link";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

type TabType = "dashboard" | "posts" | "drafts" | "settings";

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
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [stats, setStats] = useState({
    published: 0,
    drafts: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated, logout } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      id: "dashboard" as TabType,
    },
    {
      name: "Posts",
      icon: FileText,
      id: "posts" as TabType,
    },
    {
      name: "Drafts",
      icon: FileEdit,
      id: "drafts" as TabType,
    },
    {
      name: "Settings",
      icon: Settings,
      id: "settings" as TabType,
    },
  ];

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

  const handlePublishDraft = async (post: BlogPost) => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("blog_posts")
        .update({ is_draft: false, updated_at: new Date().toISOString() })
        .eq("id", post.id);

      if (error) throw error;

      const purgeSuccess = await triggerPurge();

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

  const filteredPosts = useMemo(() => {
    return posts.filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [posts, searchTerm]);

  const renderPostItem = (post: BlogPost, isDraft: boolean = false) => (
    <div
      key={post.id}
      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
    >
      <div>
        {/* <BlogPostDetailsDialog post={post} /> */}
        <div className="flex items-center gap-2">
          <Button
            variant="link"
            onClick={() => openEditorForEdit(post)}
            className="p-0 max-sm:max-w-40 text-left text-wrap"
          >
            {post.title}
          </Button>
          <Link target="_blank" href={`/blog/${post.slug}`}>
            <LinkIcon size={14} />
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          {isDraft ? "Last updated" : "Published"}{" "}
          {formatDistanceToNow(
            new Date(
              isDraft ? post.updated_at || post.created_at : post.created_at
            ),
            {
              addSuffix: true,
            }
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {!isDraft && (
          <Badge className="!py-1 h-8 !px-3" variant={"success"}>
            Published
          </Badge>
        )}
        {isDraft && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePublishDraft(post)}
            disabled={isSubmitting}
          >
            {/* {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )} */}
            Publish
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => openEditorForEdit(post)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => initiateDelete(post.slug)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Published Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Draft Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
          </CardContent>
        </Card>
      </div>

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
          <Card className="h-full shadow-none border-none">
            <CardHeader>
              <CardTitle>
                {activeTab === "posts" ? "Published Posts" : "Draft Posts"}
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
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
              <p className="text-muted-foreground">
                Settings page coming soon...
              </p>
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
