// 图片压缩工具的JavaScript代码

// 全局变量
let uploadedImages = []; // 存储已上传的图片
let selectedImages = new Set(); // 存储选中的图片索引
let compressBtn; // 压缩按钮全局变量

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化事件监听
    initEventListeners();
});

// 初始化事件监听
function initEventListeners() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('quality-value');
    compressBtn = document.getElementById('compress-btn');
    const selectAllBtn = document.getElementById('select-all');
    const deselectAllBtn = document.getElementById('deselect-all');
    const deleteSelectedBtn = document.getElementById('delete-selected');
    const downloadAllBtnElem = document.getElementById('download-all');
    const uploadBtn = document.getElementById('upload-btn');
    const monthFilter = document.getElementById('month-filter');

    // 拖拽上传事件
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // 点击上传事件
    fileInput.addEventListener('change', handleFileSelect);
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });

    // 顶部上传按钮事件
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });

    // 压缩质量调整事件
    qualitySlider.addEventListener('input', function() {
        const value = parseFloat(this.value);
        qualityValue.textContent = Math.round(value * 100) + '%';
    });

    // 压缩按钮事件
    compressBtn.addEventListener('click', compressImages);

    // 全选/取消全选事件
    selectAllBtn.addEventListener('click', selectAllImages);
    deselectAllBtn.addEventListener('click', deselectAllImages);
    deleteSelectedBtn.addEventListener('click', deleteSelectedImages);

    // 下载全部事件
    downloadAllBtnElem.addEventListener('click', downloadAllImages);
    
    // 月份筛选事件
    monthFilter.addEventListener('change', function() {
        renderFilteredImages();
    });
}

// 更新月份筛选下拉框
function updateMonthFilter() {
    const monthFilter = document.getElementById('month-filter');
    const months = new Set();
    
    // 获取所有图片的月份
    uploadedImages.forEach(image => {
        months.add(image.month);
    });
    
    // 清空现有选项（保留"全部月份"）
    monthFilter.innerHTML = '<option value="all">全部月份</option>';
    
    // 添加月份选项（按降序排列）
    Array.from(months).sort().reverse().forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        monthFilter.appendChild(option);
    });
}

// 渲染筛选后的图片
function renderFilteredImages() {
    const previewContainer = document.getElementById('preview-container');
    const monthFilter = document.getElementById('month-filter');
    const selectedMonth = monthFilter.value;
    
    // 清空预览容器
    previewContainer.innerHTML = '';
    
    // 渲染符合条件的图片
    uploadedImages.forEach((image, index) => {
        if (selectedMonth === 'all' || image.month === selectedMonth) {
            renderImagePreview(image, index);
        }
    });
}

// 拖拽事件处理
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const uploadArea = document.getElementById('upload-area');
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const uploadArea = document.getElementById('upload-area');
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const uploadArea = document.getElementById('upload-area');
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    processFiles(files);
}

// 文件选择事件处理
function handleFileSelect(e) {
    const files = e.target.files;
    processFiles(files);
    
    // 清空input值，允许重复上传同一文件
    e.target.value = '';
}

// 处理上传的文件
function processFiles(files) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // 获取文件最后修改时间
                const lastModified = new Date(file.lastModified);
                // 提取月份信息（格式：YYYY-MM）
                const month = lastModified.getFullYear() + '-' + String(lastModified.getMonth() + 1).padStart(2, '0');
                
                const imageData = {
                    file: file,
                    src: e.target.result,
                    name: file.name,
                    size: file.size,
                    lastModified: lastModified,
                    month: month
                };
                const index = uploadedImages.length;
                uploadedImages.push(imageData);
                // 默认选择新上传的图片
                selectedImages.add(index);
                // 更新月份筛选器并重新渲染
                updateMonthFilter();
                renderFilteredImages();
            };
            reader.readAsDataURL(file);
        }
    }
}

// 渲染图片预览
function renderImagePreview(imageData, index) {
    const previewContainer = document.getElementById('preview-container');
    const imageItem = document.createElement('div');
    imageItem.className = `image-item bg-gray-100 rounded-lg p-2 ${selectedImages.has(index) ? 'selected' : ''}`;
    imageItem.dataset.index = index;
    
    imageItem.innerHTML = `
        <div class="relative">
            <img src="${imageData.src}" alt="${imageData.name}" class="image-preview w-full rounded">
            <div class="absolute top-1 right-1 bg-white rounded-full p-1">
                <input type="checkbox" class="image-checkbox" data-index="${index}" style="width: 20px; height: 20px; cursor: pointer;" ${selectedImages.has(index) ? 'checked' : ''}>
            </div>
        </div>
        <div class="mt-2 text-xs text-gray-600 truncate">${imageData.name}</div>
        <div class="text-xs text-gray-500">${formatFileSize(imageData.size)}</div>
    `;
    
    // 添加点击事件
    imageItem.addEventListener('click', function() {
        toggleImageSelection(index);
    });
    
    // 添加复选框事件
    const checkbox = imageItem.querySelector('.image-checkbox');
    checkbox.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleImageSelection(index);
    });
    
    previewContainer.appendChild(imageItem);
}

// 切换图片选择状态
function toggleImageSelection(index) {
    const imageItem = document.querySelector(`[data-index="${index}"]`);
    const checkbox = imageItem.querySelector('.image-checkbox');
    
    if (selectedImages.has(index)) {
        selectedImages.delete(index);
        imageItem.classList.remove('selected');
        checkbox.checked = false;
    } else {
        selectedImages.add(index);
        imageItem.classList.add('selected');
        checkbox.checked = true;
    }
}

