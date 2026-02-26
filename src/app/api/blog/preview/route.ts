import { NextResponse } from "next/server";

import { getBlogPosts } from "@/lib/blog-data";

export async function GET() {
  const posts = await getBlogPosts();
  return NextResponse.json({ posts: posts.slice(0, 3) });
}
