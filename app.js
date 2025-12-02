// 图片压缩工具的JavaScript代码

// 全局变量
let uploadedImages = []; // 存储已上传的图片
let selectedImages = new Set(); // 存储选中的图片索引
let compressedResults = []; // 存储压缩结果
let selectedCompressedImages = new Set(); // 存储选中的压缩图片索引
let compressBtn; // 压缩按钮全局变量

// 页面加载完成后初始化
 document.addEventListener('DOMContentLoaded', function() {
     // 初始化事件监听
     initEventListeners();
     // 初始化月份筛选
     initMonthFilter();
 });

// 初始化月份筛选
function initMonthFilter() {
    const monthFilter = document.getElementById('month-filter');
    if (monthFilter) {
        monthFilter.addEventListener('change', function() {
            renderAllPreviews();
        });
    }
}

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
                // 获取文件的修改日期或当前日期作为月份依据
                const fileDate = file.lastModifiedDate || new Date();
                const month = fileDate.getMonth() + 1; // 月份从1开始
                const year = fileDate.getFullYear();
                
                const imageData = {
                    file: file,
                    src: e.target.result,
                    name: file.name,
                    size: file.size,
                    month: month,
                    year: year
                };
                const index = uploadedImages.length;
                uploadedImages.push(imageData);
                // 默认选择新上传的图片
                selectedImages.add(index);
                renderImagePreview(imageData, index);
                
                // 更新月份筛选选项
                updateMonthFilterOptions();
            };
            reader.readAsDataURL(file);
        }
    }
}

// 更新月份筛选选项
function updateMonthFilterOptions() {
    const monthFilter = document.getElementById('month-filter');
    if (!monthFilter) return;
    
    // 保存当前选中的值
    const currentValue = monthFilter.value;
    
    // 获取所有唯一的年月组合
    const uniqueMonths = new Set();
    uploadedImages.forEach(imageData => {
        uniqueMonths.add(`${imageData.year}-${imageData.month}`);
    });
    
    // 只在月份组合变化时更新选项
    const currentOptions = new Set();
    for (let i = 1; i < monthFilter.options.length; i++) {
        currentOptions.add(monthFilter.options[i].value);
    }
    
    const newMonths = Array.from(uniqueMonths).sort().reverse();
    const needUpdate = newMonths.length !== currentOptions.size || 
                      newMonths.some(month => !currentOptions.has(month));
    
    if (needUpdate) {
        // 清空现有选项，保留"全部月份"
        monthFilter.innerHTML = '<option value="all">全部月份</option>';
        
        // 批量添加唯一的年月选项
        newMonths.forEach(monthStr => {
            const [year, month] = monthStr.split('-');
            const option = document.createElement('option');
            option.value = monthStr;
            option.textContent = `${year}年${month}月`;
            monthFilter.appendChild(option);
        });
        
        // 恢复之前的选中值或默认选中"全部月份"
        monthFilter.value = currentValue || 'all';
    }
}

