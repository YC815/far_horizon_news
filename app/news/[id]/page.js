// app/news/[id]/page.js
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { getArticleById } from "@/lib/articles";

export default async function ArticlePage({ params }) {
  const article = await getArticleById(params.id);
  if (!article) notFound();

  const { title, subtitle, date, author, tags, coverImage, contentHTML } =
    article;
  const formattedDate = new Date(date).toLocaleDateString("zh-Hant", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      {/* 回到主頁按鈕 */}
      <div className="mb-6">
        <Link
          href="/"
          className="flex items-center text-zinc-500 hover:text-zinc-700"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          回到主頁
        </Link>
      </div>

      {/* 文章標題區 */}
      <header className="space-y-3 mb-8">
        <h1 className="text-5xl font-extrabold leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-lg text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        )}
        <div className="flex flex-wrap items-center text-sm text-zinc-500 dark:text-zinc-400 space-x-2">
          <span>{formattedDate}</span>
          <span>•</span>
          <span>作者：{author}</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">
              #{tag}
            </Badge>
          ))}
        </div>
      </header>

      {/* 封面圖片 */}
      {coverImage && (
        <div className="mb-8">
          <Image
            src={coverImage}
            alt={title}
            width={800}
            height={450}
            className="w-full h-auto rounded-lg object-cover shadow"
          />
        </div>
      )}

      {/* 文章內容 */}
      <article className="prose prose-lg mx-auto dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: contentHTML }} />
      </article>

      {/* 頁尾（可擴充分享按鈕、回到頂部等） */}
      <footer className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-700 text-center text-sm text-zinc-500 dark:text-zinc-400">
        感謝閱讀，歡迎分享或留下評論！
      </footer>
    </main>
  );
}
