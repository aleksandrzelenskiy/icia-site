import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import MarkdownContent from "@/components/blog/MarkdownContent";
import { formatDate } from "@/lib/blog";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {};
  }

  const title = post.seo?.title ?? `${post.title} — ICIA`;
  const description = post.seo?.description ?? post.excerpt;
  const image = post.seo?.image;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined
    }
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-28">
      <div className="space-y-6">
        <Link href="/blog" className="text-sm font-semibold text-primary">
          ← Вернуться в блог
        </Link>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-mutedForeground">
            <span className="rounded-full border border-black/10 px-3 py-1 text-[11px] font-semibold text-foreground dark:border-white/10">
              {post.category}
            </span>
            <span>{formatDate(post.date)}</span>
            <span>{post.readTime}</span>
          </div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{post.title}</h1>
          <p className="text-mutedForeground">{post.excerpt}</p>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-black/10 px-3 py-1 text-[11px] font-semibold text-mutedForeground dark:border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-10 h-[280px] overflow-hidden rounded-2xl sm:h-[360px]">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>

      <div className="mt-10">
        <MarkdownContent content={post.content} />
      </div>
    </div>
  );
}
