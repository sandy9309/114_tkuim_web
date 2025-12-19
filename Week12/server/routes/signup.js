// server/routes/signup.js

import express from 'express';
import { 
    findAllParticipants, 
    findParticipantById, 
    findParticipantsByOwner,
    createParticipant, 
    deleteParticipant 
} from '../repositories/participants.js'; 
import { authMiddleware } from '../middleware/auth.js'; 

const router = express.Router();

// 所有 /api/signup 路由都需要經過身份驗證
router.use(authMiddleware); 

// [GET] 查詢列表
router.get('/', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: '缺少授權資訊' });

        const { role, id: userId } = req.user;

        // Admin 看全部，Student 只看自己的
        const data = (role === 'admin') 
            ? await findAllParticipants() 
            : await findParticipantsByOwner(userId);

        // 避免 data 為 null
        const serializedData = (data || []).map(doc => ({
            id: doc._id,
            name: doc.name,
            phone: doc.phone,
            ownerId: doc.ownerId,
            createdAt: doc.createdAt
        }));

        res.json({ total: serializedData.length, data: serializedData });

    } catch (error) {
        console.error('GET /api/signup error:', error);
        res.status(500).json({ error: '伺服器內部錯誤' });
    }
});

// [POST] 新增資料
router.post('/', async (req, res) => {
    const { name, phone } = req.body;
    if (!name || !phone) return res.status(400).json({ error: '姓名和電話為必填' });

    try {
        if (!req.user) return res.status(401).json({ error: '缺少授權資訊' });

        const newParticipant = await createParticipant({ 
            name, 
            phone, 
            ownerId: req.user.id 
        });

        res.status(201).json({
            id: newParticipant._id,
            name: newParticipant.name,
            ownerId: newParticipant.ownerId,
            message: '報名成功'
        });

    } catch (error) {
        console.error('POST /api/signup error:', error);
        res.status(500).json({ error: '新增報名資料失敗' });
    }
});

// [DELETE] 刪除資料 (嚴格權限檢查)
router.delete('/:id', async (req, res) => {
    const { id: participantId } = req.params;

    try {
        if (!req.user) return res.status(401).json({ error: '缺少授權資訊' });

        const { role, id: userId } = req.user;

        const participant = await findParticipantById(participantId);

        // 1. 檢查資料是否存在
        if (!participant) {
            return res.status(404).json({ error: '找不到該報名資料' });
        }

        // 2. 嚴格比對權限 (轉型為字串避免 ObjectId 物件比對誤差)
        const isOwner = participant.ownerId && (String(participant.ownerId) === String(userId));
        const isAdmin = role === 'admin';

        console.log('--- 刪除權限檢查 ---');
        console.log(`請求者 ID: ${userId} (${role})`);
        console.log(`擁有者 ID: ${participant.ownerId}`);
        console.log(`判定結果: isOwner=${isOwner}, isAdmin=${isAdmin}`);

        if (!isOwner && !isAdmin) {
            console.log('🚫 攔截成功：權限不足');
            return res.status(403).json({ error: '權限不足，您只能刪除自己建立的資料' });
        }

        // 3. 執行刪除
        const result = await deleteParticipant(participantId);

        if (result && result.deletedCount === 0) {
            return res.status(404).json({ error: '資料已不存在，刪除失敗' });
        }

        console.log('✅ 刪除執行成功');
        res.json({ message: '報名資料刪除完成' });

    } catch (error) {
        console.error('DELETE /api/signup error:', error);
        res.status(500).json({ error: '伺服器內部錯誤，刪除失敗' });
    }
});

export default router;