// 全选图片
function selectAllImages() {
    selectedImages.clear();
    const monthFilter = document.getElementById('month-filter');
    const selectedMonth = monthFilter.value;
    
    uploadedImages.forEach((image, index) => {
        if (selectedMonth === 'all' || image.month === selectedMonth) {
            selectedImages.add(index);
        }
    });
    renderFilteredImages();
}

// 取消全选图片
function deselectAllImages() {
    selectedImages.clear();
    const imageItems = document.querySelectorAll('.image-item');
    imageItems.forEach((item) => {
        item.classList.remove('selected');
        const checkbox = item.querySelector('.image-checkbox');
        checkbox.checked = false;
    });
}

// 删除选中的图片
function deleteSelectedImages() {
    if (selectedImages.size === 0) {
        alert('请先选择要删除的图片');
        return;
    }
    
    // 按索引降序删除，避免索引混乱
    const sortedIndices = Array.from(selectedImages).sort((a, b) => b - a);
    sortedIndices.forEach(index => {
        uploadedImages.splice(index, 1);
        selectedImages.delete(index);
    });
    
    // 重新渲染预览
    renderAllPreviews();
}

// 重新渲染所有预览
function renderAllPreviews() {
    // 更新月份筛选器并重新渲染
    updateMonthFilter();
    renderFilteredImages();
}

// 压缩图片
function compressImages() {
    if (uploadedImages.length === 0) {
        alert('请先上传图片');
        return;
    }
    
    // 获取压缩设置
    const quality = parseFloat(document.getElementById('quality').value);
    const format = document.getElementById('format').value;
    
    // 显示加载状态
    compressBtn.innerHTML = '<span class="loading">压缩中...</span>';
    compressBtn.disabled = true;
    
    // 压缩所有图片
    const compressPromises = uploadedImages.map(async (imageData, index) => {
        return compressImage(imageData, quality, format, index);
    });
    
    // 等待所有压缩完成
    Promise.all(compressPromises).then(results => {
        // 渲染压缩结果
        renderCompressionResults(results);
        
        // 恢复按钮状态
        compressBtn.innerHTML = '开始压缩';
        compressBtn.disabled = false;
    });
}

// 压缩单张图片
async function compressImage(imageData, quality, format, index) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            // 创建Canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 设置Canvas尺寸与原图相同
            canvas.width = img.width;
            canvas.height = img.height;
            
            // 绘制图片
            ctx.drawImage(img, 0, 0, img.width, img.height);
            
            // 确定输出格式
            let outputFormat = format;
            if (format === 'same') {
                outputFormat = imageData.file.type.split('/')[1];
            }
            
            // 转换为Blob
            canvas.toBlob((blob) => {
                let finalBlob = blob;
                let finalSize = blob.size;
                
                // 比较压缩前后大小，如果压缩后更大，则使用原文件
                if (finalSize >= imageData.file.size) {
                    finalBlob = imageData.file;
                    finalSize = imageData.file.size;
                    // 保持原格式
                    outputFormat = imageData.file.type.split('/')[1];
                }
                
                const compressedData = {
                    original: imageData,
                    compressed: {
                        blob: finalBlob,
                        size: finalSize,
                        width: img.width,
                        height: img.height,
                        format: outputFormat
                    },
                    index: index
                };
                resolve(compressedData);
            }, `image/${outputFormat}`, quality);
        };
        img.src = imageData.src;
    });
}

// 渲染压缩结果
function renderCompressionResults(results) {
    const resultContainer = document.getElementById('result-container');
    const resultSection = document.getElementById('result-section');
    
    // 清空结果容器
    resultContainer.innerHTML = '';
    
    // 渲染每个结果
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'border border-gray-200 rounded-lg p-4';
        
        // 计算压缩率
        const originalSize = result.original.size;
        const compressedSize = result.compressed.size;
        const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        
        resultItem.innerHTML = `
            <div class="flex flex-col md:flex-row gap-4">
                <!-- 原图信息 -->
                <div class="flex-1">
                    <h4 class="font-medium mb-2">原图</h4>
                    <img src="${result.original.src}" alt="原图" class="image-preview w-full rounded mb-2">
                    <div class="text-sm text-gray-600">
                        <div>文件名: ${result.original.name}</div>
                        <div>尺寸: ${result.compressed.width} × ${result.compressed.height}</div>
                        <div>大小: ${formatFileSize(originalSize)}</div>
                    </div>
                </div>
                
                <!-- 压缩后信息 -->
                <div class="flex-1">
                    <h4 class="font-medium mb-2">压缩后</h4>
                    <img src="${URL.createObjectURL(result.compressed.blob)}" alt="压缩后" class="image-preview w-full rounded mb-2">
                    <div class="text-sm text-gray-600">
                        <div>格式: ${result.compressed.format.toUpperCase()}</div>
                        <div>尺寸: ${result.compressed.width} × ${result.compressed.height}</div>
                        <div>大小: ${formatFileSize(compressedSize)}</div>
                        <div class="text-green-600">压缩率: ${compressionRatio}%</div>
                    </div>
                    <div class="mt-3">
                        <button class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors" onclick="downloadImage(this, '${URL.createObjectURL(result.compressed.blob)}', '${result.original.name.split('.')[0]}_compressed.${result.compressed.format}')">
                            下载
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        resultContainer.appendChild(resultItem);
    });
    
    // 显示结果区域
    resultSection.classList.remove('hidden');
    
    // 滚动到结果区域
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// 下载图片
function downloadImage(button, url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 下载全部图片
function downloadAllImages() {
    // 这里可以实现批量下载功能
    alert('批量下载功能开发中...');
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

