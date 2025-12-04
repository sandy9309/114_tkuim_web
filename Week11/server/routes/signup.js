import express from 'express';
import {
  createParticipant,
  listParticipants,
  updateParticipant,
  deleteParticipant
} from '../repositories/participants.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: '缺少必要欄位 (name, email, phone)' });
    }

    const id = await createParticipant({ name, email, phone, status: 'pending' });

    res.status(201).json({
      message: '報名成功！',
      id: id.toHexString()
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: '此 Email 已報名，請勿重複提交。' });
    }
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1 || limit < 1) {
      return res.status(400).json({ error: 'page 和 limit 必須大於 0' });
    }

    const { participants, total } = await listParticipants(page, limit);

    res.json({
      data: participants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  const { id } = req.params;
  const { phone, status } = req.body;

  const patch = {};
  if (phone !== undefined) patch.phone = phone;
  if (status !== undefined) patch.status = status;

  if (Object.keys(patch).length === 0) {
    return res.status(400).json({ error: '請提供要更新的欄位' });
  }

  try {
    const result = await updateParticipant(id, patch);

    if (!result.matchedCount) {
      return res.status(404).json({ error: '找不到資料' });
    }

    res.json({
      updated: result.modifiedCount,
      message: '更新成功'
    });

  } catch (error) {
    if (error instanceof Error && error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ error: '無效的 ID 格式' });
    }
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteParticipant(req.params.id);

    if (!result.deletedCount) {
      return res.status(404).json({ error: '找不到資料' });
    }

    res.status(204).end();

  } catch (error) {
    if (error instanceof Error && error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ error: '無效的 ID 格式' });
    }
    next(error);
  }
});

export default router;
