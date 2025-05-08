import "./globals.css";
import { ThemeProvider } from "next-themes";
import { NavBar } from "@/components/NavBar";

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      {/* 在伺服器渲染時，不給任何 theme 相關的 class */}
      <body className="bg-white text-zinc-900">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NavBar />
          <main className="pt-16 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
