const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// 支持的图片格式
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// 确保目录存在
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`创建目录: ${dirPath}`);
  }
}

// 检查文件是否为支持的图片格式
function isSupportedImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return SUPPORTED_FORMATS.includes(ext);
}

// 获取文件大小（字节）
function getFileSize(filePath) {
  return fs.statSync(filePath).size;
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 压缩单张图片
async function compressImage(inputPath, outputPath, quality) {
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
        sharpInstance = sharpInstance.gif();
        break;
    }
    
    // 输出图片
    await sharpInstance.toFile(outputPath);
    
    return true;
  } catch (error) {
    console.error(`压缩失败 ${inputPath}:`, error.message);
    return false;
  }
}

// 压缩目录下所有图片
async function compressDirectory(inputDir, outputDir, quality, overwrite) {
  console.log('=== 图片压缩工具 ===');
  console.log(`输入目录: ${inputDir}`);
  console.log(`输出目录: ${outputDir}`);
  console.log(`压缩质量: ${quality}`);
  console.log('==================');
  
  // 确保目录存在
  ensureDir(inputDir);
  ensureDir(outputDir);
  
  // 读取输入目录
  const files = fs.readdirSync(inputDir);
  const imageFiles = files.filter(file => isSupportedImage(file));
  
  if (imageFiles.length === 0) {
    console.log('输入目录中没有支持的图片文件');
    return;
  }
  
  console.log(`找到 ${imageFiles.length} 张图片，开始压缩...`);
  console.log('==================');
  
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  let successCount = 0;
  let failCount = 0;
  
  // 遍历压缩图片
  for (const file of imageFiles) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);
    
    // 检查输出文件是否已存在
    if (fs.existsSync(outputPath) && !overwrite) {
      console.log(`跳过 ${file}: 输出文件已存在`);
      continue;
    }
    
    console.log(`压缩中: ${file}`);
    
    const originalSize = getFileSize(inputPath);
    const success = await compressImage(inputPath, outputPath, quality);
    
    if (success) {
      const compressedSize = getFileSize(outputPath);
      const savedSize = originalSize - compressedSize;
      const savedPercent = originalSize > 0 ? ((savedSize / originalSize) * 100).toFixed(1) : 0;
      
      console.log(`✓ 成功: ${file}`);
      console.log(`  原始大小: ${formatFileSize(originalSize)}`);
      console.log(`  压缩后: ${formatFileSize(compressedSize)}`);
      console.log(`  节省: ${formatFileSize(savedSize)} (${savedPercent}%)`);
      
      totalOriginalSize += originalSize;
      totalCompressedSize += compressedSize;
      successCount++;
    } else {
      console.log(`✗ 失败: ${file}`);
      failCount++;
    }
    
    console.log('------------------');
  }
  
  // 输出统计信息
  console.log('==================');
  console.log('压缩完成！');
  console.log(`成功: ${successCount} 张`);
  console.log(`失败: ${failCount} 张`);
  
  const totalSavedSize = totalOriginalSize - totalCompressedSize;
  const totalSavedPercent = totalOriginalSize > 0 ? ((totalSavedSize / totalOriginalSize) * 100).toFixed(1) : 0;
  
  console.log(`总原始大小: ${formatFileSize(totalOriginalSize)}`);
  console.log(`总压缩后: ${formatFileSize(totalCompressedSize)}`);
  console.log(`总节省: ${formatFileSize(totalSavedSize)} (${totalSavedPercent}%)`);
  console.log('==================');
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
  .help()
  .alias('help', 'h')
  .argv;

// 执行压缩
compressDirectory(argv.input, argv.output, argv.quality, argv.overwrite);
