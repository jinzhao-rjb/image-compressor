// 图片压缩工具的JavaScript代码

// 全局变量
var uploadedImages = []; // 存储已上传的图片
var selectedImages = []; // 存储选中的图片索引（使用数组替代Set，提升兼容性）
var compressedResults = []; // 存储压缩结果
var selectedCompressedImages = []; // 存储选中的压缩图片索引（使用数组替代Set，提升兼容性）
var compressBtn; // 压缩按钮全局变量

// 添加Array.from的polyfill
if (!Array.from) {
  Array.from = function (object) {
    return [].slice.call(object);
  };
}

// 添加Set的polyfill（如果需要）
if (typeof Set === 'undefined') {
  window.Set = function() {
    this.values = [];
  };
  Set.prototype.add = function(value) {
    if (!this.has(value)) {
      this.values.push(value);
    }
  };
  Set.prototype.has = function(value) {
    return this.values.indexOf(value) !== -1;
  };
  Set.prototype.delete = function(value) {
    var index = this.values.indexOf(value);
    if (index !== -1) {
      this.values.splice(index, 1);
    }
  };
  Set.prototype.values = function() {
    return this.values;
  };
}

// 添加Promise的polyfill
if (typeof Promise === 'undefined') {
  window.Promise = function(fn) {
    var callbacks = [];
    this.then = function(cb) {
      callbacks.push(cb);
      return this;
    };
    function resolve(value) {
      setTimeout(function() {
        callbacks.forEach(function(cb) {
          cb(value);
        });
      }, 0);
    }
    fn(resolve);
  };
}

// 添加forEach的polyfill
if (typeof Array.prototype.forEach === 'undefined') {
  Array.prototype.forEach = function(callback) {
    for (var i = 0; i < this.length; i++) {
      callback(this[i], i, this);
    }
  };
}

// 页面加载完成后初始化
 document.addEventListener('DOMContentLoaded', function() {
     // 初始化事件监听
     initEventListeners();
     // 初始化月份筛选
     initMonthFilter();
 });

// 初始化月份筛选
function initMonthFilter() {
    var monthFilter = document.getElementById('month-filter');
    if (monthFilter) {
        monthFilter.addEventListener('change', function() {
            renderAllPreviews();
        });
    }
}

// 初始化事件监听
function initEventListeners() {
    var uploadArea = document.getElementById('upload-area');
    var fileInput = document.getElementById('file-input');
    var qualitySlider = document.getElementById('quality');
    var qualityValue = document.getElementById('quality-value');
    compressBtn = document.getElementById('compress-btn');
    var uploadBtn = document.getElementById('upload-btn');

    // 拖拽上传事件
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
    }

    // 点击上传事件
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    if (uploadArea) {
        uploadArea.addEventListener('click', function() {
            if (fileInput) {
                fileInput.click();
            }
        });
    }

    // 顶部上传按钮事件
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            if (fileInput) {
                fileInput.click();
            }
        });
    }

    // 压缩质量调整事件
    if (qualitySlider && qualityValue) {
        qualitySlider.addEventListener('input', function() {
            var value = parseFloat(this.value);
            qualityValue.textContent = Math.round(value * 100) + '%';
        });
    }

    // 压缩按钮事件
    if (compressBtn) {
        compressBtn.addEventListener('click', compressImages);
    }

    // 压缩结果区域的事件监听
    var selectAllBtn = document.getElementById('selectAllBtn');
    var selectNoneBtn = document.getElementById('selectNoneBtn');
    var downloadAllBtnElem = document.getElementById('downloadAllBtn');
    
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', selectAllCompressedImages);
    }
    if (selectNoneBtn) {
        selectNoneBtn.addEventListener('click', deselectAllCompressedImages);
    }
    if (downloadAllBtnElem) {
        downloadAllBtnElem.addEventListener('click', downloadAllImages);
    }
}

// 拖拽事件处理
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    var uploadArea = document.getElementById('upload-area');
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
    
    var files = e.dataTransfer.files;
    processFiles(files);
}

// 文件选择事件处理
function handleFileSelect(e) {
    var files = e.target.files;
    processFiles(files);
    
    // 清空input值，允许重复上传同一文件
    e.target.value = '';
}

