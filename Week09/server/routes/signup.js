// Week09/server/routes/signup.js
import { Router } from 'express';
import { nanoid } from 'nanoid';

export const router = Router();

// 模擬資料庫儲存
const participants = [];

//  GET /api/signup: 查看報名清單
router.get('/', (req, res) => {
  res.json({ total: participants.length, data: participants });
});

//  POST /api/signup: 
router.post('/', (req, res) => {
  const { 
    name, 
    email, 
    phone, 
    password, 
    confirmPassword, 
    interests, 
    terms 
  } = req.body ?? {};
  
  const errors = [];

  if (!name) errors.push({ param: 'name', msg: '姓名為必填' });
  if (!email) errors.push({ param: 'email', msg: 'Email 為必填' });
  if (!phone) errors.push({ param: 'phone', msg: '手機為必填' });
  if (!password) errors.push({ param: 'password', msg: '密碼為必填' });
  if (!terms) errors.push({ param: 'terms', msg: '必須同意服務條款' });
  if (!interests || interests.length === 0) {
    errors.push({ param: 'interests', msg: '請至少勾選一項興趣' });
  }

  const emailPattern = /^[^\s@]+@(gmail\.com|o365\.tku\.edu\.tw)$/;
  if (email && !emailPattern.test(email)) {
    errors.push({ param: 'email', msg: 'Email 必須為 @gmail.com 或 @o365.tku.edu.tw' });
  }
  
  if (phone && !/^\d{10}$/.test(phone)) {
    errors.push({ param: 'phone', msg: '手機需為 10 碼數字' });
  }

  if (password) {
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      errors.push({ param: 'password', msg: '密碼需至少 8 碼且英數混合' });
    }
  }

  if (password !== confirmPassword) {
    errors.push({ param: 'confirm-password', msg: '兩次密碼不一致' });
  }

  if (email && participants.some(p => p.email === email)) {
    return res.status(409).json({ message: '此信箱已註冊' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors }); 
  }

  const participant = {
    id: nanoid(8),
    name,
    email,
    phone,
    password, 
    interests,
    createdAt: new Date().toISOString()
  };
  
  participants.push(participant);
  
  // 回傳 201 Created
  res.status(201).json({ message: '報名成功', participant: { id: participant.id, name: participant.name, email: participant.email } });
});
