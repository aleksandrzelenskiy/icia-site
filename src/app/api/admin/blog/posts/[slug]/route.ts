import { NextResponse } from "next/server";

import { getBlogPostRawBySlug, saveBlogPostRaw } from "@/lib/blog-fs";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { slug } = await params;
  const content = await getBlogPostRawBySlug(slug);

  if (!content) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ slug, content });
}

export async function PUT(request: Request, { params }: Params) {
  const { slug } = await params;
  const payload = (await request.json().catch(() => null)) as
    | { content?: string }
    | null;
  const content = payload?.content;

  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  try {
    await saveBlogPostRaw(slug, content);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
