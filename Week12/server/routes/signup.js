// server/routes/signup.js

import express from 'express';
// 假設這是你存取 MongoDB participants 集合的 Repositories
import { 
    findAllParticipants, 
    findParticipantById, 
    findParticipantsByOwner,
    createParticipant, 
    deleteParticipant 
} from '../repositories/participants.js'; 

// 匯入你剛才完成的守門員
import { authMiddleware } from '../middleware/auth.js'; 

const router = express.Router();

// ----------------------------------------------------
// 1. 套用 authMiddleware：保護此路由檔案中的所有接口
// ----------------------------------------------------
router.use(authMiddleware); 


// ----------------------------------------------------
// 2. GET / (查詢報名列表)
// 授權邏輯：Admin 可看全部；Student 只可看自己建立的
// ----------------------------------------------------
router.get('/', async (req, res) => {
    // req.user 包含了 authMiddleware 驗證後掛載的使用者資訊 { id, email, role }
    const { role, id: userId } = req.user;
    
    let data;
    
    try {
        if (role === 'admin') {
            // Admin 角色：查詢所有報名資料
            data = await findAllParticipants();
        } else {
            // Student/其他 角色：只查詢 ownerId 是自己的資料
            // 課程要求：學生只能查自己的資料
            data = await findParticipantsByOwner(userId);
        }

        // 報名資料通常需要序列化，這裡假設你有一個 serializeParticipant 函式
        // 如果沒有，可以直接回傳 data
        const serializedData = data.map(doc => ({
            id: doc._id,
            name: doc.name,
            phone: doc.phone,
            ownerId: doc.ownerId,
            createdAt: doc.createdAt
        }));

        res.json({ 
            total: serializedData.length, 
            data: serializedData 
        });

    } catch (error) {
        console.error('GET /api/signup error:', error);
        res.status(500).json({ error: '無法讀取報名資料' });
    }
});


// ----------------------------------------------------
// 3. POST / (新增報名資料)
// 授權邏輯：登入者才能新增，並記錄 ownerId
// ----------------------------------------------------
router.post('/', async (req, res) => {
    // authMiddleware 已確保只有登入者能到這一步
    const { name, phone } = req.body;
    
    // 檢查基本資料完整性
    if (!name || !phone) {
        return res.status(400).json({ error: '姓名和電話為必填' });
    }

    try {
        // 記錄 ownerId: 使用當前登入者的 ID
        const newParticipant = await createParticipant({ 
            name, 
            phone, 
            ownerId: req.user.id // 🚨 關鍵：記錄建立者 ID
        });

        // 建立成功，回傳 201 Created
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


// ----------------------------------------------------
// 4. DELETE /:id (刪除報名資料)
// 授權邏輯：只有資料擁有者或 Admin 才能刪除
// ----------------------------------------------------
router.delete('/:id', async (req, res) => {
    const { id: participantId } = req.params;
    const { role, id: userId } = req.user;

    try {
        // 1. 尋找資料
        const participant = await findParticipantById(participantId);
        if (!participant) {
            return res.status(404).json({ error: '找不到該報名資料' });
        }

        // 2. 授權檢查
        const isOwner = participant.ownerId.toString() === userId;
        const isAdmin = role === 'admin';

        if (!isOwner && !isAdmin) {
            // 403 Forbidden (權限不足)
            return res.status(403).json({ error: '權限不足，您只能刪除自己建立的資料' });
        }

        // 3. 執行刪除
        const deletedCount = await deleteParticipant(participantId);
        
        if (deletedCount === 0) {
             // 雖然我們已經檢查過是否存在，但這裡是最終確認
             return res.status(404).json({ error: '刪除失敗，找不到資料' });
        }

        res.json({ message: '報名資料刪除完成' });

    } catch (error) {
        console.error(`DELETE /api/signup/${participantId} error:`, error);
        res.status(500).json({ error: '刪除操作失敗' });
    }
});

export default router;