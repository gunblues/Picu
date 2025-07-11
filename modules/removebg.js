
let selfieSegmentation;
let canvas, ctx, outputImg, downloadRemovebgBtn; // 新增 downloadRemovebgBtn

export function initRemoveBgTool() {
  const removebgBtn = document.getElementById('removebg-btn');
  downloadRemovebgBtn = document.getElementById('download-removebg-btn'); // 移除 const
  const uploadedList = document.getElementById('uploaded-list');
  canvas = document.getElementById('removebg-canvas');
  ctx = canvas.getContext('2d');
  outputImg = document.getElementById('removebg-output');

  // 監聽全域的 image-selected 事件，用於預覽圖片
  window.addEventListener('image-selected', (event) => {
    const { dataUrl } = event.detail;
    // **重要**：每次都重新獲取最新的元素參照，防止因 DOM 操作導致參照失效
    const currentOutputImg = document.getElementById('removebg-output');
    if (currentOutputImg) {
      currentOutputImg.src = dataUrl;
      currentOutputImg.style.display = 'block';
      canvas.style.display = 'none'; // 確保 canvas 隱藏
    }
  });

  // "Remove Background" 按鈕的點擊事件
  removebgBtn.onclick = async () => {
    if (!outputImg.src || outputImg.style.display === 'none') {
      alert(window.alertTranslations.alertSelectImageForRemoveBg);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    // 隱藏 outputImg，顯示 canvas
    outputImg.style.display = 'none';
    canvas.style.display = 'block';

    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (!selfieSegmentation) {
        await loadMediaPipe();
      }
      
      // 添加加載指示器
      outputImg.style.opacity = '0.5';
      document.body.style.cursor = 'wait';

      await selfieSegmentation.send({ image: img });
    };

    img.src = outputImg.src;
  };

  // "Download" 按鈕的點擊事件
  downloadRemovebgBtn.onclick = () => {
    if (outputImg.src && outputImg.style.display !== 'none') {
      const link = document.createElement('a');
      link.href = outputImg.src;
      link.download = 'removed-background.png'; // 下載檔案名
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(window.alertTranslations.alertNoImageToDownload); // 假設有這個翻譯鍵
    }
  };
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
  // 獲取分割蒙版
  const mask = results.segmentationMask;
  
  // 確保 canvas 尺寸與圖片一致
  canvas.width = results.image.width;
  canvas.height = results.image.height;

  // 清空畫布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 繪製蒙版
  ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
  
  // 使用 'source-in' 操作，只保留原圖中與蒙版重疊的部分（即前景）
  ctx.globalCompositeOperation = 'source-in';
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
  
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
}
