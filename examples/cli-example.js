// 命令行工具使用示例

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 示例：使用命令行工具压缩图片
function runCliExample() {
    try {
        // 创建测试目录
        const testDir = './cli-test';
        const inputDir = path.join(testDir, 'input');
        const outputDir = path.join(testDir, 'output');
        
        // 确保目录存在
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
            fs.mkdirSync(inputDir);
            fs.mkdirSync(outputDir);
        }
        
        console.log('📁 创建测试目录结构');
        console.log(`   测试根目录: ${testDir}`);
        console.log(`   输入目录: ${inputDir}`);
        console.log(`   输出目录: ${outputDir}`);
        console.log('');
        
        // 示例1：查看帮助信息
        console.log('📋 示例1：查看命令行帮助信息');
        console.log('-----------------------------------');
        const helpOutput = execSync('node src/cli.js --help', { encoding: 'utf-8' });
        console.log(helpOutput);
        
        // 示例2：查看版本信息
        console.log('📋 示例2：查看版本信息');
        console.log('-----------------------------------');
        const versionOutput = execSync('node src/cli.js --version', { encoding: 'utf-8' });
        console.log(versionOutput);
        
        // 示例3：使用默认参数
        console.log('📋 示例3：使用默认参数压缩图片');
        console.log('-----------------------------------');
        console.log('请先在 input 目录中添加一些图片，然后运行以下命令：');
        console.log('node src/cli.js');
        console.log('');
        
        // 示例4：自定义压缩质量
        console.log('📋 示例4：自定义压缩质量');
        console.log('-----------------------------------');
        console.log('命令：node src/cli.js -q 90');
        console.log('说明：将压缩质量设置为90，获得更高质量的压缩结果');
        console.log('');
        
        // 示例5：自定义输入输出目录
        console.log('📋 示例5：自定义输入输出目录');
        console.log('-----------------------------------');
        console.log('命令：node src/cli.js -i ./custom-input -o ./custom-output');
        console.log('说明：从custom-input目录读取图片，压缩后保存到custom-output目录');
        console.log('');
        
        // 示例6：不覆盖已存在的文件
        console.log('📋 示例6：不覆盖已存在的文件');
        console.log('-----------------------------------');
        console.log('命令：node src/cli.js -w false');
        console.log('说明：如果输出目录中已存在同名文件，则跳过该文件');
        console.log('');
        
        // 示例7：递归处理子目录
        console.log('📋 示例7：递归处理子目录');
        console.log('-----------------------------------');
        console.log('命令：node src/cli.js -r true');
        console.log('说明：递归处理输入目录下的所有子目录中的图片');
        console.log('');
        
        console.log('🎉 命令行工具示例展示完毕！');
        console.log('您可以根据上述示例，结合实际需求使用命令行工具。');
        
    } catch (error) {
        console.error('❌ 示例执行失败:', error.message);
    }
}

// 执行示例
runCliExample();