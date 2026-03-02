"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BLOG_CATEGORIES, formatDate, type BlogPostSummary } from "@/lib/blog";

type AdminPostsResponse = {
  posts?: BlogPostSummary[];
  error?: string;
};

type AdminPostResponse = {
  slug?: string;
  content?: string;
  error?: string;
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [editor, setEditor] = useState("");
  const [status, setStatus] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const selectedPost = useMemo(
    () => posts.find((post) => post.slug === selectedSlug) ?? null,
    [posts, selectedSlug]
  );

  const loadPosts = async () => {
    setLoadingList(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/blog/posts");
      const data = (await response.json()) as AdminPostsResponse;
      if (!response.ok) throw new Error(data.error || "Не удалось загрузить список");
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось загрузить список");
    } finally {
      setLoadingList(false);
    }
  };

  const loadPost = async (slug: string) => {
    setLoadingPost(true);
    setStatus("");
    try {
      const response = await fetch(`/api/admin/blog/posts/${slug}`);
      const data = (await response.json()) as AdminPostResponse;
      if (!response.ok) throw new Error(data.error || "Не удалось загрузить пост");
      setSelectedSlug(slug);
      setEditor(data.content ?? "");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось загрузить пост");
    } finally {
      setLoadingPost(false);
    }
  };

  const createDraft = async () => {
    const slug = newSlug.trim();
    if (!slug) {
      setStatus("Укажите slug нового поста");
      return;
    }

    setSaving(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug })
      });
      const data = (await response.json()) as AdminPostResponse;
      if (!response.ok) throw new Error(data.error || "Не удалось создать пост");

      setEditor(data.content ?? "");
      setSelectedSlug(data.slug ?? slug);
      setNewSlug("");
      await loadPosts();
      setStatus("Черновик создан");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось создать пост");
    } finally {
      setSaving(false);
    }
  };

  const saveCurrent = async () => {
    if (!selectedSlug) {
      setStatus("Сначала выберите или создайте пост");
      return;
    }
    if (!editor.trim()) {
      setStatus("Редактор пуст");
      return;
    }

    setSaving(true);
    setStatus("");
    try {
      const response = await fetch(`/api/admin/blog/posts/${selectedSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editor })
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error || "Не удалось сохранить пост");
      await loadPosts();
      setStatus("Пост сохранен");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось сохранить пост");
    } finally {
      setSaving(false);
    }
  };

  const replaceCoverImageInFrontmatter = (content: string, imageUrl: string) => {
    const normalized = content.replace(/\r\n/g, "\n");
    const lines = normalized.split("\n");
    if (lines[0] !== "---") {
      return content;
    }

    const endIndex = lines.indexOf("---", 1);
    if (endIndex === -1) {
      return content;
    }

    let replaced = false;
    for (let i = 1; i < endIndex; i += 1) {
      if (lines[i].startsWith("coverImage:")) {
        lines[i] = `coverImage: "${imageUrl}"`;
        replaced = true;
        break;
      }
    }

    if (!replaced) {
      lines.splice(endIndex, 0, `coverImage: "${imageUrl}"`);
    }

    return lines.join("\n");
  };

  const uploadCoverImage = async () => {
    if (!coverFile) {
      setStatus("Выберите файл изображения");
      return;
    }
    if (!editor.trim()) {
      setStatus("Сначала откройте пост");
      return;
    }

    setUploadingImage(true);
    setStatus("");
    try {
      const payload = new FormData();
      payload.append("file", coverFile);

      const response = await fetch("/api/admin/blog/upload-image", {
        method: "POST",
        body: payload
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Не удалось загрузить изображение");
      }

      setEditor((prev) => replaceCoverImageInFrontmatter(prev, data.url as string));
      setCoverFile(null);
      setStatus(`Изображение загружено: ${data.url}`);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Не удалось загрузить изображение"
      );
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 pb-16 pt-28 lg:grid-cols-[320px_1fr]">
      <aside className="glass rounded-2xl p-5">
        <h1 className="text-xl font-semibold">Админка блога</h1>
        <p className="mt-2 text-sm text-mutedForeground">
          Контент хранится в markdown-файлах в `content/blog`.
        </p>
        <p className="mt-2 text-xs text-mutedForeground">
          Категории: {BLOG_CATEGORIES.join(", ")}.
        </p>

        <div className="mt-5 space-y-2">
          <Input
            placeholder="new-post-slug"
            value={newSlug}
            onChange={(event) => setNewSlug(event.target.value)}
          />
          <Button
            type="button"
            onClick={createDraft}
            disabled={saving}
            className="w-full"
          >
            Создать черновик
          </Button>
        </div>

        <div className="mt-5">
          <Button type="button" variant="outline" onClick={loadPosts} disabled={loadingList}>
            Обновить список
          </Button>
        </div>

        <div className="mt-5 space-y-2">
          {posts.map((post) => (
            <button
              key={post.slug}
              type="button"
              onClick={() => loadPost(post.slug)}
              className={
                post.slug === selectedSlug
                  ? "w-full rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-left"
                  : "w-full rounded-xl border border-black/10 px-3 py-2 text-left hover:border-primary/30 dark:border-white/10"
              }
            >
              <p className="line-clamp-2 text-sm font-semibold">{post.title}</p>
              <p className="mt-1 text-xs text-mutedForeground">
                {post.category} · {formatDate(post.date)}
              </p>
              <p className="mt-1 text-xs text-mutedForeground">/{post.slug}</p>
            </button>
          ))}
          {!loadingList && posts.length === 0 && (
            <p className="text-sm text-mutedForeground">Постов пока нет.</p>
          )}
        </div>
      </aside>

      <section className="glass rounded-2xl p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">
              {selectedPost ? selectedPost.title : "Редактор поста"}
            </h2>
            <p className="text-sm text-mutedForeground">
              {selectedSlug ? `slug: ${selectedSlug}` : "Выберите пост слева"}
            </p>
          </div>
          <Button type="button" onClick={saveCurrent} disabled={saving || loadingPost}>
            Сохранить
          </Button>
        </div>

        <div className="mb-4 grid gap-3 rounded-xl border border-black/10 p-3 dark:border-white/10 md:grid-cols-[1fr_auto]">
          <Input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setCoverFile(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={uploadCoverImage}
            disabled={uploadingImage || loadingPost}
          >
            {uploadingImage ? "Загрузка..." : "Загрузить обложку"}
          </Button>
        </div>

        <Textarea
          value={editor}
          onChange={(event) => setEditor(event.target.value)}
          placeholder="Markdown с frontmatter"
          className="min-h-[70vh] font-mono text-sm"
          disabled={loadingPost}
        />

        <p className="mt-3 text-sm text-mutedForeground">
          {loadingPost ? "Загрузка..." : status || "Формат: frontmatter + markdown."}
        </p>
      </section>
    </div>
  );
}
