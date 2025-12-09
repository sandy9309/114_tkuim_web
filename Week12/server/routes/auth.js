// server/routes/auth.js

import express from 'express';
import bcrypt from 'bcrypt';
import { findUserByEmail, createUser } from '../repositories/users.js';
import { generateToken } from '../generateToken.js'; 

const router = express.Router();
const SALT_ROUNDS = 10; // bcrypt 鹽值 (建議設為 10)

// --- POST /auth/signup (使用者註冊) ---
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  // 🚨 簡化：這裡我們假設你的前端或 Schema 驗證了 email 格式

  // 1. 檢查是否重複 (課程要求)
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    // HTTP 409 Conflict 代表請求與目標資源的目前狀態發生衝突
    return res.status(409).json({ error: '電子郵件已存在，請直接登入' });
  }

  try {
    // 2. 使用 bcrypt.hash 雜湊密碼 (課程要求)
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. 建立新使用者 (預設角色 'student')
    const user = await createUser({ email, passwordHash, role: 'student' });
    
    // 4. 回傳資訊 (課程要求)
    // 注意：我們只回傳公眾資訊，絕不回傳 passwordHash!
    res.status(201).json({ 
        id: user._id, 
        email: user.email, 
        role: user.role,
        message: '註冊成功' 
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: '伺服器內部錯誤' });
  }
});


// --- POST /auth/login (使用者登入) ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // 1. 尋找使用者
  const user = await findUserByEmail(email);
  if (!user) {
    // 帳號不存在 (為安全起見，不透露是帳號還是密碼錯誤)
    return res.status(401).json({ error: '帳號或密碼錯誤' });
  }

  // 2. 使用 bcrypt.compare 驗證密碼 (課程要求)
  // 比較傳入的密碼 (明碼) 是否與資料庫的雜湊 (passwordHash) 相符
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: '帳號或密碼錯誤' });
  }

  // 3. 簽發 JWT Token (課程要求)
  const token = generateToken(user);

  // 4. 回傳 Token 和使用者資訊
  res.json({ 
    token, 
    expiresIn: '2h', // 請與 generateToken.js 中的設定一致
    user: { id: user._id, email: user.email, role: user.role } 
  });
});

export default router;