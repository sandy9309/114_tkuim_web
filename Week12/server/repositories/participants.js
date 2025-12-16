import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';

const collection = () => getDB().collection('participants');

export async function findParticipantById(id) {
    if (!ObjectId.isValid(id)) return null;
    return collection().findOne({ _id: new ObjectId(id) });
}

export async function findAllParticipants() {
    return collection()
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
}

// 修正：查詢時確保 ownerId 是 ObjectId，否則字串比對會查無資料
export async function findParticipantsByOwner(ownerId) {
    const queryId = typeof ownerId === 'string' ? new ObjectId(ownerId) : ownerId;
    return collection()
        .find({ ownerId: queryId }) 
        .sort({ createdAt: -1 })
        .toArray();
}

// 修正：新增資料時，強制將 ownerId 轉為 ObjectId 存入資料庫
export async function createParticipant(data) {
    const formattedData = {
        ...data,
        ownerId: typeof data.ownerId === 'string' ? new ObjectId(data.ownerId) : data.ownerId,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const result = await collection().insertOne(formattedData);
    return { ...formattedData, _id: result.insertedId }; 
}

export async function updateParticipant(id, patch) {
    if (!ObjectId.isValid(id)) throw new Error('Invalid ObjectId format');
    return collection().updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...patch, updatedAt: new Date() } }
    );
}

// 修正：刪除時回傳結果物件，方便路由判斷 deletedCount
export async function deleteParticipant(id) {
    if (!ObjectId.isValid(id)) return { deletedCount: 0 };
    return collection().deleteOne({ _id: new ObjectId(id) });
}

export async function initializeIndexes() {
    const coll = collection();
    await coll.createIndex({ ownerId: 1 }, { name: "ownerId_index" });
    console.log(`[DB] Index 'participants.ownerId' checked.`);
}