
# 環境需求 
Node.js、npm、Docker、Docker Compose

安裝依賴套件
```npm install```

環境變數(server/.env)
```
PORT=3001
MONGODB_URI=mongodb://week12-admin:week12-pass@localhost:27017/week12?authSource=week12
ALLOWED_ORIGIN=http://localhost:5173
JWT_SECRET=AbC_123$!@qWeRtY_zXcVbN
```
# 啟動指令
啟動 Mongo:在 docker/ 目錄下
```docker compose up -d```

驗證 Mongo
```docker ps```

啟動伺服器:在 server/ 目錄下
```cd server ```/
```npm run dev```

- 前端控制面板：http://localhost:3001
- 後端 API 基底：http://localhost:3001
# 測試帳號列表
- 管理員 (Admin) : ```admin@example.com	123456```(可查閱與刪除所有報名資料)
- 一般學員 (Student) : ```student@test.com	123456```(僅能管理（查、刪）自己建立的資料)
- 一般學員 (Student) : ```studen@test.com	123456```
 # 測試方式
 - 自動化測試 ```npm test```
 - 手動 API 測試 (tests/api.http)
  ![圖片說明](./screenshots/token.png)
  ![圖片說明](./screenshots/新增學生.png)
  ![圖片說明](./screenshots/12194.png)
  ![圖片說明](./screenshots/12195.png)
  ![圖片說明](./screenshots/12199.png)
 - 前端測試影片 https://youtu.be/QGefuSc9Y6I