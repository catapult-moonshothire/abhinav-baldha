import { Content } from "@tiptap/react";

export type TabType = "dashboard" | "posts" | "drafts" | "settings";

export interface BlogPost {
  id: string; // UUID for the post
  title: string; // Title of the blog post
  slug: string; // Slug used in the URL
  description?: string; // Short description (optional)
  content: string; // Full content of the post
  content_preview?: string; // Optional preview of the content
  author: string; // Author's name or ID
  category?: string; // Category of the blog post (optional)
  // tags: string[]; // Array of tags associated with the post
  meta_title?: string; // Optional SEO title for the post
  meta_description?: string; // Optional SEO description for the post
  views: number; // Number of views for the post
  is_draft: boolean; // Flag to indicate if the post is a draft
  created_at: string; // Timestamp for when the post was created
  updated_at?: string; // Timestamp for when the post was last updated (optional)
  label?: string; // Optional label for categorizing the post (could be like a "highlight" or "special" label)
  published_at?: string; // New field for tracking the publication date
  author_bio?: string; // New field for author's bio (optional)
  reading_time?: number; // New field for estimated reading time (in minutes)
  featured_image_url?: string; // New field for featured image URL
  status: "draft" | "published" | "archived"; // New field for post status, default 'draft'
}

export interface FullScreenEditorProps {
  currentPost: BlogPost | null;
  content: Content;
  setContent: (content: Content) => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
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
