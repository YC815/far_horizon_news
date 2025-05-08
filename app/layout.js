// app/layout.js
"use client"; // 若使用 next-themes 的 ThemeProvider 需為 Client Component
import { ThemeProvider } from "next-themes";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html
      lang="zh-Hant"
      className="light" // 確保 SSR 和 client 初始一致
      style={{ colorScheme: "light" }} // 確保 SSR 和 client 初始一致
      suppressHydrationWarning={true} // 抑制少許不一致警告
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
