

export function initCompressTool() {
  const compressBtn = document.getElementById('compress-btn');
  const compressList = document.getElementById('compress-list');
  const compressQualityInput = document.getElementById('compress-quality');
  const compressQualityValueSpan = document.getElementById('compress-quality-value');
  const compressFormatSelect = document.getElementById('compress-format');
  const compressSizeEstimateDiv = document.getElementById('compress-size-estimate');

  const resizeWidthInput = document.getElementById('compress-resize-width');
  const resizeHeightInput = document.getElementById('compress-resize-height');

  // Helper to format bytes to a readable string
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function updateSizeEstimate() {
    if (!window.selectedIndices || window.selectedIndices.size === 0) {
      compressSizeEstimateDiv.textContent = '';
      return;
    }

    let totalOriginalSize = 0;
    let totalEstimatedSize = 0;

    const quality = parseFloat(compressQualityInput.value) / 100;
    const selectedFormat = compressFormatSelect.value;
    const resizeWidth = parseInt(resizeWidthInput?.value || 0) || null;
    const resizeHeight = parseInt(resizeHeightInput?.value || 0) || null;

    Array.from(window.selectedIndices).forEach(index => {
      const image = window.imageDataList[index];
      if (!image || !image.size || !image.width || !image.height) {
        return; // Skip if essential data is missing
      }

      totalOriginalSize += image.size;

      let estimatedImageSize = image.size;

      // 1. Apply quality factor (non-linear approximation)
      // A simple heuristic: lower quality reduces size, but not linearly.
      // For example, quality 50 might not be half the size.
      // Let's use a more aggressive reduction for lower quality.
      estimatedImageSize *= (0.3 + 0.7 * quality); // This makes 100% quality result in 1x, 0% quality in 0.3x

      // 2. Apply resize factor
      if (resizeWidth || resizeHeight) {
        let newWidth = resizeWidth || image.width;
        let newHeight = resizeHeight || image.height;

        if (resizeWidth && !resizeHeight) {
          newHeight = image.height * (newWidth / image.width);
        } else if (resizeHeight && !resizeWidth) {
          newWidth = image.width * (newHeight / image.height);
        }
        
        const originalArea = image.width * image.height;
        const newArea = newWidth * newHeight;
        if (originalArea > 0) {
          estimatedImageSize *= (newArea / originalArea);
        }
      }

      // 3. Apply format conversion factor
      // These are rough estimates and can vary greatly based on image content
      if (selectedFormat !== 'original' && selectedFormat !== image.type) {
        if (image.type.includes('png') && selectedFormat.includes('jpeg')) {
          estimatedImageSize *= 0.2; // PNG to JPEG often results in significant reduction
        } else if (image.type.includes('png') && selectedFormat.includes('webp')) {
          estimatedImageSize *= 0.15; // PNG to WebP even more reduction
        } else if (image.type.includes('jpeg') && selectedFormat.includes('webp')) {
          estimatedImageSize *= 0.7; // JPEG to WebP usually some reduction
        }
        // Add other format conversions as needed
      }
      
      totalEstimatedSize += estimatedImageSize;
    });

    // Ensure estimated size is not negative or zero if original was positive
    if (totalOriginalSize > 0 && totalEstimatedSize <= 0) {
        totalEstimatedSize = 1; // Smallest possible positive value
    }

    const reduction = totalOriginalSize > 0 ? ((totalOriginalSize - totalEstimatedSize) / totalOriginalSize) * 100 : 0;
    const reductionText = reduction > 0 ? ` (預計減少 ${reduction.toFixed(1)}%)` : '';

    compressSizeEstimateDiv.textContent = `預估總大小：從 ${formatBytes(totalOriginalSize)} 變為 ${formatBytes(totalEstimatedSize)}${reductionText}`;
  }

  // Display quality value and update estimate
  compressQualityInput.oninput = () => {
    compressQualityValueSpan.textContent = compressQualityInput.value;
    updateSizeEstimate();
  };

  // Update estimate when format or resize dimensions change
  compressFormatSelect.onchange = updateSizeEstimate;
  resizeWidthInput.oninput = updateSizeEstimate;
  resizeHeightInput.oninput = updateSizeEstimate;

  // Update selection list (called by uploader)
  window.updateCompressSelection = (selectedItems) => {
    compressList.innerHTML = '';
    selectedItems.forEach((item, i) => {
      const span = document.createElement('span');
      span.textContent = item.name || `圖片 ${i + 1}`; // Use item.name instead of item.filename
      compressList.appendChild(span);
    });
    updateSizeEstimate(); // Update estimate when selection changes
  };

  // Initial estimate calculation when the tool is initialized
  updateSizeEstimate();

  compressBtn.onclick = async () => {
    if (!window.selectedIndices || window.selectedIndices.size === 0) {
      alert(window.alertTranslations.alertSelectImageForCompress);
      return;
    }

    const quality = parseFloat(compressQualityInput.value) / 100;
    const selectedFormat = compressFormatSelect.value;

    const resizeWidth = parseInt(resizeWidthInput?.value || 0) || null;
    const resizeHeight = parseInt(resizeHeightInput?.value || 0) || null;

    const selectedImages = Array.from(window.selectedIndices).map(i => {
      return window.imageDataList[i];
    });

    const zip = new JSZip();
    const workers = [];
    const compressedResults = new Array(selectedImages.length);
    let completedCount = 0;

    compressList.innerHTML = '<span>處理中...請稍候</span>';

    for (let i = 0; i < selectedImages.length; i++) {
      const { dataUrl, name, type: originalType } = selectedImages[i]; // Use name instead of filename
      const format = selectedFormat === 'original' ? originalType : selectedFormat;
      const fileExtension = format.split('/')[1];
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => img.onload = resolve);

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const worker = new Worker('./modules/compressWorker.js');
      workers.push(worker);

      worker.onmessage = (event) => {
        const { status, index, compressedData, message } = event.data;
        if (status === 'success') {
          compressedResults[index] = { filename:selectedImages[index].name, blob: new Uint8Array(compressedData), originalType: selectedImages[index].type }; // Add originalType
        } else {
          console.error(`壓縮圖片 ${selectedImages[index].name} 失敗:`, message);
        }

        completedCount++;
        if (completedCount === selectedImages.length) {
          workers.forEach(w => w.terminate());

          compressList.innerHTML = '<span>打包中...</span>';
          compressedResults.forEach(({ filename, blob, originalType }) => { // Add originalType to destructuring
            const format = selectedFormat === 'original' ? originalType : selectedFormat; // Determine format for each image
            const fileExtension = format.split('/')[1]; // Get extension for each image
            const name = filename.replace(/\.[^/.]+$/, `.${fileExtension}`);
            zip.file(name, blob);
          });

          if (selectedImages.length === 1) {
            const { filename, blob } = compressedResults[0];
            const originalNameWithoutExt = filename.split('.').slice(0, -1).join('.');
            const newFilename = `${originalNameWithoutExt}_compressed.${fileExtension}`;

            const url = URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.download = newFilename;
            link.click();
            URL.revokeObjectURL(url);
            compressList.innerHTML = '';
          } else {
            zip.generateAsync({ type: 'blob' }).then(blob => {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'compressed_images.zip';
              link.click();
              URL.revokeObjectURL(link.href);
              compressList.innerHTML = '';
            }).catch(err => {
              console.error('生成ZIP失敗:', err);
              compressList.innerHTML = '<span>打包失敗</span>';
            });
          }
        }
      };

      worker.postMessage({
        imageData,
        quality,
        format,
        index: i,
        resizeWidth,
        resizeHeight
      }, [imageData.data.buffer]);
    }
  };
}
