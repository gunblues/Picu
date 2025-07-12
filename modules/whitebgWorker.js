onmessage = async function (e) {
  const { dataUrl, width, height, shadow, border, index, originalType } = e.data; // Receive dataUrl

  try {
    const img = new Image();
    img.src = dataUrl;
    await new Promise(resolve => img.onload = resolve);

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 白底
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // 計算圖片縮放比例並置中
    const ratio = Math.min(width / img.width, height / img.height);
    const imgWidth = img.width * ratio;
    const imgHeight = img.height * ratio;
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

    ctx.drawImage(img, x, y, imgWidth, imgHeight);

    // 浮框
    if (border) {
      ctx.shadowColor = 'transparent'; // 清除陰影避免影響邊框
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ccc';
      ctx.strokeRect(x, y, imgWidth, imgHeight);
    }

    const blob = await canvas.convertToBlob({ type: originalType, quality: 0.9 }); // Use originalType
    const buffer = await blob.arrayBuffer();
    postMessage({ status: 'success', index, whitebgData: buffer });

  } catch (error) {
    postMessage({ status: 'error', index, message: error.message });
  }
};

// Remove createImageBitmapFromData as it's no longer needed
// function createImageBitmapFromData(imageData) {
//   return new Promise((resolve) => {
//     const canvas = new OffscreenCanvas(imageData.width, imageData.height);
//     const ctx = canvas.getContext('2d');
//     ctx.putImageData(imageData, 0, 0);
//     canvas.convertToBlob().then(blob => {
//       createImageBitmap(blob).then(resolve);
//     });
//   });
// }
