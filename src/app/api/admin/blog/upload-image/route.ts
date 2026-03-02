import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

const extensionByType: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/heic": ".heic",
  "image/heif": ".heif",
  "image/avif": ".avif"
};

const safeFileName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Поддерживаются только файлы изображений" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Размер файла не должен превышать 10MB" },
      { status: 400 }
    );
  }

  const originalName = safeFileName(file.name || "image");
  const nameExt =
    originalName.lastIndexOf(".") > -1
      ? originalName.slice(originalName.lastIndexOf("."))
      : "";
  const ext = nameExt || extensionByType[file.type] || ".img";
  const fileName = `${Date.now()}-${randomUUID()}${ext}`;
  const relativeUrl = `/blog/${fileName}`;
  const outputDir = path.join(process.cwd(), "public", "blog");
  const outputPath = path.join(outputDir, fileName);

  await fs.mkdir(outputDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(outputPath, buffer);

  return NextResponse.json({ url: relativeUrl });
}
