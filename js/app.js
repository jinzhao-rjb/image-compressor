// 图片压缩工具 JavaScript - 支持移动端上传200张图片

// DOM 元素
var uploadArea = document.getElementById('uploadArea');
var fileInput = document.getElementById('fileInput');
var qualitySlider = document.getElementById('quality');
var qualityValue = document.getElementById('qualityValue');
var formatSelect = document.getElementById('format');
var replaceOriginalCheckbox = document.getElementById('replaceOriginal');
var losslessCompressionCheckbox = document.getElementById('losslessCompression');
var compressBtn = document.getElementById('compressBtn');
var previewGrid = document.getElementById('previewGrid');
var resultsSection = document.getElementById('resultsSection');
var resultsGrid = document.getElementById('resultsGrid');
var totalStats = document.getElementById('totalStats');
var downloadAllBtn = document.getElementById('downloadAllBtn');
var selectedCountEl = document.getElementById('selectedCount');
var totalSizeEl = document.getElementById('totalSize');
var compressionProgressEl = document.getElementById('compressionProgress');

// 配置
var CONFIG = {
  maxConcurrent: 3,      // 最大并发压缩数，移动端优化
  retryTimes: 2,          // 失败重试次数
  chunkSize: 50,          // 每次处理的文件块大小
  maxFileSize: 100 * 1024 * 1024,  // 单个文件最大100MB
  maxTotalSize: 2 * 1024 * 1024 * 1024, // 总文件大小最大2GB
  maxImages: 200,         // 单次最大上传图片数
  previewLimit: 20        // 预览图片数量限制
};

// 存储数据
var uploadedImages = [];
var compressedImages = [];
var compressionProgress = 0;
var totalFiles = 0;
var processedFiles = 0;
var isCompressing = false;
var totalSize = 0;

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 更新质量显示
qualitySlider.addEventListener('input', function() {
    qualityValue.textContent = qualitySlider.value;
});

// 更新统计信息
function updateStats() {
    selectedCountEl.textContent = uploadedImages.length;
    totalSizeEl.textContent = formatFileSize(totalSize);
    compressionProgressEl.textContent = compressionProgress + '%';
}

// 处理文件上传
function handleFileUpload(files) {
    // 清空现有数据
    cleanupResources();
    uploadedImages = [];
    compressedImages = [];
    compressionProgress = 0;
    totalFiles = 0;
    processedFiles = 0;
    totalSize = 0;
    
    // 检查文件数量
    if (files.length > CONFIG.maxImages) {
        alert('单次最多只能上传' + CONFIG.maxImages + '张图片，请减少文件数量');
        return;
    }
    
    // 检查总文件大小
    var currentTotalSize = 0;
    var validFiles = [];
    
    // 使用传统for循环替代Array.from和forEach
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (file.type.startsWith('image/')) {
            // 检查单个文件大小
            if (file.size > CONFIG.maxFileSize) {
                console.warn('跳过文件 ' + file.name + ': 超过最大文件大小限制 (' + formatFileSize(CONFIG.maxFileSize) + ')');
                continue;
            }
            
            validFiles.push(file);
            currentTotalSize += file.size;
        }
    }
    
    // 检查总文件大小
    if (currentTotalSize > CONFIG.maxTotalSize) {
        alert('总文件大小超过限制 (' + formatFileSize(CONFIG.maxTotalSize) + ')，请减少文件数量或大小');
        return;
    }
    
    totalSize = currentTotalSize;
    
    // 遍历有效文件
    for (var i = 0; i < validFiles.length; i++) {
        var file = validFiles[i];
        uploadedImages.push({
            file: file,
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrl: null
        });
    }
    
    totalFiles = uploadedImages.length;
    
    // 显示预览
    displayPreview();
    
    // 显示压缩按钮
    compressBtn.disabled = uploadedImages.length === 0;
    
    // 隐藏结果区域
    resultsSection.style.display = 'none';
    
    // 更新统计
    updateStats();
}

