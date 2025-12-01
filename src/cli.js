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
  }
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
async function compressImage(filePath, outputPath, quality = 85, overwrite = false) {
  try {
    // 读取图片
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    // 压缩图片
    const compressedImage = image[metadata.format]({
      quality: quality,
      progressive: true
    });
    
    // 确定输出路径
    const finalOutputPath = overwrite ? filePath : outputPath;
    
    // 保存压缩后的图片
    await compressedImage.toFile(finalOutputPath);
    
    return {
      success: true,
      originalPath: filePath,
      compressedPath: finalOutputPath,
      originalSize: metadata.size,
      compressedSize: (await fs.stat(finalOutputPath)).size,
      format: metadata.format
    };
  } catch (error) {
    console.error(`压缩失败 ${filePath}:`, error.message);
    return {
      success: false,
      originalPath: filePath,
      error: error.message
    };
  }
}

// 压缩目录下的所有图片
async function compressDirectory(inputDir, outputDir = null, quality = 85, overwrite = false) {
  console.log(`开始压缩目录: ${inputDir}`);
  console.log(`输出目录: ${overwrite ? '覆盖原文件' : (outputDir || '默认输出目录')}`);
  
  // 如果没有指定输出目录且不覆盖，则使用默认输出目录
  if (!outputDir && !overwrite) {
    outputDir = path.join(inputDir, 'compressed');
    await ensureDir(outputDir);
    console.log(`创建输出目录: ${outputDir}`);
  }
  
  // 读取目录下的所有文件
  const files = await fs.readdir(inputDir);
  const imageFiles = files.filter(file => 
    SUPPORTED_FORMATS.includes(path.extname(file).toLowerCase())
  );
  
  console.log(`找到 ${imageFiles.length} 张图片`);
  
  if (imageFiles.length === 0) {
    console.log('没有找到支持的图片文件');
    return;
  }
  
  // 压缩所有图片
  let successCount = 0;
  let failCount = 0;
  
  for (const file of imageFiles) {
    const filePath = path.join(inputDir, file);
    const outputPath = outputDir ? path.join(outputDir, file) : filePath;
    
    const result = await compressImage(filePath, outputPath, quality, overwrite);
    
    if (result.success) {
      successCount++;
      const savedSize = result.originalSize - result.compressedSize;
      console.log(`✓ ${file}: 压缩成功 (${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)}, 节省 ${formatFileSize(savedSize)})`);
    } else {
      failCount++;
      console.log(`✗ ${file}: 压缩失败 - ${result.error}`);
    }
  }
  
  console.log(`\n压缩完成: 成功 ${successCount} 张, 失败 ${failCount} 张`);
}

// 主函数
async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('input', {
      alias: 'i',
      type: 'string',
      description: '输入目录或文件路径',
      demandOption: true
    })
    .option('output', {
      alias: 'o',
      type: 'string',
      description: '输出目录路径 (默认: 压缩后文件保存到原目录的compressed子目录)'
    })
    .option('quality', {
      alias: 'q',
      type: 'number',
      description: '压缩质量 (1-100, 默认85)',
      default: 85
    })
    .option('overwrite', {
      alias: 'w',
      type: 'boolean',
      description: '是否用压缩后的图片替代原文件',
      default: false
    })
    .option('concurrent', {
      alias: 'c',
      type: 'number',
      description: '最大并发数',
      default: CONFIG.maxConcurrent
    })
    .help()
    .alias('help', 'h')
    .argv;

  // 更新配置
  CONFIG.maxConcurrent = argv.concurrent;
  
  const inputPath = argv.input;
  const stats = await fs.stat(inputPath);
  
  if (stats.isDirectory()) {
    // 压缩目录下所有图片
    await compressDirectory(inputPath, argv.output, argv.quality, argv.overwrite);
  } else if (stats.isFile()) {
    // 压缩单个文件
    const outputPath = argv.output || (argv.overwrite ? inputPath : path.join(path.dirname(inputPath), 'compressed', path.basename(inputPath)));
    if (!argv.overwrite) {
      await ensureDir(path.dirname(outputPath));
    }
    const result = await compressImage(inputPath, outputPath, argv.quality, argv.overwrite);
    if (result.success) {
      const savedSize = result.originalSize - result.compressedSize;
      console.log(`✓ 压缩成功: ${path.basename(inputPath)}`);
      console.log(`  原始大小: ${formatFileSize(result.originalSize)}`);
      console.log(`  压缩后: ${formatFileSize(result.compressedSize)}`);
      console.log(`  节省: ${formatFileSize(savedSize)}`);
      console.log(`  输出路径: ${result.compressedPath}`);
    } else {
      console.log(`✗ 压缩失败: ${path.basename(inputPath)} - ${result.error}`);
    }
  } else {
    console.error('输入路径不是有效的文件或目录');
    process.exit(1);
  }
}

// 执行主函数
main().catch(error => {
  console.error('程序错误:', error);
  process.exit(1);
});
