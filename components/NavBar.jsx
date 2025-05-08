// components/NavBar.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Search, Sun, Moon } from "lucide-react";

export function NavBar() {
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    const currentTheme = theme === "system" ? systemTheme : theme;
    const toggleTheme = () =>
        setTheme(currentTheme === "dark" ? "light" : "dark");

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-gray-100 dark:bg-zinc-800 shadow">            {/* 左上角 Logo */}
            <Link href="/" className="flex items-center space-x-2">
                <Image
                    src="/favicon.ico"
                    alt="遠望地平線 Logo"
                    width={32}
                    height={32}
                    className="rounded-full"
                />
                <span className="text-xl font-bold">遠望地平線</span>
            </Link>

            {/* 右側：搜尋 + 主題切換 */}
            <div className="flex items-center space-x-4">
                {/* 搜尋框 */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <Input placeholder="搜尋新聞..." className="pl-10 w-48 md:w-64" />
                </div>

                {/* 太陽 / 月亮 按鈕 */}
                {mounted && (
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                        aria-label="切換深淺色模式"
                    >
                        {currentTheme === "dark" ? (
                            <Sun className="w-5 h-5 text-yellow-400" />
                        ) : (
                            <Moon className="w-5 h-5 text-zinc-600" />
                        )}
                    </button>
                )}
            </div>
        </header>
    );
}
