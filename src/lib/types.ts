import { Content } from "@tiptap/react";

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  content_preview: string;
  created_at: string;
  updated_at?: string;
  author: string;
  views: number;
  slug: string;
  label: string;
}

export interface FullScreenEditorProps {
  currentPost: BlogPost | null;
  content: Content;
  setContent: (content: Content) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  register: any;
  errors: any;
  control: any;
  isSubmitting: boolean;
  isValid: boolean;
}

export // Update the BlogPostTable component to handle loading states
interface BlogPostTableProps {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (slug: string) => void;
  isSubmitting: boolean;
}
