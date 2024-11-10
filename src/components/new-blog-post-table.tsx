import { useToast } from "@/hooks/use-toast";
import { BlogPostTableProps } from "@/lib/types";
import { useState } from "react";
import BlogPostDetailsDialog from "./blog-post-details-dialog";
import { Button } from "./ui/button";
import { Edit, RefreshCw, Trash } from "lucide-react";

function BlogPostTable({
  posts,
  onEdit,
  onDelete,
  isSubmitting,
}: BlogPostTableProps) {
  const [deletingPost, setDeletingPost] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (slug: string) => {
    try {
      setDeletingPost(slug);
      onDelete(slug);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete post",
      });
    } finally {
      setDeletingPost(null);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <p>No posts found</p>
        <p className="text-sm">Create a new post to get started</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase bg-muted">
          <tr>
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Author</th>
            <th className="px-4 py-2 text-left">Label</th>
            <th className="px-4 py-2 text-left">Slug</th>
            <th className="px-4 py-2 text-left">Views</th>
            <th className="px-4 py-2 text-left">Last Updated</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.slug} className="border-b">
              <td className="px-4 py-2">
                <BlogPostDetailsDialog post={post} />
              </td>
              <td className="px-4 py-2">{post.author}</td>
              <td className="px-4 py-2">
                {post.label && (
                  <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                    {post.label}
                  </span>
                )}
              </td>
              <td className="px-4 py-2">{post.slug}</td>
              <td className="px-4 py-2">{post.views}</td>
              {post?.updated_at ? (
                <td className="px-4 py-2">
                  {new Date(post?.updated_at).toLocaleDateString()}
                </td>
              ) : (
                <span className="px-4 py-2">No Data</span>
              )}
              <td className="px-4 py-2 text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(post)}
                    disabled={isSubmitting}
                    title="Edit post"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(post.slug)}
                    disabled={isSubmitting || deletingPost === post.slug}
                    title="Delete post"
                  >
                    {deletingPost === post.slug ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BlogPostTable;
