// server/db.js

import { MongoClient, ObjectId } from 'mongodb'; 
import dotenv from 'dotenv'; 

dotenv.config(); 

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/lab_database'; 
let client = null;
let db = null;

export async function connectDB() {
  if (db) return db; 
  
  try {
    client = new MongoClient(url); 
    await client.connect();
    db = client.db(); 
    console.log(" MongoDB connected successfully.");
    
    // --- 修正區域：安全的索引初始化 ---
    try {
      // 嘗試匯入索引設定，如果檔案不存在或沒匯出則跳過，不影響啟動
      const userRepo = await import('./repositories/users.js').catch(() => null);
      if (userRepo && typeof userRepo.initializeIndexes === 'function') {
        await userRepo.initializeIndexes();
      }

      const partRepo = await import('./repositories/participants.js').catch(() => null);
      if (partRepo && typeof partRepo.initializeIndexes === 'function') {
        await partRepo.initializeIndexes();
      }
    } catch (indexErr) {
      console.warn(" 索引初始化跳過或失敗，但不影響連線:", indexErr.message);
    }
    
    return db;
  } catch (error) {
    console.error(" MongoDB connection failed:", error.message);
    process.exit(1); 
  }
}

export function getDB() {
  if (!db) throw new Error('Database not initialized.');
  return db;
}

export function getCollection(name) {
  return getDB().collection(name);
}

export { ObjectId }; 

process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('\n[DB] Connection closed');
  }
  process.exit(0);
});