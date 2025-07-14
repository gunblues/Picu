let currentRotation = 0; // 0, 90, 180, 270 degrees
let currentFlipHorizontal = false;
let currentFlipVertical = false;
let operationSequence = [];

function resetRotateState() {
  currentRotation = 0;
  currentFlipHorizontal = false;
  currentFlipVertical = false;
  operationSequence = [];
}

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

  if (selectedImageIndices.length > 1) {
    rotatePreviewContainer.style.display = 'none';
    rotatePreviewImage.src = '';
    rotateOperationSequenceDiv.style.display = 'block';
    rotateOperationSequenceDiv.textContent = operationSequence.join(' → ');
    return;
  }

  // If only one image is selected, show preview and hide sequence
  rotateOperationSequenceDiv.style.display = 'none';
  rotateOperationSequenceDiv.textContent = '';

  const selectedImage = window.imageDataList[selectedImageIndices[0]];
  if (!selectedImage) {
    rotatePreviewContainer.style.display = 'none';
    rotatePreviewImage.src = '';
    return;
  }

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
    dataUrl: selectedImage.dataUrl,
    rotation: currentRotation,
    flipHorizontal: currentFlipHorizontal,
    flipVertical: currentFlipVertical,
    originalType: selectedImage.type
  });
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

    rotatePreviewContainer.style.display = 'none';
    rotatePreviewImage.src = '';

    const selectedImages = Array.from(window.selectedIndices).map(i => window.imageDataList[i]);

    rotateProgressBarContainer.style.display = 'block';
    rotateProgressBar.style.width = '0%';
    rotateProgressBar.textContent = '0%';

    const workers = [];
    const rotateResults = new Array(selectedImages.length);
    let completedCount = 0;

    for (let i = 0; i < selectedImages.length; i++) {
      const { dataUrl, name } = selectedImages[i];

      const worker = new Worker('./modules/rotateWorker.js');
      workers.push(worker);

      worker.onmessage = (event) => {
        const { status, index, rotateData, message } = event.data;
        if (status === 'success') {
          rotateResults[index] = { filename: selectedImages[index].name, blob: new Blob([rotateData], { type: selectedImages[index].type }) };
        } else {
          console.error(`旋轉圖片 ${selectedImages[index].name} 失敗:`, message);
        }

        completedCount++;
        const progress = Math.round((completedCount / selectedImages.length) * 100);
        rotateProgressBar.style.width = `${progress}%`;
        rotateProgressBar.textContent = `${progress}%`;

        if (completedCount === selectedImages.length) {
          workers.forEach(w => w.terminate());
          rotateProgressBarContainer.style.display = 'none';

          if (selectedImages.length === 1) {
            const { filename, blob } = rotateResults[0];
            const originalNameWithoutExt = filename.split('.').slice(0, -1).join('.');
            const fileExtension = filename.split('.').pop();
            const newFilename = `${originalNameWithoutExt}_rotated.${fileExtension}`;

            const url = URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.download = newFilename;
            link.click();
            URL.revokeObjectURL(url);
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
            });
          }
        }
      };

      worker.postMessage({
        dataUrl,
        rotation: currentRotation,
        flipHorizontal: currentFlipHorizontal,
        flipVertical: currentFlipVertical,
        index: i,
        originalType: selectedImages[i].type
      });
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
    rotateBtn.textContent = `Rotate (${count})`;
  }
  const selectedImageIndices = Array.from(window.selectedIndices || []);
  if (selectedImageIndices.length === 1) {
    const rotateTab = document.getElementById('rotate');
    if (rotateTab && rotateTab.classList.contains('active')) {
      // Directly call generatePreview when selection changes and tab is active
      window.generateRotatePreview();
    }
  } else if (selectedImageIndices.length > 1) {
    if (rotateOperationSequenceDiv) {
      rotateOperationSequenceDiv.style.display = 'block';
      rotateOperationSequenceDiv.textContent = operationSequence.join(' → ');
    }
    const rotatePreviewContainer = document.getElementById('rotate-preview-container');
    const rotatePreviewImage = document.getElementById('rotate-preview-image');
    if (rotatePreviewContainer) rotatePreviewContainer.style.display = 'none';
    if (rotatePreviewImage) rotatePreviewImage.src = '';
  } else {
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
