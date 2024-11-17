import { BlogPost } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { formatDate } from "@/lib/helper";

const BlogPostDetailsDialog = ({ post }: { post: BlogPost }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button
        variant="link"
        className="p-0 max-sm:max-w-40 text-left text-wrap"
      >
        {post.title}
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-3xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{post.title}</DialogTitle>
      </DialogHeader>
      <ScrollArea className="max-h-96">
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
      </ScrollArea>
    </DialogContent>
  </Dialog>
);

export default BlogPostDetailsDialog;
