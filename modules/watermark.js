
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


let watermarkPreviewCanvas;
let watermarkPreviewCtx;
let watermarkOverlayText;
let watermarkOverlayImage;
let watermarkPreviewContainer;
let watermarkBaseImagePreview; // New element for base image preview

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

export function initWatermarkTool() {
    console.log('Watermark tool initialized.');

    // Get DOM elements
    watermarkPreviewCanvas = document.getElementById('watermark-preview-canvas');
    if (watermarkPreviewCanvas) {
        watermarkPreviewCtx = watermarkPreviewCanvas.getContext('2d');
    } else {
        console.error('watermark-preview-canvas not found!');
        return; // Exit if canvas is not found
    }
    watermarkOverlayText = document.getElementById('watermark-overlay-text');
    watermarkOverlayImage = document.getElementById('watermark-overlay-image');
    watermarkPreviewContainer = document.getElementById('watermark-preview-container');
    watermarkBaseImagePreview = document.getElementById('watermark-base-image-preview'); // Get the new base image element

    const watermarkTypeRadios = document.querySelectorAll('input[name="watermark-type"]');
    const textWatermarkControls = document.getElementById('text-watermark-controls');
    const imageWatermarkControls = document.getElementById('image-watermark-controls');
    const applyWatermarkBtn = document.getElementById('apply-watermark-btn');

    // Initialize control values
    document.getElementById('watermark-text-input').value = watermarkTextConfig.text;
    document.getElementById('watermark-font').value = watermarkTextConfig.font;
    document.getElementById('watermark-font-size').value = watermarkTextConfig.fontSize;
    document.getElementById('watermark-font-size-value').textContent = watermarkTextConfig.fontSize;
    document.getElementById('watermark-color').value = watermarkTextConfig.color;
    document.getElementById('watermark-opacity').value = watermarkTextConfig.opacity * 100;
    document.getElementById('watermark-opacity-value').textContent = `${watermarkTextConfig.opacity * 100}%`;
    document.getElementById('watermark-image-opacity').value = watermarkImageConfig.opacity * 100;
    document.getElementById('watermark-image-opacity-value').textContent = `${watermarkImageConfig.opacity * 100}%`;

    // Event Listeners for watermark type selection
    watermarkTypeRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            currentWatermarkType = event.target.value;
            if (currentWatermarkType === 'text') {
                textWatermarkControls.style.display = 'block';
                imageWatermarkControls.style.display = 'none';
                watermarkOverlayText.style.display = 'block';
                watermarkOverlayImage.style.display = 'none';
            } else {
                textWatermarkControls.style.display = 'none';
                imageWatermarkControls.style.display = 'block';
                watermarkOverlayText.style.display = 'none';
                watermarkOverlayImage.style.display = 'block';
            }
            updateWatermarkPreview();
        });
    });

    // Event Listeners for text watermark controls
    document.getElementById('watermark-text-input').addEventListener('input', (e) => {
        watermarkTextConfig.text = e.target.value;
        updateWatermarkPreview();
    });
    document.getElementById('watermark-font').addEventListener('change', (e) => {
        watermarkTextConfig.font = e.target.value;
        updateWatermarkPreview();
    });
    document.getElementById('watermark-font-size').addEventListener('input', (e) => {
        watermarkTextConfig.fontSize = parseInt(e.target.value);
        document.getElementById('watermark-font-size-value').textContent = watermarkTextConfig.fontSize;
        updateWatermarkPreview();
    });
    document.getElementById('watermark-color').addEventListener('input', (e) => {
        watermarkTextConfig.color = e.target.value;
        updateWatermarkPreview();
    });
    document.getElementById('watermark-opacity').addEventListener('input', (e) => {
        watermarkTextConfig.opacity = parseFloat(e.target.value) / 100;
        document.getElementById('watermark-opacity-value').textContent = `${e.target.value}%`;
        updateWatermarkPreview();
    });

    // Event Listener for image watermark upload
    document.getElementById('watermark-image-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    watermarkImageConfig.image = img;
                    watermarkOverlayImage.src = img.src;
                    // Set initial size of overlay image to fit within preview container
                    const containerWidth = watermarkPreviewContainer.offsetWidth;
                    const containerHeight = watermarkPreviewContainer.offsetHeight;
                    let newWidth = img.width;
                    let newHeight = img.height;

                    if (newWidth > containerWidth || newHeight > containerHeight) {
                        const aspectRatio = newWidth / newHeight;
                        if (newWidth > containerWidth) {
                            newWidth = containerWidth * 0.5; // Start with 50% of container width
                            newHeight = newWidth / aspectRatio;
                        }
                        if (newHeight > containerHeight) {
                            newHeight = containerHeight * 0.5; // Start with 50% of container height
                            newWidth = newHeight * aspectRatio;
                        }
                    }
                    watermarkOverlayImage.style.width = `${newWidth}px`;
                    watermarkOverlayImage.style.height = `${newHeight}px`;
                    watermarkOverlayImage.style.left = `${(containerWidth - newWidth) / 2}px`;
                    watermarkOverlayImage.style.top = `${(containerHeight - newHeight) / 2}px`;

                    updateWatermarkPreview();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Event Listener for image watermark opacity
    document.getElementById('watermark-image-opacity').addEventListener('input', (e) => {
        watermarkImageConfig.opacity = parseFloat(e.target.value) / 100;
        document.getElementById('watermark-image-opacity-value').textContent = `${e.target.value}%`;
        updateWatermarkPreview();
    });

    // Event Listener for apply watermark button
    applyWatermarkBtn.addEventListener('click', handleApplyWatermark);

    // Listen for changes in selected images in the uploader
    document.getElementById('uploaded-list').addEventListener('change', (event) => {
        if (event.target.classList.contains('image-checkbox')) {
            updateWatermarkPreview();
        }
    });

    // Initial preview update
    updateWatermarkPreview();
}

