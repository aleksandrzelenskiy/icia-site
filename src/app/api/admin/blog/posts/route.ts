import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { createBlogPostDraft, listBlogPostSummaries } from "@/lib/blog-fs";

export const runtime = "nodejs";

export async function GET() {
  const posts = await listBlogPostSummaries();
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | { slug?: string }
    | null;
  const slug = payload?.slug?.trim();

  if (!slug) {
    return NextResponse.json(
      { error: "Slug is required" },
      { status: 400 }
    );
  }

  try {
    const post = await createBlogPostDraft(slug);
    revalidatePath("/blog");
    revalidatePath("/");
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
