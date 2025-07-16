function debounce(func, delay) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

export function initCropTool() {
  const cropCanvasContainer = document.getElementById('crop-canvas');
  const toolbar = document.getElementById('crop-toolbar');
  const ratioButtons = toolbar.querySelectorAll('button[data-ratio]');
  const cropBtn = document.getElementById('crop-btn');

  let cropper = null;
  let originalFilename = 'image';

  // 監聽全域的 image-selected 事件
  let originalImage = null; // Store the original image object
  let originalImageWidth = 0;
  let originalImageHeight = 0;
  let scaleFactor = 1; // How much the original image was scaled down for preview
  let originalImageType = 'image/png'; // Store the original image type, default to png

  window.addEventListener('image-selected', (event) => {
    const { dataUrl, name, type } = event.detail;
    originalFilename = name || 'image';
    originalImageType = type || 'image/png'; // Set the image type

    // Load the original image to get its dimensions
    originalImage = new Image();
    originalImage.onload = () => {
      originalImageWidth = originalImage.naturalWidth;
      originalImageHeight = originalImage.naturalHeight;

      // Determine the maximum dimension for the preview image
      const MAX_PREVIEW_DIMENSION = 600; // Max width or height for preview
      let previewWidth = originalImageWidth;
      let previewHeight = originalImageHeight;

      if (originalImageWidth > MAX_PREVIEW_DIMENSION || originalImageHeight > MAX_PREVIEW_DIMENSION) {
        if (originalImageWidth > originalImageHeight) {
          previewHeight = Math.round(originalImageHeight * (MAX_PREVIEW_DIMENSION / originalImageWidth));
          previewWidth = MAX_PREVIEW_DIMENSION;
        } else {
          previewWidth = Math.round(originalImageWidth * (MAX_PREVIEW_DIMENSION / originalImageHeight));
          previewHeight = MAX_PREVIEW_DIMENSION;
        }
        scaleFactor = originalImageWidth / previewWidth; // Calculate scale factor
      } else {
        scaleFactor = 1; // No scaling needed for preview
      }

      // Create a temporary canvas to draw the scaled image for Cropper.js
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = previewWidth;
      tempCanvas.height = previewHeight;
      tempCtx.drawImage(originalImage, 0, 0, previewWidth, previewHeight);
      const previewDataUrl = tempCanvas.toDataURL('image/png'); // Get data URL of scaled image

      // 1. 銷毀舊的 Cropper 實例
      if (cropper) {
        cropper.destroy();
      }

      // 2. 清空容器
      cropCanvasContainer.innerHTML = '';

      // 3. 建立全新的圖片元素，使用縮小後的圖片
      const imageElement = document.createElement('img');
      imageElement.id = 'image-to-crop';
      imageElement.style.width = '100%';
      imageElement.style.maxHeight = '80vh';
      imageElement.style.objectFit = 'contain';
      imageElement.style.display = 'block';
      imageElement.src = previewDataUrl; // Use the scaled image data URL
      cropCanvasContainer.appendChild(imageElement);

      // 4. 在新圖片載入後，初始化新的 Cropper 實例
      imageElement.onload = () => {
        const initializeCropperWhenReady = () => {
          if (imageElement.clientWidth > 0) {
            cropper = new Cropper(imageElement, {
              aspectRatio: 1,
              viewMode: 1,
              responsive: true,
              autoCropArea: 0.8,
              zoomable: false, // Disable zooming the image itself
              zoomOnWheel: false, // Disable zooming with mouse wheel
              zoomOnTouch: false, // Disable zooming with touch gestures
              crop: debounce(() => {
                // This function will be called after the crop box stops moving for 100ms
                // You can add any logic here that you want to debounce, e.g., updating a live preview of the cropped image
                // For now, we just log to console to observe the debounce effect
                console.log('Cropper crop event debounced.');
              }, 100),
            });
            const activeButton = toolbar.querySelector('button[data-ratio].active');
            if (activeButton) {
              cropper.setAspectRatio(parseRatio(activeButton.dataset.ratio));
            }
          } else {
            requestAnimationFrame(initializeCropperWhenReady);
          }
        };
        requestAnimationFrame(initializeCropperWhenReady);
      };
    };
    originalImage.src = dataUrl; // Start loading the original image
  });

  // Check if an image is already selected when the tool initializes
  if (window.selectedForCrop !== null && window.imageDataList[window.selectedForCrop]) {
    const initialImageData = window.imageDataList[window.selectedForCrop];
    const event = new CustomEvent('image-selected', { 
      detail: { 
        dataUrl: initialImageData.dataUrl,
        name: initialImageData.name
      }
    });
    window.dispatchEvent(event);
  }

  function parseRatio(ratioStr) {
    if (ratioStr === 'free') return NaN;
    const parts = ratioStr.split('/');
    return parts.length === 2
      ? parseFloat(parts[0]) / parseFloat(parts[1])
      : parseFloat(ratioStr);
  }

  ratioButtons.forEach(button => {
    button.addEventListener('click', () => {
      const ratio = button.dataset.ratio;
      if (cropper) {
        cropper.setAspectRatio(parseRatio(ratio));
      }

      ratioButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });

  cropBtn.addEventListener('click', () => {
    if (!originalImage) {
      alert(window.alertTranslations.alertSelectImage || 'Please select an image first.');
      return;
    }
    if (!cropper) {
      alert('Cropper is not initialized. Please wait for the image to load.');
      return;
    }

    const cropData = cropper.getData(); // Get crop box data from the scaled preview

    // Calculate the actual crop coordinates on the original high-resolution image
    const actualX = cropData.x * scaleFactor;
    const actualY = cropData.y * scaleFactor;
    const actualWidth = cropData.width * scaleFactor;
    const actualHeight = cropData.height * scaleFactor;

    // Create a new canvas for the high-resolution cropped image
    const outputCanvas = document.createElement('canvas');
    const outputCtx = outputCanvas.getContext('2d');

    outputCanvas.width = actualWidth;
    outputCanvas.height = actualHeight;

    // Draw the cropped portion of the original image onto the new canvas
    outputCtx.drawImage(
        originalImage, 
        actualX, actualY, actualWidth, actualHeight, // Source rectangle
        0, 0, actualWidth, actualHeight // Destination rectangle
    );

    outputCanvas.toBlob(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      
      // Determine the file extension from the original filename
      let newFilename = 'cropped_image.png'; // Default filename
      if (typeof originalFilename === 'string' && originalFilename.length > 0) {
        const nameParts = originalFilename.split('.');
        const originalExtension = nameParts.length > 1 ? nameParts.pop() : 'png';
        const baseName = nameParts.join('.');

        // Use the original extension if it's jpg/jpeg/png, otherwise default to png
        const outputExtension = ['jpg', 'jpeg', 'png'].includes(originalExtension.toLowerCase()) ? originalExtension : 'png';
        newFilename = `${baseName}_cropped.${outputExtension}`;
      } else {
        console.warn('originalFilename is not a valid string, using default filename.');
      }

      link.download = newFilename; 
      
      link.click();
      URL.revokeObjectURL(blob);
      outputCanvas.remove(); // Clean up the temporary canvas
    }, originalImageType); // Use the stored original image type for output
  });
}

