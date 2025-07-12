export function initWhiteBgTool() {
  const btn = document.getElementById('whitebg-btn');
  const preview = document.getElementById('whitebg-preview');

  btn.onclick = async () => {
    if (!window.selectedIndices || window.selectedIndices.size === 0) {
      alert(window.alertTranslations.alertSelectImageForWhiteBg);
      return;
    }

    const width = parseInt(document.getElementById('whitebg-width').value) || 1000;
    const height = parseInt(document.getElementById('whitebg-height').value) || 1000;
    const shadow = document.getElementById('whitebg-shadow').checked;
    const border = document.getElementById('whitebg-border').checked;

    const selectedImages = Array.from(window.selectedIndices).map(i => window.imageDataList[i]);

    preview.innerHTML = '製作中...請稍候';

    const workers = [];
    const whitebgResults = new Array(selectedImages.length);
    let completedCount = 0;

    for (let i = 0; i < selectedImages.length; i++) {
      const { dataUrl, name } = selectedImages[i];
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => img.onload = resolve);

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
        dataUrl: dataUrl,
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
    whitebgBtn.textContent = `Add White Background (${count})`;
  }
};

// ✅ 初始化呼叫一次
const selectedItems = Array.from(window.selectedIndices || []).map(i => window.imageDataList?.[i]).filter(Boolean);
window.updateWhitebgSelection(selectedItems);
