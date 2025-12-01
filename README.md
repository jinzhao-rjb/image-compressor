# 🖼️ 图片压缩工具

一个高性能、高质量的图片压缩工具，压缩后画质几乎不变，支持多种图片格式批量处理。

[![npm version](https://badge.fury.io/js/image-compressor.svg)](https://www.npmjs.com/package/image-compressor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dt/image-compressor.svg)](https://www.npmjs.com/package/image-compressor)

## ✨ 核心亮点

- **🎯 高质量压缩**：采用先进的压缩算法，压缩后画质几乎不变，人眼难以分辨差异
- **🚀 高性能处理**：基于 Sharp 库，压缩速度快，支持批量处理大量图片
- **🎨 多格式支持**：支持 JPG、JPEG、PNG、WebP、GIF 等多种图片格式

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 使用示例

#### 基础使用

1. 将需要压缩的图片放入 `input` 目录
2. 运行压缩命令：

```bash
node index.js
```

3. 压缩后的图片将保存到 `output` 目录

#### 命令行高级使用

```bash
# 查看帮助信息
npm run compress -- --help

# 设置压缩质量为 90
npm run compress -- -q 90

# 自定义输入输出目录
npm run compress -- -i ./my-images -o ./compressed

# 不覆盖已存在的文件
npm run compress -- -w false
```

## 📋 功能清单

| 功能 | 描述 | 支持格式 |
|------|------|----------|
| 高质量压缩 | 压缩后画质几乎不变 | JPG/JPEG/PNG/WebP |
| 批量处理 | 一次性压缩目录下所有图片 | 所有支持格式 |
| 格式优化 | 根据不同格式设置最佳压缩参数 | 所有支持格式 |
| 压缩统计 | 显示每张图片压缩前后的大小对比 | 所有支持格式 |
| 命令行界面 | 支持通过命令行参数灵活配置 | 所有支持格式 |
| 自动目录管理 | 自动创建输入输出目录 | - |

## 🛠️ 技术栈说明

- **Node.js**：JavaScript 运行时环境
- **Sharp**：高性能图片处理库，基于 libvips 构建
- **yargs**：命令行参数解析库

### 压缩原理

| 图片格式 | 压缩方式 | 优化参数 |
|----------|----------|----------|
| JPG/JPEG | 有损压缩 | mozjpeg 编码器 + 渐进式压缩 |
| PNG | 无损压缩 | 压缩级别 9 + 自适应过滤 |
| WebP | 有损压缩 | 高质量压缩算法 |
| GIF | 保持原质量 | 原样输出 |

## 📸 截图展示

### 命令行界面

![命令行界面](https://via.placeholder.com/800x400?text=命令行界面+截图)

### 压缩效果对比

| 原图 | 压缩后 |
|------|--------|
| ![原图](https://via.placeholder.com/400x300?text=原图) | ![压缩后](https://via.placeholder.com/400x300?text=压缩后) |
| 文件大小：2.5 MB | 文件大小：512 KB |
| 质量：100% | 质量：85% |

## 🎥 动效录制建议

使用以下工具录制工具使用动效：

- **Gifox**：macOS 平台，简单易用，支持高质量 GIF 录制
- **ScreenToGif**：Windows 平台，免费开源，功能丰富
- **LICEcap**：跨平台，轻量级，支持快速录制

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交修改：`git commit -m 'Add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

### 开发规范

- 代码风格：遵循 JavaScript 标准风格
- 提交信息：清晰明了，使用英文
- 测试：确保所有功能正常运行

## 📄 许可证

MIT License © 2024

## ❓ 常见问题

### Q: 压缩后的图片画质会下降吗？
A: 压缩质量设置为 85 时，人眼几乎无法分辨压缩前后的差异。您可以根据需要调整压缩质量参数。

### Q: 支持哪些图片格式？
A: 支持 JPG、JPEG、PNG、WebP、GIF 格式。

### Q: 可以压缩单个图片吗？
A: 当前版本支持目录批量压缩，您可以将单个图片放入 input 目录进行压缩。

### Q: 压缩速度快吗？
A: 基于 Sharp 库，压缩速度非常快，比传统的图片处理库快 2-5 倍。

### Q: 可以在 Windows/macOS/Linux 上使用吗？
A: 是的，支持所有主流操作系统，只要安装了 Node.js 环境。

## 📞 联系方式

如有问题或建议，欢迎提交 Issue 或联系开发者。

---

**享受高质量的图片压缩体验！** 🎉