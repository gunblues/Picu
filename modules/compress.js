

import imageCompression from 'browser-image-compression';

export function initCompressTool() {
  const compressBtn = document.getElementById('compress-btn');
  const compressList = document.getElementById('compress-list');
  const compressQualityInput = document.getElementById('compress-quality');
  const compressQualityValueSpan = document.getElementById('compress-quality-value');
  const compressFormatSelect = document.getElementById('compress-format');
  const compressSizeInfoDiv = document.getElementById('compress-size-info');
  const progressBarContainer = document.getElementById('compress-progress-container');
  const progressBar = document.getElementById('compress-progress-bar');

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
    compressList.innerHTML = '';
    selectedItems.forEach((item, i) => {
      const span = document.createElement('span');
      span.textContent = item.name || `圖片 ${i + 1}`;
      compressList.appendChild(span);
    });
    updateOriginalSizeInfo();
  };

  compressBtn.onclick = async () => {
    if (!window.selectedIndices || window.selectedIndices.size === 0) {
      alert(window.alertTranslations.alertSelectImageForCompress);
      return;
    }

    const quality = parseInt(compressQualityInput.value, 10) / 100;
    const selectedFormat = compressFormatSelect.value;

    const selectedImages = Array.from(window.selectedIndices)
      .map(i => window.imageDataList[i])
      .filter(Boolean);

    if (selectedImages.length === 0) return;

    compressList.innerHTML = ''; // Clear previous messages
    progressBarContainer.style.display = 'block'; // Show progress bar
    progressBar.style.width = '0%';
    progressBar.textContent = `0% (${window.appTranslations.compressing})`;

    const zip = new JSZip();
    let processedCount = 0;
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;

    for (const image of selectedImages) {
      totalOriginalSize += image.file.size;

      const options = {
        maxSizeMB: Infinity,
        maxWidthOrHeight: Infinity,
        useWebWorker: false,
        fileType: selectedFormat,
        initialQuality: quality,
      };

      try {
        const compressedFile = await imageCompression(image.file, options);
        const finalBlob = compressedFile.size < image.file.size ? compressedFile : image.file;
        totalCompressedSize += finalBlob.size;

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
