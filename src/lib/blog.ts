export const BLOG_CATEGORIES = ["Новости", "Сообщество", "Образование"] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type BlogPostSeo = {
  title?: string;
  description?: string;
  image?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: BlogCategory;
  tags: string[];
  coverImage: string;
  content: string;
  seo?: BlogPostSeo;
};

export type BlogPostSummary = Pick<
  BlogPost,
  "slug" | "title" | "date" | "category"
>;

export const DEFAULT_BLOG_COVER_IMAGE = "/mission-bg.jpg";

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(value));

export const markdownToPlainText = (markdown: string) =>
  markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+]\([^)]+\)/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
