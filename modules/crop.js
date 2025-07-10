

export function initCropTool() {
  const canvas = document.getElementById('crop-canvas');
  const ctx = canvas.getContext('2d');
  const toolbar = document.getElementById('crop-toolbar');
  const ratioButtons = toolbar.querySelectorAll('button[data-ratio]');
  const cropBtn = document.getElementById('crop-btn');

  let image = null;
  let imgX = 0, imgY = 0, imgW = 0, imgH = 0;
  let startX, startY, endX, endY;
  let isDragging = false;
  let cropRect = null;
  let aspectRatio = null; // null means free ratio
  let originalFilename = 'image'; // Add a variable to store the original filename

  window.loadImageToCrop = (dataUrl, filename) => { // Add filename parameter
    image = new Image();
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      imgX = 0; imgY = 0;
      imgW = image.width;
      imgH = image.height;
      aspectRatio = null;
      originalFilename = filename || 'image'; // Store the filename
      draw();
    };
    image.src = dataUrl;
  };

  ratioButtons.forEach(btn => {
    btn.onclick = () => {
      ratioButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.dataset.ratio;
      if (val === 'custom') {
        aspectRatio = null;
      } else {
        const parts = val.split('/');
        aspectRatio = parseFloat(parts[0]) / parseFloat(parts[1]);
      }
      draw();
    };
  });
  ratioButtons[ratioButtons.length - 1].classList.add('active'); // 預設自由比例

  canvas.onmousedown = (e) => {
    if (!image) {
      alert(window.alertTranslations.alertSelectImage);
      return;
    }
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    endX = startX;
    endY = startY;
    cropRect = null;
    draw();
  };

  canvas.onmousemove = (e) => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    let mouseX = Math.min(Math.max(e.clientX - rect.left, 0), canvas.width);
    let mouseY = Math.min(Math.max(e.clientY - rect.top, 0), canvas.height);

    if (aspectRatio) {
      const dx = mouseX - startX;
      const dy = mouseY - startY;

      // 判斷拖曳方向
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx > absDy) {
        // 以水平為主
        const w = dx;
        const h = w / aspectRatio;
        endX = startX + w;
        endY = startY + h;
      } else {
        // 以垂直為主
        const h = dy;
        const w = h * aspectRatio;
        endY = startY + h;
        endX = startX + w;
      }
    } else {
      endX = mouseX;
      endY = mouseY;
    }

    cropRect = {
      x: Math.min(startX, endX),
      y: Math.min(startY, endY),
      w: Math.abs(endX - startX),
      h: Math.abs(endY - startY),
    };

    draw();
  };

  canvas.onmouseup = (e) => {
    if (!isDragging) return;
    isDragging = false;
    draw();
  };
  canvas.onmouseleave = () => {
    if (isDragging) {
      isDragging = false;
      draw();
    }
  };

  function draw() {
    if (!image) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, imgX, imgY, imgW, imgH);

    if (cropRect) {
      ctx.strokeStyle = '#ff9900';
      ctx.lineWidth = 2;
      ctx.setLineDash([6]);
      ctx.strokeRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);

      // 遮罩外圍
      ctx.fillStyle = 'rgba(255, 153, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, cropRect.y);
      ctx.fillRect(0, cropRect.y + cropRect.h, canvas.width, canvas.height - (cropRect.y + cropRect.h));
      ctx.fillRect(0, cropRect.y, cropRect.x, cropRect.h);
      ctx.fillRect(cropRect.x + cropRect.w, cropRect.y, canvas.width - (cropRect.x + cropRect.w), cropRect.h);
    }
  }

  cropBtn.onclick = () => {
    if (!cropRect || !image) {
      alert(window.alertTranslations.alertDragCropArea);
      return;
    }
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropRect.w;
    cropCanvas.height = cropRect.h;
    const cropCtx = cropCanvas.getContext('2d');
    cropCtx.drawImage(image, cropRect.x, cropRect.y, cropRect.w, cropRect.h, 0, 0, cropRect.w, cropRect.h);

    cropCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Generate new filename
      const nameParts = originalFilename.split('.');
      const extension = nameParts.pop();
      const baseName = nameParts.join('.');
      const newFilename = `${baseName}_cropped.${extension}`;

      a.download = newFilename; // Use the new filename
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.9);
  };
}