// 渲染图片预览
function renderImagePreview(imageData, index) {
    const previewContainer = document.getElementById('preview-container');
    const imageItem = document.createElement('div');
    imageItem.className = `image-item bg-gray-100 rounded-lg p-2 ${selectedImages.has(index) ? 'selected' : ''}`;
    imageItem.dataset.index = index;
    
    // 添加月份显示
    const monthDisplay = imageData.month ? `<div class="text-xs text-gray-400">${imageData.year}年${imageData.month}月</div>` : '';
    
    // 直接创建完整的HTML结构，避免复杂的DOM操作
    imageItem.innerHTML = `
        <div class="relative">
            <img src="${imageData.src}" alt="${imageData.name}" class="image-preview w-full rounded">
            <div class="absolute top-1 right-1 bg-white rounded-full p-1">
                <input type="checkbox" class="image-checkbox" data-index="${index}" style="width: 20px; height: 20px; cursor: pointer;" ${selectedImages.has(index) ? 'checked' : ''}>
            </div>
        </div>
        <div class="mt-2 text-xs text-gray-600 truncate">${imageData.name}</div>
        ${monthDisplay}
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
    const imageItems = document.querySelectorAll('.image-item');
    imageItems.forEach((item, index) => {
        selectedImages.add(index);
        item.classList.add('selected');
        const checkbox = item.querySelector('.image-checkbox');
        checkbox.checked = true;
    });
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
    const previewContainer = document.getElementById('preview-container');
    previewContainer.innerHTML = '';
    
    // 获取当前选中的月份筛选
    const monthFilter = document.getElementById('month-filter');
    const selectedMonth = monthFilter ? monthFilter.value : 'all';
    
    uploadedImages.forEach((imageData, index) => {
        // 检查图片是否符合当前月份筛选条件
        if (selectedMonth === 'all' || `${imageData.year}-${imageData.month}` === selectedMonth) {
            renderImagePreview(imageData, index);
        }
    });
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
    
    // 存储压缩结果
    compressedResults = results;
    // 重置选中的压缩图片
    selectedCompressedImages.clear();
    
    // 清空结果容器
    resultContainer.innerHTML = '';
    
    // 渲染每个结果
    results.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'border border-gray-200 rounded-lg p-4 mb-4';
        
        // 计算压缩率
        const originalSize = result.original.size;
        const compressedSize = result.compressed.size;
        const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        
        resultItem.innerHTML = `
            <div class="flex items-start mb-3">
                <input type="checkbox" class="compressed-image-checkbox" id="compressed-checkbox-${index}" onchange="toggleCompressedImageSelection(${index})">
                <label for="compressed-checkbox-${index}" class="ml-2 text-sm text-gray-600">选择</label>
            </div>
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
// 切换压缩图片选择状态
function toggleCompressedImageSelection(index) {
    if (selectedCompressedImages.has(index)) {
        selectedCompressedImages.delete(index);
    } else {
        selectedCompressedImages.add(index);
    }
}

// 选择所有压缩图片
function selectAllCompressedImages() {
    selectedCompressedImages.clear();
    for (let i = 0; i < compressedResults.length; i++) {
        selectedCompressedImages.add(i);
        const checkbox = document.getElementById(`compressed-checkbox-${i}`);
        if (checkbox) {
            checkbox.checked = true;
        }
    }
}

// 取消选择所有压缩图片
function deselectAllCompressedImages() {
    selectedCompressedImages.clear();
    for (let i = 0; i < compressedResults.length; i++) {
        const checkbox = document.getElementById(`compressed-checkbox-${i}`);
        if (checkbox) {
            checkbox.checked = false;
        }
    }
}

function downloadAllImages() {
    // 检查是否有压缩结果
    if (compressedResults.length === 0) {
        alert('请先压缩图片');
        return;
    }
    
    // 检查是否有选中的图片，如果没有则默认下载全部
    let imagesToDownload;
    if (selectedCompressedImages.size === 0) {
        // 默认下载全部
        imagesToDownload = Array.from({ length: compressedResults.length }, (_, i) => i);
    } else {
        // 下载选中的图片
        imagesToDownload = Array.from(selectedCompressedImages);
    }
    
    const count = imagesToDownload.length;
    
    // 询问用户是否要打包下载
    const useZip = confirm(`检测到 ${count} 张图片，是否要打包成zip文件一次性下载？\n\n确定：打包成zip文件下载\n取消：逐个下载`);
    
    if (useZip) {
        // 使用JSZip打包下载
        zipDownloadImages(imagesToDownload);
    } else {
        // 逐个下载
        individualDownloadImages(imagesToDownload);
    }
}

// 打包成zip文件下载
function zipDownloadImages(imagesToDownload) {
    const count = imagesToDownload.length;
    alert(`正在打包 ${count} 张图片，请稍候...`);
    
    // 创建JSZip实例
    const zip = new JSZip();
    const imageFolder = zip.folder("compressed_images");
    
    // 存储所有的Promise
    const promises = [];
    
    imagesToDownload.forEach((index) => {
        const result = compressedResults[index];
        if (result) {
            const promise = new Promise((resolve) => {
                const compressedData = result.compressed;
                const originalFile = result.original.file;
                const originalName = originalFile.name;
                const filename = `${originalName.split('.')[0]}_compressed.${compressedData.format}`;
                
                // 将Blob转换为ArrayBuffer，JSZip需要ArrayBuffer
                const reader = new FileReader();
                reader.onload = (e) => {
                    // 将图片添加到zip文件夹
                    imageFolder.file(filename, e.target.result);
                    resolve();
                };
                reader.readAsArrayBuffer(compressedData.blob);
            });
            
            promises.push(promise);
        }
    });
    
    // 等待所有图片处理完成
    Promise.all(promises)
        .then(() => {
            // 生成zip文件
            return zip.generateAsync({ type: "blob" });
        })
        .then((zipBlob) => {
            // 创建下载链接
            const a = document.createElement('a');
            const blobUrl = URL.createObjectURL(zipBlob);
            a.href = blobUrl;
            a.download = `compressed_images_${new Date().getTime()}.zip`;
            document.body.appendChild(a);
            
            // 触发下载
            a.click();
            
            // 清理资源
            document.body.removeChild(a);
            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 100);
            
            alert(`已生成zip文件，开始下载 ${count} 张图片`);
        })
        .catch((error) => {
            console.error('生成zip文件失败:', error);
            alert('生成zip文件失败，请重试或选择逐个下载');
        });
}

// 逐个下载图片
function individualDownloadImages(imagesToDownload) {
    const count = imagesToDownload.length;
    if (!confirm(`即将逐个下载 ${count} 张图片，是否继续？`)) {
        return;
    }
    
    let downloadCount = 0;
    
    // 创建下载函数
    const downloadNext = (idx) => {
        if (idx >= imagesToDownload.length) {
            alert(`已开始下载 ${downloadCount} 张图片`);
            return;
        }
        
        const index = imagesToDownload[idx];
        const result = compressedResults[index];
        
        if (result) {
            try {
                const compressedData = result.compressed;
                const originalFile = result.original.file;
                const originalName = originalFile.name;
                const filename = `${originalName.split('.')[0]}_compressed.${compressedData.format}`;
                
                console.log(`准备下载第 ${idx + 1} 张图片:`, filename);
                
                // 创建下载链接
                const a = document.createElement('a');
                const blobUrl = URL.createObjectURL(compressedData.blob);
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                
                a.style.display = 'none';
                
                // 添加click事件监听，确保下载完成后清理资源
                a.addEventListener('click', () => {
                    setTimeout(() => {
                        URL.revokeObjectURL(blobUrl);
                    }, 100);
                });
                
                // 触发下载
                a.click();
                
                // 立即移除元素
                document.body.removeChild(a);
                
                downloadCount++;
                console.log(`已下载 ${downloadCount} 张图片`);
                
                // 继续下载下一张
                setTimeout(() => {
                    downloadNext(idx + 1);
                }, 100);
            } catch (error) {
                console.error('下载图片失败:', error);
                // 继续下载下一张
                setTimeout(() => {
                    downloadNext(idx + 1);
                }, 100);
            }
        } else {
            console.error('压缩结果不存在');
            // 继续下载下一张
            setTimeout(() => {
                downloadNext(idx + 1);
            }, 100);
        }
    };
    
    // 开始下载第一张
    downloadNext(0);
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

