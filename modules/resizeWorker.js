onmessage = async function (e) {
  const { dataUrl, width, height, index, originalType, maintainAspectRatio, noEnlargeSmaller } = e.data;

  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);

    let finalWidth = width;
    let finalHeight = height;

    // 1. Apply maintainAspectRatio logic
    if (maintainAspectRatio) {
      const originalAspectRatio = imageBitmap.width / imageBitmap.height;
      const targetAspectRatio = width / height;

      if (targetAspectRatio > originalAspectRatio) {
        // Target is wider, fit by height
        finalHeight = height;
        finalWidth = Math.round(height * originalAspectRatio);
      } else {
        // Target is taller or same aspect ratio, fit by width
        finalWidth = width;
        finalHeight = Math.round(width / originalAspectRatio);
      }
    }

    // 2. Apply noEnlargeSmaller logic
    if (noEnlargeSmaller) {
      // Check if the image would be enlarged in either dimension
      const wouldEnlargeWidth = imageBitmap.width < finalWidth;
      const wouldEnlargeHeight = imageBitmap.height < finalHeight;

      if (wouldEnlargeWidth || wouldEnlargeHeight) {
        if (maintainAspectRatio) {
          // If aspect ratio is maintained, and we are not enlarging, use original dimensions
          finalWidth = imageBitmap.width;
          finalHeight = imageBitmap.height;
        } else {
          // If aspect ratio is NOT maintained, cap each dimension individually
          if (wouldEnlargeWidth) {
            finalWidth = imageBitmap.width;
          }
          if (wouldEnlargeHeight) {
            finalHeight = imageBitmap.height;
          }
        }
      }
    }

    // Ensure dimensions are at least 1 to avoid errors
    finalWidth = Math.max(1, finalWidth);
    finalHeight = Math.max(1, finalHeight);

    const resizeCanvas = new OffscreenCanvas(finalWidth, finalHeight);
    const resizeCtx = resizeCanvas.getContext('2d');
    resizeCtx.drawImage(imageBitmap, 0, 0, finalWidth, finalHeight);

    const outputBlob = await resizeCanvas.convertToBlob({ type: originalType, quality: 0.9 });
    const buffer = await outputBlob.arrayBuffer();
    postMessage({ status: 'success', index, resizedData: buffer });

  } catch (error) {
    postMessage({ status: 'error', index, message: error.message });
  }
};
