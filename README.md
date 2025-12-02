# 📸 图片压缩工具 - 免费、高效的在线图片压缩解决方案

[![GitHub Stars](https://img.shields.io/github/stars/jinzhao-rjb/image-compressor.svg?style=social&label=Star&maxAge=2592000)](https://github.com/jinzhao-rjb/image-compressor/stargazers)
[![GitHub License](https://img.shields.io/github/license/jinzhao-rjb/image-compressor.svg)](https://github.com/jinzhao-rjb/image-compressor/blob/master/LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/jinzhao-rjb/image-compressor.svg)](https://github.com/jinzhao-rjb/image-compressor/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/jinzhao-rjb/image-compressor.svg)](https://github.com/jinzhao-rjb/image-compressor/pulls)

## 🌟 核心亮点

### 📱 移动端友好的批量处理
- 支持移动端相册批量选择功能
- 响应式设计，适配各种屏幕尺寸
- 触摸友好的界面，操作流畅

### 🎨 灵活设置与实时预览
- 可调节压缩质量（10%-100%）
- 支持多种输出格式（JPEG、PNG、WebP）
- 实时显示压缩前后对比效果

### 🔒 本地处理，保护隐私
- 所有压缩操作均在浏览器本地完成
- 不会将图片上传到任何服务器
- 数据安全可控，保护您的隐私

## 🚀 快速开始

### 在线使用
直接访问在线预览链接：

[🌐 https://jinzhao-rjb.github.io/image-compressor/](https://jinzhao-rjb.github.io/image-compressor/)

### 前端本地运行

#### 环境要求
- 现代浏览器（Chrome 60+、Firefox 55+、Safari 12+、Edge 79+）
- 无需安装任何依赖

#### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/jinzhao-rjb/image-compressor.git
   cd image-compressor
   ```

2. **启动本地服务器**
   ```bash
   # 使用Python 3
   python -m http.server 8000
   
   # 或使用Node.js
   npx serve
   ```

3. **访问应用**
   打开浏览器访问：`http://localhost:8000`

### CLI命令行使用

#### 环境要求
- Node.js 16+ 
- npm 或 yarn 包管理器

#### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/jinzhao-rjb/image-compressor.git
   cd image-compressor
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **使用CLI压缩图片**
   ```bash
   # 基本用法
   npm run compress -- --input ./input --output ./output
   
   # 自定义压缩质量
   npm run compress -- --input ./input --output ./output --quality 80
   
   # 批量处理特定格式
   npm run compress -- --input ./input --output ./output --format jpeg
   ```

#### CLI参数说明

| 参数 | 描述 | 默认值 |
|------|------|--------|
| `--input, -i` | 输入目录路径 | 必填 |
| `--output, -o` | 输出目录路径 | 必填 |
| `--quality, -q` | 压缩质量 (10-100) | 80 |
| `--format, -f` | 输出格式 (jpeg/png/webp) | 保留原格式 |
| `--width, -w` | 输出宽度 | 保留原宽度 |
| `--height, -h` | 输出高度 | 保留原高度 |

### 前端使用示例

1. **上传图片**
   - 点击上传区域或拖拽图片到上传区域
   - 在移动端可直接从相册选择多张图片

2. **调整压缩设置**
   - 拖动滑块调整压缩质量
   - 选择所需的输出格式

3. **开始压缩**
   - 点击"开始压缩"按钮
   - 等待压缩完成（实时显示进度）

4. **下载图片**
   - 点击单张图片的"下载"按钮获取单个文件
   - 点击"下载全部"按钮批量下载所有压缩后的图片

## ✨ 功能清单

| 功能 | 描述 |
|------|------|
| **批量上传** | 支持拖拽和选择多种方式上传多张图片 |
| **压缩质量调节** | 10%-100% 可调节压缩质量 |
| **多种输出格式** | 支持 JPEG、PNG、WebP 格式输出 |
| **实时预览** | 压缩前后效果对比，一目了然 |
| **批量下载** | 支持单个和批量下载压缩后的图片 |
| **移动端优化** | 支持移动端相册勾选上传 |
| **隐私保护** | 本地压缩，不上传任何数据 |
| **响应式设计** | 适配各种设备屏幕尺寸 |

## 🛠️ 技术栈

### 前端技术

| 技术 | 用途 |
|------|------|
| **HTML5** | 页面结构设计 |
| **CSS3** | 响应式样式设计 |
| **JavaScript (ES6+)** | 核心功能实现 |
| **Canvas API** | 图片压缩处理 |
| **Tailwind CSS** | 快速样式开发 |
| **Vue 3** | 组件化开发（部分功能） |
| **Element Plus** | UI组件库 |
| **JSZip** | 批量下载打包 |

### 后端/CLI技术

| 技术 | 用途 |
|------|------|
| **Node.js** | 运行环境 |
| **Sharp** | 高效图片处理库 |
| **Yargs** | 命令行参数解析 |
| **Node.js Streams** | 高效文件处理 |

## 📸 截图展示

### 桌面端界面

![桌面端主界面](https://via.placeholder.com/800x450?text=桌面端主界面)

### 移动端界面

![移动端主界面](https://via.placeholder.com/375x667?text=移动端主界面)

### 压缩效果对比

![压缩效果对比](https://via.placeholder.com/800x200?text=压缩效果对比)

### 批量下载功能

![批量下载功能](https://via.placeholder.com/800x450?text=批量下载功能)

## 🎥 动效展示

### 拖拽上传演示

![拖拽上传演示](https://via.placeholder.com/800x450?text=拖拽上传演示.gif)

### 批量压缩演示

![批量压缩演示](https://via.placeholder.com/800x450?text=批量压缩演示.gif)

> **录制建议**：使用 [Gifox](https://gifox.app/) 或 [ScreenToGif](https://www.screentogif.com/) 录制高质量GIF动效，尺寸建议控制在 800x450 像素，帧率 15-20fps。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目！

### 贡献流程

1. **Fork 项目**
2. **创建特性分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **打开 Pull Request**

### 开发规范

- 遵循现有的代码风格
- 确保代码质量和性能
- 为新功能添加测试
- 更新文档（如果需要）

## ❓ 常见问题 (FAQ)

### Q: 压缩后的图片质量如何？
A: 压缩质量可调节（10%-100%），建议使用 50%-80% 的压缩质量，在文件大小和图片质量之间取得平衡。

### Q: 支持哪些图片格式？
A: 支持输入格式：JPEG、PNG、WebP、GIF、BMP；输出格式：JPEG、PNG、WebP。

### Q: 可以压缩多少张图片？
A: 理论上支持无限多张图片，但建议一次压缩 50-100 张，以获得最佳性能。

### Q: 我的图片会被上传到服务器吗？
A: 不会，所有压缩操作均在本地浏览器完成，不会将图片上传到任何服务器，保护您的隐私。

### Q: 为什么压缩后的图片比原文件大？
A: 这种情况通常发生在原图片已经过高度压缩，或者输出格式选择不当（如将小尺寸JPEG转换为PNG）。建议根据图片类型选择合适的输出格式。

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📧 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 [GitHub Issue](https://github.com/jinzhao-rjb/image-compressor/issues)
- 发送邮件至：example@example.com

---

**享受免费、高效的图片压缩体验！** 🎉

---

## 📖 英文README

For English README, please see [README_EN.md](README_EN.md)
