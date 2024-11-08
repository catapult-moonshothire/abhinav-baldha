"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit, Menu, Plus, Trash, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/helper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useForm } from "react-hook-form";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { Content } from "@tiptap/react";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  content_preview: string;
  created_at: string;
  author: string;
  views: number;
}

const Sidebar = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => (
  <div
    className={cn(
      "fixed inset-y-0 left-0 z-50 w-48 transform bg-background transition-transform duration-200 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full",
      "md:relative md:translate-x-0"
    )}
  >
    <div className="flex h-full flex-col p-4 pl-0">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <nav className="space-y-2">
        <Button variant="default" className="w-full justify-start">
          <Edit className="mr-2 h-4 w-4" />
          Posts
        </Button>
      </nav>
    </div>
  </div>
);

const BlogPostTable = ({
  posts,
  onEdit,
  onDelete,
}: {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (postId: string) => void;
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Title</TableHead>
        <TableHead>Author</TableHead>
        <TableHead>Views</TableHead>
        <TableHead>Created At</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {posts?.map((post) => (
        <TableRow key={post.id}>
          <TableCell>
            <BlogPostDetailsDialog post={post} />
          </TableCell>
          <TableCell>{post.author}</TableCell>
          <TableCell>{post.views}</TableCell>
          <TableCell>{formatDate(post.created_at)}</TableCell>
          <TableCell>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(post)}
              className="mr-2"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(post.id)}
              className="text-red-600"
            >
              <Trash className="h-5 w-5" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const BlogPostDetailsDialog = ({ post }: { post: BlogPost }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="link" className="p-0">
        {post.title}
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-3xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{post.title}</DialogTitle>
      </DialogHeader>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{post.title}</CardTitle>
          <CardDescription>{post.author}</CardDescription>
          <p>{formatDate(post.created_at)}</p>
        </CardHeader>
        <CardContent>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
          <div className="mt-4 flex gap-2"></div>
        </CardContent>
      </Card>
    </DialogContent>
  </Dialog>
);

export default function BlogPostDisplay() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [content, setContent] = useState<Content>("");
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, reset, setValue } = useForm<BlogPost>();

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
    const { data: newPost, error } = await supabase
      .from("blog_posts")
      .insert([
        {
          ...data,
          content: content,
          content_preview: content.toString().slice(0, 200),
          views: 0,
        },
      ])
      .single();

    if (newPost) {
      toast.success("Post added successfully");
    }
    if (error) {
      console.error(error);
      toast.error("Failed to add post");
    }
    setIsModalOpen(false);
    reset();
    setContent("");
    fetchPosts();
  };

  const handleEditPost = async (updatedData: BlogPost) => {
    if (!currentPost) return;
    const { data: updatedPost, error } = await supabase
      .from("blog_posts")
      .update({
        ...updatedData,
        content: content,
        content_preview: content.toString().slice(0, 200),
      })
      .eq("id", currentPost.id)
      .single();

    if (updatedPost) {
      toast.success("Post updated successfully");
    }
    if (error) {
      console.error(error);
      toast.error("Failed to update post");
    }
    setIsModalOpen(false);
    setCurrentPost(null);
    reset();
    setContent("");
  };

  const handleDeletePost = async (postId: string) => {
    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", postId);
    if (!error) {
      toast.success("Post deleted successfully");
    } else {
      console.error(error);
      toast.error("Failed to delete post");
    }
  };

  const openModalForEdit = (post: BlogPost) => {
    setCurrentPost(post);
    reset(post);
    setContent(post.content);
    setIsModalOpen(true);
  };

  const openModalForAdd = () => {
    setCurrentPost(null);
    reset();
    setContent("");
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-[calc(100vh-248px)] bg-background">
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
            <Button variant="default" onClick={openModalForAdd}>
              <Plus className="mr-2 h-5 w-5" /> New Post
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
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
                    onEdit={openModalForEdit}
                    onDelete={handleDeletePost}
                  />
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Add/Edit Post Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{currentPost ? "Edit Post" : "New Post"}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(100vh-200px)]">
            <form
              onSubmit={handleSubmit(
                currentPost ? handleEditPost : handleAddPost
              )}
              className="space-y-4"
            >
              <Input
                placeholder="Title"
                {...register("title", { required: true })}
              />
              <Input
                placeholder="Author"
                {...register("author", { required: true })}
              />
              <MinimalTiptapEditor
                value={content}
                onChange={setContent}
                className="min-h-[300px] border rounded-md"
                editorContentClassName="p-5"
                output="html"
                placeholder="Type your content here..."
                autofocus={true}
                editable={true}
                editorClassName="focus:outline-none prose max-w-full"
              />
              <Button type="submit" className="w-full">
                {currentPost ? "Update Post" : "Add Post"}
              </Button>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
