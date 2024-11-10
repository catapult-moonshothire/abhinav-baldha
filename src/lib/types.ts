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
