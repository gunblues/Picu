
  let selfieSegmentation;
let canvas, ctx, outputImg, downloadRemovebgBtn; // 新增 downloadRemovebgBtn
let removebgProgressBarContainer, removebgProgressBar;

// 新增全域變數來儲存原始圖片資訊和處理結果
let originalRemoveBgImage = null; // 儲存原始圖片物件
let originalRemoveBgImageWidth = 0;
let originalRemoveBgImageHeight = 0;
let downsampleScaleFactor = 1; // 降採樣比例
let processedMask = null; // 儲存處理後的遮罩
let processedImageBlob = null; // 儲存處理後的圖片 Blob (用於下載)

export function initRemoveBgTool() {
  const removebgBtn = document.getElementById('removebg-btn');
  const originalRemoveBgBtnText = removebgBtn.textContent;
  let isModelLoading = false;
  let isModelLoaded = false;
  downloadRemovebgBtn = document.getElementById('download-removebg-btn');
  const uploadedList = document.getElementById('uploaded-list');
  canvas = document.getElementById('removebg-canvas');
  ctx = canvas.getContext('2d');
  outputImg = document.getElementById('removebg-output');

  removebgProgressBarContainer = document.getElementById('removebg-progress-container');
  removebgProgressBar = document.getElementById('removebg-progress-bar');

  // 監聽全域的 image-selected 事件，用於預覽圖片
  window.addEventListener('image-selected', (event) => {
    const { dataUrl } = event.detail;
    // **重要**：每次都重新獲取最新的元素參照，防止因 DOM 操作導致參照失效
    const currentOutputImg = document.getElementById('removebg-output');
    if (currentOutputImg) {
      currentOutputImg.src = dataUrl;
      currentOutputImg.style.display = 'block';
      canvas.style.display = 'none'; // 確保 canvas 隱藏
      removebgProgressBarContainer.style.display = 'none'; // Hide progress bar on new image selection
    }
  });

  // "Remove Background" 按鈕的點擊事件
  removebgBtn.onclick = async () => {
    if (!outputImg.src || outputImg.style.display === 'none') {
      alert(window.alertTranslations.alertSelectImageForRemoveBg);
      return;
    }

    if (!isModelLoaded && !isModelLoading) {
      isModelLoading = true;
      removebgBtn.textContent = window.alertTranslations.loadingModelMessage;
      removebgBtn.disabled = true;
      removebgProgressBarContainer.style.display = 'block';
      removebgProgressBar.style.width = '0%';
      removebgProgressBar.textContent = '0%';
      try {
        await loadMediaPipe();
        isModelLoaded = true;
        console.log('MediaPipe model loaded successfully.');
      } catch (error) {
        console.error('Failed to load MediaPipe model:', error);
        alert('模型載入失敗，請重試。');
        removebgBtn.textContent = originalRemoveBgBtnText;
        removebgBtn.disabled = false;
        isModelLoading = false;
        removebgProgressBarContainer.style.display = 'none';
        return;
      }
      removebgBtn.textContent = originalRemoveBgBtnText;
      removebgBtn.disabled = false;
      isModelLoading = false;
    }

    if (!isModelLoaded) {
      // 如果模型還沒載入完成，則不執行去背操作
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    // 隱藏 outputImg，顯示 canvas
    outputImg.style.display = 'none';
    canvas.style.display = 'block';

    img.onload = async () => {
      originalRemoveBgImage = img; // Store the original image object
      originalRemoveBgImageWidth = img.width;
      originalRemoveBgImageHeight = img.height;

      const MAX_REMOVEBG_DIMENSION = 800; // Max width or height for MediaPipe input
      let inputWidth = img.width;
      let inputHeight = img.height;

      if (inputWidth > MAX_REMOVEBG_DIMENSION || inputHeight > MAX_REMOVEBG_DIMENSION) {
        if (inputWidth > inputHeight) {
          inputHeight = Math.round(img.height * (MAX_REMOVEBG_DIMENSION / img.width));
          inputWidth = MAX_REMOVEBG_DIMENSION;
        } else {
          inputWidth = Math.round(img.width * (MAX_REMOVEBG_DIMENSION / img.height));
          inputHeight = MAX_REMOVEBG_DIMENSION;
        }
        downsampleScaleFactor = originalRemoveBgImageWidth / inputWidth; // Calculate scale factor
      } else {
        downsampleScaleFactor = 1; // No downsampling needed
      }

      // Create a temporary canvas for downsampled input to MediaPipe
      const inputCanvas = document.createElement('canvas');
      const inputCtx = inputCanvas.getContext('2d');
      inputCanvas.width = inputWidth;
      inputCanvas.height = inputHeight;
      inputCtx.drawImage(img, 0, 0, inputWidth, inputHeight);

      // 添加加載指示器
      outputImg.style.opacity = '0.5';
      document.body.style.cursor = 'wait';
      removebgProgressBarContainer.style.display = 'block';
      removebgProgressBar.style.width = '50%'; // Simulate progress
      removebgProgressBar.textContent = '50%';

      await selfieSegmentation.send({ image: inputCanvas }); // Send downsampled image to MediaPipe
    };

    img.src = outputImg.src;
  };

  // "Download" 按鈕的點擊事件
  downloadRemovebgBtn.onclick = async () => {
    if (!originalRemoveBgImage || !processedMask || !processedImageBlob) {
      alert(window.alertTranslations.alertNoImageToDownload);
      return;
    }

    const addWhiteBgCheckbox = document.getElementById('removebg-white-bg');

    // Create a high-resolution canvas for output
    const outputCanvas = document.createElement('canvas');
    const outputCtx = outputCanvas.getContext('2d');

    outputCanvas.width = originalRemoveBgImageWidth;
    outputCanvas.height = originalRemoveBgImageHeight;

    // Scale the mask and image to original dimensions
    // Draw the mask first to define the clipping area on the high-res canvas
    outputCtx.drawImage(processedMask, 0, 0, originalRemoveBgImageWidth, originalRemoveBgImageHeight);

    // Use 'source-in' to isolate the foreground on the high-res canvas
    outputCtx.globalCompositeOperation = 'source-in';
    outputCtx.drawImage(originalRemoveBgImage, 0, 0, originalRemoveBgImageWidth, originalRemoveBgImageHeight);

    // If the user wants a white background, draw it behind the existing content
    if (addWhiteBgCheckbox && addWhiteBgCheckbox.checked) {
      outputCtx.globalCompositeOperation = 'destination-over';
      outputCtx.fillStyle = 'white';
      outputCtx.fillRect(0, 0, originalRemoveBgImageWidth, originalRemoveBgImageHeight);
    }
    
    // Reset composite operation
    outputCtx.globalCompositeOperation = 'source-over';

    outputCanvas.toBlob((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'removed-background.png'; // 下載檔案名
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      outputCanvas.remove(); // Clean up the temporary canvas
    }, 'image/png');
  };

  // Check if an image is already selected when the tool initializes
  if (window.selectedForCrop !== null && window.imageDataList[window.selectedForCrop]) {
    const initialImageData = window.imageDataList[window.selectedForCrop];
    const event = new CustomEvent('image-selected', { 
      detail: { 
        dataUrl: initialImageData.dataUrl,
        name: initialImageData.name
      }
    });
    window.dispatchEvent(event);
  }
}

async function loadMediaPipe() {
  selfieSegmentation = new SelfieSegmentation({
    locateFile: (file) => 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/' + file,
  });
  selfieSegmentation.setOptions({ modelSelection: 1 });
  selfieSegmentation.onResults(onResults);
  await selfieSegmentation.initialize();
}

function onResults(results) {
  const addWhiteBgCheckbox = document.getElementById('removebg-white-bg');

  // 儲存處理後的遮罩和圖片
  processedMask = results.segmentationMask;
  processedImageBlob = results.image; // This is actually an ImageBitmap or HTMLImageElement
  
  // 確保 canvas 尺寸與圖片一致 (使用降採樣後的尺寸)
  canvas.width = results.image.width;
  canvas.height = results.image.height;

  // 清空畫布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the mask first to define the clipping area
  ctx.drawImage(processedMask, 0, 0, canvas.width, canvas.height);

  // Use 'source-in' to isolate the foreground
  ctx.globalCompositeOperation = 'source-in';
  ctx.drawImage(processedImageBlob, 0, 0, canvas.width, canvas.height);

  // If the user wants a white background, draw it behind the existing content
  if (addWhiteBgCheckbox && addWhiteBgCheckbox.checked) {
    // Use 'destination-over' to draw behind the existing content
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  // 重置混合模式
  ctx.globalCompositeOperation = 'source-over';

  // **重要**：在非同步回呼中，重新獲取最新的元素參照來更新
  const currentOutputImg = document.getElementById('removebg-output');
  if (currentOutputImg) {
    // 清除舊的圖片，確保只顯示一張
    currentOutputImg.src = ''; // 清空 src
    currentOutputImg.src = canvas.toDataURL('image/png');
    currentOutputImg.style.opacity = '1';
    currentOutputImg.style.display = 'block';
    canvas.style.display = 'none'; // 隱藏 canvas
    downloadRemovebgBtn.style.display = 'inline-block'; // 顯示下載按鈕
  }
  
  // 恢復滑鼠樣式
  document.body.style.cursor = 'default';
  removebgProgressBar.style.width = '100%'; // Set to 100% on completion
  removebgProgressBar.textContent = '100%';
  setTimeout(() => {
    removebgProgressBarContainer.style.display = 'none'; // Hide after a short delay
  }, 500);
}

  
