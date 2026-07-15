#!/bin/sh
set -e

echo "🚀 Starting FHN application..."

# 等待資料庫準備就緒
echo "⏳ Waiting for PostgreSQL to be ready..."
until npx prisma db execute --schema=./prisma/schema.prisma --stdin <<EOF
SELECT 1;
EOF
do
  echo "💤 PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is up"

# 執行資料庫 migration
echo "🔄 Running database migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

# 執行種子資料（如果存在且是首次啟動）
if [ -f "prisma/seed.js" ]; then
  echo "🌱 Seeding database..."
  npx prisma db seed || echo "⚠️  Seed skipped (may already exist)"
fi

echo "✅ Database ready"

# 啟動 Next.js
echo "🎬 Starting Next.js server..."
exec node_modules/.bin/next start
