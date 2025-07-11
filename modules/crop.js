export function initCropTool() {
  const imageElement = document.createElement('img');
  imageElement.id = 'image-to-crop';
  imageElement.style.maxWidth = '100%'; // Ensure image fits within container
  imageElement.style.display = 'block'; // Remove extra space below image
  
  const cropCanvasContainer = document.getElementById('crop-canvas'); // This was a canvas, now it will hold the image
  cropCanvasContainer.innerHTML = ''; // Clear existing canvas
  cropCanvasContainer.appendChild(imageElement);

  const toolbar = document.getElementById('crop-toolbar');
  const ratioButtons = toolbar.querySelectorAll('button[data-ratio]');
  const cropBtn = document.getElementById('crop-btn');

  let cropper = null;
  let originalFilename = 'image';

  window.loadImageToCrop = (dataUrl, filename) => {
    originalFilename = filename || 'image';
    imageElement.src = dataUrl;

    if (cropper) {
      cropper.destroy();
    }

    cropper = new Cropper(imageElement, {
      aspectRatio: NaN, // Free ratio by default
      viewMode: 2, // Restrict the canvas to not exceed the container
      autoCropArea: 0.8, // 80% of the image
      background: false, // Hide the grid background
      ready() {
        // Set initial active ratio button
        ratioButtons.forEach(btn => btn.classList.remove('active'));
        toolbar.querySelector('button[data-ratio="custom"]').classList.add('active');
      }
    });
  };

  ratioButtons.forEach(btn => {
    btn.onclick = () => {
      ratioButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.dataset.ratio;
      if (val === 'custom') {
        cropper.setAspectRatio(NaN); // Free ratio
      } else {
        const parts = val.split('/');
        const aspectRatio = parseFloat(parts[0]) / parseFloat(parts[1]);
        cropper.setAspectRatio(aspectRatio);
      }
    };
  });

  cropBtn.onclick = () => {
    if (!cropper || !imageElement.src) {
      alert(window.alertTranslations.alertSelectImage);
      return;
    }

    const croppedCanvas = cropper.getCroppedCanvas();
    croppedCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const nameParts = originalFilename.split('.');
      const extension = nameParts.pop();
      const baseName = nameParts.join('.');
      const newFilename = `${baseName}_cropped.${extension}`;

      a.download = newFilename;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.9); // You can adjust format and quality
  };
}