export function initUploader() {
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');
  const uploadedList = document.getElementById('uploaded-list');
  const selectAllBtn = document.getElementById('select-all-btn');
  const deselectAllBtn = document.getElementById('deselect-all-btn');

  window.imageDataList = [];
  window.selectedIndices = new Set();
  window.selectedForCrop = null;

  function renderUploadedList() {
    uploadedList.innerHTML = '';
    window.imageDataList.forEach((item, index) => {
      const dataUrl = item.dataUrl;
      const container = document.createElement('div');
      container.className = 'img-container';
      container.dataset.fileObject = JSON.stringify(item.file); // Store file object as string
      container.dataset.fileName = item.name;

      // Add dimensions display
      const dimensionsDiv = document.createElement('div');
      dimensionsDiv.className = 'image-dimensions';
      dimensionsDiv.textContent = `${item.width}x${item.height} (${item.name.split('.').pop()})`;
      dimensionsDiv.style.position = 'absolute';
      dimensionsDiv.style.bottom = '5px';
      dimensionsDiv.style.right = '5px';
      dimensionsDiv.style.background = 'rgba(0, 0, 0, 0.7)';
      dimensionsDiv.style.color = 'white';
      dimensionsDiv.style.padding = '2px 5px';
      dimensionsDiv.style.borderRadius = '3px';
      dimensionsDiv.style.fontSize = '12px';
      dimensionsDiv.style.zIndex = '3';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.dataset.index = index;
      checkbox.checked = window.selectedIndices.has(index);
      checkbox.style.position = 'absolute'; // 絕對定位在 container 內部
      checkbox.style.top = '5px';
      checkbox.style.left = '5px';
      checkbox.style.width = '20px';
      checkbox.style.height = '20px';
      checkbox.style.opacity = '0.9';
      checkbox.style.zIndex = '3'; // 確保在圖片和 label 上方

      checkbox.onchange = (e) => {
        if (e.target.checked) {
          window.selectedIndices.add(index);
          img.classList.add('selected');
        
          const selectedItems = Array.from(window.selectedIndices)
            .map(i => window.imageDataList[i])
            .filter(Boolean);

        } else {
          window.selectedIndices.delete(index);
          img.classList.remove('selected');
        }
        updateBatchProcessingList();
      };

      // label 元素現在只用於包裹 checkbox，或者可以移除
      // 為了保持語義，我們讓它存在，但它不再是 checkbox 的定位父級
      const label = document.createElement('label');
      // label.appendChild(checkbox); // 不再將 checkbox 放入 label

      const img = document.createElement('img');
      img.src = item.dataUrl;
      img.alt = `已上傳圖片 ${index + 1}`;
      img.style.width = '100%'; // 填滿 container
      img.style.height = '100%'; // 填滿 container
      img.style.objectFit = 'cover';
      img.style.border = '1px solid #ccc';
      img.style.borderRadius = '4px';
      img.style.cursor = 'pointer';
      img.style.position = 'absolute'; // 絕對定位在 container 內部
      img.style.top = '0';
      img.style.left = '0';

      img.onclick = () => {
        // 處理選中狀態
        uploadedList.querySelectorAll('img').forEach(i => i.classList.remove('selected'));
        img.classList.add('selected');
        window.selectedForCrop = index;

        // **兼容舊模式**：直接呼叫函式，確保 crop 和 enhance 功能正常
        if (typeof window.loadImageToCrop === 'function') {
          window.loadImageToCrop(dataUrl, item.name);
        }
        if (typeof window.loadImageToEnhance === 'function') {
          window.loadImageToEnhance(dataUrl, item.name);
        }

        // **支援新模式**：觸發全域事件，供 removebg 等模組使用
        const event = new CustomEvent('image-selected', { 
          detail: { 
            dataUrl: dataUrl,
            name: item.name
          }
        });
        window.dispatchEvent(event);
      };

      // ✅ 刪除按鈕
      const delBtn = document.createElement('button');
      delBtn.textContent = 'X';
      delBtn.title = '刪除此圖片';
      delBtn.style.position = 'absolute';
      delBtn.style.top = '0px';
      delBtn.style.right = '2px';
      delBtn.style.paddingInline = '5px';
      delBtn.style.background = '#f2f2f2';
      delBtn.style.border = '1px solid #ccc';
      delBtn.style.color = '#333';
      delBtn.style.fontWeight = 'bold';
      delBtn.style.borderRadius = '50%';
      delBtn.style.height = '22px';
      delBtn.style.fontSize = '16px';
      delBtn.style.lineHeight = '5px';
      delBtn.style.textAlign = 'center';
      delBtn.style.cursor = 'pointer';
      delBtn.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
      delBtn.onclick = () => {
        // 刪除邏輯
        window.imageDataList.splice(index, 1);
        window.selectedIndices = new Set(
          Array.from(window.selectedIndices)
            .filter(i => i !== index)
            .map(i => (i > index ? i - 1 : i))
        );
        if (window.selectedForCrop === index) {
          window.selectedForCrop = null;
        }
        else if (window.selectedForCrop > index) {
          window.selectedForCrop -= 1;
        }
        renderUploadedList();
        updateBatchProcessingList();
      };

      // 將所有元素直接添加到 container
      container.appendChild(img); // 先添加圖片，讓它在底部
      container.appendChild(checkbox); // 再添加 checkbox，讓它在圖片上方
      container.appendChild(label); // 添加 label (如果需要，可以移除)
      container.appendChild(dimensionsDiv); // Add dimensions div
      container.appendChild(delBtn); // 最后添加删除按钮
      uploadedList.appendChild(container);
    });
  }

  function updateBatchProcessingList() {
    if (typeof window.updateCompressSelection === 'function') {
      window.updateCompressSelection(
        Array.from(window.selectedIndices)
             .filter(i => window.imageDataList[i] !== undefined) // Filter out undefined items
             .map(i => window.imageDataList[i])
      );
    }
    if (typeof window.updateResizeSelection === 'function') {
      window.updateResizeSelection(
        Array.from(window.selectedIndices)
             .filter(i => window.imageDataList[i] !== undefined) // Filter out undefined items
             .map(i => window.imageDataList[i])
      );
    }
    if (typeof window.updateWhitebgSelection === 'function') {
      window.updateWhitebgSelection(
        Array.from(window.selectedIndices)
             .filter(i => window.imageDataList[i] !== undefined) // Filter out undefined items
             .map(i => window.imageDataList[i])
      );
    }
    if (typeof window.updateRotateSelection === 'function') {
      window.updateRotateSelection(
        Array.from(window.selectedIndices)
             .filter(i => window.imageDataList[i] !== undefined) // Filter out undefined items
             .map(i => window.imageDataList[i])
      );
    }
    if (typeof window.updateWatermarkSelection === 'function') {
      window.updateWatermarkSelection(
        Array.from(window.selectedIndices)
             .filter(i => window.imageDataList[i] !== undefined) // Filter out undefined items
             .map(i => window.imageDataList[i])
      );
    }
  }

  selectAllBtn.onclick = () => {
    window.imageDataList.forEach((_, idx) => window.selectedIndices.add(idx));
    renderUploadedList();
    updateBatchProcessingList();
  };

  deselectAllBtn.onclick = () => {
    window.selectedIndices.clear();
    renderUploadedList();
    updateBatchProcessingList();
  };

  uploadArea.onclick = () => fileInput.click();

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });

  fileInput.onchange = (e) => {
    handleFiles(e.target.files);
  };

  function handleFiles(files) {
    // Clear rotate operation sequence when new files are uploaded
    if (typeof window.resetRotateState === 'function') {
      window.resetRotateState();
    }
    const fileArr = Array.from(files);
    const loadPromises = []; // Array to hold promises for each file loading

    fileArr.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      const promise = new Promise(resolve => { // Create a promise for each file
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            window.imageDataList.push({
              name: file.name,
              dataUrl: ev.target.result,
              type: file.type,
              size: file.size, // Add original file size
              width: img.width, // Add original image width
              height: img.height, // Add original image height
              file: file // Store the original file object
            });
            const newIndex = window.imageDataList.length - 1;
            window.selectedIndices.add(newIndex);
            resolve(); // Resolve the promise when image is loaded and data is pushed
          };
          img.src = ev.target.result;
        };
      });
      reader.readAsDataURL(file);
      loadPromises.push(promise); // Add the promise to the array
    });

    // Wait for all images to load before rendering and updating batch list
    Promise.all(loadPromises).then(() => {
      renderUploadedList();
      updateBatchProcessingList();

      // If this is the first image uploaded, automatically select it for crop/enhance
      // This condition needs to be adjusted if multiple initial files are uploaded
      if (window.imageDataList.length === fileArr.length) { // Check if this is the initial batch
        setTimeout(() => {
          const firstImageElement = uploadedList.querySelector('.img-container img');
          if (firstImageElement) {
            firstImageElement.click();
          }
        }, 0);
      }
    });
  }
}
