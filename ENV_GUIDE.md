# 環境變數使用指南

## 檔案架構一覽

```
專案根目錄/
├── .env                 # ❌ 你的私人設定（不提交到 Git）
├── .env.example         # ✅ 範本檔案（給其他開發者參考）
├── .env.docker          # ✅ Docker Compose 專用範本
└── ENV_GUIDE.md         # 📖 本說明文件
```

---

## 快速選擇

根據你的使用場景，選擇對應的設定方式：

| 場景 | 使用檔案 | 指令 | 適合對象 |
|------|---------|------|----------|
| **Docker 一鍵部署** | `.env.docker` | `cp .env.docker .env && docker-compose up` | 測試、生產部署 |
| **本地開發（Supabase）** | `.env.example` | `cp .env.example .env` → 編輯 | 初學者 |
| **本地開發（SQLite）** | `.env.example` | `cp .env.example .env` → 取消場景2註解 | 快速開發 |
| **混合模式** | `.env.example` | `cp .env.example .env` → 取消場景3註解 | 進階開發者 |

---

## 場景 1：Docker 一鍵部署（推薦）

### 適用對象
- 想快速測試完整系統
- 生產環境部署
- 不想手動設定資料庫

### 步驟

```bash
# 1. 複製 Docker 專用環境變數
cp .env.docker .env

# 2. （可選）修改密碼
# 開啟 .env，修改 fhn_password 和 minio_password

# 3. 啟動
docker-compose up
```

### 包含的服務
- ✅ PostgreSQL 17（資料庫）
- ✅ MinIO（檔案儲存）
- ✅ Next.js（網站）

### 訪問
- 網站：http://localhost:3000
- MinIO Console：http://localhost:9001

---

## 場景 2：本地開發 + Supabase

### 適用對象
- 不想安裝資料庫
- 想用雲端服務
- 團隊協作（共用資料庫）

### 步驟

#### 2.1 建立 Supabase 專案

1. 前往 https://supabase.com 註冊（免費）
2. 建立新專案
3. 等待專案初始化（約 2 分鐘）

#### 2.2 取得連線資訊

在 Supabase Dashboard：

1. **Settings** → **Database**
   - 複製 `Connection string (URI)`
   - 格式：`postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

2. **Settings** → **API**
   - 複製 `Project URL`（`NEXT_PUBLIC_SUPABASE_URL`）
   - 複製 `service_role key`（`SUPABASE_SERVICE_KEY`）

3. **Storage** → **Create a new bucket**
   - Bucket name: `images`
   - Public bucket: ✅ 勾選
   - 點擊 Create

#### 2.3 設定環境變數

```bash
# 1. 複製範本
cp .env.example .env

# 2. 開啟 .env，找到「場景 1」的區塊，填入資訊：
# DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
# NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
# SUPABASE_SERVICE_KEY=eyJhbGc...（從 Dashboard 複製）
```

#### 2.4 啟動

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### 優點
- 零安裝（無需本地資料庫）
- 免費方案夠用（500MB 資料庫 + 1GB 儲存）
- 團隊可共用同一個專案

### 缺點
- 需要網路連線
- 免費方案有使用限制

---

## 場景 3：本地開發 + SQLite

### 適用對象
- 離線開發
- 快速原型驗證
- 不想依賴外部服務

### 步驟

```bash
# 1. 複製範本
cp .env.example .env

# 2. 開啟 .env，啟用「場景 2」的設定
#    刪除前面的 # 號即可

# 3. 設定 Supabase Storage（SQLite 只能儲存資料，檔案仍需雲端）
#    按照「場景 2」的步驟 2.2 取得 Supabase 資訊

# 4. 啟動
npm install
npx prisma migrate dev  # 會自動建立 dev.db
npx prisma db seed
npm run dev
```

### 優點
- 最快速（資料庫是單一檔案）
- 無需安裝 PostgreSQL
- 離線可用（除了圖片上傳）

### 缺點
- 檔案儲存仍需 Supabase
- 不適合生產環境
- 無法多人同時開發（檔案鎖）

---

## 場景 4：混合模式（進階）

### 適用對象
- 想模擬生產環境
- 需要熱重載（npm run dev）
- 不想完全跑 Docker

### 步驟

```bash
# 1. 只啟動資料庫和儲存（不跑應用程式）
docker-compose up postgres minio minio_init

# 2. 複製範本並啟用「場景 3」
cp .env.example .env
# 開啟 .env，取消「場景 3」的註解

# 3. 本地啟動應用程式
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### 優點
- 使用 PostgreSQL（與生產環境一致）
- 支援熱重載（修改程式碼立即生效）
- 完全本地化（無需 Supabase）

### 缺點
- 需要 Docker
- 設定較複雜

---

## 環境變數詳解

### 資料庫相關

```env
# PostgreSQL（Supabase 或 Docker）
DATABASE_URL="postgresql://user:password@host:5432/database"

# SQLite（檔案資料庫）
DATABASE_URL="file:./dev.db"
```

