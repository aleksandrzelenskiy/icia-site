import { NextResponse } from "next/server";

import { getBlogPosts } from "@/lib/blog-data";
import { isPublicBlogEnabled } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isPublicBlogEnabled()) {
    return NextResponse.json({ error: "Blog preview is disabled." }, { status: 404 });
  }

  const posts = await getBlogPosts();
  return NextResponse.json({ posts: posts.slice(0, 3) });
}
