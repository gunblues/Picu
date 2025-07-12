onmessage = async function (e) {
  const { dataUrl, width, height, index, originalType } = e.data; // Receive dataUrl

  try {
    const img = new Image();
    img.src = dataUrl;
    await new Promise(resolve => img.onload = resolve);

    const resizeCanvas = new OffscreenCanvas(width, height);
    const resizeCtx = resizeCanvas.getContext('2d');
    resizeCtx.drawImage(img, 0, 0, width, height);

    const blob = await resizeCanvas.convertToBlob({ type: originalType, quality: 0.9 }); // Use originalType
    const buffer = await blob.arrayBuffer();
    postMessage({ status: 'success', index, resizedData: buffer });

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
