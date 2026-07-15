// prisma/seed.js
/**
 * 資料庫種子資料
 * 執行：npx prisma db seed
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 開始播種資料...");

  // 清除既有資料（開發環境用）
  if (process.env.NODE_ENV !== "production") {
    console.log("🗑️  清除既有資料（開發模式）");
    await prisma.image.deleteMany();
    await prisma.news.deleteMany();
    await prisma.tag.deleteMany();
  }

  // ============================================
  // 建立標籤
  // ============================================
  console.log("📌 建立標籤...");
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "學術活動" } }),
    prisma.tag.create({ data: { name: "國際交流" } }),
    prisma.tag.create({ data: { name: "學生事務" } }),
    prisma.tag.create({ data: { name: "校園新聞" } }),
    prisma.tag.create({ data: { name: "重要公告" } }),
  ]);
  console.log(`✅ 建立了 ${tags.length} 個標籤`);

  // ============================================
  // 建立範例新聞
  // ============================================
  console.log("📰 建立範例新聞...");

  const news1 = await prisma.news.create({
    data: {
      homeTitle: "歡迎使用遠望地平線新聞平台",
      title: "系統上線公告",
      subtitle: "全新的新聞管理與發布系統正式啟用",
      contentMD: `# 歡迎使用

這是一個基於 **Next.js** 與 **Prisma** 建構的新聞平台。

## 主要功能

- 📝 Markdown 編輯器
- 🏷️ 標籤管理
- 🖼️ 圖片上傳
- 🔍 內容搜尋

## 技術棧

- **前端**: Next.js 15 + React 19
- **後端**: Next.js API Routes
- **資料庫**: PostgreSQL (生產) / SQLite (開發)
- **ORM**: Prisma
- **儲存**: MinIO / Supabase Storage

---

感謝您的使用！
`,
      contentHTML: `<h1>歡迎使用</h1>
<p>這是一個基於 <strong>Next.js</strong> 與 <strong>Prisma</strong> 建構的新聞平台。</p>
<h2>主要功能</h2>
<ul>
<li>📝 Markdown 編輯器</li>
<li>🏷️ 標籤管理</li>
<li>🖼️ 圖片上傳</li>
<li>🔍 內容搜尋</li>
</ul>
<h2>技術棧</h2>
<ul>
<li><strong>前端</strong>: Next.js 15 + React 19</li>
<li><strong>後端</strong>: Next.js API Routes</li>
<li><strong>資料庫</strong>: PostgreSQL (生產) / SQLite (開發)</li>
<li><strong>ORM</strong>: Prisma</li>
<li><strong>儲存</strong>: MinIO / Supabase Storage</li>
</ul>
<hr>
<p>感謝您的使用！</p>`,
      coverImage: null,
      tags: {
        connect: [{ id: tags[3].id }, { id: tags[4].id }], // 校園新聞、重要公告
      },
    },
  });

  const news2 = await prisma.news.create({
    data: {
      homeTitle: "Docker 部署指南",
      title: "如何使用 Docker Compose 一鍵部署",
      subtitle: "從 git clone 到網站上線，只需三個指令",
      contentMD: `# Docker 部署指南

## 快速開始

\`\`\`bash
git clone <repository-url>
cp .env.docker .env
docker-compose up
\`\`\`

就是這麼簡單！

## 包含的服務

1. **PostgreSQL 17** - 資料庫
2. **MinIO** - 物件儲存（圖片）
3. **Next.js** - 網站應用

## 環境配置

所有設定都在 \`.env.docker\` 檔案中，包括：

- 資料庫連線字串
- MinIO 存取金鑰
- 儲存模式選擇

## 進階功能

- 自動執行 migration
- 種子資料初始化
- 健康檢查
- 資料持久化

---

更多資訊請參閱 README.md
`,
      contentHTML: `<h1>Docker 部署指南</h1>
<h2>快速開始</h2>
<pre><code class="language-bash">git clone &lt;repository-url&gt;
cp .env.docker .env
docker-compose up
</code></pre>
<p>就是這麼簡單！</p>
<h2>包含的服務</h2>
<ol>
<li><strong>PostgreSQL 17</strong> - 資料庫</li>
<li><strong>MinIO</strong> - 物件儲存（圖片）</li>
<li><strong>Next.js</strong> - 網站應用</li>
</ol>
<h2>環境配置</h2>
<p>所有設定都在 <code>.env.docker</code> 檔案中，包括：</p>
<ul>
<li>資料庫連線字串</li>
<li>MinIO 存取金鑰</li>
<li>儲存模式選擇</li>
</ul>
<h2>進階功能</h2>
<ul>
<li>自動執行 migration</li>
<li>種子資料初始化</li>
<li>健康檢查</li>
<li>資料持久化</li>
</ul>
<hr>
<p>更多資訊請參閱 README.md</p>`,
      coverImage: null,
      tags: {
        connect: [{ id: tags[0].id }, { id: tags[4].id }], // 學術活動、重要公告
      },
    },
  });

  const news3 = await prisma.news.create({
    data: {
      homeTitle: "開發環境設定",
      title: "本地開發環境設定指南",
      subtitle: "適用於開發者的詳細設定說明",
      contentMD: `# 本地開發設定

## 方式一：使用 Supabase（推薦）

1. 前往 [Supabase](https://supabase.com) 建立專案
2. 建立 \`images\` bucket
3. 複製環境變數到 \`.env.local\`

## 方式二：使用 SQLite

適合快速開發，不需要外部服務。

\`\`\`bash
# .env.local
DATABASE_URL="file:./dev.db"
STORAGE_MODE=supabase
\`\`\`

## 安裝依賴

\`\`\`bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
\`\`\`

---

專案將在 http://localhost:3000 啟動
`,
      contentHTML: `<h1>本地開發設定</h1>
<h2>方式一：使用 Supabase（推薦）</h2>
<ol>
<li>前往 <a href="https://supabase.com">Supabase</a> 建立專案</li>
<li>建立 <code>images</code> bucket</li>
<li>複製環境變數到 <code>.env.local</code></li>
</ol>
<h2>方式二：使用 SQLite</h2>
<p>適合快速開發，不需要外部服務。</p>
<pre><code class="language-bash"># .env.local
DATABASE_URL=&quot;file:./dev.db&quot;
STORAGE_MODE=supabase
</code></pre>
<h2>安裝依賴</h2>
<pre><code class="language-bash">npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
</code></pre>
<hr>
<p>專案將在 http://localhost:3000 啟動</p>`,
      coverImage: null,
      tags: {
        connect: [{ id: tags[2].id }], // 學生事務
      },
    },
  });

  console.log(`✅ 建立了 3 則範例新聞`);

  // ============================================
  // 總結
  // ============================================
  console.log("\n🎉 資料播種完成！");
  console.log(`   - ${tags.length} 個標籤`);
  console.log(`   - 3 則新聞`);
  console.log("\n訪問 http://localhost:3000 查看結果");
}

main()
  .catch((e) => {
    console.error("❌ 播種失敗：", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
