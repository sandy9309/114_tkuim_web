啟動環境需求</br>
-Node.js: 建議版本 18 或更高。</br>
-npm: Node.js 套件管理器。</br>
-VS Code 擴充功能: 建議安裝 REST Client ，用於測試 API 端點。</br>
</br>
1.啟動後端伺服器 (Server)</br>
-安裝依賴: 進入 server 目錄，安裝所需的套件。</br>
cd server</br>
npm install</br>
</br>
啟動伺服器: 使用 nodemon 進行開發模式啟動。</br>
npm run dev</br>
成功後，終端機將顯示：Server ready on http://localhost:3001/</br>
</br>
2.啟動前端頁面 (Client)</br>
開啟 HTML:在 VS Code 中，開啟 client/signup_form.html，使用 Live Server 開啟。</br>
</br>
3.API 端點文件</br>
方法:GET;POST</br>
端點:/api/signup;/api/signup</br>
說明:取得目前的報名清單與總數;提交新的報名資料。</br>
預期狀態碼:200 OK;201 Created (成功) / 400 Bad Request (驗證失敗) / 409 Conflict (Email 重複)</br>
</br>
4.測試方式 (任選兩種)</br>
-VS Code REST Client 測試</br>
檔案位置: tests/api.http</br>
如何測試: 開啟 api.http 檔案，點擊右鍵 Send Request 按鈕即可發送測試。</br>
包含測試: 成功的 POST 請求 (201 Created) 和失敗的 POST 請求 (400 Bad Request)。</br>
-Postman 測試</br>
文件位置: tests/signup_collection.json</br>
如何測試:開啟 Postman 應用程式。=>點擊 Import，選擇 signup_collection.json 檔案匯入。=>開啟匯入的 Collection，運行其中的 POST 請求來驗證 API。
