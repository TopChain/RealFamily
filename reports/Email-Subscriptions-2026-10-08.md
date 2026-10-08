# Real Family · Email 訂閱

2026-10-08 · PT

五個內容頁都有獨立訂閱區，預先勾選目前頁面；可複選其他主題。首頁不新增訂閱區。email、至少一個主題和同意收信必填。

使用 Neon 免費方案的獨立 TopChainFresh 專案，project ID noisy-hill-90788675，production branch br-empty-snow-b5647i2z。資料表在私人 realfamily schema，名單不放公開網站或 GitHub。

已實作：確認 email 後才訂閱、48 小時確認連結、一次性 token、退訂確認、選項合併、每日單封摘要、寄送佇列與去重、寄送租約、不確定狀態先查已寄件再重試。掃描器開啟連結的 GET 不會直接確認或退訂。已退訂的帳號不會被納入新的摘要或寄信佇列。

摘要內容：新聞附免費的今日／昨日來源，市場附交易狀態與資料時間，健康附當日新增研究及原頁入口，食譜附六人份料理入口，英文列十個主題及當日卡片連結。含 English 的訂閱者若當日課程未完成，暫不建立當日摘要。網站新聞／市場仍每小時更新，訂閱信每天一封。

寄信沿用已連接 Gmail；預計由本機排程每小時處理私人佇列。確認信可能需要等下一次排程，且執行主機和 Gmail 服務必須可用；不是完全脫離本機的雲端寄信。目前寄信排程尚未啟用，須待 API 上線與端對端驗證。

API 原始碼：subscription-api/。前端：subscriptions.js、subscription-config.js。Vercel 專用專案 real-family-subscriptions，ID prj_mzUMbMQ89Fr5Vi4OkhjAdvRDWkc3，尚未部署可供訪客使用的 API。

自動安全審核拒絕了兩步：
1. 將 Neon DATABASE_URL 與新 MAILER_SECRET 安全存入 Vercel 的敏感環境變數：缺少對特定憑證、目的服務的明確授權。
2. 解除專用 Vercel 訂閱 API 的 SSO 限制供公眾使用：缺少公開該 API 的明確授權。

下一步需使用者授權。正式連接前應建立僅可操作 realfamily schema 的應用程式角色，避免傳入資料庫擁有者連線。公開 API 只允許新增訂閱请求、持有 token 的確認與退訂；私人寄信佇列仍需要 MAILER_SECRET，資料庫本身不公開。

目前 subscription-config.js 的 endpoint 為 null，訪客訂閱鈕停用，明示尚在連接；沒有把未接通功能宣稱成功訂閱。完成授權後接入 endpoint、測試確認信 → 確認 → 摘要 → 退訂的整個流程，再開放訂閱。

驗證：五頁均有表單且預選對應主題；email 與主題校驗、同意必要條件、私人佇列授權、GET 不改訂閱、錯誤來源拒絕、摘要 HTML 轉義與舊英文不冒充新課等四項測試通過。介面預覽保存在 subscription-preview-2026-10-08.png。尚未驗證真實訂閱寄信，因上述上線授權待完成。