// 处理上传的文件
function processFiles(files) {
    for (var i = 0; i < files.length; i++) {
        (function() {
            var file = files[i];
            if (file.type.startsWith('image/')) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    // 获取文件的修改日期或当前日期作为月份依据
                    var fileDate = file.lastModifiedDate || new Date();
                    var month = fileDate.getMonth() + 1; // 月份从1开始
                    var year = fileDate.getFullYear();
                    
                    var imageData = {
                        file: file,
                        src: e.target.result,
                        name: file.name,
                        size: file.size,
                        month: month,
                        year: year
                    };
                    var index = uploadedImages.length;
                    uploadedImages.push(imageData);
                    // 默认选择新上传的图片
                    selectedImages.push(index);
                    renderImagePreview(imageData, index);
                    
                    // 更新月份筛选选项
                    updateMonthFilterOptions();
                };
                reader.readAsDataURL(file);
            }
        })();
    }
}

// 更新月份筛选选项
function updateMonthFilterOptions() {
    var monthFilter = document.getElementById('month-filter');
    if (!monthFilter) return;
    
    // 保存当前选中的值
    var currentValue = monthFilter.value;
    
    // 获取所有唯一的年月组合
    var uniqueMonths = [];
    uploadedImages.forEach(function(imageData) {
        var monthKey = imageData.year + '-' + imageData.month;
        if (uniqueMonths.indexOf(monthKey) === -1) {
            uniqueMonths.push(monthKey);
        }
    });
    
    // 只在月份组合变化时更新选项
    var currentOptions = [];
    for (var i = 1; i < monthFilter.options.length; i++) {
        currentOptions.push(monthFilter.options[i].value);
    }
    
    var newMonths = uniqueMonths.sort().reverse();
    var needUpdate = newMonths.length !== currentOptions.length;
    if (!needUpdate) {
        for (var m = 0; m < newMonths.length; m++) {
            if (currentOptions.indexOf(newMonths[m]) === -1) {
                needUpdate = true;
                break;
            }
        }
    }
    
    if (needUpdate) {
        // 清空现有选项，保留"全部月份"
        monthFilter.innerHTML = '<option value="all">全部月份</option>';
        
        // 批量添加唯一的年月选项
        for (var i = 0; i < newMonths.length; i++) {
        var monthStr = newMonths[i];
        var yearMonth = monthStr.split('-');
        var year = yearMonth[0];
        var month = yearMonth[1];
        var option = document.createElement('option');
        option.value = monthStr;
        option.textContent = year + '年' + month + '月';
        monthFilter.appendChild(option);
    }
        
        // 恢复之前的选中值或默认选中"全部月份"
        monthFilter.value = currentValue || 'all';
    }
}

// 渲染图片预览
function renderImagePreview(imageData, index) {
    var previewContainer = document.getElementById('preview-container');
    var imageItem = document.createElement('div');
    var selectedClass = selectedImages.indexOf(index) !== -1 ? 'selected' : '';
    imageItem.className = 'image-item bg-gray-100 rounded-lg p-2 ' + selectedClass;
    imageItem.dataset.index = index;
    
    // 添加月份显示
    var monthDisplay = '';
    if (imageData.month) {
        monthDisplay = '<div class="text-xs text-gray-400">' + imageData.year + '年' + imageData.month + '月</div>';
    }
    
    // 直接创建完整的HTML结构，避免复杂的DOM操作
    var checkboxChecked = selectedImages.indexOf(index) !== -1 ? 'checked' : '';
    imageItem.innerHTML = 
        '<div class="relative">' +
        '<img src="' + imageData.src + '" alt="' + imageData.name + '" class="image-preview w-full rounded">' +
        '<div class="absolute top-1 right-1 bg-white rounded-full p-1">' +
        '<input type="checkbox" class="image-checkbox" data-index="' + index + '" style="width: 20px; height: 20px; cursor: pointer;" ' + checkboxChecked + '>' +
        '</div>' +
        '</div>' +
        '<div class="mt-2 text-xs text-gray-600 truncate">' + imageData.name + '</div>' +
        monthDisplay +
        '<div class="text-xs text-gray-500">' + formatFileSize(imageData.size) + '</div>';
    
    // 添加点击事件
    imageItem.addEventListener('click', function() {
        toggleImageSelection(index);
    });
    
    // 添加复选框事件
    var checkbox = imageItem.querySelector('.image-checkbox');
    checkbox.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleImageSelection(index);
    });
    
    previewContainer.appendChild(imageItem);
}

// 切换图片选择状态
function toggleImageSelection(index) {
    var imageItem = document.querySelector('[data-index="' + index + '"]');
    var checkbox = imageItem.querySelector('.image-checkbox');
    
    var indexInArray = selectedImages.indexOf(index);
    if (indexInArray !== -1) {
        selectedImages.splice(indexInArray, 1);
        imageItem.classList.remove('selected');
        checkbox.checked = false;
    } else {
        selectedImages.push(index);
        imageItem.classList.add('selected');
        checkbox.checked = true;
    }
}

