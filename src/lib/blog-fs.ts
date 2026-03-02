import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import {
  BLOG_CATEGORIES,
  DEFAULT_BLOG_COVER_IMAGE,
  type BlogCategory,
  type BlogPost,
  type BlogPostSummary,
  type BlogPostSeo,
  markdownToPlainText
} from "@/lib/blog";

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");
const FRONTMATTER_BOUNDARY = "---";

const isCategory = (value: string): value is BlogCategory =>
  BLOG_CATEGORIES.includes(value as BlogCategory);

const stripQuotes = (value: string) => {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const normalizeSlug = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const toReadTime = (content: string) => {
  const words = markdownToPlainText(content).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} мин`;
};

const toExcerpt = (content: string) => {
  const plain = markdownToPlainText(content);
  if (plain.length <= 180) return plain;
  return `${plain.slice(0, 177).trim()}...`;
};

const parseDate = (value: string | undefined) => {
  if (!value) return new Date(0);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
};

const parseFrontmatter = (
  raw: string
): { meta: Record<string, string | string[]>; body: string } => {
  const normalized = raw.replace(/\r\n/g, "\n");
  if (!normalized.startsWith(`${FRONTMATTER_BOUNDARY}\n`)) {
    return { meta: {}, body: normalized.trim() };
  }

  const boundary = `\n${FRONTMATTER_BOUNDARY}\n`;
  const endIndex = normalized.indexOf(boundary, FRONTMATTER_BOUNDARY.length + 1);
  if (endIndex === -1) {
    return { meta: {}, body: normalized.trim() };
  }

  const frontmatter = normalized.slice(
    FRONTMATTER_BOUNDARY.length + 1,
    endIndex
  );
  const body = normalized.slice(endIndex + boundary.length).trim();

  const meta: Record<string, string | string[]> = {};
  const lines = frontmatter.split("\n");

  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      index += 1;
      continue;
    }

    const separator = trimmed.indexOf(":");
    if (separator === -1) {
      index += 1;
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (!value) {
      const items: string[] = [];
      let probe = index + 1;
      while (probe < lines.length) {
        const probeLine = lines[probe].trim();
        if (probeLine.startsWith("- ")) {
          items.push(stripQuotes(probeLine.slice(2).trim()));
          probe += 1;
          continue;
        }
        break;
      }

      if (items.length > 0) {
        meta[key] = items;
        index = probe;
        continue;
      }
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = stripQuotes(value);
    }

    if (value.startsWith("[") && value.endsWith("]")) {
      const list = value
        .slice(1, -1)
        .split(",")
        .map((item) => stripQuotes(item))
        .filter(Boolean);
      meta[key] = list;
      index += 1;
      continue;
    }

    meta[key] = value;
    index += 1;
  }

  return { meta, body };
};

const asString = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : undefined;

const asStringList = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const toYamlQuoted = (value: string) =>
  `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

const serializePost = (post: BlogPost) => {
  const seo = post.seo ?? {};
  const lines = [
    FRONTMATTER_BOUNDARY,
    `title: ${toYamlQuoted(post.title)}`,
    `slug: ${toYamlQuoted(post.slug)}`,
    `excerpt: ${toYamlQuoted(post.excerpt)}`,
    `date: ${toYamlQuoted(post.date)}`,
    `readTime: ${toYamlQuoted(post.readTime)}`,
    `category: ${toYamlQuoted(post.category)}`,
    "tags:",
    ...post.tags.map((tag) => `  - ${toYamlQuoted(tag)}`),
    `coverImage: ${toYamlQuoted(post.coverImage)}`,
    `seoTitle: ${toYamlQuoted(seo.title ?? "")}`,
    `seoDescription: ${toYamlQuoted(seo.description ?? "")}`,
    `seoImage: ${toYamlQuoted(seo.image ?? "")}`,
    FRONTMATTER_BOUNDARY,
    "",
    post.content.trim(),
    ""
  ];
  return lines.join("\n");
};

const toBlogPost = (slug: string, raw: string): BlogPost => {
  const { meta, body } = parseFrontmatter(raw);
  const safeSlug = normalizeSlug(asString(meta.slug) || slug) || slug;
  const rawCategory = asString(meta.category);
  const category = rawCategory && isCategory(rawCategory) ? rawCategory : "Сообщество";
  const tags = asStringList(meta.tags);

  const seo: BlogPostSeo | undefined =
    asString(meta.seoTitle) || asString(meta.seoDescription) || asString(meta.seoImage)
      ? {
          title: asString(meta.seoTitle) || undefined,
          description: asString(meta.seoDescription) || undefined,
          image: asString(meta.seoImage) || undefined
        }
      : undefined;

  return {
    slug: safeSlug,
    title: asString(meta.title) || safeSlug,
    excerpt: asString(meta.excerpt) || toExcerpt(body),
    date: asString(meta.date) || "1970-01-01",
    readTime: asString(meta.readTime) || toReadTime(body),
    category,
    tags,
    coverImage: asString(meta.coverImage) || DEFAULT_BLOG_COVER_IMAGE,
    content: body,
    seo
  };
};

const toFilePath = (slug: string) => path.join(CONTENT_DIR, `${slug}.md`);

const ensureContentDir = async () => {
  await fs.mkdir(CONTENT_DIR, { recursive: true });
};

export const getBlogTemplate = (slugInput: string) => {
  const slug = normalizeSlug(slugInput) || "new-post";
  const today = new Date().toISOString().slice(0, 10);

  return serializePost({
    slug,
    title: "Новый материал",
    excerpt: "Краткое описание статьи для карточки блога.",
    date: today,
    readTime: "4 мин",
    category: "Сообщество",
    tags: ["ICIA"],
    coverImage: DEFAULT_BLOG_COVER_IMAGE,
    seo: {
      title: "",
      description: "",
      image: ""
    },
    content:
      "Короткий лид статьи.\n\n### Подзаголовок\n\n- Первый пункт\n- Второй пункт\n\n> Ключевая мысль материала."
  });
};

export const getAllBlogPosts = async (): Promise<BlogPost[]> => {
  await ensureContentDir();
  const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });

  const posts = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map(async (entry) => {
        const slug = entry.name.replace(/\.md$/, "");
        const raw = await fs.readFile(path.join(CONTENT_DIR, entry.name), "utf-8");
        return toBlogPost(slug, raw);
      })
  );

  return posts.sort(
    (a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()
  );
};

