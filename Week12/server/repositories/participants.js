// server/repositories/participants.js

import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';

const collection = () => getDB().collection('participants');

export async function findParticipantById(id) {
    if (!ObjectId.isValid(id)) {
        return null;
    }
    return collection().findOne({ _id: new ObjectId(id) });
}

export async function findAllParticipants() {
    return collection()
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
}
export async function findParticipantsByOwner(ownerId) {
    return collection()
        .find({ ownerId: ownerId }) 
        .sort({ createdAt: -1 })
        .toArray();
}

export async function createParticipant(data) {
    const result = await collection().insertOne({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    return { ...data, _id: result.insertedId }; 
}

export async function updateParticipant(id, patch) {
    if (!ObjectId.isValid(id)) {
        throw new Error('Invalid ObjectId format');
    }
    return collection().updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...patch, updatedAt: new Date() } }
    );
}

export async function deleteParticipant(id) {
    if (!ObjectId.isValid(id)) {
        return { deletedCount: 0 };
    }
    return collection().deleteOne({ _id: new ObjectId(id) });
}

const COLLECTION_NAME = 'participants';

export async function initializeIndexes() {
    const coll = collection();
    await coll.createIndex(
        { ownerId: 1 }, 
        { name: "ownerId_index" }
    );
    console.log(`[DB] Index '${COLLECTION_NAME}.ownerId' created/checked.`);
}