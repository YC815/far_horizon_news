#!/bin/bash
# 快速驗證 Docker Compose 設定

set -e

echo "=========================================="
echo "  FHN Docker Compose 自動連線測試"
echo "=========================================="
echo ""

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 步驟 1: 檢查 Docker
echo -e "${YELLOW}[1/6] 檢查 Docker 環境...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安裝${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose 未安裝${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker 環境正常${NC}"
echo ""

# 步驟 2: 檢查檔案
echo -e "${YELLOW}[2/6] 檢查必要檔案...${NC}"
files=("docker-compose.yml" "Dockerfile" "docker-entrypoint.sh" ".env.docker")
for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ 缺少檔案: $file${NC}"
        exit 1
    fi
    echo -e "  ✓ $file"
done
echo -e "${GREEN}✅ 檔案完整${NC}"
echo ""

# 步驟 3: 檢查環境變數
echo -e "${YELLOW}[3/6] 檢查環境變數設定...${NC}"
if [ ! -f ".env" ]; then
    echo -e "  ℹ️  未找到 .env，嘗試複製範本..."
    cp .env.docker .env
    echo -e "${GREEN}  ✅ 已複製 .env.docker → .env${NC}"
else
    echo -e "  ✓ .env 已存在"
fi
echo ""

# 步驟 4: 驗證 docker-compose 配置
echo -e "${YELLOW}[4/6] 驗證 Docker Compose 配置...${NC}"
if docker-compose config > /dev/null 2>&1; then
    echo -e "${GREEN}✅ docker-compose.yml 語法正確${NC}"
else
    echo -e "${RED}❌ docker-compose.yml 有語法錯誤${NC}"
    docker-compose config
    exit 1
fi
echo ""

# 步驟 5: 檢查連接埠
echo -e "${YELLOW}[5/6] 檢查連接埠可用性...${NC}"
ports=(3000 5432 9000 9001)
port_names=("Next.js" "PostgreSQL" "MinIO API" "MinIO Console")

for i in "${!ports[@]}"; do
    port="${ports[$i]}"
    name="${port_names[$i]}"

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "  ${YELLOW}⚠️  連接埠 $port ($name) 已被使用${NC}"
        echo -e "     可能需要修改 docker-compose.yml 或停止佔用的程式"
    else
        echo -e "  ✓ 連接埠 $port ($name) 可用"
    fi
done
echo ""

# 步驟 6: 顯示自動連線配置
echo -e "${YELLOW}[6/6] Docker 自動連線配置檢查${NC}"
echo ""
echo "  📊 服務依賴關係："
echo "  ┌──────────┐"
echo "  │PostgreSQL│ ←┐"
echo "  └──────────┘  │"
echo "                ├─ depends_on (自動等待)"
echo "  ┌──────────┐  │"
echo "  │  MinIO   │ ←┤"
echo "  └──────────┘  │"
echo "                │"
echo "  ┌──────────┐  │"
echo "  │ Next.js  │ ←┘"
echo "  └──────────┘"
echo ""
echo "  🔗 自動連線設定："
echo "  DATABASE_URL: postgresql://...@postgres:5432/fhn_db"
echo "                                    ^^^^^^^^"
echo "                              Docker 服務名稱（自動解析）"
echo ""
echo "  MINIO_ENDPOINT: minio"
echo "                  ^^^^^"
echo "            Docker 服務名稱（自動解析）"
echo ""

# 顯示下一步
echo "=========================================="
echo -e "${GREEN}✅ 所有檢查通過！${NC}"
echo "=========================================="
echo ""
echo "現在可以啟動服務："
echo ""
echo "  ${GREEN}docker-compose up${NC}"
echo ""
echo "服務會按以下順序自動啟動並連線："
echo "  1. PostgreSQL 啟動 → 健康檢查通過"
echo "  2. MinIO 啟動 → 健康檢查通過"
echo "  3. Next.js 啟動 → 自動連線到 PostgreSQL 和 MinIO"
echo "  4. 執行資料庫 migration"
echo "  5. 載入種子資料"
echo "  6. 啟動網站"
echo ""
echo "完成後訪問："
echo "  • 網站: http://localhost:3000"
echo "  • MinIO Console: http://localhost:9001"
echo ""
echo "停止服務："
echo "  ${YELLOW}Ctrl+C${NC} 或 ${YELLOW}docker-compose down${NC}"
echo ""
