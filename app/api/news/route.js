// app/api/news/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const list = await prisma.news.findMany({
      include: {
        tags: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 格式化回傳：把多對多關聯拆平
    const result = list.map((n) => ({
      id: n.id,
      homeTitle: n.homeTitle,
      title: n.title,
      subtitle: n.subtitle,
      coverImage: n.coverImage,
      createdAt: n.createdAt,
      tags: n.tags.map((tag) => tag.name),
      images: n.images.map((img) => ({ id: img.id, url: img.url })),
      contentMD: n.contentMD,
      contentHTML: n.contentHTML,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ GET /api/news 錯誤：", error);
    return NextResponse.json(
      { error: "Failed to fetch news", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const {
      homeTitle,
      title,
      subtitle,
      contentMD,
      contentHTML,
      coverImage,
      tags = [], // Array<string>
      imageIds = [], // Array<string>
    } = await request.json();

    const news = await prisma.news.create({
      data: {
        homeTitle,
        title,
        subtitle,
        contentMD,
        contentHTML,
        coverImage,
        tags: {
          connectOrCreate: tags.map((tagName) => ({
            where: { name: tagName },
            create: { name: tagName },
          })),
        },
        images: {
          connect: imageIds.map((id) => ({ id })),
        },
      },
      include: {
        tags: true,
        images: true,
      },
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error("❌ POST /api/news 錯誤：", error);
    return NextResponse.json(
      { error: "Failed to create news", details: error.message },
      { status: 500 }
    );
  }
}
