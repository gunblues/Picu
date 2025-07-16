let currentRotation = 0; // 0, 90, 180, 270 degrees
let currentFlipHorizontal = false;
let currentFlipVertical = false;
let operationSequence = [];

// 新增變數來儲存原始圖片資訊
let originalRotateImage = null;
let originalRotateImageWidth = 0;
let originalRotateImageHeight = 0;

function resetRotateState() {
  currentRotation = 0;
  currentFlipHorizontal = false;
  currentFlipVertical = false;
  operationSequence = [];
}

window.resetRotateState = resetRotateState; // Expose globally

const debounce = (func, delay) => {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

const generatePreview = async () => {
  const rotatePreviewContainer = document.getElementById('rotate-preview-container');
  const rotatePreviewImage = document.getElementById('rotate-preview-image');
  const rotateOperationSequenceDiv = document.getElementById('rotate-operation-sequence');

  const selectedImageIndices = Array.from(window.selectedIndices || []);
  if (selectedImageIndices.length === 0) {
    rotatePreviewContainer.style.display = 'none';
    rotatePreviewImage.src = '';
    rotateOperationSequenceDiv.style.display = 'none';
    rotateOperationSequenceDiv.textContent = '';
    return;
  }

  // If one or more images are selected, show preview for the first one
  // Ensure the operation sequence div is hidden
  rotateOperationSequenceDiv.style.display = 'none';
  rotateOperationSequenceDiv.textContent = '';

  const selectedImage = window.imageDataList[selectedImageIndices[0]];
  if (!selectedImage) {
    rotatePreviewContainer.style.display = 'none';
    rotatePreviewImage.src = '';
    return;
  }

  // Load the original image to get its dimensions
  const img = new Image();
  img.onload = () => {
    originalRotateImage = img; // Store the original image object
    originalRotateImageWidth = img.naturalWidth;
    originalRotateImageHeight = img.naturalHeight;

    const MAX_PREVIEW_DIMENSION = 800; // Max width or height for preview
    let previewWidth = originalRotateImageWidth;
    let previewHeight = originalRotateImageHeight;

    // Calculate new dimensions while maintaining aspect ratio
    if (originalRotateImageWidth > MAX_PREVIEW_DIMENSION || originalRotateImageHeight > MAX_PREVIEW_DIMENSION) {
      if (originalRotateImageWidth > originalRotateImageHeight) {
        previewWidth = MAX_PREVIEW_DIMENSION;
        previewHeight = Math.round(originalRotateImageHeight * (MAX_PREVIEW_DIMENSION / originalRotateImageWidth));
      } else {
        previewHeight = MAX_PREVIEW_DIMENSION;
        previewWidth = Math.round(originalRotateImageWidth * (MAX_PREVIEW_DIMENSION / originalRotateImageHeight));
      }
    }

    // Create a temporary canvas to draw the scaled image for Worker
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = previewWidth;
    tempCanvas.height = previewHeight;
    tempCtx.drawImage(img, 0, 0, previewWidth, previewHeight);
    const previewDataUrl = tempCanvas.toDataURL(selectedImage.type);

    rotatePreviewContainer.style.display = 'block';
    rotatePreviewImage.src = '';

    let previewWorker = null;
    if (previewWorker) {
      previewWorker.terminate();
    }

    previewWorker = new Worker('./modules/rotateWorker.js');

    previewWorker.onmessage = (event) => {
      const { status, rotateData, message } = event.data;
      if (status === 'success') {
        const blob = new Blob([rotateData], { type: selectedImage.type });
        const url = URL.createObjectURL(blob);
        rotatePreviewImage.src = url;
        rotatePreviewImage.onload = () => URL.revokeObjectURL(url);
      } else {
        console.error('生成預覽失敗:', message);
        rotatePreviewImage.src = '';
      }
    };

    previewWorker.postMessage({
      dataUrl: previewDataUrl, // Send downsampled image
      rotation: currentRotation,
      flipHorizontal: currentFlipHorizontal,
      flipVertical: currentFlipVertical,
      originalType: selectedImage.type
    });
  };
  img.src = selectedImage.dataUrl; // Start loading the original image
};

const debouncedGeneratePreview = debounce(generatePreview, 300);

window.generateRotatePreview = generatePreview; // Expose generatePreview globally

export function initRotateTool() {
  const btn = document.getElementById('rotate-btn');
  const rotateLeftBtn = document.getElementById('rotate-left-btn');
  const rotateRightBtn = document.getElementById('rotate-right-btn');
  const flipHorizontalBtn = document.getElementById('flip-horizontal-btn');
  const flipVerticalBtn = document.getElementById('flip-vertical-btn');
  const rotateProgressBarContainer = document.getElementById('rotate-progress-container');
  const rotateProgressBar = document.getElementById('rotate-progress-bar');

  const rotatePreviewContainer = document.getElementById('rotate-preview-container');
  const rotatePreviewImage = document.getElementById('rotate-preview-image');

  resetRotateState(); // Reset state on initialization

  rotateLeftBtn.addEventListener('click', () => {
    currentRotation = (currentRotation - 90 + 360) % 360;
    operationSequence.push('Rotate Left');
    debouncedGeneratePreview();
  });

  rotateRightBtn.addEventListener('click', () => {
    currentRotation = (currentRotation + 90) % 360;
    operationSequence.push('Rotate Right');
    debouncedGeneratePreview();
  });

  flipHorizontalBtn.addEventListener('click', () => {
    currentFlipHorizontal = !currentFlipHorizontal;
    operationSequence.push('Flip Horizontal');
    debouncedGeneratePreview();
  });

  flipVerticalBtn.addEventListener('click', () => {
    currentFlipVertical = !currentFlipVertical;
    operationSequence.push('Flip Vertical');
    debouncedGeneratePreview();
  });

  btn.onclick = async () => {
    if (!window.selectedIndices || window.selectedIndices.size === 0) {
      alert(window.alertTranslations.alertSelectImageForRotate);
      return;
    }

    const selectedImages = Array.from(window.selectedIndices).map(i => window.imageDataList[i]);

    // Only hide preview and show progress bar if multiple images are selected
    if (selectedImages.length > 1) {
      rotatePreviewContainer.style.display = 'none';
      rotatePreviewImage.src = '';
      rotateProgressBarContainer.style.display = 'block';
      rotateProgressBar.style.width = '0%';
      rotateProgressBar.textContent = '0%';
    } else { // For single image, keep preview visible and update progress bar
      rotateProgressBarContainer.style.display = 'block';
      rotateProgressBar.style.width = '0%';
      rotateProgressBar.textContent = '0%';
    }

    const rotateResults = new Array(selectedImages.length);
    let completedCount = 0;

    for (let i = 0; i < selectedImages.length; i++) {
      const { dataUrl, name, type } = selectedImages[i];

      // Create a temporary canvas for high-resolution output
      const outputCanvas = document.createElement('canvas');
      const outputCtx = outputCanvas.getContext('2d');

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        let outputWidth = img.width;
        let outputHeight = img.height;

        // If rotating by 90 or 270 degrees, swap width and height
        if (currentRotation === 90 || currentRotation === 270) {
          [outputWidth, outputHeight] = [outputHeight, outputWidth];
        }

        outputCanvas.width = outputWidth;
        outputCanvas.height = outputHeight;

        outputCtx.translate(outputWidth / 2, outputHeight / 2);

        let scaleX = 1;
        let scaleY = 1;
        if (currentFlipHorizontal) {
          scaleX = -1;
        }
        if (currentFlipVertical) {
          scaleY = -1;
        }
        outputCtx.scale(scaleX, scaleY);

        outputCtx.rotate(currentRotation * Math.PI / 180);

        outputCtx.drawImage(img, -img.width / 2, -img.height / 2);

        outputCanvas.toBlob(blob => {
          rotateResults[i] = { filename: name, blob: blob };
          completedCount++;
          const progress = Math.round((completedCount / selectedImages.length) * 100);
          rotateProgressBar.style.width = `${progress}%`;
          rotateProgressBar.textContent = `${progress}%`;

          if (completedCount === selectedImages.length) {
            rotateProgressBarContainer.style.display = 'none';

            if (selectedImages.length === 1) {
              const { filename, blob } = rotateResults[0];
              const originalNameWithoutExt = filename.split('.').slice(0, -1).join('.');
              const fileExtension = filename.split('.').pop();
              const newFilename = `${originalNameWithoutExt}_rotated.${fileExtension}`;

              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = newFilename;
              link.click();
              URL.revokeObjectURL(url);
              generatePreview(); // Re-generate preview after single image download
            } else {
              const zip = new JSZip();
              rotateProgressBarContainer.style.display = 'none';
              rotateResults.forEach(({ filename, blob }) => {
                const name = filename.replace(/\.[^/.]+$/, `.${filename.split('.').pop()}`);
                zip.file(name, blob);
              });

              zip.generateAsync({ type: 'blob' }).then(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'rotated_images.zip';
                link.click();
                URL.revokeObjectURL(link.href);
              }).catch(err => {
                console.error('生成ZIP失敗:', err);
              }).finally(() => {
                rotateProgressBarContainer.style.display = 'none';
                generatePreview(); // Re-generate preview after multiple image download
              });
            }
          }
          outputCanvas.remove(); // Clean up the temporary canvas
        }, type); // Use original image type for output
      };
      img.src = dataUrl;
    }
  };

  // Call generatePreview on initialization to show the default state
  generatePreview();
}

