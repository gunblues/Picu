

export function initResizeTool() {
  const resizeBtn = document.getElementById('resize-btn');
  const resizeWidthInput = document.getElementById('resize-width');
  const resizeHeightInput = document.getElementById('resize-height');
  const resizePreview = document.getElementById('resize-preview');

  if (!resizeBtn || !resizeWidthInput || !resizeHeightInput) {
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

    resizePreview.innerHTML = '處理中...請稍候';

    const workers = [];
    const resizedResults = new Array(selectedImages.length);
    let completedCount = 0;

    for (let i = 0; i < selectedImages.length; i++) {
      const { dataUrl, name } = selectedImages[i];
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => img.onload = resolve);

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const worker = new Worker('./modules/resizeWorker.js');
      workers.push(worker);

      worker.onmessage = (event) => {
        const { status, index, resizedData, message } = event.data;
        if (status === 'success') {
          resizedResults[index] = { filename: selectedImages[index].name, blob: new Uint8Array(resizedData) };
        } else {
          console.error(`調整圖片 ${selectedImages[index].name} 失敗:`, message);
        }

        completedCount++;
        if (completedCount === selectedImages.length) {
          workers.forEach(w => w.terminate());

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
            resizePreview.innerHTML = '<span>打包中...</span>';
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
              resizePreview.innerHTML = '<span>打包失敗</span>';
            });
          }
        }
      };

      worker.postMessage({
        imageData,
        width,
        height,
        index: i,
        originalType: selectedImages[i].type // Pass originalType
      }, [imageData.data.buffer]);
    }
  };

  function loadImageAsync(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = dataUrl;
    });
  }
}
