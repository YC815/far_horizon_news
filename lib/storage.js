// lib/storage.js
/**
 * 儲存抽象層：支援 MinIO 和 Supabase Storage
 *
 * 環境變數：
 * - STORAGE_MODE: "minio" 或 "supabase"
 *
 * MinIO 需要：
 * - MINIO_ENDPOINT, MINIO_PORT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET
 *
 * Supabase 需要：
 * - NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

// ============================================
// 儲存模式判斷
// ============================================
const STORAGE_MODE = process.env.STORAGE_MODE || "supabase";

// ============================================
// MinIO Client（S3 相容）
// ============================================
let minioClient = null;

if (STORAGE_MODE === "minio") {
  const endpoint = process.env.MINIO_ENDPOINT || "localhost";
  const port = process.env.MINIO_PORT || "9000";
  const useSSL = process.env.MINIO_USE_SSL === "true";

  minioClient = new S3Client({
    endpoint: `${useSSL ? "https" : "http"}://${endpoint}:${port}`,
    region: "us-east-1", // MinIO 需要但不實際使用
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY,
      secretAccessKey: process.env.MINIO_SECRET_KEY,
    },
    forcePathStyle: true, // MinIO 必須
  });
}

// ============================================
// Supabase Client
// ============================================
let supabaseClient = null;

if (STORAGE_MODE === "supabase") {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️  Supabase 設定不完整，請檢查環境變數");
  } else {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
}

// ============================================
// 統一介面：上傳檔案
// ============================================
/**
 * 上傳檔案到儲存服務
 * @param {File} file - 檔案物件
 * @param {string} fileName - 檔案名稱（含路徑）
 * @returns {Promise<{url: string, path: string}>}
 */
export async function uploadFile(file, fileName) {
  if (STORAGE_MODE === "minio") {
    return uploadToMinio(file, fileName);
  } else if (STORAGE_MODE === "supabase") {
    return uploadToSupabase(file, fileName);
  } else {
    throw new Error(`不支援的儲存模式: ${STORAGE_MODE}`);
  }
}

// ============================================
// MinIO 上傳實作
// ============================================
async function uploadToMinio(file, fileName) {
  if (!minioClient) {
    throw new Error("MinIO client 未初始化");
  }

  const bucket = process.env.MINIO_BUCKET || "images";

  // 將 File 物件轉為 Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
  });

  await minioClient.send(command);

  // 建構公開 URL
  const endpoint = process.env.MINIO_ENDPOINT || "localhost";
  const port = process.env.MINIO_PORT || "9000";
  const useSSL = process.env.MINIO_USE_SSL === "true";

  const publicUrl = `${useSSL ? "https" : "http"}://${endpoint}:${port}/${bucket}/${fileName}`;

  return {
    url: publicUrl,
    path: fileName,
  };
}

// ============================================
// Supabase 上傳實作
// ============================================
async function uploadToSupabase(file, fileName) {
  if (!supabaseClient) {
    throw new Error("Supabase client 未初始化");
  }

  const { data, error } = await supabaseClient.storage
    .from("images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase 上傳失敗: ${error.message}`);
  }

  const { data: urlData } = supabaseClient.storage
    .from("images")
    .getPublicUrl(data.path);

  if (!urlData?.publicUrl) {
    throw new Error("Supabase 回傳空的 publicUrl");
  }

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

// ============================================
// 統一介面：刪除檔案
// ============================================
/**
 * 從儲存服務刪除檔案
 * @param {string} path - 檔案路徑
 * @returns {Promise<void>}
 */
export async function deleteFile(path) {
  if (STORAGE_MODE === "minio") {
    return deleteFromMinio(path);
  } else if (STORAGE_MODE === "supabase") {
    return deleteFromSupabase(path);
  } else {
    throw new Error(`不支援的儲存模式: ${STORAGE_MODE}`);
  }
}

// ============================================
// MinIO 刪除實作
// ============================================
async function deleteFromMinio(path) {
  if (!minioClient) {
    throw new Error("MinIO client 未初始化");
  }

  const bucket = process.env.MINIO_BUCKET || "images";

  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: path,
  });

  await minioClient.send(command);
}

// ============================================
// Supabase 刪除實作
// ============================================
async function deleteFromSupabase(path) {
  if (!supabaseClient) {
    throw new Error("Supabase client 未初始化");
  }

  const { error } = await supabaseClient.storage.from("images").remove([path]);

  if (error) {
    throw new Error(`Supabase 刪除失敗: ${error.message}`);
  }
}

// ============================================
// 工具函式：生成唯一檔案名稱
// ============================================
/**
 * 生成帶時間戳的唯一檔案名稱
 * @param {string} originalName - 原始檔案名稱
 * @returns {string}
 */
export function generateFileName(originalName) {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop();
  const baseName = originalName.split(".").slice(0, -1).join(".");

  return `${timestamp}-${randomSuffix}-${baseName}.${extension}`;
}

// ============================================
// 除錯資訊
// ============================================
console.log(`📦 Storage mode: ${STORAGE_MODE}`);
if (STORAGE_MODE === "minio") {
  console.log(
    `   MinIO endpoint: ${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`
  );
} else if (STORAGE_MODE === "supabase") {
  console.log(`   Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
}
