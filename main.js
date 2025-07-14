import { initUploader } from './modules/uploader.js';


const initializedTools = {};

window.onload = () => {
  console.log('main.js loaded and window.onload executed!');

  initUploader(); // Uploader is always initialized

  // Tab 切換邏輯
  const tabButtons = document.querySelectorAll('#tabs button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const targetId = button.dataset.tab;

      // 移除所有 tab 的 active 狀態
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // 將點擊的 tab 設為 active
      button.classList.add('active');
      document.getElementById(targetId).classList.add('active');

      // Lazy load tool modules
      if (!initializedTools[targetId]) {
        try {
          switch (targetId) {
            case 'compress':
              const { initCompressTool } = await import('./modules/compress.js');
              initCompressTool();
              break;
            case 'resize':
              const { initResizeTool } = await import('./modules/resize.js');
              initResizeTool();
              break;
            case 'whitebg':
              const { initWhiteBgTool } = await import('./modules/whitebg.js');
              initWhiteBgTool();
              // Manually trigger preview generation when whitebg tab is activated
              const whitebgWidthInput = document.getElementById('whitebg-width');
              if (whitebgWidthInput) {
                whitebgWidthInput.dispatchEvent(new Event('input'));
              }
              break;
            case 'rotate':
              const { initRotateTool } = await import('./modules/rotate.js');
              initRotateTool();
              // The updateRotateSelection function will handle preview generation
              break;
            case 'enhance':
              const { initEnhanceTool } = await import('./modules/enhance.js');
              initEnhanceTool();
              break;
            case 'crop':
              const { initCropTool } = await import('./modules/crop.js');
              initCropTool();
              break;
            case 'removebg':
              const { initRemoveBgTool } = await import('./modules/removebg.js');
              initRemoveBgTool();
              break;
          }
          initializedTools[targetId] = true;
        } catch (error) {
          console.error(`Failed to load or initialize ${targetId} tool:`, error);
        }
      }
    });
  });

  // Simulate a click on the initially active tab to load its content
  const initialActiveTabButton = document.querySelector('#tabs button.active');
  if (initialActiveTabButton) {
    initialActiveTabButton.click();
  }
};
