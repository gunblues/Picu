let watermarkPreviewCanvas;
let watermarkPreviewCtx;
let watermarkOverlayText;
let watermarkOverlayImage;
let watermarkPreviewContainer;

function drawPreview() {
    if (!activeImageForPreview) return;

    const containerWidth = watermarkPreviewContainer.offsetWidth;
    const containerHeight = watermarkPreviewContainer.offsetHeight;

    // Set canvas size to fill the container
    watermarkPreviewCanvas.width = containerWidth;
    // Calculate the height based on the image's aspect ratio and the container's width
    const calculatedHeight = containerWidth / (activeImageForPreview.width / activeImageForPreview.height);

    // Set the container's height to match the calculated height
    watermarkPreviewContainer.style.height = `${calculatedHeight}px`;

    // Set canvas size to fill the container
    watermarkPreviewCanvas.width = containerWidth;
    watermarkPreviewCanvas.height = calculatedHeight;

    // Draw the image to fill the canvas
    watermarkPreviewCtx.clearRect(0, 0, watermarkPreviewCanvas.width, watermarkPreviewCanvas.height);
    watermarkPreviewCtx.drawImage(activeImageForPreview, 0, 0, watermarkPreviewCanvas.width, watermarkPreviewCanvas.height);

    // Ensure the canvas itself is not offset by previous centering styles
    watermarkPreviewCanvas.style.marginLeft = `0px`;
    watermarkPreviewCanvas.style.marginTop = `0px`;

    // Update overlay positions and styles
    if (currentWatermarkType === 'text') {
        watermarkOverlayText.style.display = 'block';
        watermarkOverlayImage.style.display = 'none';

        watermarkOverlayText.textContent = watermarkTextConfig.text;
        watermarkOverlayText.style.font = `${watermarkTextConfig.fontSize}px ${watermarkTextConfig.font}`;
        watermarkOverlayText.style.color = watermarkTextConfig.color;
        watermarkOverlayText.style.opacity = watermarkTextConfig.opacity;

        // Ensure the text element's size is naturally calculated before getting offsetWidth/Height
        watermarkOverlayText.style.width = 'auto';
        watermarkOverlayText.style.height = 'auto';

        // Force reflow to get accurate dimensions after font and text content are set
        const currentTextWidth = watermarkOverlayText.offsetWidth;
        const currentTextHeight = watermarkOverlayText.offsetHeight;

        // Update relative size based on current dimensions
        watermarkTextConfig.width = currentTextWidth / watermarkPreviewCanvas.width;
        watermarkTextConfig.height = currentTextHeight / watermarkPreviewCanvas.height;

        // Apply stored relative position and calculated size
        watermarkOverlayText.style.left = `${watermarkTextConfig.x * watermarkPreviewCanvas.width}px`;
        watermarkOverlayText.style.top = `${watermarkTextConfig.y * watermarkPreviewCanvas.height}px`;
        watermarkOverlayText.style.width = `${currentTextWidth}px`;
        watermarkOverlayText.style.height = `${currentTextHeight}px`;
    } else { // Image watermark
        watermarkOverlayText.style.display = 'none';
        watermarkOverlayImage.style.display = 'block';

        watermarkOverlayImage.style.opacity = watermarkImageConfig.opacity;

        // Always re-calculate and apply image dimensions and position
        if (watermarkImageConfig.image) {
            const img = watermarkImageConfig.image;
            let newWidth = img.width;
            let newHeight = img.height;

            // Scale to fit within 50% of preview canvas, or maintain minimum size
            const maxPreviewWidth = watermarkPreviewCanvas.width * 0.5;
            const maxPreviewHeight = watermarkPreviewCanvas.height * 0.5;
            const minSize = 50; // pixels

            // Apply minimum size if smaller
            if (newWidth < minSize && newHeight < minSize) {
                const aspectRatio = newWidth / newHeight;
                if (newWidth < newHeight) {
                    newWidth = minSize;
                    newHeight = minSize / aspectRatio;
                } else {
                    newHeight = minSize;
                    newWidth = minSize * aspectRatio;
                }
            } else if (newWidth < minSize) {
                newWidth = minSize;
                newHeight = minWidth / (img.width / img.height);
            } else if (newHeight < minSize) {
                newHeight = minSize;
                newWidth = newHeight * (img.width / img.height);
            }

            // Scale down if larger than 50% of canvas
            if (newWidth > maxPreviewWidth || newHeight > maxPreviewHeight) {
                const aspectRatio = newWidth / newHeight;
                if (newWidth / maxPreviewWidth > newHeight / maxPreviewHeight) {
                    newWidth = maxPreviewWidth;
                    newHeight = newWidth / aspectRatio;
                } else {
                    newHeight = maxPreviewHeight;
                    newWidth = newHeight * aspectRatio;
                }
            }

            // Update watermarkImageConfig with the calculated relative dimensions
            watermarkImageConfig.width = newWidth / watermarkPreviewCanvas.width;
            watermarkImageConfig.height = newHeight / watermarkPreviewCanvas.height;

            // Apply calculated pixel dimensions to the overlay image
            watermarkOverlayImage.style.width = `${newWidth}px`;
            watermarkOverlayImage.style.height = `${newHeight}px`;

            // Apply stored relative position
            watermarkOverlayImage.style.left = `${watermarkImageConfig.x * watermarkPreviewCanvas.width}px`;
            watermarkOverlayImage.style.top = `${watermarkImageConfig.y * watermarkPreviewCanvas.height}px`;
        }
    }
    
}

