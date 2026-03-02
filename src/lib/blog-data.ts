import { getAllBlogPosts, getBlogPostBySlugFromFs } from "@/lib/blog-fs";

export const getBlogPosts = async () => getAllBlogPosts();

export const getBlogPostBySlug = async (slug: string) =>
  getBlogPostBySlugFromFs(slug);