**重點：**
- Docker 環境用 `@postgres:5432`（服務名稱）
- 本地連 Docker 用 `@localhost:5432`（主機名）

---

### 儲存相關

```env
# 儲存模式（minio 或 supabase）
STORAGE_MODE=minio
```

#### MinIO 設定（Docker 環境）

```env
MINIO_ENDPOINT=minio      # Docker 內用服務名稱
MINIO_PORT=9000
MINIO_ACCESS_KEY=minio_admin
MINIO_SECRET_KEY=minio_password
MINIO_BUCKET=images
MINIO_USE_SSL=false
```

**本地連 Docker 的 MinIO：**

```env
MINIO_ENDPOINT=localhost  # 改成 localhost
MINIO_PORT=9000
# 其他不變
```

#### Supabase Storage 設定

```env
STORAGE_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
```

---

### Next.js 設定

```env
# 開發模式
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# 生產模式（Docker）
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://localhost:3000

# 生產模式（伺服器）
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

---

## 常見問題

### Q1：我該用哪個場景？

**快速回答表：**

| 問題 | 推薦場景 |
|------|---------|
| 我想最快看到網站 | 場景 1（Docker） |
| 我不想裝 Docker | 場景 2（Supabase） |
| 我想離線開發 | 場景 3（SQLite） |
| 我是進階開發者 | 場景 4（混合） |

---

### Q2：`.env` 要提交到 Git 嗎？

**❌ 絕對不要！**

`.env` 包含敏感資訊（密碼、API 金鑰），已在 `.gitignore` 中。

**✅ 應該提交：**
- `.env.example`（範本）
- `.env.docker`（Docker 範本）
- `ENV_GUIDE.md`（本文件）

---

### Q3：如何切換場景？

直接修改 `.env` 即可，不需重新安裝依賴：

```bash
# 從 Supabase 切換到 Docker MinIO
vim .env
# 修改 STORAGE_MODE=supabase → STORAGE_MODE=minio
# 修改 MINIO_ENDPOINT 等相關設定

# 重啟應用程式
npm run dev  # 或 docker-compose restart app
```

---

### Q4：生產環境要改什麼？

**必須修改的：**

1. **資料庫密碼**
   ```env
   DATABASE_URL="postgresql://fhn_user:STRONG_PASSWORD_HERE@..."
   ```

2. **MinIO 密碼**（如果用 MinIO）
   ```env
   MINIO_ACCESS_KEY=your_secure_access_key
   MINIO_SECRET_KEY=your_very_long_secure_secret_key_min_16_chars
   ```

3. **API URL**
   ```env
   NEXT_PUBLIC_API_URL=https://yourdomain.com
   ```

4. **同步修改 docker-compose.yml**
   ```yaml
   postgres:
     environment:
       POSTGRES_PASSWORD: STRONG_PASSWORD_HERE  # 與 DATABASE_URL 一致

   minio:
     environment:
       MINIO_ROOT_USER: your_secure_access_key
       MINIO_ROOT_PASSWORD: your_very_long_secure_secret_key_min_16_chars
   ```

---

### Q5：如何確認設定正確？

```bash
# 檢查環境變數是否載入
node -e "console.log(process.env.DATABASE_URL)"

# 測試資料庫連線
npx prisma db execute --stdin <<< "SELECT 1;"

# 測試 MinIO 連線（如果用 MinIO）
curl http://localhost:9000/minio/health/live
```

---

## 環境變數優先順序

Next.js 載入環境變數的順序：

1. `.env.production.local`（生產模式）
2. `.env.local`（所有環境，除了 test）
3. `.env.production`（生產模式）
4. `.env.development`（開發模式）
5. `.env`（**我們使用這個**）

---

## 安全建議

### ✅ 應該做的

- 使用強密碼（至少 16 字元）
- 定期更換密碼
- 不同環境用不同密碼
- 使用 `.env.example` 分享範本（不包含真實密碼）

### ❌ 不應該做的

- 將 `.env` 提交到 Git
- 在公開場合分享 `.env` 內容
- 在程式碼中寫死密碼
- 使用預設密碼部署到生產環境

---

## 總結

**清晰的檔案架構：**

```
.env              ← 你的私人設定（不提交）
.env.example      ← 開發者參考範本
.env.docker       ← Docker 專用範本
ENV_GUIDE.md      ← 使用說明
```

**選擇場景：**
- 🚀 快速測試 → 場景 1（Docker）
- 👶 初學者 → 場景 2（Supabase）
- ⚡ 快速開發 → 場景 3（SQLite）
- 🔧 進階開發 → 場景 4（混合）

**記住：**
- `.env` 永遠不提交
- 生產環境必須改密碼
- 有問題查看本文件

---

**還有問題？** 查看 [README.md](README.md) 或建立 Issue
