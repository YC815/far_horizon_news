// app/page.jsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { TagSelector } from "@/components/TagSelector";

export default function HomePage() {
  const [selectedTags, setSelectedTags] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 從 API 載入新聞列表
  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        setNewsList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("載入新聞失敗：", err);
        setLoading(false);
      });
  }, []);

  const filteredNews = selectedTags.length
    ? newsList.filter((n) =>
        n.tags?.some((t) => selectedTags.includes(t))
      )
    : newsList;

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-900 px-6">
      {/* Hero 區塊 */}
      <section className="text-center mb-12 pt-12">
        <h1 className="text-4xl font-bold mb-2">遠望地平線</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          站在地平線的邊緣，看見世界的裂縫。
        </p>
      </section>

      {/* Tag 選擇器 */}
      <section className="mb-10 flex justify-center">
        <TagSelector onChange={setSelectedTags} />
      </section>

      {/* 載入狀態 */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-zinc-500">載入中...</p>
        </div>
      )}

      {/* 卡片區 */}
      {!loading && (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-12">
          {filteredNews.length > 0 ? (
            filteredNews.map((news) => (
              <Link
                key={news.id}
                href={`/news/${news.id}`}
                className="block rounded-xl overflow-hidden shadow-md border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-shadow"
              >
                {/* 圖片區域 */}
                {news.coverImage ? (
                  <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800">
                    <Image
                      src={news.coverImage}
                      alt={news.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {news.homeTitle?.charAt(0) || news.title?.charAt(0) || "N"}
                    </span>
                  </div>
                )}

                {/* 內容區域 */}
                <div className="p-4 space-y-2">
                  {/* 標籤 */}
                  {news.tags && news.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap text-xs">
                      {news.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 標題 */}
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {news.homeTitle || news.title}
                  </h3>

                  {/* 副標題 */}
                  {news.subtitle && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {news.subtitle}
                    </p>
                  )}

                  {/* 日期 */}
                  <p className="text-xs text-zinc-400">
                    {new Date(news.createdAt).toLocaleDateString("zh-TW", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-zinc-500">
                {selectedTags.length > 0
                  ? "找不到符合的新聞。請嘗試選擇其他 Tag。"
                  : "目前沒有新聞。"}
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
