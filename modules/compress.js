import imageCompression from 'browser-image-compression';

export function initCompressTool() {
  const compressBtn = document.getElementById('compress-btn');
  const compressList = document.getElementById('compress-list'); // Keep this for now, will remove in index.php
  const compressQualityInput = document.getElementById('compress-quality');
  const compressQualityValueSpan = document.getElementById('compress-quality-value');
  const compressFormatSelect = document.getElementById('compress-format');
  const compressSizeInfoDiv = document.getElementById('compress-size-info');
  const progressBarContainer = document.getElementById('compress-progress-container');
  const progressBar = document.getElementById('compress-progress-bar');
  const compressMaxDimensionInput = document.getElementById('compress-max-dimension');

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function updateOriginalSizeInfo() {
    const selectedImages = Array.from(window.selectedIndices)
      .map(i => window.imageDataList[i])
      .filter(Boolean);

    if (selectedImages.length === 0) {
      compressSizeInfoDiv.innerHTML = '';
      return;
    }

    const totalOriginalSize = selectedImages.reduce((sum, img) => sum + (img.file.size || 0), 0);
    compressSizeInfoDiv.innerHTML = `${window.appTranslations.totalOriginalSizeLabel} <strong>${formatBytes(totalOriginalSize)}</strong>`;
  }

  compressQualityInput.oninput = () => {
    compressQualityValueSpan.textContent = compressQualityInput.value;
  };

  window.updateCompressSelection = (selectedItems) => {
    // 更新按鈕文字，顯示選中檔案數量
    const selectedCount = selectedItems.length;
    // 提供一個預設值，以防 window.appTranslations.compressBtn 尚未載入
    const originalButtonText = window.appTranslations && window.appTranslations.compressBtn ? window.appTranslations.compressBtn : 'Compress & Download Selected'; 
    if (selectedCount > 0) {
      compressBtn.textContent = `${originalButtonText} (${selectedCount})`;
    } else {
      compressBtn.textContent = originalButtonText;
    }

    updateOriginalSizeInfo();
  };

  compressBtn.onclick = async () => {
    if (!window.selectedIndices || window.selectedIndices.size === 0) {
      alert(window.alertTranslations.alertSelectImageForCompress);
      return;
    }

    const quality = parseInt(compressQualityInput.value, 10) / 100;
    const selectedFormat = compressFormatSelect.value;
    const maxDimension = parseInt(compressMaxDimensionInput.value, 10) || Infinity;

    console.log('壓縮選項 - maxDimension:', maxDimension, 'quality:', quality, 'format:', selectedFormat);

    const selectedImages = Array.from(window.selectedIndices)
      .map(i => window.imageDataList[i])
      .filter(Boolean);

    if (selectedImages.length === 0) return;

    // compressList.innerHTML = ''; // Clear previous messages - no longer needed here
    progressBarContainer.style.display = 'block'; // Show progress bar
    progressBar.style.width = '0%';
    progressBar.textContent = `0% (${window.appTranslations.compressing})`;

    const zip = new JSZip();
    let processedCount = 0;
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;

    for (const image of selectedImages) {
      totalOriginalSize += image.file.size;

      // 讀取原始圖片尺寸
      const originalImage = new Image();
      const originalImageLoadPromise = new Promise(resolve => {
        originalImage.onload = () => resolve();
        originalImage.src = URL.createObjectURL(image.file);
      });
      await originalImageLoadPromise;
      const originalWidth = originalImage.width;
      const originalHeight = originalImage.height;
      URL.revokeObjectURL(originalImage.src); // 釋放 URL 物件

      const options = {
        maxSizeMB: Infinity, 
        maxWidthOrHeight: maxDimension, 
        useWebWorker: true, 
        fileType: selectedFormat,
        initialQuality: quality,
      };

      console.log(`處理圖片: ${image.file.name}, 原始尺寸: ${originalWidth}x${originalHeight}, 原始大小: ${formatBytes(image.file.size)}`);
      console.log('傳遞給 imageCompression 的選項:', options);

      try {
        const compressedFile = await imageCompression(image.file, options);
        const finalBlob = compressedFile.size < image.file.size ? compressedFile : image.file;
        totalCompressedSize += finalBlob.size;

        // 為了獲取壓縮後圖片的尺寸，我們需要將 Blob 轉換為 Image 物件
        const img = new Image();
        const imgLoadPromise = new Promise(resolve => {
          img.onload = () => resolve();
          img.src = URL.createObjectURL(finalBlob);
        });
        await imgLoadPromise;

        console.log(`壓縮後圖片: ${finalBlob.name}, 尺寸: ${img.width}x${img.height}, 大小: ${formatBytes(finalBlob.size)}`);
        URL.revokeObjectURL(img.src); // 釋放 URL 物件

        const fileExtension = selectedFormat.split('/')[1];
        const finalFilename = image.file.name.replace(/\.[^/.]+$/, `.${fileExtension}`);

        zip.file(finalFilename, finalBlob);

      } catch (error) {
        console.error(`壓縮圖片 ${image.name} 失敗:`, error);
        zip.file(image.file.name, image.file);
        totalCompressedSize += image.file.size;
      }

      processedCount++;
      const progress = Math.round((processedCount / selectedImages.length) * 100);
      progressBar.style.width = `${progress}%`;
      progressBar.textContent = `${progress}% (${window.appTranslations.compressing})`;
    }

    // All images processed, now handle download
    progressBarContainer.style.display = 'none'; // Hide progress bar
    const reduction = totalOriginalSize > 0 ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100 : 0;
    compressSizeInfoDiv.innerHTML = window.appTranslations.compressSummary.replace('%s', formatBytes(totalOriginalSize)).replace('%s', formatBytes(totalCompressedSize)) + window.appTranslations.compressSummaryReduction.replace('%s', reduction.toFixed(1));

    if (selectedImages.length === 1) {
      const singleResultFile = Object.values(zip.files)[0];
      const blob = await singleResultFile.async('blob');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = singleResultFile.name;
      link.click();
      URL.revokeObjectURL(link.href);
    } else {
      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'picu_compressed_images.zip';
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };
}
