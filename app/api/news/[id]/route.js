// app/api/news/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  const article = await prisma.news.findUnique({
    where: { id: params.id },
    include: {
      tags: { include: { tag: true } },
      images: true,
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: article.id,
    title: article.title,
    subtitle: article.subtitle,
    author: article.author,
    date: article.date,
    coverImage: article.coverImage,
    tags: article.tags.map((t) => t.tag.name),
    images: article.images.map((img) => ({ id: img.id, url: img.url })),
    contentMD: article.contentMD,
  });
}
