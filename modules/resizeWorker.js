onmessage = function (e) {
  const { imageData, width, height, index } = e.data;

  try {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    const imageBitmap = createImageBitmapFromData(imageData);

    imageBitmap.then(bitmap => {
      const resizeCanvas = new OffscreenCanvas(width, height);
      const resizeCtx = resizeCanvas.getContext('2d');
      resizeCtx.drawImage(bitmap, 0, 0, width, height);

      resizeCanvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 }).then(blob => {
        blob.arrayBuffer().then(buffer => {
          postMessage({ status: 'success', index, resizedData: buffer });
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
