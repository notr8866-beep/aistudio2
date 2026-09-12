# 報價管理系統 (Quotation Management System)

這是一個以 **React 19 + TypeScript + Vite 6 + Tailwind CSS v4** 開發的企業級報價管理系統。本系統採用純前端獨立架構與本地持久化儲存（LocalStorage），**不需要安裝任何外部後端或資料庫**，只要有 Node.js 即可在個人電腦本機端「單機測試」與運作！

---

## 💻 本地端（單機）環境快速啟動指南

### 1. 系統需求環境
- **Node.js**：版本 `>= 18.0.0` 或更高版本（建議使用 Node 20 LTS 或 Node 22）
- **套件管理器**：`npm`（Node.js 內建）、`pnpm` 或 `yarn`、`bun`

---

### 2. 下載並取得專案原始碼
若您是從 Google AI Studio 下載：
1. 點擊 AI Studio 右上方選單中的 **Export**（或分享/下載 ZIP）。
2. 解壓縮下載的壓縮檔至您電腦的指定工作目錄（例如：`D:\Projects\quotation-system` 或 `~/projects/quotation-system`）。
3. 使用終端機（Terminal / PowerShell / CMD）進入該資料夾：
   ```bash
   cd quotation-system
   ```

---

### 3. 安裝相依套件
在專案根目錄下執行安裝指令：

```bash
npm install
```
*(使用 pnpm 的開發者可執行 `pnpm install`；yarn 執行 `yarn`)*

---

### 4. 啟動單機 Vite 開發伺服器
安裝完成後，執行以下啟動指令：

```bash
npm run dev
```

啟動後，終端機會顯示伺服器運作資訊：
```text
  VITE v6.2.x  ready in ~200 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

在您的瀏覽器（Chrome、Edge、Safari 或 Firefox）網址列輸入：
👉 **http://localhost:3000**

> 💡 **小撇步**：您也可以執行 `npm run dev:local`，Vite 會在伺服器啟動完成後自動開啟您的預設瀏覽器！

---

## 🛠️ 可用的 npm 常用腳本一覽

| 指令 | 功能說明 | 適用情境 |
| :--- | :--- | :--- |
| `npm run dev` | 啟動本機 Vite 開發伺服器（監聽 Port 3000） | 日常單機測試與功能開發 |
| `npm run dev:local` | 啟動本機 Vite 開發伺服器並**自動開啟瀏覽器** | 本機快速體驗 |
| `npm run build` | 將專案最佳化編譯打包成生產環境靜態檔（輸出至 `dist/`） | 上線部署或產生發布包 |
| `npm run preview` | 本地預覽編譯後的正式發布版（`dist/`） | 驗證打包後的功能是否無誤 |
| `npm run lint` / `npm test` | 執行 TypeScript 型別與語法安全靜態檢查 | 程式碼品質檢驗 |
| `npm run clean` | 清除舊的編譯產出目錄 | 重整專案產物 |

---

## 🌟 單機測試核心特色

1. **零外部依賴、開箱即用**：
   - 無需配置 Docker、無需安裝 PostgreSQL / MySQL / Redis。
   - 所有客戶名冊、廠商目錄、在庫產品與報價紀錄，均透過瀏覽器端的 **LocalStorage** 進行即時離線安全儲存。

2. **內建完整示範測試資料**：
   - 首次啟動系統時，已預載常見的企業客戶、台灣本土優質廠商、各式電子與周邊產品，以及已建置的商用報價單。
   - 介面右上角提供「**重置示範資料**」按鈕，隨時可一鍵將資料還原為初始純淨測試狀態。

3. **單機資料備份與遷移（JSON）**：
   - 提供「**本地單機測試指引**」面板，支援**一鍵匯出 JSON 備份檔**。
   - 可以在不同電腦或不同瀏覽器間隨時透過**匯入 JSON**，無縫還原測試資料。

4. **即時連動與防呆驗證**：
   - **必填欄位防呆**：公司名稱、窗口、電話、Email（格式驗證）、地址均有即時紅字提醒。
   - **客戶選單連動**：選擇客戶即時帶出電話、聯絡窗口、付款條件。
   - **產品與複價連動**：選擇品項即時帶出建議售價，調整數量自動以毫秒級反應計算 `單價 × 數量 = 複價` 與 5% 營業稅。

5. **商用列印與 PDF 匯出**：
   - 每張報價單皆提供預覽與列印功能，支援直接呼叫瀏覽器原生列印視窗（Ctrl+P / Cmd+P）另存為正式標準 A4 規格 PDF。

---

## 🧪 單機功能驗收清單

系統導覽列中特設「**驗收條件測試專區**」，包含五項客觀指標：
1. **必填欄位防呆檢驗**：故意留空必填欄位嘗試送出，驗證是否 100% 成功攔截。
2. **客戶資訊自動帶出**：開立報價單切換客戶，電話與聯絡人自動填入。
3. **單價帶入與複價計算精確度**：選定產品帶入單價，調整數量後總計計算無誤差。
4. **跨模組資料即時連動**：新增產品或客戶後，報價單下拉選項立即同步呈現。
5. **報價單生命週期與列印預覽**：支援草稿、已發送、已確認、已結案等狀態切換及完整 A4 商用排版。

---

## 📂 專案檔案結構

```text
├── index.html                  # 應用程式 HTML 進入點（字體、標題設定）
├── package.json                # 專案相依套件與 NPM Scripts
├── vite.config.ts              # Vite 6 與 Tailwind CSS v4 整合設定
├── tsconfig.json               # TypeScript 編譯設定
├── src/
│   ├── main.tsx                # React 進入點
│   ├── App.tsx                 # 主畫面框架、導覽列與數據摘要卡片
│   ├── types.ts                # 客戶、廠商、產品、報價單資料型別定義
│   ├── index.css               # 全域樣式與 Tailwind CSS 樣式
│   ├── data/
│   │   └── initialData.ts      # 初始示範資料（客戶、廠商、產品、報價單）
│   ├── utils/
│   │   └── storage.ts          # LocalStorage 本地存取、備份與還原邏輯
│   └── components/
│       ├── CustomerManager.tsx # 客戶管理模組
│       ├── VendorManager.tsx   # 廠商管理模組
│       ├── ProductManager.tsx  # 產品管理模組（含毛利率分析）
│       ├── QuoteManager.tsx    # 報價單管理模組（含連動選單、明細計算與列印）
│       ├── AcceptanceCriteriaView.tsx # 5大驗收指標客觀測試專區
│       └── LocalTestingModal.tsx      # 單機測試指引與 JSON 備份視窗
```
