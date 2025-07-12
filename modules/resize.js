export function initResizeTool() {
  const resizeBtn = document.getElementById('resize-btn');
  const resizeWidthInput = document.getElementById('resize-width');
  const resizeHeightInput = document.getElementById('resize-height');
  const resizePreview = document.getElementById('resize-preview');
  const resizeProgressBarContainer = document.getElementById('resize-progress-container');
  const resizeProgressBar = document.getElementById('resize-progress-bar');

  if (!resizeBtn || !resizeWidthInput || !resizeHeightInput || !resizeProgressBarContainer || !resizeProgressBar) {
    console.warn('Resize tool UI not found.');
    return;
  }

  resizeBtn.onclick = async () => {
    if (!window.selectedIndices || window.selectedIndices.size === 0) {
      alert(window.alertTranslations.alertSelectImageForResize);
      return;
    }

    const width = parseInt(resizeWidthInput.value);
    const height = parseInt(resizeHeightInput.value);

    if (!width || !height) {
      alert(window.alertTranslations.alertEnterWidthHeight);
      return;
    }

    const selectedImages = Array.from(window.selectedIndices).map(i => {
      return window.imageDataList[i];
    });

    resizePreview.innerHTML = ''; // Clear previous messages
    resizeProgressBarContainer.style.display = 'block';
    resizeProgressBar.style.width = '0%';
    resizeProgressBar.textContent = '0%';

    const workers = [];
    const resizedResults = new Array(selectedImages.length);
    let completedCount = 0;

    for (let i = 0; i < selectedImages.length; i++) {
      const { dataUrl, name } = selectedImages[i];
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => img.onload = resolve);

      const worker = new Worker('./modules/resizeWorker.js');
      workers.push(worker);

      worker.onmessage = (event) => {
        const { status, index, resizedData, message } = event.data;
        if (status === 'success') {
          resizedResults[index] = { filename: selectedImages[index].name, blob: new Blob([resizedData], { type: selectedImages[index].type }) };
        } else {
          console.error(`調整圖片 ${selectedImages[index].name} 失敗:`, message);
          resizePreview.innerHTML = `處理圖片 ${selectedImages[index].name} 失敗: ${message}`;
        }

        completedCount++;
        const progress = Math.round((completedCount / selectedImages.length) * 100);
        resizeProgressBar.style.width = `${progress}%`;
        resizeProgressBar.textContent = `${progress}%`;

        if (completedCount === selectedImages.length) {
          workers.forEach(w => w.terminate());
          resizeProgressBarContainer.style.display = 'none';

          if (selectedImages.length === 1) {
            const { filename, blob } = resizedResults[0];
            const originalNameWithoutExt = filename.split('.').slice(0, -1).join('.');
            const fileExtension = filename.split('.').pop();
            const newFilename = `${originalNameWithoutExt}_resized.${fileExtension}`;

            const url = URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.download = newFilename;
            link.click();
            URL.revokeObjectURL(url);
            resizePreview.innerHTML = '';
          } else {
            const zip = new JSZip();
            // Hide progress bar during zipping
            resizeProgressBarContainer.style.display = 'none';
            resizedResults.forEach(({ filename, blob }) => {
              const name = filename.replace(/\.[^/.]+$/, `.${filename.split('.').pop()}`);
              zip.file(name, blob);
            });

            zip.generateAsync({ type: 'blob' }).then(blob => {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'resized_images.zip';
              link.click();
              URL.revokeObjectURL(link.href);
              resizePreview.innerHTML = '';
            }).catch(err => {
              console.error('生成ZIP失敗:', err);
            }).finally(() => {
              resizeProgressBarContainer.style.display = 'none'; // Ensure progress bar is hidden even on error
            });
          }
        }
      };

      worker.postMessage({
        dataUrl: dataUrl,
        width,
        height,
        index: i,
        originalType: selectedImages[i].type
      });
    };
  };
}

// ✅ 註冊並立即執行 Resize 選取圖片更新按鈕
window.updateResizeSelection = (selectedItems) => {
  const resizeBtn = document.getElementById('resize-btn');
  if (resizeBtn) {
    const count = selectedItems.length;
    resizeBtn.textContent = `Resize & Download Selected (${count})`;
  }
};

// ✅ 初始化呼叫一次
const selectedItems = Array.from(window.selectedIndices || []).map(i => window.imageDataList?.[i]).filter(Boolean);
window.updateResizeSelection(selectedItems);