function updateWatermarkPreview() {
    if (!watermarkPreviewCanvas || !watermarkPreviewCtx || !watermarkPreviewContainer || !watermarkOverlayText || !watermarkOverlayImage) {
        console.warn('updateWatermarkPreview skipped due to uninitialized elements (DOM)');
        return;
    }

    if (!activeImageForPreview) { // Check if an image is actually loaded for preview
        console.warn('updateWatermarkPreview skipped: No active image for preview.');
        watermarkPreviewCtx.clearRect(0, 0, watermarkPreviewCanvas.width, watermarkPreviewCanvas.height);
        watermarkOverlayText.style.display = 'none';
        watermarkOverlayImage.style.display = 'none';
        return;
    }

    console.log('updateWatermarkPreview called with active image.');

    // Set container height to maintain aspect ratio
    const aspectRatio = activeImageForPreview.naturalWidth / activeImageForPreview.naturalHeight;
    watermarkPreviewContainer.style.height = `${watermarkPreviewContainer.offsetWidth / aspectRatio}px`;

    // Set canvas dimensions to match the displayed image
    watermarkPreviewCanvas.width = watermarkPreviewContainer.offsetWidth;
    watermarkPreviewCanvas.height = watermarkPreviewContainer.offsetHeight;
    drawPreview();
}


function getSelectedImages() {
    console.log('getSelectedImages called');
    const selectedImages = [];
    // Iterate through the global selectedIndices set
    window.selectedIndices.forEach(index => {
        const item = window.imageDataList[index];
        if (item) {
            selectedImages.push({
                file: item.file, // The original File object
                originalSrc: item.dataUrl, // The data URL for display
                name: item.name // The original file name
            });
        }
    });
    console.log('Selected images in getSelectedImages:', selectedImages);
    return selectedImages;
}

function showProgressBar(containerId, barId) {
    document.getElementById(containerId).style.display = 'block';
    document.getElementById(barId).style.width = '0%';
    document.getElementById(barId).textContent = '0%';
}

function updateProgressBar(barId, processedCount, totalCount) {
    const progressBar = document.getElementById(barId);
    const progress = Math.round((processedCount / totalCount) * 100);
    progressBar.style.width = `${progress}%`;
    progressBar.textContent = `${progress}%`;
}

function hideProgressBar(containerId) {
    document.getElementById(containerId).style.display = 'none';
}

