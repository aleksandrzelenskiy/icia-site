"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { BlogPost, formatDate } from "@/lib/blog";

type BlogListProps = {
  posts: BlogPost[];
};

const getContentText = (post: BlogPost) =>
  post.content
    .map((block) => {
      if (block.type === "ul") return block.items.join(" ");
      return block.text;
    })
    .join(" ");

export default function BlogList({ posts }: BlogListProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Все");
  const [activeTag, setActiveTag] = useState("Все");

  const categories = useMemo(() => {
    const set = new Set(posts.map((post) => post.category).filter(Boolean));
    return ["Все", ...Array.from(set)];
  }, [posts]);

  const tags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((post) => {
      post.tags.forEach((tag) => set.add(tag));
    });
    return ["Все", ...Array.from(set)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return posts.filter((post) => {
      if (activeCategory !== "Все" && post.category !== activeCategory) {
        return false;
      }
      if (activeTag !== "Все" && !post.tags.includes(activeTag)) {
        return false;
      }
      if (!query) return true;

      const haystack = `${post.title} ${post.excerpt} ${getContentText(post)}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [posts, search, activeCategory, activeTag]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-32">
      <div className="flex flex-col gap-6">
        <p className="text-sm uppercase tracking-[0.2em] text-mutedForeground">
          Блог ICIA
        </p>
        <h1 className="text-4xl font-semibold sm:text-5xl">
          Практика, стандарты и новости отрасли
        </h1>
        <p className="max-w-2xl text-mutedForeground">
          Публикуем рекомендации, разборы кейсов, изменения в стандартах и обновления
          платформы для подрядчиков и специалистов.
        </p>
      </div>

      <div className="mt-10 grid gap-6 rounded-2xl border border-black/5 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по статьям"
          />
          <div className="text-sm text-mutedForeground">
            Найдено: <span className="font-semibold text-foreground">{filteredPosts.length}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={
                category === activeCategory
                  ? "rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primaryForeground"
                  : "rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-mutedForeground transition hover:text-foreground dark:border-white/10"
              }
            >
              {category}
            </button>
          ))}
        </div>

        {tags.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={
                  tag === activeTag
                    ? "rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-background"
                    : "rounded-full border border-black/10 px-3 py-1 text-[11px] font-semibold text-mutedForeground transition hover:text-foreground dark:border-white/10"
                }
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {filteredPosts.map((post) => (
          <article
            key={post.slug}
            className="glass flex h-full flex-col justify-between rounded-2xl p-6"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-mutedForeground">
                <span className="rounded-full border border-black/10 px-3 py-1 text-[11px] font-semibold text-foreground dark:border-white/10">
                  {post.category}
                </span>
                <span>{formatDate(post.date)}</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="text-2xl font-semibold">{post.title}</h2>
              <p className="text-sm text-mutedForeground">{post.excerpt}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-black/10 px-3 py-1 text-[11px] font-semibold text-mutedForeground dark:border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link
              href={`/blog/${post.slug}`}
              className="mt-6 inline-flex items-center text-sm font-semibold text-primary"
            >
              Читать статью →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