window.updateRotateSelection = (selectedItems) => {
  const rotateBtn = document.getElementById('rotate-btn');
  const rotateOperationSequenceDiv = document.getElementById('rotate-operation-sequence');
  if (rotateBtn) {
    const count = selectedItems.length;
    rotateBtn.textContent = `${window.appTranslations.rotateBtn} (${count})`;
  }
  const selectedImageIndices = Array.from(window.selectedIndices || []);
  if (selectedImageIndices.length >= 1) { // Changed from === 1 to >= 1
    const rotateTab = document.getElementById('rotate');
    if (rotateTab && rotateTab.classList.contains('active')) {
      // Directly call generatePreview when selection changes and tab is active
      window.generateRotatePreview();
    }
  } else { // No images selected
    const rotatePreviewContainer = document.getElementById('rotate-preview-container');
    const rotatePreviewImage = document.getElementById('rotate-preview-image');
    if (rotatePreviewContainer) rotatePreviewContainer.style.display = 'none';
    if (rotatePreviewImage) rotatePreviewImage.src = '';
    if (rotateOperationSequenceDiv) {
      rotateOperationSequenceDiv.style.display = 'none';
      rotateOperationSequenceDiv.textContent = '';
    }
  }
};

const selectedItems = Array.from(window.selectedIndices || []).map(i => window.imageDataList?.[i]).filter(Boolean);
window.updateRotateSelection(selectedItems);
