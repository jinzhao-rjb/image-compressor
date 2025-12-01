// 图片压缩工具 JavaScript

// DOM 元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const formatSelect = document.getElementById('format');
const compressBtn = document.getElementById('compressBtn');
const previewGrid = document.getElementById('previewGrid');
const resultsSection = document.getElementById('resultsSection');
const resultsGrid = document.getElementById('resultsGrid');
const totalStats = document.getElementById('totalStats');
const downloadAllBtn = document.getElementById('downloadAllBtn');

// 存储上传的图片
let uploadedImages = [];
let compressedImages = [];

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 更新质量显示
qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = qualitySlider.value;
});

// 处理文件上传
function handleFileUpload(files) {
    // 清空现有图片
    uploadedImages = [];
    compressedImages = [];
    
    // 遍历文件
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            uploadedImages.push({
                file: file,
                name: file.name,
                size: file.size
            });
        }
    });
    
    // 显示预览
    displayPreview();
    
    // 显示压缩按钮
    compressBtn.disabled = uploadedImages.length === 0;
}

// 显示图片预览
function displayPreview() {
    if (uploadedImages.length === 0) {
        previewGrid.innerHTML = `
            <div class="empty-preview">
                <p>上传图片后将显示预览</p>
            </div>
        `;
        return;
    }
    
    let previewHTML = '';
    uploadedImages.forEach((image, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="${image.name}" class="preview-image">
                <div class="preview-info">
                    <div>${image.name}</div>
                    <div>${formatFileSize(image.size)}</div>
                    <button class="remove-btn" onclick="removeImage(${index})">移除</button>
                </div>
            `;
            previewGrid.appendChild(previewItem);
        };
        reader.readAsDataURL(image.file);
    });
    
    // 清空初始预览
    previewGrid.innerHTML = '';
}

// 移除图片
function removeImage(index) {
    uploadedImages.splice(index, 1);
    displayPreview();
    compressBtn.disabled = uploadedImages.length === 0;
}

// 压缩图片
async function compressImages() {
    compressedImages = [];
    resultsGrid.innerHTML = '';
    
    for (const [index, image] of uploadedImages.entries()) {
        const compressedImage = await compressSingleImage(image, index);
        if (compressedImage) {
            compressedImages.push(compressedImage);
        }
    }
    
    // 显示结果
    displayResults();
}

// 压缩单张图片
async function compressSingleImage(image, index) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 创建 Canvas
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 设置 Canvas 尺寸
                canvas.width = img.width;
                canvas.height = img.height;
                
                // 绘制图片
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // 确定输出格式
                let outputFormat = formatSelect.value;
                let mimeType = image.file.type;
                
                if (outputFormat !== 'original') {
                    mimeType = `image/${outputFormat}`;
                }
                
                // 压缩质量
                const quality = parseInt(qualitySlider.value) / 100;
                
                // 转换为 Blob
                canvas.toBlob((blob) => {
                    if (!blob) {
                        resolve(null);
                        return;
                    }
                    
                    const compressedImage = {
                        original: image,
                        compressed: {
                            blob: blob,
                            size: blob.size,
                            url: URL.createObjectURL(blob),
                            name: `${image.name.split('.')[0]}_compressed.${outputFormat === 'original' ? image.name.split('.').pop() : outputFormat}`,
                            mimeType: mimeType
                        },
                        savings: image.size - blob.size,
                        savingsPercent: ((1 - blob.size / image.size) * 100).toFixed(1)
                    };
                    
                    resolve(compressedImage);
                }, mimeType, quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(image.file);
    });
}

// 显示压缩结果
function displayResults() {
    if (compressedImages.length === 0) {
        return;
    }
    
    // 显示结果区域
    resultsSection.style.display = 'block';
    
    // 显示每张图片的结果
    compressedImages.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <div class="result-header">
                <div class="result-name">${result.compressed.name}</div>
                <a href="${result.compressed.url}" download="${result.compressed.name}" class="download-btn">下载</a>
            </div>
            <img src="${result.compressed.url}" alt="${result.compressed.name}" class="result-image">
            <div class="result-stats">
                <div class="stat-item">
                    <span class="stat-label">原图大小:</span>
                    <span class="stat-value">${formatFileSize(result.original.size)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">压缩后:</span>
                    <span class="stat-value">${formatFileSize(result.compressed.size)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">压缩率:</span>
                    <span class="stat-value">${result.savingsPercent}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">节省空间:</span>
                    <span class="stat-value">${formatFileSize(result.savings)}</span>
                </div>
            </div>
        `;
        resultsGrid.appendChild(resultItem);
    });
    
    // 显示总统计
    displayTotalStats();
}

// 显示总统计
function displayTotalStats() {
    const totalOriginalSize = compressedImages.reduce((sum, img) => sum + img.original.size, 0);
    const totalCompressedSize = compressedImages.reduce((sum, img) => sum + img.compressed.size, 0);
    const totalSavings = totalOriginalSize - totalCompressedSize;
    const totalSavingsPercent = totalOriginalSize > 0 ? ((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1) : 0;
    
    totalStats.innerHTML = `
        <h3>总压缩统计</h3>
        <div class="total-stats-grid">
            <div class="total-stat-item">
                <span class="total-stat-value">${formatFileSize(totalOriginalSize)}</span>
                <span class="total-stat-label">总原图大小</span>
            </div>
            <div class="total-stat-item">
                <span class="total-stat-value">${formatFileSize(totalCompressedSize)}</span>
                <span class="total-stat-label">总压缩后大小</span>
            </div>
            <div class="total-stat-item">
                <span class="total-stat-value">${formatFileSize(totalSavings)}</span>
                <span class="total-stat-label">总节省空间</span>
            </div>
            <div class="total-stat-item">
                <span class="total-stat-value">${totalSavingsPercent}%</span>
                <span class="total-stat-label">总压缩率</span>
            </div>
        </div>
    `;
}

// 下载全部图片
function downloadAllImages() {
    compressedImages.forEach(result => {
        const a = document.createElement('a');
        a.href = result.compressed.url;
        a.download = result.compressed.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

// 事件监听

// 点击上传
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// 文件选择
fileInput.addEventListener('change', (e) => {
    handleFileUpload(e.target.files);
});

// 拖拽上传
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
    handleFileUpload(e.dataTransfer.files);
});

// 压缩按钮
compressBtn.addEventListener('click', compressImages);

// 下载全部按钮
downloadAllBtn.addEventListener('click', downloadAllImages);

// 初始化
function init() {
    // 设置初始质量值
    qualityValue.textContent = qualitySlider.value;
    
    // 禁用压缩按钮
    compressBtn.disabled = true;
    
    // 隐藏结果区域
    resultsSection.style.display = 'none';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
