const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// 支持的图片格式
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// 配置
const CONFIG = {
  maxConcurrent: 5, // 最大并发数，可根据系统性能调整
  retryTimes: 2,     // 失败重试次数
  chunkSize: 100     // 每次处理的文件块大小
};

// 确保目录存在
async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`创建目录: ${dirPath}`);
  }
}

// 检查文件是否为支持的图片格式
function isSupportedImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return SUPPORTED_FORMATS.includes(ext);
}

// 获取文件大小（字节）
async function getFileSize(filePath) {
  const stats = await fs.stat(filePath);
  return stats.size;
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 压缩单张图片，支持重试
async function compressImage(inputPath, outputPath, quality, retryCount = 0) {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    
    let sharpInstance = sharp(inputPath);
    
    // 根据图片格式设置压缩选项
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        sharpInstance = sharpInstance.jpeg({
          quality: quality,
          mozjpeg: true,
          progressive: true
        });
        break;
      case '.png':
        sharpInstance = sharpInstance.png({
          quality: quality,
          compressionLevel: 9,
          adaptiveFiltering: true
        });
        break;
      case '.webp':
        sharpInstance = sharpInstance.webp({
          quality: quality,
          lossless: false
        });
        break;
      case '.gif':
        // GIF压缩保持原有质量
        sharpInstance = sharpInstance.gif();
        break;
    }
    
    // 输出图片
    await sharpInstance.toFile(outputPath);
    
    return true;
  } catch (error) {
    if (retryCount < CONFIG.retryTimes) {
      console.log(`重试压缩 ${inputPath} (${retryCount + 1}/${CONFIG.retryTimes})...`);
      return compressImage(inputPath, outputPath, quality, retryCount + 1);
    }
    console.error(`压缩失败 ${inputPath}:`, error.message);
    return false;
  }
}

// 并发压缩图片
async function compressImagesInParallel(imageFiles, inputDir, outputDir, quality, overwrite) {
  let successCount = 0;
  let failCount = 0;
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  let processedCount = 0;
  
  // 创建并发控制函数
  async function processImage(file) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);
    
    try {
      // 检查输出文件是否已存在
      let outputExists = false;
      try {
        await fs.access(outputPath);
        outputExists = true;
      } catch {
        outputExists = false;
      }
      
      if (outputExists && !overwrite) {
        console.log(`跳过 ${file}: 输出文件已存在`);
        processedCount++;
        return;
      }
      
      // 获取原始文件大小
      const originalSize = await getFileSize(inputPath);
      totalOriginalSize += originalSize;
      
      // 压缩图片
      const success = await compressImage(inputPath, outputPath, quality);
      
      if (success) {
        // 获取压缩后文件大小
        const compressedSize = await getFileSize(outputPath);
        totalCompressedSize += compressedSize;
        const savedSize = originalSize - compressedSize;
        const savedPercent = originalSize > 0 ? ((savedSize / originalSize) * 100).toFixed(1) : 0;
        
        console.log(`✓ 成功: ${file}`);
        console.log(`  原始大小: ${formatFileSize(originalSize)}`);
        console.log(`  压缩后: ${formatFileSize(compressedSize)}`);
        console.log(`  节省: ${formatFileSize(savedSize)} (${savedPercent}%)`);
        successCount++;
      } else {
        console.log(`✗ 失败: ${file}`);
        failCount++;
      }
    } catch (error) {
      console.error(`处理失败 ${file}:`, error.message);
      failCount++;
    } finally {
      processedCount++;
      // 显示进度
      console.log(`进度: ${processedCount}/${imageFiles.length} (${((processedCount / imageFiles.length) * 100).toFixed(1)}%)`);
      console.log('------------------');
    }
  }
  
  // 实现并发控制
  const queue = [...imageFiles];
  const workers = [];
  
  // 启动工作线程
  for (let i = 0; i < Math.min(CONFIG.maxConcurrent, queue.length); i++) {
    workers.push(runWorker());
  }
  
  // 工作线程函数
  async function runWorker() {
    while (queue.length > 0) {
      const file = queue.shift();
      await processImage(file);
    }
  }
  
  // 等待所有工作线程完成
  await Promise.all(workers);
  
  return {
    successCount,
    failCount,
    totalOriginalSize,
    totalCompressedSize
  };
}

// 压缩目录下所有图片
async function compressDirectory(inputDir, outputDir, quality, overwrite) {
  console.log('=== 图片压缩工具 ===');
  console.log(`输入目录: ${inputDir}`);
  console.log(`输出目录: ${outputDir}`);
  console.log(`压缩质量: ${quality}`);
  console.log(`最大并发: ${CONFIG.maxConcurrent}`);
  console.log(`失败重试: ${CONFIG.retryTimes}次`);
  console.log('==================');
  
  try {
    // 确保目录存在
    await ensureDir(inputDir);
    await ensureDir(outputDir);
    
    // 异步读取输入目录
    const files = await fs.readdir(inputDir);
    const imageFiles = files.filter(file => isSupportedImage(file));
    
    if (imageFiles.length === 0) {
      console.log('输入目录中没有支持的图片文件');
      return;
    }
    
    console.log(`找到 ${imageFiles.length} 张图片，开始压缩...`);
    console.log('==================');
    
    // 记录开始时间
    const startTime = Date.now();
    
    // 并发压缩图片
    const result = await compressImagesInParallel(imageFiles, inputDir, outputDir, quality, overwrite);
    
    // 计算耗时
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    // 输出统计信息
    console.log('==================');
    console.log('压缩完成！');
    console.log(`总耗时: ${duration.toFixed(2)} 秒`);
    console.log(`成功: ${result.successCount} 张`);
    console.log(`失败: ${result.failCount} 张`);
    
    const totalSavedSize = result.totalOriginalSize - result.totalCompressedSize;
    const totalSavedPercent = result.totalOriginalSize > 0 ? ((totalSavedSize / result.totalOriginalSize) * 100).toFixed(1) : 0;
    
    console.log(`总原始大小: ${formatFileSize(result.totalOriginalSize)}`);
    console.log(`总压缩后: ${formatFileSize(result.totalCompressedSize)}`);
    console.log(`总节省: ${formatFileSize(totalSavedSize)} (${totalSavedPercent}%)`);
    console.log(`平均速度: ${(result.successCount / duration).toFixed(2)} 张/秒`);
    console.log('==================');
  } catch (error) {
    console.error('压缩过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 解析命令行参数
const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    description: '输入目录',
    type: 'string',
    default: './input'
  })
  .option('output', {
    alias: 'o',
    description: '输出目录',
    type: 'string',
    default: './output'
  })
  .option('quality', {
    alias: 'q',
    description: '压缩质量 (1-100)',
    type: 'number',
    default: 85
  })
  .option('overwrite', {
    alias: 'w',
    description: '是否覆盖已存在的文件',
    type: 'boolean',
    default: true
  })
  .option('concurrent', {
    alias: 'c',
    description: '最大并发数',
    type: 'number',
    default: CONFIG.maxConcurrent
  })
  .help()
  .alias('help', 'h')
  .argv;

// 更新配置
if (argv.concurrent > 0) {
  CONFIG.maxConcurrent = argv.concurrent;
}

// 执行压缩
compressDirectory(argv.input, argv.output, argv.quality, argv.overwrite);