function downloadZip(zip, filename) {
    zip.generateAsync({ type: "blob" })
        .then(function (content) {
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
}




let currentWatermarkType = 'text'; // 'text' or 'image'
let watermarkTextConfig = {
    text: 'Your Watermark',
    font: 'Arial',
    fontSize: 50,
    color: '#000000',
    opacity: 0.7,
    x: 0, // Relative X position (0-1)
    y: 0, // Relative Y position (0-1)
    width: 0, // Relative width (0-1)
    height: 0, // Relative height (0-1)
};
let watermarkImageConfig = {
    image: null, // Image object
    opacity: 0.7,
    x: 0, // Relative X position (0-1)
    y: 0, // Relative Y position (0-1)
    width: 0, // Relative width (0-1)
    height: 0, // Relative height (0-1)
};



let activeImageForPreview = null; // The actual Image object for the first selected image

export function setWatermarkPreviewImage(imageData) {
    if (!imageData || !imageData.dataUrl) {
        activeImageForPreview = null;
        updateWatermarkPreview();
        return;
    }

    const imageUrl = imageData.dataUrl;

    if (!activeImageForPreview || activeImageForPreview.src !== imageUrl) {
        activeImageForPreview = new Image();
        activeImageForPreview.onload = () => {
            updateWatermarkPreview();
        };
        activeImageForPreview.src = imageUrl;
    } else {
        updateWatermarkPreview();
    }
}

export function initWatermarkTool() {
    console.log('Watermark tool initialized.');

    // Get canvas and context
    watermarkPreviewCanvas = document.getElementById('watermark-preview-canvas');
    watermarkOverlayText = document.getElementById('watermark-overlay-text');
    watermarkOverlayImage = document.getElementById('watermark-overlay-image');
    watermarkPreviewContainer = document.getElementById('watermark-preview-container');
    if (!watermarkPreviewCanvas || !watermarkOverlayText || !watermarkOverlayImage || !watermarkPreviewContainer) {
        console.error('One or more watermark preview elements not found!');
        return;
    }

    watermarkPreviewCtx = watermarkPreviewCanvas.getContext('2d');

    // Bind input events for text watermark
    const textInput = document.getElementById('watermark-text-input');
    const fontSelect = document.getElementById('watermark-font');
    const fontSizeInput = document.getElementById('watermark-font-size');
    const colorInput = document.getElementById('watermark-color');
    const textOpacityInput = document.getElementById('watermark-opacity');

    if (textInput) textInput.addEventListener('input', e => {
        watermarkTextConfig.text = e.target.value;
        updateWatermarkPreview();
    });

    if (fontSelect) fontSelect.addEventListener('change', e => {
        watermarkTextConfig.font = e.target.value;
        updateWatermarkPreview();
    });

    if (fontSizeInput) fontSizeInput.addEventListener('input', e => {
        watermarkTextConfig.fontSize = parseInt(e.target.value);
        updateWatermarkPreview();
    });

    if (colorInput) colorInput.addEventListener('input', e => {
        watermarkTextConfig.color = e.target.value;
        updateWatermarkPreview();
    });

    if (textOpacityInput) textOpacityInput.addEventListener('input', e => {
        const val = parseFloat(e.target.value);
        watermarkTextConfig.opacity = val;
        const textOpacityLabel = document.getElementById('watermark-opacity-value');
        if (textOpacityLabel) textOpacityLabel.textContent = `${Math.round(val * 100)}%`;
        updateWatermarkPreview();
    });

    
    // Update initial label values
    const textOpacityLabel = document.getElementById('watermark-opacity-value');
    const imageOpacityLabel = document.getElementById('watermark-image-opacity-value');
    if (textOpacityLabel && textOpacityInput) textOpacityLabel.textContent = `${Math.round(textOpacityInput.value * 100)}%`;
    // imageOpacityInput might not be defined yet, so check before accessing
    const imageOpacityInput = document.getElementById('watermark-image-opacity');
    if (imageOpacityLabel && imageOpacityInput) imageOpacityLabel.textContent = `${Math.round(imageOpacityInput.value * 100)}%`;

    // Bind input event for image watermark opacity
    if (imageOpacityInput) {
        imageOpacityInput.addEventListener('input', e => {
            const val = parseFloat(e.target.value);
        watermarkImageConfig.opacity = val;
        if (imageOpacityLabel) imageOpacityLabel.textContent = `${Math.round(val * 100)}%`;
            updateWatermarkPreview();
        });
    }

    setupDraggableAndResizable();

    // Bind apply watermark button
    const applyWatermarkBtn = document.getElementById('apply-watermark-btn');
    if (applyWatermarkBtn) {
        applyWatermarkBtn.addEventListener('click', handleApplyWatermark);
    }
}

export 



function setupDraggableAndResizable() {
    const targetElement = currentWatermarkType === 'text' ? watermarkOverlayText : watermarkOverlayImage;
    if (!targetElement) return;

    let isDragging = false;
    let isResizing = false;
    let startX, startY, startWidth, startHeight, startLeft, startTop;
    let activeHandle = null;

    // Remove existing event listeners to prevent duplicates
    targetElement.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    // Remove existing resize handles
    const existingHandles = targetElement.querySelectorAll('.resize-handle');
    existingHandles.forEach(handle => handle.remove());

    function onMouseDown(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent dragging the parent container

        if (e.target.classList.contains('resize-handle')) {
            isResizing = true;
            activeHandle = e.target;
        } else {
            isDragging = true;
        }

        startX = e.clientX;
        startY = e.clientY;
        startWidth = targetElement.offsetWidth;
        startHeight = targetElement.offsetHeight;
        startLeft = targetElement.offsetLeft;
        startTop = targetElement.offsetTop;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(e) {
        if (isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newLeft = startLeft + dx;
            let newTop = startTop + dy;

            // Boundary checks - allow watermark to go outside canvas boundaries for full control
            const canvasLeft = watermarkPreviewCanvas.offsetLeft;
            const canvasTop = watermarkPreviewCanvas.offsetTop;
            const canvasRight = canvasLeft + watermarkPreviewCanvas.width;
            const canvasBottom = canvasTop + watermarkPreviewCanvas.height;

            // Boundary checks relative to the canvas position within the container
            newLeft = Math.min(Math.max(newLeft, canvasLeft - targetElement.offsetWidth), canvasRight);
            newTop = Math.min(Math.max(newTop, canvasTop - targetElement.offsetHeight), canvasBottom);

            targetElement.style.left = `${newLeft}px`;
            targetElement.style.top = `${newTop}px`;

            // Update relative position
            if (currentWatermarkType === 'text') {
                watermarkTextConfig.x = (newLeft - canvasLeft) / watermarkPreviewCanvas.width;
                watermarkTextConfig.y = (newTop - canvasTop) / watermarkPreviewCanvas.height;
            } else {
                watermarkImageConfig.x = (newLeft - canvasLeft) / watermarkPreviewCanvas.width;
                watermarkImageConfig.y = (newTop - canvasTop) / watermarkPreviewCanvas.height;
            }

        } else if (isResizing && activeHandle) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newWidth = startWidth;
            let newHeight = startHeight;
            let newLeft = startLeft;
            let newTop = startTop;

            const aspectRatio = startWidth / startHeight;

            switch (activeHandle.dataset.handle) {
                case 'nw': // North-West
                    newWidth = startWidth - dx;
                    newHeight = startHeight - dy;
                    newLeft = startLeft + dx;
                    newTop = startTop + dy;
                    break;
                case 'ne': // North-East
                    newWidth = startWidth + dx;
                    newHeight = startHeight - dy;
                    newTop = startTop + dy;
                    break;
                case 'sw': // South-West
                    newWidth = startWidth - dx;
                    newHeight = startHeight + dy;
                    newLeft = startLeft + dx;
                    break;
                case 'se': // South-East
                    newWidth = startWidth + dx;
                    newHeight = startHeight + dy;
                    break;
            }

            // Maintain aspect ratio for image watermark
            if (currentWatermarkType === 'image') {
                if (newWidth < 10) newWidth = 10; // Minimum size
                if (newHeight < 10) newHeight = 10; // Minimum size

                if (activeHandle.dataset.handle.includes('w') || activeHandle.dataset.handle.includes('e')) { // Horizontal drag
                    newHeight = newWidth / aspectRatio;
                } else { // Vertical drag
                    newWidth = newHeight * aspectRatio;
                }
            }

            // Apply new dimensions and position
            targetElement.style.width = `${newWidth}px`;
            targetElement.style.height = `${newHeight}px`;
            targetElement.style.left = `${newLeft}px`;
            targetElement.style.top = `${newTop}px`;

            // Update relative size and position
            if (currentWatermarkType === 'text') {
                watermarkTextConfig.x = newLeft / watermarkPreviewCanvas.width;
                watermarkTextConfig.y = newTop / watermarkPreviewCanvas.height;
                watermarkTextConfig.width = newWidth / watermarkPreviewCanvas.width;
                watermarkTextConfig.height = newHeight / watermarkPreviewCanvas.height;
            } else {
                watermarkImageConfig.x = newLeft / watermarkPreviewCanvas.width;
                watermarkImageConfig.y = newTop / watermarkPreviewCanvas.height;
                watermarkImageConfig.width = newWidth / watermarkPreviewCanvas.width;
                watermarkImageConfig.height = newHeight / watermarkPreviewCanvas.height;
            }
        }
    }

    function onMouseUp() {
        isDragging = false;
        isResizing = false;
        activeHandle = null;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    targetElement.addEventListener('mousedown', onMouseDown);

    // Add resize handles for image watermark
    if (currentWatermarkType === 'image') {
        const handles = ['nw', 'ne', 'sw', 'se'];
        handles.forEach(handle => {
            const div = document.createElement('div');
            div.classList.add('resize-handle', handle);
            div.dataset.handle = handle;
            targetElement.appendChild(div);
            div.addEventListener('mousedown', onMouseDown); // Attach mousedown to handle
        });
    }
}


async function handleApplyWatermark() {
    const selectedImages = getSelectedImages();
    if (selectedImages.length === 0) {
        alert(window.alertTranslations.alertSelectImageForWatermark);
        return;
    }

    showProgressBar('watermark-progress-container', 'watermark-progress-bar');
    let processedCount = 0;
    const zip = new JSZip();
    let singleImageBlob = null; // To store the blob for single image download
    const processedBlobs = []; // Declare processedBlobs here

    // Calculate relative watermark properties from the preview
    let relativeWatermarkX, relativeWatermarkY, relativeWatermarkWidth, relativeWatermarkHeight;

    if (currentWatermarkType === 'text') {
        relativeWatermarkX = watermarkTextConfig.x;
        relativeWatermarkY = watermarkTextConfig.y;
        relativeWatermarkWidth = watermarkTextConfig.width;
        relativeWatermarkHeight = watermarkTextConfig.height;
    } else { // Image watermark
        relativeWatermarkX = watermarkImageConfig.x;
        relativeWatermarkY = watermarkImageConfig.y;
        relativeWatermarkWidth = watermarkImageConfig.width;
        relativeWatermarkHeight = watermarkImageConfig.height;
    }

    for (const { file, originalSrc, name } of selectedImages) {
        try {
            const img = new Image();
            img.src = originalSrc;
            await new Promise(resolve => img.onload = resolve);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Calculate absolute watermark properties for the current image
            const absWatermarkX = relativeWatermarkX * canvas.width;
            const absWatermarkY = relativeWatermarkY * canvas.height;
            const absWatermarkWidth = relativeWatermarkWidth * canvas.width;
            const absWatermarkHeight = relativeWatermarkHeight * canvas.height;

            if (currentWatermarkType === 'text') {
                ctx.font = `${watermarkTextConfig.fontSize * (canvas.width / watermarkPreviewCanvas.width)}px ${watermarkTextConfig.font}`; // Scale font size
                ctx.fillStyle = watermarkTextConfig.color;
                ctx.globalAlpha = watermarkTextConfig.opacity;
                ctx.fillText(watermarkTextConfig.text, absWatermarkX, absWatermarkY + absWatermarkHeight); // Adjust Y for text baseline
            } else { // Image watermark
                if (watermarkImageConfig.image) {
                    ctx.globalAlpha = watermarkImageConfig.opacity;
                    ctx.drawImage(watermarkImageConfig.image, absWatermarkX, absWatermarkY, absWatermarkWidth, absWatermarkHeight);
                }
            }
            ctx.globalAlpha = 1; // Reset alpha

            const blob = await new Promise(resolve => canvas.toBlob(resolve, file.type));
            if (selectedImages.length === 1) {
                singleImageBlob = blob;
            }
            processedBlobs.push({ name, blob });
            zip.file(name, blob);

            processedCount++;
            updateProgressBar('watermark-progress-bar', processedCount, selectedImages.length);

        } catch (error) {
            console.error('Error applying watermark to image:', name, error);
        }
    }

    if (processedCount > 0) {
        if (selectedImages.length === 1) {
            // Single image: download directly
            const { name } = selectedImages[0];
            const originalNameWithoutExt = name.split('.').slice(0, -1).join('.');
            const fileExtension = name.split('.').pop();
            const newFilename = `${originalNameWithoutExt}_watermarked.${fileExtension}`;

            const blob = singleImageBlob; // Use the directly processed blob
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = newFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            // Multiple images: download as zip
            downloadZip(zip, 'watermarked_images.zip');
        }
    }
    hideProgressBar('watermark-progress-container');
}
