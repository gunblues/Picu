onmessage = function (e) {
  const { imageData, quality, format, index, resizeWidth, resizeHeight } = e.data;

  try {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    const imageBitmap = createImageBitmapFromData(imageData);

    imageBitmap.then(bitmap => {
      const drawWidth = resizeWidth || bitmap.width;
      const drawHeight = resizeHeight || bitmap.height;

      const resizeCanvas = new OffscreenCanvas(drawWidth, drawHeight);
      const resizeCtx = resizeCanvas.getContext('2d');
      resizeCtx.drawImage(bitmap, 0, 0, drawWidth, drawHeight);

      resizeCanvas.convertToBlob({ type: format, quality }).then(blob => {
        blob.arrayBuffer().then(buffer => {
          postMessage({ status: 'success', index, compressedData: buffer }, [buffer]);
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
