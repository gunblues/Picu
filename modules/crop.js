export function initCropTool() {
  const cropCanvasContainer = document.getElementById('crop-canvas');
  const toolbar = document.getElementById('crop-toolbar');
  const ratioButtons = toolbar.querySelectorAll('button[data-ratio]');
  const cropBtn = document.getElementById('crop-btn');

  let cropper = null;
  let originalFilename = 'image';

  // 監聽全域的 image-selected 事件
  window.addEventListener('image-selected', (event) => {
    const { dataUrl, name } = event.detail;
    originalFilename = name || 'image';

    // 1. 銷毀舊的 Cropper 實例
    if (cropper) {
      cropper.destroy();
    }

    // 2. 清空容器
    cropCanvasContainer.innerHTML = '';

    // 3. 建立全新的圖片元素
    const imageElement = document.createElement('img');
    imageElement.id = 'image-to-crop';
    imageElement.style.width = '100%';
    imageElement.style.maxHeight = '80vh';
    imageElement.style.objectFit = 'contain';
    imageElement.style.display = 'block';
    imageElement.src = dataUrl;
    cropCanvasContainer.appendChild(imageElement);

    // 4. 在新圖片載入後，初始化新的 Cropper 實例
    imageElement.onload = () => {
      // 建立一個函式來重複檢查圖片尺寸，直到它被正確渲染
      const initializeCropperWhenReady = () => {
        // 檢查圖片的 clientWidth 是否大於 0，這表示它已經在 DOM 中被渲染並佔有空間
        if (imageElement.clientWidth > 0) {
          // 尺寸已就緒，初始化 Cropper.js
          cropper = new Cropper(imageElement, {
            aspectRatio: 1,
            viewMode: 1,
            responsive: true,
            autoCropArea: 0.8, // 將初始裁切區設定為圖片區域的 80%
          });
          // 恢復上次選擇的比例按鈕狀態
          const activeButton = toolbar.querySelector('button[data-ratio].active');
          if (activeButton) {
            cropper.setAspectRatio(parseRatio(activeButton.dataset.ratio));
          }
        } else {
          // 圖片尚未渲染，要求瀏覽器在下一個繪製週期再次呼叫此函式
          requestAnimationFrame(initializeCropperWhenReady);
        }
      };
      // 開始檢查循環
      requestAnimationFrame(initializeCropperWhenReady);
    };
  });

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

  function parseRatio(ratioStr) {
    if (ratioStr === 'free') return NaN;
    const parts = ratioStr.split('/');
    return parts.length === 2
      ? parseFloat(parts[0]) / parseFloat(parts[1])
      : parseFloat(ratioStr);
  }

  ratioButtons.forEach(button => {
    button.addEventListener('click', () => {
      const ratio = button.dataset.ratio;
      if (cropper) {
        cropper.setAspectRatio(parseRatio(ratio));
      }

      ratioButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });

  cropBtn.addEventListener('click', () => {
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      canvas.toBlob(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${originalFilename}_cropped.png`;
        link.click();
      }, 'image/png');
    }
  });
}

