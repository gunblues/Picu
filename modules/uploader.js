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
        } else {
          window.selectedIndices.delete(index);
          img.classList.remove('selected');
        }
        updateCompressList();
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
        uploadedList.querySelectorAll('img').forEach(i => i.classList.remove('selected'));
        img.classList.add('selected');
        window.selectedForCrop = index;
        if (typeof window.loadImageToCrop === 'function') {
          window.loadImageToCrop(dataUrl, item.name); // Pass item.name
        }
        if (typeof window.loadImageToEnhance === 'function') {
          window.loadImageToEnhance(dataUrl, item.name); // Pass item.name
        }
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
        } else if (window.selectedForCrop > index) {
          window.selectedForCrop -= 1;
        }
        renderUploadedList();
        updateCompressList();
      };

      // 將所有元素直接添加到 container
      container.appendChild(img); // 先添加圖片，讓它在底部
      container.appendChild(checkbox); // 再添加 checkbox，讓它在圖片上方
      container.appendChild(label); // 添加 label (如果需要，可以移除)
      container.appendChild(delBtn); // 最后添加删除按钮
      uploadedList.appendChild(container);
    });
  }

  function updateCompressList() {
    if (typeof window.updateCompressSelection === 'function') {
      window.updateCompressSelection(Array.from(window.selectedIndices).map(i => window.imageDataList[i].dataUrl));
    }
  }

  selectAllBtn.onclick = () => {
    window.imageDataList.forEach((_, idx) => window.selectedIndices.add(idx));
    renderUploadedList();
    updateCompressList();
  };

  deselectAllBtn.onclick = () => {
    window.selectedIndices.clear();
    renderUploadedList();
    updateCompressList();
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
    const fileArr = Array.from(files);
    fileArr.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        window.imageDataList.push({ 
          name: file.name,
          dataUrl: ev.target.result,
          type: file.type
        });
        window.selectedIndices.add(newIndex);
        renderUploadedList();
        updateCompressList();

        // If this is the first image uploaded, automatically select it for crop/enhance
        if (window.imageDataList.length === 1) {
          // Simulate a click on the newly added image to trigger selection and loading
          // This needs to be done after the image element is rendered in the DOM
          setTimeout(() => {
            const firstImageElement = uploadedList.querySelector('.img-container img');
            if (firstImageElement) {
              firstImageElement.click();
            }
          }, 0); // Use setTimeout to ensure the element is in the DOM
        }
      };
      reader.readAsDataURL(file);
    });
  }
}
