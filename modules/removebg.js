
let selfieSegmentation;
let canvas, ctx, outputImg;

export function initRemoveBgTool() {
  const removebgBtn = document.getElementById('removebg-btn');
  canvas = document.getElementById('removebg-canvas');
  ctx = canvas.getContext('2d');
  outputImg = document.getElementById('removebg-output');

  removebgBtn.onclick = async () => {
    const selected = document.querySelector('#uploaded-list img.selected');
    if (!selected) {
      alert(window.alertTranslations.alertSelectImageForRemoveBg);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      // 清空 canvas 和 output 圖片
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      outputImg.src = '';
      outputImg.style.display = 'none';

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (!selfieSegmentation) await loadMediaPipe();
      await selfieSegmentation.send({ image: img });
    };

    // 強制刷新，確保同一張圖也會觸發 onload
    img.src = selected.src + '?t=' + Date.now();
  };
}

async function loadMediaPipe() {
  selfieSegmentation = new SelfieSegmentation({
    locateFile: (file) => 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/' + file,
  });
  selfieSegmentation.setOptions({ modelSelection: 1 });
  selfieSegmentation.onResults(onResults);
  await selfieSegmentation.initialize();
}

function onResults(results) {
  const mask = results.segmentationMask;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-in';
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';

  outputImg.src = canvas.toDataURL('image/png');
  outputImg.style.display = 'block';
}
