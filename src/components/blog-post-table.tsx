import { Edit, Trash } from "lucide-react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { formatDate } from "@/lib/helper";
import { BlogPost } from "@/lib/types";
import BlogPostDetailsDialog from "./blog-post-details-dialog";

const BlogPostTable = ({
  posts,
  onEdit,
  onDelete,
}: {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (slug: string) => void;
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Title</TableHead>
        <TableHead>Slug</TableHead>
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
          <TableCell>{post.slug}</TableCell>
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
              onClick={() => onDelete(post.slug)}
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

export default BlogPostTable;
