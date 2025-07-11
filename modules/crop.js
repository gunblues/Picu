export function initCropTool() {
  const imageElement = document.createElement('img');
  imageElement.id = 'image-to-crop';
  imageElement.style.width = '100%';
  imageElement.style.maxHeight = '80vh';
  imageElement.style.objectFit = 'contain';
  imageElement.style.display = 'block';

  const cropCanvasContainer = document.getElementById('crop-canvas');
  cropCanvasContainer.innerHTML = '';
  cropCanvasContainer.appendChild(imageElement);

  const toolbar = document.getElementById('crop-toolbar');
  const ratioButtons = toolbar.querySelectorAll('button[data-ratio]');
  const cropBtn = document.getElementById('crop-btn');

  let cropper = null;
  let originalFilename = 'image';

  window.loadImageToCrop = (dataUrl, filename) => {
    originalFilename = filename || 'image';
    imageElement.src = dataUrl;

    imageElement.onload = () => {
      const waitUntilImageReady = () => {
        if (imageElement.clientWidth > 0 && imageElement.clientHeight > 0) {
          if (cropper) {
            cropper.destroy();
          }

          cropper = new Cropper(imageElement, {
            aspectRatio: 1,
            viewMode: 1,
            responsive: true,
            autoCropArea: 1,
          });
        } else {
          requestAnimationFrame(waitUntilImageReady);
        }
      };

      requestAnimationFrame(waitUntilImageReady);
    };
  };

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
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      canvas.toBlob(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${originalFilename}_cropped.png`;
        link.click();
      }, 'image/png');
    }
  });
}

