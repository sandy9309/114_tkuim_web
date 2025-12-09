// server/db.js

import { MongoClient, ObjectId } from 'mongodb'; 
import dotenv from 'dotenv'; 

dotenv.config(); 

const url = process.env.MONGODB_URI; 
let client = null;
let db = null;

export async function connectDB() {
  if (db) return db; 
  
  try {
    client = new MongoClient(url); 
    await client.connect();
    db = client.db(); 
    console.log(" MongoDB connected successfully.");
    
    const { initializeIndexes: initializeUserIndexes } = await import('./repositories/users.js');
    await initializeUserIndexes(); 
    const { initializeIndexes: initializeParticipantIndexes } = await import('./repositories/participants.js');
    await initializeParticipantIndexes(); 
    
    return db;
  } catch (error) {
    console.error(" MongoDB connection failed:", error.message);
    process.exit(1); 
  }
}

// 取得資料庫實例
export function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
}

export function getCollection(name) {
  return getDB().collection(name);
}
export { ObjectId }; 

process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('\n[DB] Connection closed due to application termination');
  }
  process.exit(0);
});