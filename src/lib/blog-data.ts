import { blogPosts as fallbackPosts } from "@/lib/blog";
import { fetchStrapiPostBySlug, fetchStrapiPosts } from "@/lib/strapi";

export const getBlogPosts = async () => {
  const posts = await fetchStrapiPosts();
  return posts && posts.length ? posts : fallbackPosts;
};

export const getBlogPostBySlug = async (slug: string) => {
  const post = await fetchStrapiPostBySlug(slug);
  if (post) return post;
  return fallbackPosts.find((item) => item.slug === slug) ?? null;
};
