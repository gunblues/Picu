

export function initWhiteBgTool() {
  const btn = document.getElementById('whitebg-btn');
  const preview = document.getElementById('whitebg-preview');

  btn.onclick = async () => {
    if (!window.selectedIndices || window.selectedIndices.size === 0) {
      alert(window.alertTranslations.alertSelectImageForWhiteBg);
      return;
    }
    const selectedImages = Array.from(window.selectedIndices).map(i => window.imageDataList[i]);
    if (selectedImages.length === 0) {
      alert(window.alertTranslations.alertSelectImageForWhiteBg);
      return;
    }

    const width = parseInt(document.getElementById('whitebg-width').value) || 1000;
    const height = parseInt(document.getElementById('whitebg-height').value) || 1000;
    const shadow = document.getElementById('whitebg-shadow').checked;
    const border = document.getElementById('whitebg-border').checked;

    preview.innerHTML = '製作中...請稍候';

    const workers = [];
    const whitebgResults = new Array(selectedImages.length);
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

      const worker = new Worker('./modules/whitebgWorker.js');
      workers.push(worker);

      worker.onmessage = (event) => {
        const { status, index, whitebgData, message } = event.data;
        if (status === 'success') {
          whitebgResults[index] = { filename: selectedImages[index].name, blob: new Uint8Array(whitebgData) };
        } else {
          console.error(`製作白底圖 ${selectedImages[index].name} 失敗:`, message);
        }

        completedCount++;
        if (completedCount === selectedImages.length) {
          workers.forEach(w => w.terminate());

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
            preview.innerHTML = '<span>打包中...</span>';
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
              preview.innerHTML = '<span>打包失敗</span>';
            });
          }
        }
      };

      worker.postMessage({
        imageData,
        width,
        height,
        shadow,
        border,
        index: i,
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
