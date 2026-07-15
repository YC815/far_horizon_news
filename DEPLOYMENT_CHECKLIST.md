# 部署前檢查清單

在正式部署前，請確認以下項目。

---

## 基礎環境檢查

- [ ] Docker 已安裝（`docker --version`）
- [ ] Docker Compose 已安裝（`docker-compose --version`）
- [ ] 至少 2GB 可用記憶體
- [ ] 至少 5GB 可用磁碟空間

---

## 檔案完整性檢查

執行以下指令確認所有必要檔案存在：

```bash
# 檢查 Docker 相關檔案
ls -la | grep -E "(docker|Dockerfile|env)"

# 應該看到：
# - docker-compose.yml
# - Dockerfile
# - docker-entrypoint.sh
# - .dockerignore
# - .env.docker
# - .env.local.example
```

---

## 環境變數設定

- [ ] 已複製環境變數範本：`cp .env.docker .env`
- [ ] **生產環境必須修改預設密碼：**

```bash
# 開啟 .env 並修改以下值
POSTGRES_PASSWORD=<your_secure_password>
MINIO_ROOT_PASSWORD=<your_minio_password>
```

- [ ] 確認儲存模式正確：

```env
STORAGE_MODE=minio  # Docker 環境用 minio
```

---

## 安全性檢查（生產環境）

- [ ] 已修改所有預設密碼
- [ ] 資料庫密碼長度 > 16 字元
- [ ] MinIO 密碼長度 > 16 字元
- [ ] 已設定防火牆規則（僅開放必要連接埠）
- [ ] 已規劃 HTTPS 設定（透過反向代理）

---

## 啟動前測試

### 1. 語法檢查

```bash
# 檢查 docker-compose.yml 語法
docker-compose config

# 應該看到完整配置輸出，無錯誤訊息
```

### 2. 連接埠可用性

```bash
# 確認連接埠未被佔用
lsof -i :3000   # 應用程式
lsof -i :5432   # PostgreSQL
lsof -i :9000   # MinIO API
lsof -i :9001   # MinIO Console

# 如果有程式佔用，請先關閉或修改 docker-compose.yml 中的連接埠映射
```

### 3. Dockerfile 驗證

```bash
# 檢查啟動腳本可執行權限
ls -l docker-entrypoint.sh

# 如果沒有執行權限，執行：
chmod +x docker-entrypoint.sh
```

---

## 首次啟動流程

### 步驟 1：建置映像檔

```bash
docker-compose build

# 預期：
# - 下載 base images（node:20-alpine, postgres:17, minio）
# - 安裝 npm 依賴
# - 建置 Next.js
# - 總耗時約 5-10 分鐘
```

### 步驟 2：啟動服務（前景模式，方便觀察）

```bash
docker-compose up

# 預期看到的訊息順序：
# 1. PostgreSQL 啟動
# 2. MinIO 啟動
# 3. MinIO bucket 初始化
# 4. Next.js 應用程式啟動
# 5. 執行 Prisma migration
# 6. 載入種子資料
# 7. "🎬 Starting Next.js server..."
```

### 步驟 3：驗證服務

**在另一個終端機執行：**

```bash
# 1. 檢查容器狀態（應該都是 healthy 或 running）
docker-compose ps

# 2. 測試網站
curl http://localhost:3000

# 3. 測試 API
curl http://localhost:3000/api/news

# 4. 測試 MinIO
curl http://localhost:9000/minio/health/live
```

---

## 啟動後驗證清單

- [ ] 瀏覽器訪問 http://localhost:3000 可以看到網站
- [ ] 網站首頁顯示 3 則範例新聞
- [ ] MinIO Console (http://localhost:9001) 可以登入
- [ ] MinIO 中存在 `images` bucket
- [ ] 後台新聞編輯功能正常（http://localhost:3000/admin/news/new）
- [ ] 圖片上傳功能正常

---

## 常見啟動問題

### 問題 1：PostgreSQL 健康檢查失敗

**症狀：**
```
postgres | server started
postgres | ERROR: database "fhn_db" does not exist
```

**原因：** 首次啟動時資料庫尚未建立

**解決：** 等待約 10 秒，PostgreSQL 會自動建立資料庫

---

### 問題 2：應用程式無法連接資料庫

**症狀：**
```
app | ❌ Can't reach database server
```

**解決：**
```bash
# 1. 確認 PostgreSQL 正在執行
docker-compose ps postgres

# 2. 檢查資料庫連線字串
docker-compose exec app env | grep DATABASE_URL

# 3. 重啟應用程式
docker-compose restart app
```

---

### 問題 3：MinIO bucket 不存在

**症狀：** 圖片上傳失敗，錯誤訊息 "Bucket does not exist"

**解決：**
```bash
# 重新執行 bucket 初始化
docker-compose up minio_init

# 或手動建立（訪問 http://localhost:9001）
# 1. 登入 MinIO Console
# 2. Buckets > Create Bucket
# 3. 名稱輸入 "images"
# 4. Access Policy 選擇 "public"
```

---

### 問題 4：建置過程記憶體不足

**症狀：** 建置中斷或容器被 killed

**解決：**
1. 增加 Docker Desktop 記憶體配置（至少 4GB）
2. 或使用較小的 builder：

```yaml
# docker-compose.yml
app:
  build:
    args:
      NODE_OPTIONS: "--max-old-space-size=2048"
```

---

## 停止與清理

### 正常停止

```bash
# Ctrl+C 停止前景服務

# 或背景服務用
docker-compose down
```

### 完全清理（包含資料）

```bash
# ⚠️ 警告：這會刪除所有資料（資料庫 + 圖片）
docker-compose down -v

# 確認 volumes 已刪除
docker volume ls | grep fhn
```

---

## 生產部署額外檢查

- [ ] 已設定 Nginx/Caddy 反向代理
- [ ] 已設定 SSL 證書（Let's Encrypt）
- [ ] 已設定自動重啟策略（`restart: always`）
- [ ] 已設定資源限制（CPU/Memory limits）
- [ ] 已設定日誌輪替
- [ ] 已規劃備份策略（資料庫 + MinIO）
- [ ] 已設定監控（Prometheus/Grafana 等）
- [ ] 已設定告警通知

---

## 備份策略建議

### 自動備份腳本範例

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"

# 備份資料庫
docker-compose exec -T postgres pg_dump -U fhn_user fhn_db > "$BACKUP_DIR/db_$DATE.sql"

# 備份圖片
docker cp fhn_minio:/data/images "$BACKUP_DIR/images_$DATE"

# 保留最近 7 天的備份
find "$BACKUP_DIR" -mtime +7 -delete

echo "✅ Backup completed: $DATE"
```

加入 crontab：

```bash
# 每天凌晨 3 點備份
0 3 * * * /path/to/backup.sh >> /var/log/fhn_backup.log 2>&1
```

---

## 完成！

如果以上檢查都通過，您的應用程式已成功部署！

**下一步：**
- 閱讀 [README.md](README.md) 了解更多功能
- 閱讀 [DOCKER_SETUP.md](DOCKER_SETUP.md) 了解進階 Docker 操作
- 訪問 http://localhost:3000/admin/news/new 開始發布新聞

---

**祝使用愉快！** 🎉
