# PDF to JPG Converter

轉換 PDF 文件為 JPG 圖片的在線工具。

## 🌐 在線使用

**網頁版本：** [GitHub Pages 鏈接]（將在你部署到 GitHub 後顯示）

## ✨ 功能

- 📄 上傳 PDF 文件
- 🖼️ 自動轉換為 JPG 圖片
- ⚡ 快速處理
- 🔒 隱私保護（數據不上傳到伺服器）
- 💾 直接下載結果

## 🚀 快速開始

### 線上使用（推薦）

將此倉庫 Fork 並按照以下步驟在 GitHub Pages 上部署：

1. **Fork 這個倉庫** 到你的 GitHub 帳戶
2. **進入倉庫設定** (`Settings` → `Pages`)
3. **啟用 GitHub Pages：**
   - Source 選擇 `Deploy from a branch`
   - Branch 選擇 `main` 和 `/(root)`
   - 點擊 **Save**
4. **等待部署完成**（通常 1-2 分鐘）
5. **訪問你的應用：**
   ```
   https://你的用戶名.github.io/pdf-to-jpg-converter/
   ```

### 本機開發

**前置要求：** Node.js 18+

1. **克隆倉庫：**
   ```bash
   git clone https://github.com/你的用戶名/pdf-to-jpg-converter.git
   cd pdf-to-jpg-converter
   ```

2. **安裝依賴：**
   ```bash
   npm install
   ```

3. **啟動開發伺服器：**
   ```bash
   npm run dev
   ```
   
4. **打開瀏覽器：**
   ```
   http://localhost:3000
   ```

## 📦 構建

### 構建網頁版本
```bash
npm run build
```

### 構建 Electron 桌面應用
```bash
npm run build:electron
```

### 打包應用程式（macOS）
```bash
npm run pack
```

## 📜 可用腳本

- `npm run dev` - 啟動開發伺服器
- `npm run build` - 構建生產版本
- `npm run preview` - 預覽構建結果
- `npm run lint` - 檢查代碼
- `npm run electron` - 運行 Electron 應用
- `npm run electron:dev` - 開發模式運行 Electron
- `npm run pack` - 打包 macOS 應用

## 🎯 技術棧

- **前端框架：** React 19
- **構建工具：** Vite 6
- **樣式：** Tailwind CSS
- **圖標：** Lucide React
- **PDF 處理：** PDF.js
- **圖片處理：** html2canvas
- **桌面應用：** Electron

## 📋 功能特性

✅ PDF 轉 JPG 轉換  
✅ 單頁或多頁轉換  
✅ 自訂輸出品質  
✅ 批量下載  
✅ 無廣告  
✅ 離線支持

## 🔧 自訂部署

如果你想部署到自己的伺服器（而不是 GitHub Pages），可以：

1. 構建應用：
   ```bash
   npm run build
   ```

2. 上傳 `dist/` 資料夾到你的伺服器

3. 配置服務器支援 SPA（單頁應用程式）路由

## 📝 許可

MIT License

## 🤝 貢獻

歡迎提交 Issues 和 Pull Requests！

---

**需要幫助？** 
- 檢查 [GitHub Issues](../../issues)
- 或提交新的 Issue

**喜歡這個項目？** 請給個 ⭐ Star！
