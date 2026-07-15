# Docker 部署完整指南

本指南說明如何使用 Docker Compose 一鍵部署整個應用程式。

---

## 系統需求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用記憶體
- 至少 5GB 可用磁碟空間

---

## 快速啟動（3 步驟）

### 1. Clone 專案

```bash
git clone <repository-url>
cd fhn
```

### 2. 設定環境變數

```bash
cp .env.docker .env
```

**重要安全提醒：** 生產環境請修改 `.env` 中的密碼！

```env
# 修改這些預設值：
POSTGRES_PASSWORD=your_secure_password_here
MINIO_ROOT_PASSWORD=your_minio_password_here
```

### 3. 啟動服務

```bash
# 前景執行（可看到即時 log）
docker-compose up

# 或背景執行
docker-compose up -d
```

第一次啟動會：
1. 下載映像檔（PostgreSQL, MinIO）
2. 建置應用程式（約 5-10 分鐘）
3. 執行資料庫 migration
4. 載入種子資料

---

## 訪問服務

啟動完成後，可以訪問：

| 服務 | URL | 說明 |
|------|-----|------|
| **網站** | http://localhost:3000 | 主要應用程式 |
| **MinIO Console** | http://localhost:9001 | 物件儲存管理介面 |
| **PostgreSQL** | localhost:5432 | 資料庫（需客戶端工具） |

### MinIO Console 登入

- 帳號：`minio_admin`
- 密碼：`minio_password`（或你修改後的值）

---

## 常用指令

### 查看服務狀態

```bash
docker-compose ps
```

### 查看即時 logs

```bash
# 所有服務
docker-compose logs -f

# 特定服務
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f minio
```

### 停止服務

```bash
# 停止但保留資料
docker-compose down

# 停止並刪除所有資料（包含資料庫和圖片）
docker-compose down -v
```

### 重新建置

```bash
# 修改程式碼後重新建置
docker-compose build app

# 不使用快取重建（完全乾淨）
docker-compose build --no-cache app
```

### 重啟單一服務

```bash
docker-compose restart app
```

### 進入容器內部

```bash
# 進入應用程式容器
docker-compose exec app sh

# 進入資料庫容器
docker-compose exec postgres psql -U fhn_user -d fhn_db
```

---

## 資料持久化

Docker Compose 使用 named volumes 儲存資料：

- `postgres_data`：資料庫檔案
- `minio_data`：上傳的圖片

這些 volumes 會在容器刪除後保留。

### 查看 volumes

```bash
docker volume ls | grep fhn
```

### 備份資料庫

```bash
# 匯出 SQL
docker-compose exec postgres pg_dump -U fhn_user fhn_db > backup.sql

# 還原
docker-compose exec -T postgres psql -U fhn_user -d fhn_db < backup.sql
```

### 備份圖片

```bash
# 複製出來
docker cp fhn_minio:/data ./minio_backup

# 還原
docker cp ./minio_backup/. fhn_minio:/data
```

---

## 故障排除

### 問題 1：連接埠被佔用

```
Error: Bind for 0.0.0.0:3000 failed: port is already allocated
```

**解決方法：** 修改 `docker-compose.yml` 中的連接埠映射

```yaml
ports:
  - "8080:3000"  # 改用 8080
```

### 問題 2：資料庫連線失敗

**症狀：** 應用程式啟動時報錯 `Can't reach database server`

**解決方法：**

1. 確認 PostgreSQL 容器正在執行：

```bash
docker-compose ps postgres
```

2. 查看資料庫 logs：

```bash
docker-compose logs postgres
```

3. 重啟服務：

```bash
docker-compose restart postgres
docker-compose restart app
```

### 問題 3：MinIO 無法訪問

**症狀：** 圖片上傳失敗

**解決方法：**

1. 確認 MinIO 容器健康：

```bash
docker-compose ps minio
```

2. 重新執行 bucket 初始化：

```bash
docker-compose up minio_init
```

3. 手動建立 bucket（訪問 http://localhost:9001）

### 問題 4：應用程式無法啟動

**症狀：** `docker-compose up` 後應用程式持續重啟

**解決方法：**

1. 查看詳細 logs：

```bash
docker-compose logs app
```

2. 檢查環境變數：

```bash
docker-compose exec app env | grep -E "(DATABASE|MINIO)"
```

3. 重新建置：

```bash
docker-compose build --no-cache app
docker-compose up app
```

### 問題 5：記憶體不足

**症狀：** 建置過程中斷或容器被 killed

**解決方法：** 增加 Docker Desktop 的記憶體配置（建議至少 4GB）

---

## 開發模式

如果想要在 Docker 內即時看到程式碼修改：

1. 修改 `docker-compose.yml`：

```yaml
app:
  build:
    context: .
    target: deps  # 只建置到依賴階段
  command: npm run dev  # 改用開發模式
  volumes:
    - .:/app
    - /app/node_modules
    - /app/.next
```

2. 重啟：

```bash
docker-compose up app
```

**注意：** 開發模式會比較慢，建議本地開發用 `npm run dev`

---

## 生產部署建議

### 1. 安全設定

- [ ] 修改所有預設密碼
- [ ] 使用環境變數而非寫死在檔案
- [ ] 啟用 HTTPS（透過反向代理）
- [ ] 設定防火牆規則
- [ ] 定期更新映像檔

### 2. 效能最佳化

```yaml
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

### 3. 反向代理設定（Nginx）

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. 監控與日誌

```bash
# 設定 log rotation
docker-compose logs --tail=1000 app > app.log

# 或使用 Docker logging driver
```

---

## 從 Docker 遷移到其他環境

如果未來想改用其他部署方式：

1. 匯出資料庫：

```bash
docker-compose exec postgres pg_dump -U fhn_user fhn_db > migration.sql
```

2. 匯出圖片：

```bash
docker cp fhn_minio:/data/images ./images_backup
```

3. 在新環境匯入資料後修改 `.env`：

```env
DATABASE_URL="postgresql://new_host:5432/new_db"
STORAGE_MODE=supabase  # 或其他儲存服務
```

---

## 附錄：完整架構圖

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

---

## 更多資訊

- **官方文件**：README.md
- **開發指南**：本地開發請參閱 README.md「本地開發設定」章節
- **API 文件**：`/app/api/*`
- **問題回報**：GitHub Issues

---

**祝部署順利！** 🚀
