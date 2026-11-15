# heic2jpg

把 iPhone 拍的 `.HEIC` / `.HEIF` 照片批次轉檔的小工具，有兩種用法：

| | 網頁 App（`app/`） | 命令列腳本（`heic2png.sh`） |
|---|---|---|
| 輸出 | **JPG**（品質 85、長邊最大 2048px） | PNG（原尺寸、無損） |
| 執行環境 | 任何現代瀏覽器 | 僅 macOS（使用內建 `sips`） |
| 適合 | 日常分享、省空間 | 需要原尺寸無損檔 |

---

## 網頁 App

以 [Chimes AI Design System](../Chimes-AI-Design-System) 打造的單頁應用。**所有轉檔都在瀏覽器內完成，照片不會上傳到任何伺服器。**

### 功能

- 拖曳檔案或整個資料夾，也可用「選擇檔案／選擇資料夾」按鈕；非 HEIC 與重複檔案會自動略過
- 一次轉換 2 個檔案，顯示總進度、縮圖與每個檔案的狀態；失敗的檔案再按一次「全部轉換」即可重試
- 每個檔案顯示輸出的 JPG 大小與原始 HEIC 大小
- 單檔下載，或「下載全部 (ZIP)」（保留資料夾結構，同名檔自動加上 `(1)`、`(2)`）
- 淺色／深色／跟隨系統主題（會記住選擇）
- 介面語言：繁體中文（預設）、簡體中文、英文，依瀏覽器語系自動切換

### 輸出規格

| 項目 | 設定 | 說明 |
|---|---|---|
| 格式 | JPG | 照片用 JPG 比 PNG 小很多 |
| 品質 | 85 | 肉眼幾乎看不出差異 |
| 尺寸 | 長邊最大 2048px | 4032px 的 iPhone 照片會縮小；較小的圖維持原尺寸，不放大 |
| 透明區域 | 補白底 | JPG 不支援透明 |

實測一張 4032×4032 照片：無損 PNG 約 16.6MB → 本工具輸出約 0.1–0.3MB。

要調整規格，修改 [`app/src/constants/index.ts`](app/src/constants/index.ts) 的 `JPEG_QUALITY`、`OUTPUT_MAX_EDGE` 即可。

### 啟動

需要 Node.js 22 以上（見 `app/.nvmrc`）。

```bash
cd app
npm install
npm run dev        # http://localhost:14090
```

### 常用指令

```bash
npm run dev          # 開發伺服器
npm run build        # 型別檢查 + 正式版建置（輸出到 dist/）
npm run preview      # 預覽正式版
npm run check-types  # 只做型別檢查
npm run lint         # ESLint
npm test             # 單元測試（Vitest）
```

`dist/` 是純靜態檔案，可直接放到任何靜態主機（nginx、GitHub Pages 等）分享給同事使用。

### 技術架構

- React 19 + TypeScript + Vite，Tailwind CSS v4 + shadcn/ui（base-nova），沿用 Chimes AI Design System 的 tokens 與元件
- HEIC 解碼：[`heic-to`](https://www.npmjs.com/package/heic-to)（libheif WASM，約 3.2MB，第一次轉檔時才載入）
- JPG 編碼與縮圖：瀏覽器原生 Canvas（`OffscreenCanvas.convertToBlob`），不需額外套件
- ZIP 打包：`jszip`；狀態管理：Zustand；多語系：react-intl

```
app/src/
├── components/
│   ├── AppHeader/        # 頂部品牌列
│   ├── ThemeToggle/      # 淺色／深色／跟隨系統切換
│   ├── HeicConverter/    # 拖放區、工具列、檔案表格
│   └── ui/               # 從 Design System 複製的 shadcn/ui 元件
├── hooks/                # useHeicConversion、useZipDownload、useResolvedTheme
├── store/                # useConversionStore（轉檔清單）、useThemeStore（主題）
├── utils/                # 轉檔、縮圖尺寸計算、檔名處理、ZIP、資料夾拖放
├── locales/              # zh-Hant-TW / zh-Hans / en-US
└── constants/            # 輸出規格等常數
```

每個 hook、store 與工具函式都有對應的 `__test__/` 單元測試。

---

## 命令列腳本 `heic2png.sh`

需要**原尺寸、無損 PNG** 時使用。只用 macOS 內建的 `sips`，不需安裝任何套件。

```bash
./heic2png.sh ~/Pictures/iphone                # 轉換資料夾內所有 HEIC（PNG 存在原檔旁）
./heic2png.sh -r -o ~/Desktop/png ~/Photos     # 含子資料夾，輸出到指定資料夾並保留結構
./heic2png.sh IMG_0001.HEIC IMG_0002.heic      # 指定檔案
```

| 選項 | 說明 |
|---|---|
| `-o DIR` | 輸出資料夾（預設：與原檔同一資料夾） |
| `-r` | 遞迴處理子資料夾 |
| `-j N` | 平行處理數量（預設：CPU 核心數） |
| `-f` | 覆蓋已存在的 PNG（預設略過，所以可重複執行只補轉新檔） |
| `-d` | 轉檔成功後把原始 HEIC 移到垃圾桶 |
| `-h` | 顯示說明 |

有檔案轉換失敗時會標示 `FAIL`、繼續處理其他檔案，最後以非 0 結束碼結束。

想在任何地方直接執行：

```bash
ln -s "$PWD/heic2png.sh" /opt/homebrew/bin/heic2png
```
