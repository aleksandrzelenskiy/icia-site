import { BlogContentBlock, BlogPost, BlogPostSeo } from "@/lib/blog";

type StrapiResponse<T> = {
  data: T[];
};

type StrapiMedia = {
  data: {
    attributes: {
      url: string;
    };
  } | null;
};

type StrapiSeo = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  shareImage?: StrapiMedia | null;
};

type StrapiPostAttributes = {
  title?: string;
  slug?: string;
  excerpt?: string;
  date?: string;
  readTime?: string;
  category?: string;
  tags?: string[];
  content?: BlogContentBlock[] | null;
  seo?: StrapiSeo | null;
};

type StrapiPost = {
  id: number;
  attributes: StrapiPostAttributes;
};

const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const STRAPI_BLOG_COLLECTION = process.env.STRAPI_BLOG_COLLECTION || "posts";

const isStrapiConfigured = () => Boolean(STRAPI_URL);

const getStrapiHeaders = (): HeadersInit | undefined => {
  if (!STRAPI_TOKEN) return undefined;
  return { Authorization: `Bearer ${STRAPI_TOKEN}` };
};

const getAbsoluteUrl = (url: string | undefined | null) => {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  if (!STRAPI_URL) return url;
  return `${STRAPI_URL}${url}`;
};

const toSeo = (seo?: StrapiSeo | null): BlogPostSeo | undefined => {
  if (!seo) return undefined;
  const image = getAbsoluteUrl(seo.shareImage?.data?.attributes?.url);
  return {
    title: seo.metaTitle ?? undefined,
    description: seo.metaDescription ?? undefined,
    image
  };
};

const toBlogPost = (post: StrapiPost): BlogPost | null => {
  const attrs = post.attributes;
  if (!attrs?.slug || !attrs?.title || !attrs?.excerpt || !attrs?.date) {
    return null;
  }

  return {
    slug: attrs.slug,
    title: attrs.title,
    excerpt: attrs.excerpt,
    date: attrs.date,
    readTime: attrs.readTime ?? "5 мин",
    category: attrs.category ?? "Статьи",
    tags: Array.isArray(attrs.tags) ? attrs.tags : [],
    content: Array.isArray(attrs.content) ? attrs.content : [],
    seo: toSeo(attrs.seo)
  };
};

const buildQuery = (params: Record<string, string>) => {
  const searchParams = new URLSearchParams(params);
  return searchParams.toString();
};

export const fetchStrapiPosts = async (): Promise<BlogPost[] | null> => {
  if (!isStrapiConfigured()) return null;

  const query = buildQuery({
    "sort[0]": "date:desc",
    "pagination[pageSize]": "100",
    populate: "seo.shareImage"
  });

  const response = await fetch(
    `${STRAPI_URL}/api/${STRAPI_BLOG_COLLECTION}?${query}`,
    {
      headers: getStrapiHeaders(),
      next: { revalidate: 60 }
    }
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as StrapiResponse<StrapiPost>;
  return payload.data
    .map(toBlogPost)
    .filter((item): item is BlogPost => item !== null);
};

export const fetchStrapiPostBySlug = async (
  slug: string
): Promise<BlogPost | null> => {
  if (!isStrapiConfigured()) return null;

  const query = buildQuery({
    "filters[slug][$eq]": slug,
    populate: "seo.shareImage"
  });

  const response = await fetch(
    `${STRAPI_URL}/api/${STRAPI_BLOG_COLLECTION}?${query}`,
    {
      headers: getStrapiHeaders(),
      next: { revalidate: 60 }
    }
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as StrapiResponse<StrapiPost>;
  const post = payload.data[0];
  return post ? toBlogPost(post) : null;
};

export const isStrapiEnabled = isStrapiConfigured;
