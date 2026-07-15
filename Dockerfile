# 多階段建置，減少最終映像檔大小

# ============================================
# 階段 1: 依賴安裝
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# 複製 package 檔案
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# 安裝依賴（使用 npm）
# 注意：pnpm-lock.yaml 存在但過期，優先使用 package-lock.json
RUN \
  if [ -f package-lock.json ]; then \
    npm ci; \
  else \
    npm install; \
  fi

# ============================================
# 階段 2: 建置應用程式
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# 複製依賴
COPY --from=deps /app/node_modules ./node_modules

# 複製原始碼
COPY . .

# 設定環境變數（建置時需要）
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 生成 Prisma Client
RUN npx prisma generate

# 建置 Next.js
RUN npm run build

# ============================================
# 階段 3: 生產執行環境
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# 建立非 root 使用者
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 複製 Prisma schema 和 migration
COPY --chown=nextjs:nodejs prisma ./prisma

# 複製 node_modules（只包含生產依賴）
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# 複製建置產物
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# 複製啟動腳本（先不改權限，以 root 執行 chmod）
COPY docker-entrypoint.sh ./

# 設定權限（root 執行）
RUN chmod +x docker-entrypoint.sh && \
    chown nextjs:nodejs docker-entrypoint.sh

# 環境變數
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 切換到非 root 使用者
USER nextjs

# 暴露連接埠
EXPOSE 3000

# 啟動腳本（執行 migration 後啟動應用）
ENTRYPOINT ["./docker-entrypoint.sh"]
