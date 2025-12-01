// 图片压缩工具 JavaScript - 支持大量图片

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

// 配置
const CONFIG = {
  maxConcurrent: 3,      // 最大并发压缩数
  retryTimes: 2,          // 失败重试次数
  chunkSize: 50,          // 每次处理的文件块大小
  maxFileSize: 100 * 1024 * 1024,  // 最大文件大小 (100MB)
  maxTotalSize: 1 * 1024 * 1024 * 1024  // 总文件大小限制 (1GB)
};

// 存储数据
let uploadedImages = [];
let compressedImages = [];
let compressionProgress = 0;
let totalFiles = 0;
let processedFiles = 0;
let isCompressing = false;

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
    // 清空现有数据
    uploadedImages = [];
    compressedImages = [];
    compressionProgress = 0;
    totalFiles = 0;
    processedFiles = 0;
    
    // 检查总文件大小
    let totalSize = 0;
    const validFiles = [];
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            // 检查单个文件大小
            if (file.size > CONFIG.maxFileSize) {
                console.warn(`跳过文件 ${file.name}: 超过最大文件大小限制 (${formatFileSize(CONFIG.maxFileSize)})`);
                return;
            }
            
            validFiles.push(file);
            totalSize += file.size;
        }
    });
    
    // 检查总文件大小
    if (totalSize > CONFIG.maxTotalSize) {
        alert(`总文件大小超过限制 (${formatFileSize(CONFIG.maxTotalSize)})，请减少文件数量或大小`);
        return;
    }
    
    // 遍历有效文件
    validFiles.forEach(file => {
        uploadedImages.push({
            file: file,
            name: file.name,
            size: file.size,
            type: file.type
        });
    });
    
    totalFiles = uploadedImages.length;
    
    // 显示预览
    displayPreview();
    
    // 显示压缩按钮
    compressBtn.disabled = uploadedImages.length === 0;
    
    // 隐藏结果区域
    resultsSection.style.display = 'none';
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
    
    // 清空预览区域
    previewGrid.innerHTML = '';
    
    // 显示图片数量
    const infoDiv = document.createElement('div');
    infoDiv.className = 'preview-info';
    infoDiv.innerHTML = `<p>共 ${uploadedImages.length} 张图片，总大小: ${formatFileSize(uploadedImages.reduce((sum, img) => sum + img.size, 0))}</p>`;
    previewGrid.appendChild(infoDiv);
    
    // 只显示前20张图片的预览，避免内存占用过大
    const displayCount = Math.min(20, uploadedImages.length);
    
    for (let i = 0; i < displayCount; i++) {
        const image = uploadedImages[i];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="${image.name}" class="preview-image">
                <div class="preview-info">
                    <div>${image.name}</div>
                    <div>${formatFileSize(image.size)}</div>
                </div>
            `;
            previewGrid.appendChild(previewItem);
        };
        
        reader.readAsDataURL(image.file);
    }
    
    // 如果图片数量超过20，显示剩余数量
    if (uploadedImages.length > 20) {
        const moreDiv = document.createElement('div');
        moreDiv.className = 'preview-item';
        moreDiv.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <p>... 还有 ${uploadedImages.length - 20} 张图片</p>
            </div>
        `;
        previewGrid.appendChild(moreDiv);
    }
    
    // 添加移除所有按钮
    const removeAllBtn = document.createElement('button');
    removeAllBtn.className = 'remove-btn';
    removeAllBtn.textContent = '移除所有图片';
    removeAllBtn.onclick = () => {
        uploadedImages = [];
        displayPreview();
        compressBtn.disabled = true;
    };
    previewGrid.appendChild(removeAllBtn);
}

// 压缩图片
async function compressImages() {
    if (isCompressing || uploadedImages.length === 0) return;
    
    isCompressing = true;
    compressedImages = [];
    resultsGrid.innerHTML = '';
    processedFiles = 0;
    compressionProgress = 0;
    
    // 显示结果区域
    resultsSection.style.display = 'block';
    
    // 更新压缩按钮状态
    compressBtn.disabled = true;
    compressBtn.innerHTML = '<span class="loading"></span> 压缩中...';
    
    try {
        // 分块处理图片
        for (let i = 0; i < uploadedImages.length; i += CONFIG.chunkSize) {
            const chunk = uploadedImages.slice(i, i + CONFIG.chunkSize);
            await compressImageChunk(chunk);
        }
        
        // 显示结果
        displayResults();
    } catch (error) {
        console.error('压缩过程中发生错误:', error);
        alert('压缩过程中发生错误，请重试');
    } finally {
        // 恢复按钮状态
        isCompressing = false;
        compressBtn.disabled = false;
        compressBtn.innerHTML = '开始压缩';
    }
}

