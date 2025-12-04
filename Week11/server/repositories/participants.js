// server/repositories/participants.js
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';

const collection = () => getDB().collection('participants');

const COLLECTION_NAME = 'participants';

// 新增一個初始化函式，用於確保索引存在
export async function initializeIndexes() {
  const coll = collection();
  // 建立 email 欄位的唯一索引
  await coll.createIndex(
    { email: 1 }, 
    { unique: true, name: "email_unique_index" }
  );
  console.log(`[DB] Index '${COLLECTION_NAME}.email' created/checked.`);
}

export async function createParticipant(data) {
  const result = await collection().insertOne({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return result.insertedId;
}


export async function listParticipants(page = 1, limit = 10) {
    const skip = (page - 1) * limit; // 計算跳過的筆數
    
    // 1. 取得分頁資料
    const participants = await collection()
        .find({}) 
        .sort({ createdAt: -1 })
        .skip(skip)   // <-- Mongo 的 skip 實作
        .limit(limit) // <-- Mongo 的 limit 實作
        .toArray();
        
    // 2. 取得總筆數
    const total = await collection().countDocuments({}); 
    
    return { participants, total }; // 回傳清單和總數
}

export async function updateParticipant(id, patch) {
  return collection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...patch, updatedAt: new Date() } }
  );
}

export function deleteParticipant(id) {
  return collection().deleteOne({ _id: new ObjectId(id) });
}
