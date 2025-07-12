onmessage = async function (e) {
  const { dataUrl, width, height, shadow, border, index, originalType } = e.data; // Receive dataUrl

  try {
    // Convert dataUrl to Blob using a helper function
    const blob = dataURLtoBlob(dataUrl);
    const imageBitmap = await createImageBitmap(blob);

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 白底
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // 計算圖片縮放比例並置中
    const ratio = Math.min(width / imageBitmap.width, height / imageBitmap.height);
    const imgWidth = imageBitmap.width * ratio;
    const imgHeight = imageBitmap.height * ratio;
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

    ctx.drawImage(imageBitmap, x, y, imgWidth, imgHeight);

    // 浮框
    if (border) {
      ctx.shadowColor = 'transparent'; // 清除陰影避免影響邊框
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ccc';
      ctx.strokeRect(x, y, imgWidth, imgHeight);
    }

    const outputBlob = await canvas.convertToBlob({ type: originalType, quality: 0.9 }); // Use originalType
    const buffer = await outputBlob.arrayBuffer();
    postMessage({ status: 'success', index, whitebgData: buffer });

  } catch (error) {
    postMessage({ status: 'error', index, message: error.message });
  }
};

// Helper function to convert data URL to Blob
function dataURLtoBlob(dataurl) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}
