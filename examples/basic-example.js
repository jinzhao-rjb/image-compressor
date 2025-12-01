// 基础使用示例

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 图片压缩函数
async function compressImage(inputPath, outputPath, quality = 85) {
    try {
        // 获取原始文件大小
        const stats = fs.statSync(inputPath);
        const originalSize = stats.size;
        
        // 获取图片格式
        const metadata = await sharp(inputPath).metadata();
        const format = metadata.format;
        
        // 根据格式设置压缩选项
        let options = {
            quality: quality
        };
        
        // 针对不同格式进行优化
        if (format === 'jpeg' || format === 'jpg') {
            options = {
                ...options,
                mozjpeg: true,
                progressive: true
            };
        } else if (format === 'png') {
            options = {
                ...options,
                compressionLevel: 9,
                adaptiveFiltering: true
            };
        }
        
        // 执行压缩
        await sharp(inputPath)
            .toFormat(format)
            .toFile(outputPath, options);
        
        // 获取压缩后文件大小
        const compressedStats = fs.statSync(outputPath);
        const compressedSize = compressedStats.size;
        
        // 计算压缩率
        const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
        
        console.log(`✅ 压缩成功: ${path.basename(inputPath)}`);
        console.log(`   原始大小: ${(originalSize / 1024).toFixed(2)} KB`);
        console.log(`   压缩后大小: ${(compressedSize / 1024).toFixed(2)} KB`);
        console.log(`   压缩率: ${compressionRatio}%`);
        
        return {
            originalSize,
            compressedSize,
            compressionRatio
        };
    } catch (error) {
        console.error(`❌ 压缩失败: ${path.basename(inputPath)}`);
        console.error(`   错误信息: ${error.message}`);
        return null;
    }
}

// 使用示例
async function main() {
    // 创建输入输出目录
    const inputDir = './example-input';
    const outputDir = './example-output';
    
    if (!fs.existsSync(inputDir)) {
        fs.mkdirSync(inputDir);
        console.log(`📁 创建输入目录: ${inputDir}`);
    }
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
        console.log(`📁 创建输出目录: ${outputDir}`);
    }
    
    // 检查是否有示例图片
    const inputFiles = fs.readdirSync(inputDir);
    if (inputFiles.length === 0) {
        console.log(`⚠️  输入目录 ${inputDir} 中没有图片，请先添加一些图片`);
        return;
    }
    
    console.log('🚀 开始压缩图片...');
    
    // 压缩所有图片
    for (const file of inputFiles) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file);
        
        await compressImage(inputPath, outputPath);
        console.log('');
    }
    
    console.log('🎉 所有图片压缩完成！');
}

// 执行示例
main().catch(error => {
    console.error('❌ 示例执行失败:', error);
});