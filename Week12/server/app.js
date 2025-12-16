// server/app.js

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';

import authRouter from './routes/auth.js';
import signupRouter from './routes/signup.js';

const app = express();
const port = process.env.PORT || 3001;

// --- ESM 路徑處理 ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. 中介軟體設定 ---

// 允許來自不同 Port (例如 Live Server 的 5500 或前端的 3000) 的請求
app.use(cors({
  origin: '*', // 開發階段允許所有來源，或設為 process.env.ALLOWED_ORIGIN
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// 🚨 修正靜態檔案路徑：指向與 server 平級的 client 資料夾
// 這樣你訪問 http://localhost:3001/ 就會看到 client/index.html
app.use(express.static(path.join(__dirname, '../client')));

// --- 2. 路由設定 ---

app.use('/auth', authRouter);
app.use('/api/signup', signupRouter);

// --- 3. 錯誤處理 ---

// 處理找不到的 API 路徑
app.use('/api', (req, res) => {
  res.status(404).json({ error: '找不到該 API 路由' });
});

// 全域錯誤捕捉 (當程式碼噴錯時不會直接當機)
app.use((err, req, res, next) => {
  console.error(' [Server Error]:', err);
  res.status(500).json({ error: '伺服器內部錯誤' });
});

// --- 4. 啟動伺服器 ---

// 只有在非測試環境下才啟動監聽 (避免 Vitest 重複啟動 Port)
if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      app.listen(port, () => {
        console.log('============================================');
        console.log(` 伺服器運行中: http://localhost:${port}`);
        console.log(` 前端目錄位置: ${path.join(__dirname, '../client')}`);
        console.log('============================================');
      });
    })
    .catch((error) => {
      console.error(' MongoDB 連線失敗:', error);
      process.exit(1);
    });
}

// 必須匯出 app，否則 npm test (Supertest) 無法抓到這台 server
export default app;