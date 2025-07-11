
import { createImageBitmapFromFile, downloadImageFromCanvas } from './utils.js';

let selfieSegmentation;
let canvas, ctx, outputImg;

export function initRemoveBgTool() {
  const removebgBtn = document.getElementById('removebg-btn');
  const uploadInput = document.getElementById('removebg-upload');
  canvas = document.getElementById('removebg-canvas');
  ctx = canvas.getContext('2d');
  outputImg = document.getElementById('removebg-output');

  removebgBtn.onclick = async () => {
    if (!uploadInput.files.length) return;
    const img = await createImageBitmap(uploadInput.files[0]);
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    if (!selfieSegmentation) await loadMediaPipe();

    await selfieSegmentation.send({ image: img });
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

  // 背景全透明
  ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-in';
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';

  outputImg.src = canvas.toDataURL('image/png');
  outputImg.style.display = 'block';
}