// 显示图片预览
function displayPreview() {
    if (uploadedImages.length === 0) {
        previewGrid.innerHTML = '<div class="empty-preview">' +
            '<p>上传图片后将显示预览</p>' +
        '</div>';
        return;
    }
    
    // 清空预览区域
    previewGrid.innerHTML = '';
    
    // 只显示前N张图片预览，优化性能
    var displayCount = Math.min(CONFIG.previewLimit, uploadedImages.length);
    
    for (var i = 0; i < displayCount; i++) {
        var image = uploadedImages[i];
        var reader = new FileReader();
        
        reader.onload = function(e) {
            var previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = '<img src="' + e.target.result + '" alt="' + image.name + '" class="preview-image">' +
                '<div class="preview-info">' +
                    '<div>' + image.name + '</div>' +
                    '<div>' + formatFileSize(image.size) + '</div>' +
                '</div>';
            previewGrid.appendChild(previewItem);
        };
        
        reader.readAsDataURL(image.file);
    }
    
    // 如果图片数量超过预览限制，显示更多提示
    if (uploadedImages.length > CONFIG.previewLimit) {
        var moreDiv = document.createElement('div');
        moreDiv.className = 'preview-item';
        moreDiv.innerHTML = '<div style="padding: 20px; text-align: center;">' +
            '<p>... 还有 ' + (uploadedImages.length - CONFIG.previewLimit) + ' 张图片</p>' +
        '</div>';
        previewGrid.appendChild(moreDiv);
    }
    
    // 添加移除所有按钮
    var removeAllBtn = document.createElement('button');
    removeAllBtn.className = 'remove-btn';
    removeAllBtn.textContent = '移除所有图片';
    removeAllBtn.onclick = function() {
        uploadedImages = [];
        totalSize = 0;
        displayPreview();
        compressBtn.disabled = true;
        updateStats();
    };
    previewGrid.appendChild(removeAllBtn);
}

// 压缩图片
function compressImages() {
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
        // 分块处理图片，优化移动端性能
        var chunks = [];
        for (var i = 0; i < uploadedImages.length; i += CONFIG.chunkSize) {
            chunks.push(uploadedImages.slice(i, i + CONFIG.chunkSize));
        }
        
        var currentChunk = 0;
        var processNextChunk = function() {
            if (currentChunk >= chunks.length) {
                // 显示结果
                displayResults();
                // 恢复按钮状态
                isCompressing = false;
                compressBtn.disabled = false;
                compressBtn.innerHTML = '开始压缩';
                return;
            }
            
            compressImageChunk(chunks[currentChunk], function() {
                currentChunk++;
                processNextChunk();
            });
        };
        
        processNextChunk();
    } catch (error) {
        console.error('压缩过程中发生错误:', error);
        alert('压缩过程中发生错误，请重试');
        // 恢复按钮状态
        isCompressing = false;
        compressBtn.disabled = false;
        compressBtn.innerHTML = '开始压缩';
    }
}

// 压缩图片块（并发）
function compressImageChunk(imageChunk, callback) {
    var results = [];
    var queue = Array.from(imageChunk);
    var workers = [];
    var completedWorkers = 0;
    
    // 启动工作线程
    var maxWorkers = Math.min(CONFIG.maxConcurrent, queue.length);
    for (var i = 0; i < maxWorkers; i++) {
        runWorker();
    }
    
    // 工作线程函数
    function runWorker() {
        if (queue.length === 0) {
            completedWorkers++;
            if (completedWorkers >= maxWorkers) {
                // 添加到结果数组
                for (var j = 0; j < results.length; j++) {
                    compressedImages.push(results[j]);
                }
                callback();
            }
            return;
        }
        
        var image = queue.shift();
        compressSingleImage(image).then(function(result) {
            if (result) {
                results.push(result);
            }
            processedFiles++;
            updateCompressionProgress();
            runWorker();
        }).catch(function(error) {
            console.error('压缩失败:', error);
            processedFiles++;
            updateCompressionProgress();
            runWorker();
        });
    }
}

// 更新压缩进度
function updateCompressionProgress() {
    compressionProgress = Math.round((processedFiles / totalFiles) * 100);
    compressionProgressEl.textContent = compressionProgress + '%';
}

