

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
  const ctx = enhanceCanvas.getContext('2d');

  let currentImage = null;
  let originalImage = null;
  let originalFilename = 'image'; // Add a variable to store the original filename

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
      enhanceCanvas.width = originalImage.width;
      enhanceCanvas.height = originalImage.height;
      currentImage = originalImage;
      originalFilename = filename || 'image'; // Store the filename

      // 重設調整參數
      brightnessSlider.value = 0;
      brightnessValueSpan.textContent = 0;
      saturationSlider.value = 100;
      saturationValueSpan.textContent = 100;
      contrastSlider.value = 100;
      contrastValueSpan.textContent = 100;
      filterSelect.value = 'none';

      applyEnhancements();
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
      filterParts.push('blur(2px)');
    } else if (filterType !== 'none') {
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
    enhanceCanvas.toBlob((blob) => {
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
    }, 'image/png');
  };
}
