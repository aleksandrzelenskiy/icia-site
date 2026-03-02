import BlogList from "@/components/blog/BlogList";
import BlogSiteHeader from "@/components/layout/BlogSiteHeader";
import { getBlogPosts } from "@/lib/blog-data";

export const metadata = {
  title: "Блог ICIA",
  description: "Новости, стандарты и опыт экспертов ICIA."
};

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return (
    <>
      <BlogSiteHeader />
      <BlogList posts={posts} />
    </>
  );
}
