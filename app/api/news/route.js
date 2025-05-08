// app/api/news/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const list = await prisma.news.findMany({
    include: {
      tags: { include: { tag: true } },
      images: true,
    },
    orderBy: { date: "desc" },
  });

  // 格式化回傳：把多對多關聯拆平
  const result = list.map((n) => ({
    id: n.id,
    title: n.title,
    subtitle: n.subtitle,
    author: n.author,
    date: n.date,
    coverImage: n.coverImage,
    tags: n.tags.map((t) => t.tag.name),
    images: n.images.map((img) => ({ id: img.id, url: img.url })),
    contentMD: n.contentMD,
  }));

  return NextResponse.json(result);
}

// app/api/news/route.js
export async function POST(request) {
  const {
    title,
    subtitle,
    contentMD,
    author,
    date,
    coverImage,
    tags, // Array<string>
  } = await request.json();

  const news = await prisma.news.create({
    data: {
      title,
      subtitle,
      contentMD,
      author,
      date: new Date(date),
      coverImage,
      tags: {
        create: tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
      images: {
        connect: imageIds.map((id) => ({ id })),
      },
    },
    include: {
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(news);
}
