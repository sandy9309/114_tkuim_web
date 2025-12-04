
# 環境需求 
Node.js、npm、Docker、Docker Compose

環境變數(server/.env)
```
PORT=3001 #伺服器運行的埠號
MONGODB_URI=mongodb://root:password123@localhost:27017/week11?authSource=admin #連線 MongoDB 的 URI
ALLOWED_ORIGIN=http://localhost:5173 #允許跨域存取的前端來源
```
# 啟動指令
啟動 Mongo:在 docker/ 目錄下
```docker compose up -d```

驗證 Mongo
```docker ps```

啟動伺服器:在 server/ 目錄下
```cd server ```/
```npm run dev```

# REST Client / Postman 測試腳本
```
### 1. POST /api/signup：建立新報名 (Status: 201 Created)
POST http://localhost:3001/api/signup
Content-Type: application/json

{
    "name": "ww",
    "email": "wonwoo@example.com",
    "phone": "0912345678",
    "status": "pending"
}

### 2. POST /api/signup：重複 Email (Status: 409 Conflict)
# 使用與上一個請求相同的 email 進行測試
POST http://localhost:3001/api/signup
Content-Type: application/json

{
    "name": "User",
    "email": "wonwoo@example.com",
    "phone": "0999999999"
}

### 3. GET /api/signup：測試分頁 (Status: 200 OK)
# 取得第一頁，每頁 10 筆
GET http://localhost:3001/api/signup?page=1&limit=10

### 4. PATCH /api/signup/:id：更新狀態 (請將 <ID> 替換為以取得的 _id)
PATCH http://localhost:3001/api/signup/<取得的ID>
Content-Type: application/json

{
    "phone": "0971717171"
    "status": "approved"
}

### 5. DELETE /api/signup/:id：刪除報名 
DELETE http://localhost:3001/api/signup/<取得的ID>
```
# Mongo Shell 指令範例 (CLI 驗證)

### 進入 mongosh 環境
```
docker exec -it week11-mongo mongosh -u root -p password123 --authenticationDatabase admin
```
### 驗證指令 (在 mongosh 內執行)

切換資料庫	```use week11```	

驗證唯一索引	```db.participants.getIndexes()	```回傳 email_unique_index 且 unique: true 。

手動分頁查詢 ```db.participants.find().sort({ createdAt: -1 }).skip(3).limit(3).pretty()```	示範使用 Mongo 內建的 skip 和 limit 取得第 2 頁的資料。

查詢總筆數	```db.participants.countDocuments()	```驗證 API 回傳的 total 數值是否正確。

#  MongoDB Compass 截圖
![圖片說明](./screenshots/MongoDB%20Compass.png)
![圖片說明](./screenshots/MongoDB%20Compass!.png)