export function updateWatermarkPreview() {
    console.log('updateWatermarkPreview called');
    const selectedImages = getSelectedImages();
    console.log('Selected images in updateWatermarkPreview:', selectedImages);
    if (selectedImages.length === 0) {
        watermarkPreviewCtx.clearRect(0, 0, watermarkPreviewCanvas.width, watermarkPreviewCanvas.height);
        watermarkOverlayText.style.display = 'none';
        watermarkOverlayImage.style.display = 'none';
        watermarkBaseImagePreview.src = ''; // Clear base image
        activeImageForPreview = null;
        return;
    }

    const firstSelectedImage = selectedImages[0];
    const imageUrl = firstSelectedImage.originalSrc;

    if (!activeImageForPreview || activeImageForPreview.src !== imageUrl) {
        activeImageForPreview = new Image();
        activeImageForPreview.onload = () => {
            watermarkBaseImagePreview.src = imageUrl; // Set base image source
            watermarkBaseImagePreview.onload = () => {
                // Set container height to maintain aspect ratio
                const aspectRatio = watermarkBaseImagePreview.naturalWidth / watermarkBaseImagePreview.naturalHeight;
                watermarkPreviewContainer.style.height = `${watermarkPreviewContainer.offsetWidth / aspectRatio}px`;

                // Set canvas dimensions to match the displayed image
                watermarkPreviewCanvas.width = watermarkBaseImagePreview.offsetWidth;
                watermarkPreviewCanvas.height = watermarkBaseImagePreview.offsetHeight;
                drawPreview();
            };
        };
        activeImageForPreview.src = imageUrl;
    } else {
        // If image is already loaded, just update canvas dimensions and draw
        watermarkPreviewCanvas.width = watermarkBaseImagePreview.offsetWidth;
        watermarkPreviewCanvas.height = watermarkBaseImagePreview.offsetHeight;
        drawPreview();
    }
}

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

        // Initial positioning if not set
        if (watermarkTextConfig.width === 0 || watermarkTextConfig.height === 0) {
            watermarkOverlayText.style.left = '10%'; // Default to 10% from left
            watermarkOverlayText.style.top = '10%';  // Default to 10% from top
            // Store initial relative position
            watermarkTextConfig.x = 0.1;
            watermarkTextConfig.y = 0.1;
            watermarkTextConfig.width = watermarkOverlayText.offsetWidth / watermarkPreviewCanvas.width;
            watermarkTextConfig.height = watermarkOverlayText.offsetHeight / watermarkPreviewCanvas.height;
        }
        // Ensure the text element's size is naturally calculated before getting offsetWidth/Height
        watermarkOverlayText.style.width = 'auto';
        watermarkOverlayText.style.height = 'auto';

        // Force reflow to get accurate dimensions after font and text content are set
        // Accessing offsetWidth/offsetHeight here forces the browser to re-calculate layout
        const currentTextWidth = watermarkOverlayText.offsetWidth;
        const currentTextHeight = watermarkOverlayText.offsetHeight;

        watermarkTextConfig.width = currentTextWidth / watermarkPreviewCanvas.width;
        watermarkTextConfig.height = currentTextHeight / watermarkPreviewCanvas.height;

        // Apply stored relative position and calculated size
        watermarkOverlayText.style.left = `${watermarkTextConfig.x * watermarkPreviewCanvas.width}px`;
        watermarkOverlayText.style.top = `${watermarkTextConfig.y * watermarkPreviewCanvas.height}px`;
        watermarkOverlayText.style.width = `${currentTextWidth}px`; // Set actual pixel width
        watermarkOverlayText.style.height = `${currentTextHeight}px`; // Set actual pixel height
    } else { // Image watermark
        watermarkOverlayText.style.display = 'none';
        watermarkOverlayImage.style.display = 'block';

        watermarkOverlayImage.style.opacity = watermarkImageConfig.opacity;

        // Initial positioning if not set or image changed
        if (watermarkImageConfig.width === 0 || watermarkImageConfig.height === 0 || watermarkOverlayImage.src !== watermarkImageConfig.image?.src) {
            if (watermarkImageConfig.image) {
                const img = watermarkImageConfig.image;
                let newWidth = img.width;
                let newHeight = img.height;

                // Scale to fit within 50% of preview canvas
                const maxPreviewWidth = watermarkPreviewCanvas.width * 0.5;
                const maxPreviewHeight = watermarkPreviewCanvas.height * 0.5;

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
                watermarkOverlayImage.style.width = `${newWidth}px`;
                watermarkOverlayImage.style.height = `${newHeight}px`;
                watermarkOverlayImage.style.left = `${(watermarkPreviewCanvas.width - newWidth) / 2}px`;
                watermarkOverlayImage.style.top = `${(watermarkPreviewCanvas.height - newHeight) / 2}px`;

                watermarkImageConfig.x = (watermarkPreviewCanvas.width - newWidth) / 2 / watermarkPreviewCanvas.width;
                watermarkImageConfig.y = (watermarkPreviewCanvas.height - newHeight) / 2 / watermarkPreviewCanvas.height;
                watermarkImageConfig.width = newWidth / watermarkPreviewCanvas.width;
                watermarkImageConfig.height = newHeight / watermarkPreviewCanvas.height;
            }
        } else {
            // Apply stored relative position and size
            watermarkOverlayImage.style.left = `${watermarkImageConfig.x * watermarkPreviewCanvas.width}px`;
            watermarkOverlayImage.style.top = `${watermarkImageConfig.y * watermarkPreviewCanvas.height}px`;
            watermarkOverlayImage.style.width = `${watermarkImageConfig.width * watermarkPreviewCanvas.width}px`;
            watermarkOverlayImage.style.height = `${watermarkImageConfig.height * watermarkPreviewCanvas.height}px`;
        }
    }
    setupDraggableAndResizable();
}

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