// 压缩图片块（并发）
async function compressImageChunk(imageChunk) {
    const results = [];
    const queue = [...imageChunk];
    const workers = [];
    
    // 启动工作线程
    for (let i = 0; i < Math.min(CONFIG.maxConcurrent, queue.length); i++) {
        workers.push(runWorker());
    }
    
    // 工作线程函数
    async function runWorker() {
        while (queue.length > 0) {
            const image = queue.shift();
            const result = await compressSingleImage(image);
            if (result) {
                results.push(result);
            }
            processedFiles++;
            updateProgress();
        }
    }
    
    // 等待所有工作线程完成
    await Promise.all(workers);
    
    // 添加到结果数组
    compressedImages.push(...results);
}

// 压缩单张图片，支持重试
async function compressSingleImage(image, retryCount = 0) {
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
                let mimeType = image.type;
                
                if (outputFormat !== 'original') {
                    mimeType = `image/${outputFormat}`;
                }
                
                // 压缩质量
                const quality = parseInt(qualitySlider.value) / 100;
                
                // 转换为 Blob
                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        if (retryCount < CONFIG.retryTimes) {
                            console.log(`重试压缩 ${image.name} (${retryCount + 1}/${CONFIG.retryTimes})...`);
                            const result = await compressSingleImage(image, retryCount + 1);
                            resolve(result);
                        } else {
                            console.error(`压缩失败 ${image.name}: Canvas 转换失败`);
                            resolve(null);
                        }
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
                    
                    // 释放内存
                    URL.revokeObjectURL(e.target.result);
                    canvas.width = 0;
                    canvas.height = 0;
                }, mimeType, quality);
            };
            
            img.onerror = async () => {
                if (retryCount < CONFIG.retryTimes) {
                    console.log(`重试加载 ${image.name} (${retryCount + 1}/${CONFIG.retryTimes})...`);
                    const result = await compressSingleImage(image, retryCount + 1);
                    resolve(result);
                } else {
                    console.error(`加载图片失败 ${image.name}`);
                    resolve(null);
                }
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = async () => {
            if (retryCount < CONFIG.retryTimes) {
                console.log(`重试读取 ${image.name} (${retryCount + 1}/${CONFIG.retryTimes})...`);
                const result = await compressSingleImage(image, retryCount + 1);
                resolve(result);
            } else {
                console.error(`读取文件失败 ${image.name}`);
                resolve(null);
            }
        };
        
        reader.readAsDataURL(image.file);
    });
}

// 更新压缩进度
function updateProgress() {
    compressionProgress = Math.round((processedFiles / totalFiles) * 100);
    compressBtn.innerHTML = `<span class="loading"></span> 压缩中... ${compressionProgress}%`;
}

// 显示压缩结果
function displayResults() {
    if (compressedImages.length === 0) {
        resultsGrid.innerHTML = `
            <div class="empty-preview">
                <p>没有成功压缩的图片</p>
            </div>
        `;
        return;
    }
    
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
                <span class="total-stat-value">${compressedImages.length}</span>
                <span class="total-stat-label">成功压缩</span>
            </div>
            <div class="total-stat-item">
                <span class="total-stat-value">${totalFiles - compressedImages.length}</span>
                <span class="total-stat-label">压缩失败</span>
            </div>
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
    if (compressedImages.length === 0) return;
    
    // 使用 zip.js 或其他库可以实现打包下载，这里简单实现逐个下载
    compressedImages.forEach(result => {
        const a = document.createElement('a');
        a.href = result.compressed.url;
        a.download = result.compressed.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // 延迟下载，避免浏览器阻塞
        setTimeout(() => {}, 100);
    });
}

// 清理资源
function cleanupResources() {
    // 释放所有 URL 对象
    compressedImages.forEach(result => {
        URL.revokeObjectURL(result.compressed.url);
    });
    
    compressedImages = [];
    uploadedImages = [];
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

// 页面卸载时清理资源
window.addEventListener('beforeunload', cleanupResources);

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
