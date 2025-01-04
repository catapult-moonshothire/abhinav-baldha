// components/blog/BlogPostSearch.tsx

import { Search } from "lucide-react";
import { Input } from "./ui/input";

interface BlogPostSearchProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

export default function BlogPostSearch({
  searchTerm,
  setSearchTerm,
}: BlogPostSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
      <Input
        placeholder="Search posts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-8 w-64"
      />
    </div>
  );
}