export const getBlogPostBySlugFromFs = async (
  slugInput: string
): Promise<BlogPost | null> => {
  await ensureContentDir();
  const slug = normalizeSlug(slugInput);
  if (!slug) return null;

  try {
    const raw = await fs.readFile(toFilePath(slug), "utf-8");
    return toBlogPost(slug, raw);
  } catch {
    return null;
  }
};

export const getBlogPostRawBySlug = async (
  slugInput: string
): Promise<string | null> => {
  await ensureContentDir();
  const slug = normalizeSlug(slugInput);
  if (!slug) return null;

  try {
    return await fs.readFile(toFilePath(slug), "utf-8");
  } catch {
    return null;
  }
};

export const listBlogPostSummaries = async (): Promise<BlogPostSummary[]> => {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    category: post.category
  }));
};

export const createBlogPostDraft = async (slugInput: string) => {
  await ensureContentDir();
  const slug = normalizeSlug(slugInput);
  if (!slug) {
    throw new Error("Invalid slug");
  }

  const filePath = toFilePath(slug);
  const exists = await getBlogPostRawBySlug(slug);
  if (exists) {
    throw new Error("Post already exists");
  }

  const template = getBlogTemplate(slug);
  await fs.writeFile(filePath, template, "utf-8");
  return { slug, content: template };
};

export const saveBlogPostRaw = async (slugInput: string, content: string) => {
  await ensureContentDir();
  const slug = normalizeSlug(slugInput);
  if (!slug) {
    throw new Error("Invalid slug");
  }
  await fs.writeFile(toFilePath(slug), content, "utf-8");
};
