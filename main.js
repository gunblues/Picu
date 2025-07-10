import { initUploader } from './modules/uploader.js';
import { initCropTool } from './modules/crop.js';
import { initCompressTool } from './modules/compress.js';
import { initWhiteBgTool } from './modules/whitebg.js';
import { initEnhanceTool } from './modules/enhance.js';
import { initResizeTool } from './modules/resize.js';


window.onload = () => {
  
  initUploader();
  initCropTool();
  initCompressTool();
  initWhiteBgTool();
  initEnhanceTool();
  initResizeTool(); 

  // Tab 切換邏輯
  const tabButtons = document.querySelectorAll('#tabs button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.tab;

      // 移除所有 tab 的 active 狀態
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // 將點擊的 tab 設為 active
      button.classList.add('active');
      document.getElementById(targetId).classList.add('active');
    });
  });
};