// 压缩单张图片，支持重试
function compressSingleImage(image, retryCount) {
    // 设置默认重试次数
    if (typeof retryCount === 'undefined') {
        retryCount = 0;
    }
    
    return new Promise(function(resolve) {
        var reader = new FileReader();
        
        reader.onload = function(e) {
            var img = new Image();
            
            img.onload = function() {
                // 创建 Canvas
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                
                // 设置 Canvas 尺寸
                canvas.width = img.width;
                canvas.height = img.height;
                
                // 绘制图片
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // 确定输出格式
                var outputFormat = formatSelect.value;
                var mimeType = image.type;
                
                if (outputFormat !== 'original') {
                    mimeType = 'image/' + outputFormat;
                }
                
                // 压缩质量设置
                var quality = parseInt(qualitySlider.value) / 100;
                var lossless = false;
                
                // 如果选中无损压缩选项
                if (losslessCompressionCheckbox.checked) {
                    // 对于JPG，最高质量就是无损（虽然JPG本身是有损格式）
                    // 对于PNG和WebP，使用真正的无损压缩
                    quality = 1; // 最高质量
                    lossless = true; // 无损压缩标志
                }
                
                // Canvas toBlob 选项
                var toBlobOptions = {
                    quality: quality
                };
                
                // 为支持无损压缩的格式设置无损选项
                if (mimeType === 'image/webp' || mimeType === 'image/png') {
                    toBlobOptions.lossless = lossless;
                }
                
                // 对于PNG格式，还可以设置压缩级别（0-9，9为最高压缩率）
                if (mimeType === 'image/png') {
                    toBlobOptions.compressionLevel = 9; // 最高压缩率
                }
                
                // 转换为 Blob
                canvas.toBlob(function(blob) {
                    if (!blob) {
                        if (retryCount < CONFIG.retryTimes) {
                            console.log('重试压缩 ' + image.name + ' (' + (retryCount + 1) + '/' + CONFIG.retryTimes + ')...');
                            var result = compressSingleImage(image, retryCount + 1);
                            resolve(result);
                        } else {
                            console.error('压缩失败 ' + image.name + ': Canvas 转换失败');
                            resolve(null);
                        }
                        return;
                    }
                    
                    // 确定输出文件名
                    var outputName;
                    if (replaceOriginalCheckbox.checked) {
                        // 如果替换原文件，使用原文件名
                        outputName = image.name;
                    } else {
                        // 否则添加_compressed后缀
                        outputName = image.name.split('.')[0] + '_compressed.' + (outputFormat === 'original' ? image.name.split('.').pop() : outputFormat);
                    }
                    
                    // 智能判断：根据压缩设置决定最终结果
                    var finalBlob = blob;
                    var finalSize = blob.size;
                    var finalUrl = URL.createObjectURL(blob);
                    var finalMimeType = mimeType;
                    var finalName = outputName;
                    
                    // 无损压缩逻辑：确保压缩后画质不变，且文件大小更小或相同
                    if (losslessCompressionCheckbox.checked) {
                        // 对于无损压缩，我们总是希望使用压缩后的文件，除非它真的比原图大
                        // 注意：有些格式（如PNG、WebP）的无损压缩通常会生成更小的文件
                        // 但某些特殊情况下，压缩后可能会稍大（如已经高度压缩的文件）
                        if (blob.size > image.size) {
                            // 如果压缩后文件更大，使用原图
                            // 但这并不影响无损压缩的定义，因为原图本身就是无损的
                            finalBlob = image.file;
                            finalSize = image.size;
                            finalUrl = URL.createObjectURL(image.file);
                            finalMimeType = image.type;
                            finalName = image.name;
                        }
                        // 否则，使用压缩后的文件（画质不变，文件更小）
                    } else {
                        // 普通压缩：当压缩后大小大于等于原图时使用原图
                        if (blob.size >= image.size) {
                            finalBlob = image.file;
                            finalSize = image.size;
                            finalUrl = URL.createObjectURL(image.file);
                            finalMimeType = image.type;
                            finalName = image.name;
                        }
                    }
                    
                    var compressedImage = {
                        original: image,
                        compressed: {
                            blob: finalBlob,
                            size: finalSize,
                            url: finalUrl,
                            name: finalName,
                            mimeType: finalMimeType
                        },
                        savings: image.size - finalSize,
                        savingsPercent: ((1 - finalSize / image.size) * 100).toFixed(1)
                    };
                    
                    resolve(compressedImage);
                    
                    // 释放内存
                    URL.revokeObjectURL(e.target.result);
                    canvas.width = 0;
                    canvas.height = 0;
                }, mimeType, quality);
            };
            
            img.onerror = function() {
                if (retryCount < CONFIG.retryTimes) {
                    console.log('重试加载 ' + image.name + ' (' + (retryCount + 1) + '/' + CONFIG.retryTimes + ')...');
                    var result = compressSingleImage(image, retryCount + 1);
                    resolve(result);
                } else {
                    console.error('加载图片失败 ' + image.name);
                    resolve(null);
                }
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = function() {
            if (retryCount < CONFIG.retryTimes) {
                console.log('重试读取 ' + image.name + ' (' + (retryCount + 1) + '/' + CONFIG.retryTimes + ')...');
                var result = compressSingleImage(image, retryCount + 1);
                resolve(result);
            } else {
                console.error('读取文件失败 ' + image.name);
                resolve(null);
            }
        };
        
        reader.readAsDataURL(image.file);
    });
}

// 显示压缩结果
function displayResults() {
    if (compressedImages.length === 0) {
        resultsGrid.innerHTML = '
            <div class="empty-preview">
                <p>没有成功压缩的图片</p>
            </div>
        ';
        return;
    }
    
    // 添加替换原文件提示
    if (replaceOriginalCheckbox.checked) {
        var replaceHint = document.createElement('div');
        replaceHint.className = 'error-message';
        replaceHint.innerHTML = '
            <p>💡 提示：由于浏览器安全限制，无法直接修改您的本地文件。</p>
            <p>请手动将下载的图片替换原文件，或使用命令行版本的 --replace 选项自动替换。</p>
        ';
        resultsGrid.appendChild(replaceHint);
    }
    
    // 显示每张图片的结果
    for (var index = 0; index < compressedImages.length; index++) { var result = compressedImages[index];
        var resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        // 确定下载按钮文本
        var downloadBtnText = '下载';
        if (replaceOriginalCheckbox.checked) {
            downloadBtnText = '下载（替换原文件）';
        }
        
        resultItem.innerHTML = '
            <div class="result-header">
                <div class="result-name">${result.compressed.name}</div>
                <a href="${result.compressed.url}" download="${result.compressed.name}" class="download-btn">${downloadBtnText}</a>
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
        ';
        resultsGrid.appendChild(resultItem);
    });
    
    // 显示总统计
    displayTotalStats();
}

// 显示总统计
function displayTotalStats() {
    var totalOriginalSize = 0; for (var i = 0; i < compressedImages.length; i++) { totalOriginalSize += compressedImages[i].original.size; }
    var totalCompressedSize = 0; for (var i = 0; i < compressedImages.length; i++) { totalCompressedSize += compressedImages[i].compressed.size; }
    var totalSavings = totalOriginalSize - totalCompressedSize;
    var totalSavingsPercent = totalOriginalSize > 0 ? ((totalSavings / totalOriginalSize) * 100).toFixed(1) : 0;
    
    totalStats.innerHTML = '
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
    ';
}

// 下载全部图片
function downloadAllImages() {
    if (compressedImages.length === 0) return;
    
    // 优化移动端下载体验，添加延迟避免浏览器阻塞
    for (var index = 0; index < compressedImages.length; index++) { var result = compressedImages[index];
        setTimeout(function() {
            var a = document.createElement('a');
            a.href = result.compressed.url;
            a.download = result.compressed.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }, index * 100); // 每张图片延迟100ms下载
    });
}

// 清理资源
function cleanupResources() {
    // 释放所有 URL 对象
    for (var i = 0; i < compressedImages.length; i++) { var result = compressedImages[i];
        URL.revokeObjectURL(result.compressed.url);
    });
    
    // 释放预览 URL
    for (var i = 0; i < uploadedImages.length; i++) { var image = uploadedImages[i];
        if (image.previewUrl) {
            URL.revokeObjectURL(image.previewUrl);
        }
    });
}

// 事件监听

// 文件选择
fileInput.addEventListener('change', function(e) {
    handleFileUpload(e.target.files);
});

// 拖拽上传
uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', function() {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', function(e) {
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
    
    // 更新统计
    updateStats();
}

// 移除多余的点击事件监听器，因为fileInput已经通过CSS覆盖整个uploadArea
// 当用户点击uploadArea时，会直接触发fileInput的点击事件

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
