

export function initCompressTool() {
  const compressBtn = document.getElementById('compress-btn');
  const compressList = document.getElementById('compress-list');
  const compressQualityInput = document.getElementById('compress-quality');
  const compressQualityValueSpan = document.getElementById('compress-quality-value');
  const compressFormatSelect = document.getElementById('compress-format');

  const resizeWidthInput = document.getElementById('compress-resize-width');
  const resizeHeightInput = document.getElementById('compress-resize-height');

  // 顯示品質數值
  compressQualityInput.oninput = () => {
    compressQualityValueSpan.textContent = compressQualityInput.value;
  };

  // 更新選擇清單（由 uploader 呼叫）
  window.updateCompressSelection = (selectedItems) => {
    compressList.innerHTML = '';
    selectedItems.forEach((item, i) => {
      const span = document.createElement('span');
      span.textContent = item.filename || `圖片 ${i + 1}`;
      compressList.appendChild(span);
    });
  };

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
      const { dataUrl, filename, type: originalType } = selectedImages[i];
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
          compressedResults[index] = { filename:selectedImages[index].name, blob: new Uint8Array(compressedData) };
        } else {
          console.error(`壓縮圖片 ${selectedImages[index].name} 失敗:`, message);
        }

        completedCount++;
        if (completedCount === selectedImages.length) {
          workers.forEach(w => w.terminate());

          compressList.innerHTML = '<span>打包中...</span>';
          compressedResults.forEach(({ filename, blob }) => {
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
