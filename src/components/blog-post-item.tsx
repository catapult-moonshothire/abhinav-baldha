import { BlogPost } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { LinkIcon, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface BlogPostItemProps {
  post: BlogPost;
  isDraft: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
}

export default function BlogPostItem({
  post,
  isDraft,
  onEdit,
  onDelete,
  onPublish,
}: BlogPostItemProps) {
  return (
    <div
      key={post.id}
      className="flex items-center justify-between border-b pb-4 md:pr-6 last:border-0 last:pb-0"
    >
      <div>
        <div className="flex items-center gap-2">
          <Button
            variant="link"
            onClick={onEdit}
            className="p-0 max-sm:max-w-40 text-left text-wrap"
          >
            {post.title}
          </Button>
          {!isDraft && (
            <Link target="_blank" href={`/blog/${post.slug}`}>
              <LinkIcon size={14} />
            </Link>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {isDraft ? "Last updated" : "Published"}{" "}
          {formatDistanceToNow(
            new Date(
              isDraft ? post.updated_at || post.created_at : post.created_at
            ),
            { addSuffix: true }
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
          <Button variant="outline" size="sm" onClick={onPublish}>
            Publish
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