// 全选图片
function selectAllImages() {
    selectedImages = [];
    var imageItems = document.querySelectorAll('.image-item');
    for (var i = 0; i < imageItems.length; i++) {
        var item = imageItems[i];
        selectedImages.push(i);
        item.classList.add('selected');
        var checkbox = item.querySelector('.image-checkbox');
        checkbox.checked = true;
    }
}

// 取消全选图片
function deselectAllImages() {
    selectedImages = [];
    var imageItems = document.querySelectorAll('.image-item');
    for (var i = 0; i < imageItems.length; i++) {
        var item = imageItems[i];
        item.classList.remove('selected');
        var checkbox = item.querySelector('.image-checkbox');
        checkbox.checked = false;
    }
}

// 删除选中的图片
function deleteSelectedImages() {
    if (selectedImages.length === 0) {
        alert('请先选择要删除的图片');
        return;
    }
    
    // 按索引降序删除，避免索引混乱
    var sortedIndices = selectedImages.slice().sort(function(a, b) {
        return b - a;
    });
    for (var i = 0; i < sortedIndices.length; i++) {
        var index = sortedIndices[i];
        uploadedImages.splice(index, 1);
    }
    
    // 清空选择
    selectedImages = [];
    
    // 重新渲染预览
    renderAllPreviews();
}

// 重新渲染所有预览
function renderAllPreviews() {
    var previewContainer = document.getElementById('preview-container');
    previewContainer.innerHTML = '';
    
    // 获取当前选中的月份筛选
    var monthFilter = document.getElementById('month-filter');
    var selectedMonth = monthFilter ? monthFilter.value : 'all';
    
    for (var index = 0; index < uploadedImages.length; index++) {
        var imageData = uploadedImages[index];
        // 检查图片是否符合当前月份筛选条件
        if (selectedMonth === 'all' || (imageData.year + '-' + imageData.month) === selectedMonth) {
            renderImagePreview(imageData, index);
        }
    }
}

// 压缩图片
function compressImages() {
    if (uploadedImages.length === 0) {
        alert('请先上传图片');
        return;
    }
    
    // 获取压缩设置
    var quality = parseFloat(document.getElementById('quality').value);
    var format = document.getElementById('format').value;
    
    // 显示加载状态
    compressBtn.innerHTML = '<span class="loading">压缩中...</span>';
    compressBtn.disabled = true;
    
    // 压缩所有图片 - 使用传统的回调方式替代Promise.all
    var results = [];
    var totalImages = uploadedImages.length;
    var processedImages = 0;
    
    function handleImageCompressed(result) {
        results.push(result);
        processedImages++;
        
        if (processedImages === totalImages) {
            // 所有图片压缩完成，渲染结果
            renderCompressionResults(results);
            
            // 恢复按钮状态
            compressBtn.innerHTML = '开始压缩';
            compressBtn.disabled = false;
        }
    }
    
    // 逐个压缩图片
    for (var i = 0; i < uploadedImages.length; i++) {
        compressImage(uploadedImages[i], quality, format, i).then(function(result) {
            handleImageCompressed(result);
        });
    }
}

