export function initResizeTool() {
  const resizeBtn = document.getElementById('resize-btn');
  const resizeWidthInput = document.getElementById('resize-width');
  const resizeHeightInput = document.getElementById('resize-height');
  const resizePreview = document.getElementById('resize-preview');
  const resizeProgressBarContainer = document.getElementById('resize-progress-container');
  const resizeProgressBar = document.getElementById('resize-progress-bar');

  // New UI elements
  const pixelModeRadio = document.querySelector('input[name="resize-mode"][value="pixel"]');
  const percentageModeRadio = document.querySelector('input[name="resize-mode"][value="percentage"]');
  const pixelOptionsDiv = document.getElementById('pixel-options');
  const percentageOptionsDiv = document.getElementById('percentage-options');
  const aspectRatioCheckbox = document.getElementById('aspect-ratio-checkbox');
  const noEnlargeCheckbox = document.getElementById('no-enlarge-checkbox');
  const percentageSlider = document.getElementById('percentage-slider');
  const percentageValueSpan = document.getElementById('percentage-value');

  if (!resizeBtn || !resizeWidthInput || !resizeHeightInput || !resizeProgressBarContainer || !resizeProgressBar ||
      !pixelModeRadio || !percentageModeRadio || !pixelOptionsDiv || !percentageOptionsDiv ||
      !aspectRatioCheckbox || !noEnlargeCheckbox || !percentageSlider || !percentageValueSpan) {
    console.warn('Resize tool UI not fully found. Some elements might be missing.');
    return;
  }

  // Function to update input states based on selected mode and aspect ratio checkbox
  const updateInputStates = () => {
    if (pixelModeRadio.checked) {
      resizeWidthInput.disabled = false;
      percentageSlider.disabled = true;
      if (aspectRatioCheckbox.checked) {
        resizeHeightInput.disabled = true;
        resizeHeightInput.value = ''; // Clear height when disabled
      } else {
        resizeHeightInput.disabled = false;
      }
    } else { // percentageModeRadio.checked
      resizeWidthInput.disabled = true;
      resizeHeightInput.disabled = true; // Always disable height/width in percentage mode
      percentageSlider.disabled = false;
    }
  };

  // Event listener for aspect ratio checkbox
  aspectRatioCheckbox.addEventListener('change', updateInputStates);

  // Event listeners for mode selection
  pixelModeRadio.addEventListener('change', updateInputStates);
  percentageModeRadio.addEventListener('change', updateInputStates);

  // Event listener for percentage slider
  percentageSlider.addEventListener('input', () => {
    percentageValueSpan.textContent = `${percentageSlider.value}%`;
  });

  // Initial state setup
  updateInputStates();

  resizeBtn.onclick = async () => {
    if (!window.selectedIndices || window.selectedIndices.size === 0) {
      alert(window.alertTranslations.alertSelectImageForResize);
      return;
    }

    let targetWidth, targetHeight;
    const maintainAspectRatio = aspectRatioCheckbox.checked;
    const noEnlargeSmaller = noEnlargeCheckbox.checked;

    if (pixelModeRadio.checked) {
      targetWidth = parseInt(resizeWidthInput.value);
      // If aspect ratio is maintained, height will be calculated by worker
      targetHeight = maintainAspectRatio ? null : parseInt(resizeHeightInput.value);

      if (!targetWidth || (!maintainAspectRatio && !targetHeight)) {
        alert(window.alertTranslations.alertEnterWidthHeight);
        return;
      }
    } else { // Percentage mode
      const percentage = parseInt(percentageSlider.value);
      if (isNaN(percentage) || percentage <= 0) {
        alert('請輸入有效的百分比。'); // TODO: Add translation
        return;
      }
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

      let finalWidth = targetWidth;
      let finalHeight = targetHeight;

      if (pixelModeRadio.checked && maintainAspectRatio) {
        // Calculate finalHeight based on original aspect ratio and targetWidth
        finalHeight = Math.round(img.naturalHeight * (finalWidth / img.naturalWidth));
      } else if (percentageModeRadio.checked) {
        const percentage = parseInt(percentageSlider.value);
        finalWidth = Math.round(img.naturalWidth * (percentage / 100));
        finalHeight = Math.round(img.naturalHeight * (percentage / 100));
      }

      // Ensure dimensions are at least 1 to avoid errors
      finalWidth = Math.max(1, finalWidth);
      finalHeight = Math.max(1, finalHeight);

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
        width: finalWidth,
        height: finalHeight,
        index: i,
        originalType: selectedImages[i].type,
        maintainAspectRatio: maintainAspectRatio,
        noEnlargeSmaller: noEnlargeSmaller
      });
    };
  };

  // ✅ 註冊並立即執行 Resize 選取圖片更新按鈕
  window.updateResizeSelection = (selectedItems) => {
    const resizeBtn = document.getElementById('resize-btn');
    if (resizeBtn) {
      const count = selectedItems.length;
      resizeBtn.textContent = `${window.appTranslations.resizeBtn} (${count})`;
    }
  };

  // ✅ 初始化呼叫一次
  const selectedItems = Array.from(window.selectedIndices || []).map(i => window.imageDataList?.[i]).filter(Boolean);
  window.updateResizeSelection(selectedItems);
}
