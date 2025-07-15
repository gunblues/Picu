export function initWhiteBgTool() {
  const btn = document.getElementById('whitebg-btn');
  const preview = document.getElementById('whitebg-preview');
  const whitebgProgressBarContainer = document.getElementById('whitebg-progress-container');
  const whitebgProgressBar = document.getElementById('whitebg-progress-bar');

  // New preview elements
  const whitebgPreviewContainer = document.getElementById('whitebg-preview-container');
  const whitebgPreviewImage = document.getElementById('whitebg-preview-image');
  const whitebgWidthInput = document.getElementById('whitebg-width');
  const whitebgHeightInput = document.getElementById('whitebg-height');
  const whitebgShadowCheckbox = document.getElementById('whitebg-shadow');
  const whitebgBorderCheckbox = document.getElementById('whitebg-border');

  let previewWorker = null; // To manage the worker for preview

  // Debounce function to limit how often the preview is generated
  const debounce = (func, delay) => {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  };

  const generatePreview = async () => {
    const selectedImageIndices = Array.from(window.selectedIndices || []);
    if (selectedImageIndices.length !== 1) {
      whitebgPreviewContainer.style.display = 'none';
      whitebgPreviewImage.src = '';
      return;
    }

    const selectedImage = window.imageDataList[selectedImageIndices[0]];
    if (!selectedImage) {
      whitebgPreviewContainer.style.display = 'none';
      whitebgPreviewImage.src = '';
      return;
    }

    whitebgPreviewContainer.style.display = 'block';
    whitebgPreviewImage.src = ''; // Clear previous preview

    const width = parseInt(whitebgWidthInput.value) || 1000;
    const height = parseInt(whitebgHeightInput.value) || 1000;
    const shadow = whitebgShadowCheckbox.checked;
    const border = whitebgBorderCheckbox.checked;

    // Terminate previous worker if exists
    if (previewWorker) {
      previewWorker.terminate();
    }

    previewWorker = new Worker('./modules/whitebgWorker.js');

    previewWorker.onmessage = (event) => {
      const { status, whitebgData, message } = event.data;
      if (status === 'success') {
        const blob = new Blob([whitebgData], { type: selectedImage.type });
        const url = URL.createObjectURL(blob);
        whitebgPreviewImage.src = url;
        whitebgPreviewImage.onload = () => URL.revokeObjectURL(url); // Clean up object URL
      } else {
        console.error('生成預覽失敗:', message);
        whitebgPreviewImage.src = '';
      }
    };

    previewWorker.postMessage({
      dataUrl: selectedImage.dataUrl,
      width,
      height,
      shadow,
      border,
      index: 0, // For preview, we only process one image
      originalType: selectedImage.type
    });
  };

  const debouncedGeneratePreview = debounce(generatePreview, 300); // Debounce by 300ms

  // Add event listeners to controls
  whitebgWidthInput.addEventListener('input', debouncedGeneratePreview);
  whitebgHeightInput.addEventListener('input', debouncedGeneratePreview);
  whitebgShadowCheckbox.addEventListener('change', debouncedGeneratePreview);
  whitebgBorderCheckbox.addEventListener('change', debouncedGeneratePreview);

  btn.onclick = async () => {
    if (!window.selectedIndices || window.selectedIndices.size === 0) {
      alert(window.alertTranslations.alertSelectImageForWhiteBg);
      return;
    }

    // Hide preview when actual processing starts
    whitebgPreviewContainer.style.display = 'none';
    whitebgPreviewImage.src = '';

    const width = parseInt(whitebgWidthInput.value) || 1000;
    const height = parseInt(whitebgHeightInput.value) || 1000;
    const shadow = whitebgShadowCheckbox.checked;
    const border = whitebgBorderCheckbox.checked;

    const selectedImages = Array.from(window.selectedIndices).map(i => window.imageDataList[i]);

    preview.innerHTML = ''; // Clear previous messages
    whitebgProgressBarContainer.style.display = 'block';
    whitebgProgressBar.style.width = '0%';
    whitebgProgressBar.textContent = '0%';

    const workers = [];
    const whitebgResults = new Array(selectedImages.length);
    let completedCount = 0;

    for (let i = 0; i < selectedImages.length; i++) {
      const { dataUrl, name } = selectedImages[i];

      const worker = new Worker('./modules/whitebgWorker.js');
      workers.push(worker);

      worker.onmessage = (event) => {
        const { status, index, whitebgData, message } = event.data;
        if (status === 'success') {
          whitebgResults[index] = { filename: selectedImages[index].name, blob: new Blob([whitebgData], { type: selectedImages[index].type }) };
        } else {
          console.error(`製作白底圖 ${selectedImages[index].name} 失敗:`, message);
          preview.innerHTML = `處理圖片 ${selectedImages[index].name} 失敗: ${message}`;
        }

        completedCount++;
        const progress = Math.round((completedCount / selectedImages.length) * 100);
        whitebgProgressBar.style.width = `${progress}%`;
        whitebgProgressBar.textContent = `${progress}%`;

        if (completedCount === selectedImages.length) {
          workers.forEach(w => w.terminate());
          whitebgProgressBarContainer.style.display = 'none';

          if (selectedImages.length === 1) {
            const { filename, blob } = whitebgResults[0];
            const originalNameWithoutExt = filename.split('.').slice(0, -1).join('.');
            const fileExtension = filename.split('.').pop();
            const newFilename = `${originalNameWithoutExt}_whitebg.${fileExtension}`;

            const url = URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.download = newFilename;
            link.click();
            URL.revokeObjectURL(url);
            preview.innerHTML = '';
          } else {
            const zip = new JSZip();
            // Hide progress bar during zipping
            whitebgProgressBarContainer.style.display = 'none';
            whitebgResults.forEach(({ filename, blob }) => {
              const name = filename.replace(/\.[^/.]+$/, `.${filename.split('.').pop()}`);
              zip.file(name, blob);
            });

            zip.generateAsync({ type: 'blob' }).then(blob => {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'whitebg_images.zip';
              link.click();
              URL.revokeObjectURL(link.href);
              preview.innerHTML = '';
            }).catch(err => {
              console.error('生成ZIP失敗:', err);
            }).finally(() => {
              whitebgProgressBarContainer.style.display = 'none'; // Ensure progress bar is hidden even on error
            });
          }
        }
      };

      worker.postMessage({
        dataUrl,
        width,
        height,
        shadow,
        border,
        index: i,
        originalType: selectedImages[i].type
      });
    }
  };
}