// 压缩单张图片
function compressImage(imageData, quality, format, index) {
    return new Promise(function(resolve) {
        var img = new Image();
        img.onload = function() {
            // 创建Canvas
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            
            // 设置Canvas尺寸与原图相同
            canvas.width = img.width;
            canvas.height = img.height;
            
            // 绘制图片
            ctx.drawImage(img, 0, 0, img.width, img.height);
            
            // 确定输出格式
            var outputFormat = format;
            if (format === 'same') {
                outputFormat = imageData.file.type.split('/')[1];
            }
            
            // 转换为Blob
            canvas.toBlob(function(blob) {
                var finalBlob = blob;
                var finalSize = blob.size;
                
                // 比较压缩前后大小，如果压缩后更大，则使用原文件
                if (finalSize >= imageData.file.size) {
                    finalBlob = imageData.file;
                    finalSize = imageData.file.size;
                    // 保持原格式
                    outputFormat = imageData.file.type.split('/')[1];
                }
                
                var compressedData = {
                    original: {
                        ...imageData,
                        size: imageData.file.size // 确保original对象有正确的size属性
                    },
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
            }, 'image/' + outputFormat, quality);
        };
        img.src = imageData.src;
    });
}

// 渲染压缩结果
function renderCompressionResults(results) {
    var resultContainer = document.getElementById('result-container');
    var resultSection = document.getElementById('result-section');
    
    // 存储压缩结果
    compressedResults = results;
    // 重置选中的压缩图片
    selectedCompressedImages = [];
    
    // 清空结果容器
    resultContainer.innerHTML = '';
    
    // 渲染每个结果
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        var index = i;
        var resultItem = document.createElement('div');
        resultItem.className = 'border border-gray-200 rounded-lg p-4 mb-4';
        
        // 计算压缩率
        var originalSize = result.original.size;
        var compressedSize = result.compressed.size;
        var compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        
        // 创建压缩图片的URL
        var compressedUrl = URL.createObjectURL(result.compressed.blob);
        
        // 生成文件名
        var originalName = result.original.name;
        var nameParts = originalName.split('.');
        var baseName = nameParts[0];
        for (var j = 1; j < nameParts.length - 1; j++) {
            baseName += '.' + nameParts[j];
        }
        var compressedName = baseName + '_compressed.' + result.compressed.format;
        
        // 使用字符串拼接构建HTML
        var html = '<div class="flex items-start mb-3">';
        html += '<input type="checkbox" class="compressed-image-checkbox" id="compressed-checkbox-' + index + '" onchange="toggleCompressedImageSelection(' + index + ')">';
        html += '<label for="compressed-checkbox-' + index + '" class="ml-2 text-sm text-gray-600">选择</label>';
        html += '</div>';
        html += '<div class="flex flex-col md:flex-row gap-4">';
        html += '<div class="flex-1">';
        html += '<h4 class="font-medium mb-2">原图</h4>';
        html += '<img src="' + result.original.src + '" alt="原图" class="image-preview w-full rounded mb-2">';
        html += '<div class="text-sm text-gray-600">';
        html += '<div>文件名: ' + result.original.name + '</div>';
        html += '<div>尺寸: ' + result.compressed.width + ' × ' + result.compressed.height + '</div>';
        html += '<div>大小: ' + formatFileSize(originalSize) + '</div>';
        html += '</div>';
        html += '</div>';
        html += '<div class="flex-1">';
        html += '<h4 class="font-medium mb-2">压缩后</h4>';
        html += '<img src="' + compressedUrl + '" alt="压缩后" class="image-preview w-full rounded mb-2">';
        html += '<div class="text-sm text-gray-600">';
        html += '<div>格式: ' + result.compressed.format.toUpperCase() + '</div>';
        html += '<div>尺寸: ' + result.compressed.width + ' × ' + result.compressed.height + '</div>';
        html += '<div>大小: ' + formatFileSize(compressedSize) + '</div>';
        html += '<div class="text-green-600">压缩率: ' + compressionRatio + '%</div>';
        html += '</div>';
        html += '<div class="mt-3">';
        html += '<button class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors" onclick="downloadImage(this, \'' + compressedUrl + '\', \'' + compressedName + '\')">下载</button>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        
        resultItem.innerHTML = html;
        resultContainer.appendChild(resultItem);
    }
    
    // 显示结果区域
    resultSection.classList.remove('hidden');
    
    // 滚动到结果区域
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// 下载图片
function downloadImage(button, url, filename) {
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 下载全部图片
// 切换压缩图片选择状态
function toggleCompressedImageSelection(index) {
    var indexInArray = selectedCompressedImages.indexOf(index);
    if (indexInArray !== -1) {
        selectedCompressedImages.splice(indexInArray, 1);
    } else {
        selectedCompressedImages.push(index);
    }
}

// 选择所有压缩图片
function selectAllCompressedImages() {
    selectedCompressedImages = [];
    for (var i = 0; i < compressedResults.length; i++) {
        selectedCompressedImages.push(i);
        var checkbox = document.getElementById('compressed-checkbox-' + i);
        if (checkbox) {
            checkbox.checked = true;
        }
    }
}

// 取消选择所有压缩图片
function deselectAllCompressedImages() {
    selectedCompressedImages = [];
    for (var i = 0; i < compressedResults.length; i++) {
        var checkbox = document.getElementById('compressed-checkbox-' + i);
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
    var imagesToDownload;
    if (selectedCompressedImages.length === 0) {
        // 默认下载全部
        imagesToDownload = [];
        for (var i = 0; i < compressedResults.length; i++) {
            imagesToDownload.push(i);
        }
    } else {
        // 下载选中的图片
        imagesToDownload = selectedCompressedImages.slice();
    }
    
    var count = imagesToDownload.length;
    
    // 直接使用优化的逐个下载方式，确保移动端能一次性下载多张图片
    individualDownloadImages(imagesToDownload);
}

// 打包成zip文件下载
function zipDownloadImages(imagesToDownload) {
    var count = imagesToDownload.length;
    alert('正在打包 ' + count + ' 张图片，请稍候...');
    
    // 创建JSZip实例
    var zip = new JSZip();
    var imageFolder = zip.folder("compressed_images");
    
    // 存储所有的Promise
    var promises = [];
    
    for (var i = 0; i < imagesToDownload.length; i++) {
        var index = imagesToDownload[i];
        var result = compressedResults[index];
        if (result) {
            var promise = new Promise(function(resolve) {
                var compressedData = result.compressed;
                var originalFile = result.original.file;
                var originalName = originalFile.name;
                var filename = originalName.split('.')[0] + '_compressed.' + compressedData.format;
                
                // 将Blob转换为ArrayBuffer，JSZip需要ArrayBuffer
                var reader = new FileReader();
                reader.onload = function(e) {
                    // 将图片添加到zip文件夹
                    imageFolder.file(filename, e.target.result);
                    resolve();
                };
                reader.readAsArrayBuffer(compressedData.blob);
            });
            
            promises.push(promise);
        }
    }
    
    // 等待所有图片处理完成
    Promise.all(promises)
        .then(() => {
            // 生成zip文件
            return zip.generateAsync({ type: "blob" });
        })
        .then((zipBlob) => {
            // 创建下载链接
            var a = document.createElement('a');
            var blobUrl = URL.createObjectURL(zipBlob);
            a.href = blobUrl;
            a.download = 'compressed_images_' + new Date().getTime() + '.zip';
            document.body.appendChild(a);
            
            // 触发下载
            a.click();
            
            // 清理资源
            document.body.removeChild(a);
            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 100);
            
            alert('已生成zip文件，开始下载 ' + count + ' 张图片');
        })
        .catch((error) => {
            console.error('生成zip文件失败:', error);
            alert('生成zip文件失败，请重试或选择逐个下载');
        });
}

// 逐个下载图片 - 优化移动端体验
function individualDownloadImages(imagesToDownload) {
    const count = imagesToDownload.length;
    
    // 移动端优化：简洁的确认提示
    if (!confirm('即将下载 ' + count + ' 张图片，是否继续？')) {
        return;
    }
    
    var downloadCount = 0;
    
    // 预创建所有下载链接，提高下载效率
    var downloadLinks = [];
    
    // 优化1：提前创建所有下载链接
    for (var i = 0; i < imagesToDownload.length; i++) {
        var index = imagesToDownload[i];
        var result = compressedResults[index];
        if (result) {
            try {
                var compressedData = result.compressed;
                var originalFile = result.original.file;
                var originalName = originalFile.name;
                var filename = originalName.split('.')[0] + '_compressed.' + compressedData.format;
                
                var a = document.createElement('a');
                var blobUrl = URL.createObjectURL(compressedData.blob);
                a.href = blobUrl;
                a.download = filename;
                a.style.display = 'none';
                
                // 存储下载链接和URL对象，以便后续清理
                downloadLinks.push({ a, blobUrl });
            } catch (error) {
                console.error('创建下载链接失败:', error);
            }
        }
    }
    
    // 优化2：使用更短的延迟，提高下载速度
    var DOWNLOAD_DELAY = 50; // 50ms延迟，比原来的100ms更快
    
    // 创建下载函数
    var downloadNext = function(idx) {
        if (idx >= downloadLinks.length) {
            // 所有图片下载完成后清理资源
            setTimeout(() => {
                for (var i = 0; i < downloadLinks.length; i++) {
                    var link = downloadLinks[i];
                    URL.revokeObjectURL(link.blobUrl);
                }
            }, 100);
            
            alert('已开始下载 ' + downloadLinks.length + ' 张图片');
            return;
        }
        
        var linkData = downloadLinks[idx];
        if (linkData) {
            try {
                var a = linkData.a;
                document.body.appendChild(a);
                
                // 触发下载
                a.click();
                
                // 立即移除元素
                document.body.removeChild(a);
                
                downloadCount++;
                
                // 继续下载下一张，使用更短的延迟
                setTimeout(() => {
                    downloadNext(idx + 1);
                }, DOWNLOAD_DELAY);
            } catch (error) {
                console.error('下载图片失败:', error);
                // 继续下载下一张
                setTimeout(() => {
                    downloadNext(idx + 1);
                }, DOWNLOAD_DELAY);
            }
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


// �޸�GitHub Pages�������� - 2025-12-02 15:39:24

