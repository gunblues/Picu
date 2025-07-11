import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    manifest: true, // 啟用 manifest 生成 // 將建置後的檔案輸出到 'dist' 目錄
    rollupOptions: {
      input: {
        main: 'main.js', // 您的主要 JavaScript 檔案
        style: 'style.css', // 您的主要 CSS 檔案
      },
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`
      }
    }
  }
});