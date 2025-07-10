onmessage = function (e) {
  const { imageData, width, height, shadow, border, index } = e.data;

  try {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const imageBitmap = createImageBitmapFromData(imageData);

    imageBitmap.then(bitmap => {
      // 白底
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);

      // 計算圖片縮放比例並置中
      const ratio = Math.min(width / bitmap.width, height / bitmap.height);
      const imgWidth = bitmap.width * ratio;
      const imgHeight = bitmap.height * ratio;
      const x = (width - imgWidth) / 2;
      const y = (height - imgHeight) / 2;

      // 陰影
      if (shadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      ctx.drawImage(bitmap, x, y, imgWidth, imgHeight);

      // 浮框
      if (border) {
        ctx.shadowColor = 'transparent'; // 清除陰影避免影響邊框
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(x, y, imgWidth, imgHeight);
      }

      canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 }).then(blob => {
        blob.arrayBuffer().then(buffer => {
          postMessage({ status: 'success', index, whitebgData: buffer });
        });
      });
    });
  } catch (error) {
    postMessage({ status: 'error', index, message: error.message });
  }
};

function createImageBitmapFromData(imageData) {
  return new Promise((resolve) => {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    canvas.convertToBlob().then(blob => {
      createImageBitmap(blob).then(resolve);
    });
  });
}
