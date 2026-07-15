# 遠望地平線 新聞平台

> 基於 Next.js 15 的現代化新聞管理與發布平台
> 支援 Markdown 編輯、圖片上傳、標籤管理，一鍵 Docker 部署

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.7-2D3748)](https://www.prisma.io/)

---

## 📋 目錄

- [特色功能](#特色功能)
- [快速開始](#快速開始)
- [開發環境設定](#開發環境設定)
- [技術架構](#技術架構)
- [專案結構](#專案結構)
- [環境變數設定](#環境變數設定)
- [常用指令](#常用指令)
- [資料庫管理](#資料庫管理)
- [Docker 部署](#docker-部署)
- [生產環境部署](#生產環境部署)
- [疑難排解](#疑難排解)
- [進階主題](#進階主題)
- [貢獻指南](#貢獻指南)

---

## ✨ 特色功能

### 內容管理
- **📝 Markdown 編輯器**：Monaco Editor 加持，即時預覽，支援 GFM 語法
- **🖼️ 圖片管理**：拖放上傳，自動壓縮，CDN 加速
- **🏷️ 標籤系統**：多對多關聯，智慧分類，快速檢索
- **👁️ 即時預覽**：所見即所得，Markdown 渲染支援 HTML

### 技術特色
- **🐳 Docker 化**：一鍵部署，完整隔離，隨拆即用
- **🔄 雙模式儲存**：MinIO（本地）或 Supabase（雲端）自動切換
- **💾 彈性資料庫**：開發用 SQLite，生產用 PostgreSQL
- **⚡ 熱重載**：開發環境快速迭代，即時生效

### 開發體驗
- **📦 零配置啟動**：`cp .env.docker .env && docker-compose up`
- **🛠️ 完整 TypeScript**：類型安全，智慧提示
- **🎨 現代化 UI**：TailwindCSS 4 + ShadcnUI 元件庫
- **📖 詳盡文件**：手把手教學，涵蓋所有場景

---

## 🚀 快速開始

### 方式一：Docker 一鍵部署（推薦）

**適合：** 快速測試、生產部署、不想手動設定資料庫

```bash
# 1. Clone 專案
git clone https://github.com/your-repo/fhn.git
cd fhn

# 2. 複製環境變數（使用預設值）
cp .env.docker .env

# 3. 啟動所有服務（PostgreSQL + MinIO + Next.js）
docker-compose up
```

**等待 2-3 分鐘**，完成後訪問：

| 服務 | URL | 帳號密碼 |
|------|-----|----------|
| **網站主頁** | http://localhost:3000 | - |
| **後台管理** | http://localhost:3000/admin/news/new | - |
| **MinIO Console** | http://localhost:9001 | minio_admin / minio_password |

**預設包含：**
- ✅ 3 則範例新聞
- ✅ 5 個預設標籤
- ✅ 完整後台功能

---

### 方式二：本地開發

**適合：** 開發者、需要熱重載、自訂資料庫

#### 選項 A：使用 Supabase（零安裝）

```bash
# 1. Clone 專案
git clone https://github.com/your-repo/fhn.git
cd fhn

# 2. 複製環境變數範本
cp .env.example .env

# 3. 編輯 .env，填入 Supabase 資訊
#    詳見「環境變數設定」章節

# 4. 安裝依賴
npm install

# 5. 執行資料庫 migration
npx prisma migrate dev

# 6. 載入範例資料
npx prisma db seed

# 7. 啟動開發伺服器
npm run dev
```

#### 選項 B：使用 SQLite（最快速）

```bash
# 前面 1-2 步驟同上

# 3. 編輯 .env，取消 SQLite 場景的註解
#    DATABASE_URL="file:./dev.db"
#    STORAGE_MODE=supabase
#    # 填入 Supabase Storage 資訊（僅用於圖片）

# 4-7 步驟同上
```

---

## 💻 開發環境設定

### 系統需求

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | >= 20.x | 執行環境 |
| npm | >= 10.x | 套件管理 |
| Docker | >= 20.10 | 容器化（Docker 模式） |
| Docker Compose | >= 2.0 | 容器編排（Docker 模式） |

### 環境選擇指南

根據你的需求選擇最適合的開發環境：

| 需求 | 推薦方案 | 資料庫 | 儲存 | 優點 |
|------|---------|--------|------|------|
| **快速測試** | Docker | PostgreSQL | MinIO | 零配置 |
| **初學者** | Supabase | Supabase PG | Supabase | 雲端服務 |
| **離線開發** | SQLite | SQLite | Supabase* | 單檔資料庫 |
| **進階開發** | 混合模式 | Docker PG | Docker MinIO | 模擬生產環境 |

*註：SQLite 只能儲存結構化資料，圖片仍需雲端儲存

---

### 詳細設定步驟

#### 1. Docker 模式（已涵蓋於快速開始）

**完整說明：** [DOCKER_SETUP.md](DOCKER_SETUP.md)

---

#### 2. Supabase 模式

**步驟一：建立 Supabase 專案**

1. 前往 https://supabase.com 註冊（免費方案足夠）
2. 點擊 **New Project**
3. 填寫資訊：
   - Name: `fhn-news`（自訂）
   - Database Password: 記下來，待會需要
   - Region: `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`
4. 等待約 2 分鐘初始化

**步驟二：設定 Storage**

1. 左側選單：**Storage** → **Create a new bucket**
2. 設定：
   - Name: `images`
   - Public bucket: ✅ **勾選**（重要！）
   - File size limit: 50MB（可調整）
3. 點擊 **Create bucket**

**步驟三：取得連線資訊**

1. **Settings** → **Database**
   - 找到 **Connection string** → **URI**
   - 點擊 **Copy**
   - 格式：`postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

2. **Settings** → **API**
   - `Project URL`：複製（例如：`https://xxx.supabase.co`）
   - `service_role` **secret**：點擊 **Reveal** → 複製

**步驟四：設定環境變數**

開啟 `.env`，填入以下資訊：

```env
# 貼上剛才複製的連線字串
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# 儲存模式
STORAGE_MODE=supabase

# Supabase 設定
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...（剛才複製的 service_role key）

# Next.js 設定
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**步驟五：啟動**

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

---

#### 3. SQLite 模式

**優點：** 最快速，無需安裝資料庫，離線可用（除圖片上傳）

**步驟：**

1. 先按照「Supabase 模式」的步驟一至三取得 Supabase Storage 資訊
2. 開啟 `.env`，設定：

```env
# 使用 SQLite（單檔資料庫）
DATABASE_URL="file:./dev.db"

# 儲存模式（圖片仍用 Supabase）
STORAGE_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...

# Next.js 設定
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. 啟動：

```bash
npm install
npx prisma migrate dev  # 自動建立 dev.db 檔案
npx prisma db seed
npm run dev
```

---

#### 4. 混合模式（進階）

**適合：** 想模擬生產環境，但保留熱重載功能

**步驟：**

```bash
# 1. 只啟動資料庫和儲存（不跑 Next.js）
docker-compose up postgres minio minio_init

# 2. 設定環境變數（連接到 Docker 服務）
cp .env.example .env
```

編輯 `.env`：

```env
DATABASE_URL="postgresql://fhn_user:fhn_password@localhost:5432/fhn_db"

STORAGE_MODE=minio
MINIO_ENDPOINT=localhost  # 注意：本地用 localhost，不是 minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minio_admin
MINIO_SECRET_KEY=minio_password
MINIO_BUCKET=images
MINIO_USE_SSL=false

NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

啟動：

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

---

## 🏗️ 技術架構

### 技術棧總覽

```
前端層
  ├── Next.js 15 (App Router)
  ├── React 19
  ├── TailwindCSS 4
  └── ShadcnUI Components

API 層
  ├── Next.js API Routes
  ├── RESTful API
  └── 儲存抽象層 (lib/storage.js)

資料層
  ├── Prisma ORM
  ├── PostgreSQL (生產)
  ├── SQLite (開發)
  └── MinIO / Supabase Storage

部署層
  ├── Docker
  ├── Docker Compose
  └── Multi-stage Build
```

### 核心依賴

```json
{
  "dependencies": {
    "next": "15.3.2",
    "react": "^19.0.0",
    "@prisma/client": "^6.7.0",
    "@supabase/supabase-js": "^2.49.4",
    "@aws-sdk/client-s3": "^3.933.0",
    "@monaco-editor/react": "^4.7.0",
    "react-markdown": "^10.1.0"
  }
}
```

---

## 📁 專案結構

```
fhn/
├── app/                        # Next.js App Router
│   ├── api/                    # API 路由
│   │   ├── images/route.js     # 圖片上傳 API
│   │   ├── news/route.js       # 新聞 CRUD API
│   │   └── tags/route.js       # 標籤管理 API
│   ├── admin/                  # 後台管理介面
│   │   └── news/
│   │       ├── new/page.jsx    # 新增新聞
│   │       └── [id]/page.jsx   # 編輯新聞
│   ├── news/                   # 前台新聞頁
│   │   └── [id]/page.js        # 新聞詳情頁
│   ├── layout.js               # 全域佈局
│   ├── page.jsx                # 首頁
│   └── globals.css             # 全域樣式
│
├── components/                 # React 元件
│   ├── ui/                     # ShadcnUI 元件
│   ├── AdminNewsEditor.jsx     # 後台編輯器
│   ├── NavBar.jsx              # 導航列
│   └── TagSelector.jsx         # 標籤選擇器
│
├── lib/                        # 工具函式庫
│   ├── prisma.js              # Prisma 客戶端單例
│   ├── storage.js             # 儲存抽象層（MinIO/Supabase）
│   └── supabase.js            # Supabase 客戶端
│
├── prisma/                     # 資料庫相關
│   ├── schema.prisma          # Prisma Schema 定義
│   ├── migrations/            # 資料庫遷移歷史
│   │   ├── 20250508130018_add_news_tag_image_models/
│   │   └── 20250508142159_fix_relations/
│   └── seed.js                # 種子資料腳本
│
├── public/                     # 靜態資源
│
├── docker-compose.yml          # Docker Compose 設定
├── Dockerfile                  # Docker 映像檔定義
├── docker-entrypoint.sh        # 容器啟動腳本
├── .dockerignore               # Docker 忽略檔案
│
├── .env                        # 環境變數（不提交）
├── .env.example                # 環境變數範本
├── .env.docker                 # Docker 專用範本
│
├── README.md                   # 本文件
├── ENV_GUIDE.md                # 環境變數詳細說明
├── DOCKER_SETUP.md             # Docker 完整指南
├── QUICKSTART.md               # 快速開始指南
├── DEPLOYMENT_CHECKLIST.md    # 部署檢查清單
├── MIGRATION_SUMMARY.md        # 遷移總結
│
├── package.json                # npm 設定
├── next.config.mjs             # Next.js 設定
├── tailwind.config.js          # TailwindCSS 設定
├── postcss.config.mjs          # PostCSS 設定
└── .gitignore                  # Git 忽略檔案
```

---

## 🔐 環境變數設定

### 檔案架構

```
.env              ← 你的私人設定（❌ 不提交到 Git）
.env.example      ← 開發模式範本（✅ 提交）
.env.docker       ← Docker 專用範本（✅ 提交）
```

### 快速選擇

| 使用場景 | 指令 |
|---------|------|
| **Docker 部署** | `cp .env.docker .env` |
| **本地開發** | `cp .env.example .env` → 編輯 |

### 環境變數說明

#### 資料庫

```env
# PostgreSQL（Supabase 或 Docker）
DATABASE_URL="postgresql://user:password@host:5432/database"

# SQLite（開發用）
DATABASE_URL="file:./dev.db"
```

#### 儲存模式

```env
# 選擇儲存後端（minio 或 supabase）
STORAGE_MODE=minio
```

#### MinIO 設定（Docker 環境）

```env
MINIO_ENDPOINT=minio          # Docker 內用服務名稱
MINIO_PORT=9000
MINIO_ACCESS_KEY=minio_admin
MINIO_SECRET_KEY=minio_password
MINIO_BUCKET=images
MINIO_USE_SSL=false
```

**本地連 Docker 的 MinIO：**

```env
MINIO_ENDPOINT=localhost      # 改成 localhost
```

#### Supabase Storage 設定

```env
STORAGE_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
```

#### Next.js 設定

```env
NODE_ENV=development          # 或 production
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**詳細說明：** [ENV_GUIDE.md](ENV_GUIDE.md)

---

## ⚙️ 常用指令

### 開發指令

```bash
# 安裝依賴
npm install

# 開發模式（熱重載）
npm run dev

# 生產建置
npm run build

# 啟動生產伺服器
npm start

# Lint 檢查
npm run lint
```

### Docker 指令

```bash
# 啟動所有服務（前景）
docker-compose up

# 背景執行
docker-compose up -d

# 查看日誌
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f minio

# 停止服務
docker-compose down

# 停止並刪除資料（⚠️ 危險）
docker-compose down -v

# 重新建置映像檔
docker-compose build --no-cache

# 重啟單一服務
docker-compose restart app

# 進入容器
docker-compose exec app sh
docker-compose exec postgres psql -U fhn_user -d fhn_db
```

---

## 💾 資料庫管理

### Prisma 指令

```bash
# 建立新 migration
npx prisma migrate dev --name description

# 執行 migration（生產環境）
npx prisma migrate deploy

# 重置資料庫（⚠️ 會刪除所有資料）
npx prisma migrate reset

# 播種資料
npx prisma db seed

# 生成 Prisma Client
npx prisma generate

# 開啟 Prisma Studio（視覺化工具）
npx prisma studio
```

### Schema 結構

```prisma
// prisma/schema.prisma

model News {
  id          String   @id @default(cuid())
  homeTitle   String
  title       String
  subtitle    String?
  contentMD   String
  contentHTML String
  coverImage  String?
  createdAt   DateTime @default(now())

  images Image[]
  tags   Tag[]
}

model Tag {
  id   String @id @default(cuid())
  name String @unique
  news News[]
}

model Image {
  id        String   @id @default(cuid())
  url       String
  path      String
  newsId    String?
  news      News?    @relation(fields: [newsId], references: [id])
  createdAt DateTime @default(now())
}
```

### 資料庫備份

#### PostgreSQL（Docker）

```bash
# 匯出
docker-compose exec postgres pg_dump -U fhn_user fhn_db > backup.sql

# 匯入
docker-compose exec -T postgres psql -U fhn_user -d fhn_db < backup.sql
```

#### SQLite

```bash
# 備份
cp dev.db dev.db.backup

# 還原
cp dev.db.backup dev.db
```

---

## 🐳 Docker 部署

### 架構圖

```
┌─────────────────────────────────────┐
│         Docker Compose              │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │PostgreSQL│  │  MinIO   │        │
│  │  :5432   │  │ :9000/01 │        │
│  └────┬─────┘  └─────┬────┘        │
│       │              │              │
│       └──────┬───────┘              │
│              │                      │
│         ┌────▼─────┐                │
│         │ Next.js  │                │
│         │  :3000   │                │
│         └──────────┘                │
│              │                      │
└──────────────┼──────────────────────┘
               │
          ┌────▼────┐
          │ Browser │
          └─────────┘
```

### 服務說明

| 服務 | 映像檔 | 連接埠 | 用途 |
|------|--------|-------|------|
| postgres | postgres:17-alpine | 5432 | 資料庫 |
| minio | minio/minio | 9000, 9001 | 物件儲存 |
| app | fhn:latest（自建） | 3000 | Next.js 應用 |

### 啟動流程

```bash
# 1. 設定環境變數
cp .env.docker .env

# 2. 啟動（首次會自動建置）
docker-compose up

# 觀察啟動順序：
# Step 1: PostgreSQL 啟動 → 健康檢查通過
# Step 2: MinIO 啟動 → 建立 images bucket
# Step 3: Next.js 啟動 → 執行 migration → 播種資料
# Step 4: 服務就緒
```

### 資料持久化

Docker Compose 使用 named volumes 儲存資料：

```yaml
volumes:
  postgres_data:    # 資料庫檔案
  minio_data:       # 上傳的圖片
```

**查看 volumes：**

```bash
docker volume ls | grep fhn
```

**備份 volumes：**

```bash
# 備份資料庫
docker run --rm -v fhn_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# 備份圖片
docker run --rm -v fhn_minio_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/minio_backup.tar.gz -C /data .
```

**詳細 Docker 指南：** [DOCKER_SETUP.md](DOCKER_SETUP.md)

---

## 🚀 生產環境部署

### 部署前檢查清單

**必須完成：**

- [ ] 修改所有預設密碼
- [ ] 設定環境變數（DATABASE_URL, MINIO_SECRET_KEY 等）
- [ ] 設定反向代理（Nginx / Caddy）
- [ ] 啟用 HTTPS（Let's Encrypt）
- [ ] 設定資料庫備份策略
- [ ] 設定監控與告警
- [ ] 測試容錯機制

**完整清單：** [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

### 安全設定

#### 1. 修改密碼

**`.env` 檔案：**

```env
# ⚠️ 必須修改為強密碼！
DATABASE_URL="postgresql://fhn_user:YOUR_STRONG_PASSWORD@postgres:5432/fhn_db"
MINIO_SECRET_KEY=YOUR_LONG_SECURE_SECRET_KEY_MIN_32_CHARS
```

**`docker-compose.yml` 檔案：**

```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: YOUR_STRONG_PASSWORD  # 與 DATABASE_URL 一致

minio:
  environment:
    MINIO_ROOT_PASSWORD: YOUR_LONG_SECURE_SECRET_KEY_MIN_32_CHARS
```

#### 2. 設定 Nginx 反向代理

```nginx
# /etc/nginx/sites-available/fhn

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3. 啟用 HTTPS

```bash
# 使用 Certbot（Let's Encrypt）
sudo certbot --nginx -d yourdomain.com
```

---

### 效能最佳化

#### 設定資源限制

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

#### 啟用 Redis 快取（選配）

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

---

## 🔧 疑難排解

### 常見問題

#### Q1: 連接埠被佔用

**症狀：**
```
Error: Bind for 0.0.0.0:3000 failed: port is already allocated
```

**解決：**

```bash
# 方法 1：找出佔用的程式並關閉
lsof -i :3000
kill -9 <PID>

# 方法 2：修改 docker-compose.yml
ports:
  - "8080:3000"  # 改用 8080
```

---

#### Q2: 資料庫連線失敗

**症狀：**
```
PrismaClientInitializationError: Can't reach database server
```

**解決：**

```bash
# 1. 確認 PostgreSQL 容器狀態
docker-compose ps postgres

# 2. 查看資料庫日誌
docker-compose logs postgres

# 3. 確認環境變數
docker-compose exec app env | grep DATABASE_URL

# 4. 重啟服務
docker-compose restart postgres app
```

---

#### Q3: 圖片上傳失敗

**症狀：** 上傳圖片時顯示錯誤

**MinIO 模式：**

```bash
# 檢查 MinIO 健康狀態
curl http://localhost:9000/minio/health/live

# 重新建立 bucket
docker-compose up minio_init

# 手動建立（訪問 http://localhost:9001）
```

**Supabase 模式：**

1. 訪問 Supabase Dashboard
2. Storage → 確認 `images` bucket 存在
3. 確認 bucket 設為 Public
4. 檢查環境變數中的 `SUPABASE_SERVICE_KEY`

---

#### Q4: Docker 建置失敗

**症狀：** `docker-compose build` 過程中斷

**解決：**

```bash
# 清除快取重建
docker-compose build --no-cache --pull

# 如果記憶體不足，增加 Docker Desktop 記憶體配置
# （建議至少 4GB）
```

---

#### Q5: Migration 失敗

**症狀：**
```
Error: P3009: Migration ... failed to apply cleanly
```

**解決：**

```bash
# 開發環境：重置資料庫
npx prisma migrate reset

# 生產環境：檢查 migration 衝突
npx prisma migrate resolve --applied <migration_name>
```

---

## 📚 進階主題

### 自訂儲存後端

專案使用抽象化的儲存層 ([lib/storage.js](lib/storage.js))，可輕鬆擴展：

```javascript
// lib/storage.js

export async function uploadFile(file, fileName) {
  if (STORAGE_MODE === "minio") {
    return uploadToMinio(file, fileName);
  } else if (STORAGE_MODE === "supabase") {
    return uploadToSupabase(file, fileName);
  } else if (STORAGE_MODE === "s3") {
    // 新增 AWS S3 支援
    return uploadToS3(file, fileName);
  }
}
```

---

### 水平擴展

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      replicas: 3  # 執行 3 個應用程式實例

  nginx:
    image: nginx:alpine
    # 設定 load balancer
```

---

### 監控與日誌

```yaml
# docker-compose.yml
services:
  prometheus:
    image: prom/prometheus

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
```

---

## 🤝 貢獻指南

### 如何貢獻

1. Fork 本專案
2. 建立功能分支：`git checkout -b feature/amazing-feature`
3. 提交變更：`git commit -m 'Add some amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 建立 Pull Request

### 程式碼規範

```bash
# 執行 Lint 檢查
npm run lint

# 自動修復
npm run lint -- --fix
```

---

## 📖 相關文件

| 文件 | 說明 |
|------|------|
| [ENV_GUIDE.md](ENV_GUIDE.md) | 環境變數完整指南 |
| [DOCKER_SETUP.md](DOCKER_SETUP.md) | Docker 部署詳細說明 |
| [QUICKSTART.md](QUICKSTART.md) | 30 秒快速開始 |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | 部署前檢查清單 |
| [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) | Docker 化遷移總結 |

---

## 🔗 社群連結

- [Threads](https://www.threads.com/@farhorizonnews?igshid=NTc4MTIwNjQ2YQ==)
- [Instagram](https://www.instagram.com/farhorizonnews?igsh=eng1ZThsazJlZmRo)
- [Facebook]()
- [Website]()

---

## 📄 授權

本專案採用 MIT License - 詳見 [LICENSE](LICENSE) 檔案

---

## 🙏 致謝

感謝以下開源專案：

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Supabase](https://supabase.com/)
- [MinIO](https://min.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [ShadcnUI](https://ui.shadcn.com/)

---

<div align="center">

**使用愉快！** 🎉

如有問題，歡迎[建立 Issue](https://github.com/your-repo/fhn/issues)

Made with ❤️ by FHN Team

</div>
