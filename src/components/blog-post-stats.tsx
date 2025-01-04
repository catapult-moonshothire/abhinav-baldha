import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface BlogPostStatsProps {
  published: number;
  drafts: number;
}

export default function BlogPostStats({
  published,
  drafts,
}: BlogPostStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{published}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Draft Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{drafts}</div>
        </CardContent>
      </Card>
    </div>
  );
}
