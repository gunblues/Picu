import { initUploader } from './modules/uploader.js';

const initializedTools = {};

window.onload = () => {
  console.log('main.js loaded and window.onload executed!');

  initUploader(); // Uploader is always initialized

  // --- Start of new code for mobile scroll interaction improvement ---
  const isMobile = () => {
    // A simple check for touch devices and smaller screens
    return ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) && window.innerWidth <= 768;
  };

  if (isMobile()) {
    let scrollTimeout;
    // Target range inputs, buttons, text inputs, number inputs, and select elements
    const interactiveControls = document.querySelectorAll('input[type="range"], button, input[type="text"], input[type="number"], select');

    const disableInteractions = () => {
      interactiveControls.forEach(control => {
        control.classList.add('disable-pointer-events');
      });
    };

    const enableInteractions = () => {
      interactiveControls.forEach(control => {
        control.classList.remove('disable-pointer-events');
      });
    };

    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      disableInteractions();

      scrollTimeout = setTimeout(() => {
        enableInteractions();
      }, 150); // Adjust delay as needed
    }, { passive: true }); // Use passive listener for better scroll performance
  }
  // --- End of new code ---

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
            case 'watermark':
              const watermarkModule = await import('./modules/watermark.js');
              watermarkModule.initWatermarkTool();

               
               break;
          }
          initializedTools[targetId] = true;
        } catch (error) {
          console.error(`Failed to load or initialize ${targetId} tool:`, error);
        }
      }

      // 每次切換到 watermark 分頁時，都檢查並更新預覽圖
      if (targetId === 'watermark') {
        const watermarkModule = await import('./modules/watermark.js'); // 確保模組已載入
        const currentSelectedItems = Array.from(window.selectedIndices)
          .map(i => window.imageDataList[i])
          .filter(Boolean);
        if (currentSelectedItems.length > 0) {
          watermarkModule.setWatermarkPreviewImage(currentSelectedItems[0]);
        }
        watermarkModule.updateWatermarkSelection(currentSelectedItems);
      }

      // 每次切換到 rotate 分頁時，都檢查並更新預覽圖
      if (targetId === 'rotate') {
        const rotateModule = await import('./modules/rotate.js'); // 確保模組已載入
        // 假設 rotate 模組有一個函式來更新其預覽，例如 updateRotateSelection
        window.generateRotatePreview();
      }
    });
  });

  // Simulate a click on the initially active tab to load its content
  const initialActiveTabButton = document.querySelector('#tabs button.active');
  if (initialActiveTabButton) {
    initialActiveTabButton.click();
  }

  // Listen for image-selected event to update watermark preview
  window.addEventListener('image-selected', async (event) => {
    // Only update if the watermark tab is currently active
    const watermarkTabButton = document.querySelector('#tabs button[data-tab="watermark"]');
    if (watermarkTabButton && watermarkTabButton.classList.contains('active')) {
        const watermarkModule = await import('./modules/watermark.js');
        watermarkModule.setWatermarkPreviewImage(event.detail);
        // Also update the button count when image selection changes
        const currentSelectedItems = Array.from(window.selectedIndices)
          .map(i => window.imageDataList[i])
          .filter(Boolean);
        watermarkModule.updateWatermarkSelection(currentSelectedItems);
    }
  });
};
