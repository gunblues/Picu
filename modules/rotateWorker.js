onmessage = async function (e) {
  const { dataUrl, rotation, flipHorizontal, flipVertical, index, originalType } = e.data;

  try {
    const blob = dataURLtoBlob(dataUrl);
    const imageBitmap = await createImageBitmap(blob);

    let outputWidth = imageBitmap.width;
    let outputHeight = imageBitmap.height;

    // If rotating by 90 or 270 degrees, swap width and height
    if (rotation === 90 || rotation === 270) {
      [outputWidth, outputHeight] = [outputHeight, outputWidth];
    }

    const canvas = new OffscreenCanvas(outputWidth, outputHeight);
    const ctx = canvas.getContext('2d');

    ctx.translate(outputWidth / 2, outputHeight / 2);

    // Apply flip transformations
    let scaleX = 1;
    let scaleY = 1;
    if (flipHorizontal) {
      scaleX = -1;
    }
    if (flipVertical) {
      scaleY = -1;
    }
    ctx.scale(scaleX, scaleY);

    // Apply rotation
    ctx.rotate(rotation * Math.PI / 180);

    // Draw the image centered after transformations
    ctx.drawImage(imageBitmap, -imageBitmap.width / 2, -imageBitmap.height / 2);

    const outputBlob = await canvas.convertToBlob({ type: originalType, quality: 0.9 });
    const buffer = await outputBlob.arrayBuffer();
    postMessage({ status: 'success', index, rotateData: buffer });

  } catch (error) {
    postMessage({ status: 'error', index, message: error.message });
  }
};

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
