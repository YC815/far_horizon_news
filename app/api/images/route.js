import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile, generateFileName } from "@/lib/storage";

// GET：讀取所有圖片
export async function GET() {
  try {
    console.log("📥 收到 GET /api/images 請求");

    const images = await prisma.image.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`✅ 成功取得 ${images.length} 張圖片`);
    return NextResponse.json(images);
  } catch (err) {
    console.error("🔥 讀取圖片發生錯誤：", err);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

// POST：上傳圖片
export async function POST(request) {
  try {
    console.log("📤 收到 POST /api/images 請求");

    const formData = await request.formData();
    const file = formData.get("file");
    const newsId = formData.get("newsId")?.toString() || null;

    if (!file || typeof file === "string") {
      console.warn("⚠️ 沒有提供有效圖片");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 生成唯一檔案名稱
    const fileName = generateFileName(file.name);
    console.log(`📦 上傳檔案名稱：${fileName}`);

    // 使用統一儲存介面上傳（自動判斷 MinIO 或 Supabase）
    const { url, path } = await uploadFile(file, fileName);

    console.log("🌐 圖片 URL：", url);

    // 儲存到資料庫
    const img = await prisma.image.create({
      data: {
        url,
        path,
        newsId: newsId,
      },
    });

    console.log("✅ 圖片上傳成功，ID：", img.id);
    return NextResponse.json(img);
  } catch (err) {
    console.error("🔥 /api/images 發生例外：", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
