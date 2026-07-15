# 快速開始指南

## 30 秒上手

### Docker 模式（一鍵部署）

```bash
git clone <repository>
cd fhn
cp .env.docker .env
docker-compose up
```

訪問：http://localhost:3000

---

### 本地開發模式

```bash
git clone <repository>
cd fhn
cp .env.example .env

# 編輯 .env，填入你的 Supabase 資訊
# 或啟用 SQLite 模式（取消註解）

npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

訪問：http://localhost:3000

---

## 環境變數檔案說明

| 檔案 | 用途 | 提交到 Git？ |
|------|------|-------------|
| `.env` | 你的私人設定 | ❌ 不要 |
| `.env.example` | 開發模式範本 | ✅ 要 |
| `.env.docker` | Docker 模式範本 | ✅ 要 |

---

## 選擇你的模式

### 🐳 Docker 模式

**適合：** 快速測試、生產部署

```bash
cp .env.docker .env
docker-compose up
```

**包含服務：**
- PostgreSQL（資料庫）
- MinIO（儲存）
- Next.js（網站）

---

### ☁️ Supabase 模式

**適合：** 初學者、不想裝資料庫

```bash
cp .env.example .env
# 填入 Supabase 連線資訊（見 ENV_GUIDE.md）
npm run dev
```

**需要：** Supabase 帳號（免費）

---

### 📦 SQLite 模式

**適合：** 快速開發、離線環境

```bash
cp .env.example .env
# 啟用「場景 2」設定（見檔案內註解）
npm run dev
```

**優點：** 零依賴，單檔資料庫

---

## 常用指令

### Docker

```bash
# 啟動
docker-compose up

# 背景執行
docker-compose up -d

# 停止
docker-compose down

# 查看 logs
docker-compose logs -f app

# 重建
docker-compose build --no-cache
```

### 開發

```bash
# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 啟動生產伺服器
npm start

# Lint 檢查
npm run lint
```

### 資料庫

```bash
# 執行 migration
npx prisma migrate dev

# 重置資料庫
npx prisma migrate reset

# 播種資料
npx prisma db seed

# 開啟 Prisma Studio（視覺化工具）
npx prisma studio
```

---

## 疑難排解

### 連接埠被佔用

```bash
# 找出佔用 3000 的程式
lsof -i :3000

# 或修改 docker-compose.yml
ports:
  - "8080:3000"  # 改用 8080
```

### 資料庫連線失敗

```bash
# 檢查資料庫是否執行中
docker-compose ps postgres

# 查看 logs
docker-compose logs postgres

# 重啟
docker-compose restart postgres app
```

### 圖片上傳失敗

```bash
# MinIO 模式：檢查 bucket 是否存在
docker-compose up minio_init

# 或手動建立（訪問 http://localhost:9001）

# Supabase 模式：檢查 bucket 設定
# 1. 訪問 Supabase Dashboard
# 2. Storage → 確認 images bucket 存在且為 Public
```

---

## 下一步

- 📖 詳細文件：[README.md](README.md)
- 🔧 環境變數說明：[ENV_GUIDE.md](ENV_GUIDE.md)
- 🐳 Docker 詳細指南：[DOCKER_SETUP.md](DOCKER_SETUP.md)
- ✅ 部署檢查清單：[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

**就是這麼簡單！** 🚀
