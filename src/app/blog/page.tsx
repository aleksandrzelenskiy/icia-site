import { notFound } from "next/navigation";

import BlogList from "@/components/blog/BlogList";
import BlogSiteHeader from "@/components/layout/BlogSiteHeader";
import { getBlogPosts } from "@/lib/blog-data";
import { isPublicBlogEnabled } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Блог ICIA",
  description: "Новости, стандарты и опыт экспертов ICIA."
};

export default async function BlogPage() {
  if (!isPublicBlogEnabled()) {
    notFound();
  }

  const posts = await getBlogPosts();
  return (
    <>
      <BlogSiteHeader />
      <BlogList posts={posts} />
    </>
  );
}
