

export function initEnhanceTool() {
  const brightnessSlider = document.getElementById('brightness');
  const brightnessValueSpan = document.getElementById('brightness-value');
  const saturationSlider = document.getElementById('saturation');
  const saturationValueSpan = document.getElementById('saturation-value');
  const contrastSlider = document.getElementById('contrast');
  const contrastValueSpan = document.getElementById('contrast-value');
  const filterSelect = document.getElementById('filter');
  const enhanceCanvas = document.getElementById('enhance-canvas');
  const enhanceDownloadBtn = document.getElementById('enhance-download-btn');
  const enhanceResetBtn = document.getElementById('enhance-reset-btn');
  const ctx = enhanceCanvas.getContext('2d');

  let currentImage = null;
  let originalImage = null;
  let originalFilename = 'image'; // Add a variable to store the original filename

  // Function to reset sliders to default values
  const resetEnhancements = () => {
    brightnessSlider.value = 0;
    brightnessValueSpan.textContent = 0;
    saturationSlider.value = 100;
    saturationValueSpan.textContent = 100;
    contrastSlider.value = 100;
    contrastValueSpan.textContent = 100;
    filterSelect.value = 'none';
    applyEnhancements();
  };

  // Event listener for reset button
  enhanceResetBtn.onclick = resetEnhancements;

  // 更新數值顯示與觸發套用
  brightnessSlider.oninput = () => {
    brightnessValueSpan.textContent = brightnessSlider.value;
    applyEnhancements();
  };
  saturationSlider.oninput = () => {
    saturationValueSpan.textContent = saturationSlider.value;
    applyEnhancements();
  };
  contrastSlider.oninput = () => {
    contrastValueSpan.textContent = contrastSlider.value;
    applyEnhancements();
  };
  filterSelect.onchange = applyEnhancements;

  window.loadImageToEnhance = (dataUrl, filename) => { // Add filename parameter
    console.log('loadImageToEnhance called with dataUrl:', dataUrl.substring(0, 50) + '...');
    originalImage = new Image();
    originalImage.onload = () => {
      console.log('Original image loaded. Dimensions:', originalImage.width, 'x', originalImage.height);
      
      const MAX_PREVIEW_HEIGHT = 400; // Define max height for preview
      let previewWidth = originalImage.width;
      let previewHeight = originalImage.height;

      if (previewHeight > MAX_PREVIEW_HEIGHT) {
        previewWidth = Math.round(originalImage.width * (MAX_PREVIEW_HEIGHT / originalImage.height));
        previewHeight = MAX_PREVIEW_HEIGHT;
      }

      enhanceCanvas.width = previewWidth;
      enhanceCanvas.height = previewHeight;
      currentImage = originalImage;
      originalFilename = filename || 'image'; // Store the filename

      // 重設調整參數
      resetEnhancements(); // Use the new reset function
    };
    originalImage.onerror = (e) => {
      console.error('Error loading original image:', e);
    };
    originalImage.src = dataUrl;
  };

  function applyEnhancements() {
    if (!currentImage) {
      console.log('applyEnhancements: currentImage is null, returning.');
      return;
    }

    const brightness = 100 + parseInt(brightnessSlider.value);
    const saturation = parseInt(saturationSlider.value);
    const contrast = parseInt(contrastSlider.value);
    const filterType = filterSelect.value;

    const filterParts = [
      `brightness(${brightness}%)`,
      `saturate(${saturation}%)`,
      `contrast(${contrast}%)`
    ];

    if (filterType === 'blur') {
      if (!CSS.supports('filter', 'blur(1px)')) {
        alert(window.alertTranslations.alertFilterNotSupported);
        filterSelect.value = 'none';
        return;
      }
      filterParts.push('blur(2px)');
    } else if (filterType !== 'none') {
      if (!CSS.supports('filter', `${filterType}(1)`)) {
        alert(window.alertTranslations.alertFilterNotSupported);
        filterSelect.value = 'none';
        return;
      }
      filterParts.push(`${filterType}(1)`);
    }

    const fullFilter = filterParts.join(' ');

    console.log('Full Filter String:', fullFilter);

    ctx.clearRect(0, 0, enhanceCanvas.width, enhanceCanvas.height);
    ctx.filter = fullFilter;
    ctx.drawImage(currentImage, 0, 0, enhanceCanvas.width, enhanceCanvas.height);
  }

  enhanceDownloadBtn.onclick = () => {
    if (!currentImage) {
      alert(window.alertTranslations.alertSelectImageForEnhance);
      return;
    }

    // Create a temporary canvas with original image dimensions for high-resolution output
    const outputCanvas = document.createElement('canvas');
    const outputCtx = outputCanvas.getContext('2d');

    outputCanvas.width = originalImage.width;
    outputCanvas.height = originalImage.height;

    // Apply the same enhancements to the output canvas
    const brightness = 100 + parseInt(brightnessSlider.value);
    const saturation = parseInt(saturationSlider.value);
    const contrast = parseInt(contrastSlider.value);
    const filterType = filterSelect.value;

    const filterParts = [
      `brightness(${brightness}%)`,
      `saturate(${saturation}%)`,
      `contrast(${contrast}%)`
    ];

    if (filterType === 'blur') {
      filterParts.push('blur(2px)');
    } else if (filterType !== 'none') {
      filterParts.push(`${filterType}(1)`);
    }

    const fullFilter = filterParts.join(' ');

    outputCtx.filter = fullFilter;
    outputCtx.drawImage(originalImage, 0, 0, originalImage.width, originalImage.height);

    outputCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Generate new filename
      const nameParts = originalFilename.split('.');
      const extension = nameParts.pop();
      const baseName = nameParts.join('.');
      const newFilename = `${baseName}_enhanced.${extension}`;

      a.download = newFilename; // Use the new filename
      a.click();
      URL.revokeObjectURL(url);

      // Clean up the temporary canvas
      outputCanvas.remove();
    }, 'image/png');
  };

  // Check if an image is already selected when the tool initializes
  if (window.selectedForCrop !== null && window.imageDataList[window.selectedForCrop]) {
    const initialImageData = window.imageDataList[window.selectedForCrop];
    window.loadImageToEnhance(initialImageData.dataUrl, initialImageData.name);
  }
}