// ✅ 註冊並立即更新 White Background 按鈕文字
window.updateWhitebgSelection = (selectedItems) => {
  const whitebgBtn = document.getElementById('whitebg-btn');
  if (whitebgBtn) {
    const count = selectedItems.length;
    whitebgBtn.textContent = `${window.appTranslations.whitebgBtn} (${count})`;
  }
  // Trigger preview update when selection changes
  const selectedImageIndices = Array.from(window.selectedIndices || []);
  if (selectedImageIndices.length === 1) {
    // Only generate preview if whitebg tab is active
    const whitebgTab = document.getElementById('whitebg');
    if (whitebgTab && whitebgTab.classList.contains('active')) {
      const whitebgWidthInput = document.getElementById('whitebg-width');
      const whitebgHeightInput = document.getElementById('whitebg-height');
      const whitebgShadowCheckbox = document.getElementById('whitebg-shadow');
      const whitebgBorderCheckbox = document.getElementById('whitebg-border');
      // Manually trigger input event to generate preview immediately on selection change
      whitebgWidthInput.dispatchEvent(new Event('input'));
    }
  } else {
    const whitebgPreviewContainer = document.getElementById('whitebg-preview-container');
    const whitebgPreviewImage = document.getElementById('whitebg-preview-image');
    if (whitebgPreviewContainer) whitebgPreviewContainer.style.display = 'none';
    if (whitebgPreviewImage) whitebgPreviewImage.src = '';
  }
};

// ✅ 初始化呼叫一次
const selectedItems = Array.from(window.selectedIndices || []).map(i => window.imageDataList?.[i]).filter(Boolean);
window.updateWhitebgSelection(selectedItems);
