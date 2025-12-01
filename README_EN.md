# 🖼️ Image Compressor

A high-performance, high-quality image compression tool that maintains almost unchanged image quality after compression, supporting batch processing of multiple image formats.

[![npm version](https://badge.fury.io/js/image-compressor.svg)](https://www.npmjs.com/package/image-compressor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dt/image-compressor.svg)](https://www.npmjs.com/package/image-compressor)

## ✨ Core Features

- **🎯 High-Quality Compression**: Uses advanced compression algorithms to maintain almost unchanged image quality after compression
- **🚀 High Performance**: Based on Sharp library, fast compression speed, supports batch processing of large numbers of images
- **🎨 Multi-Format Support**: Supports JPG, JPEG, PNG, WebP, GIF and other image formats

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Usage Examples

#### Basic Usage

1. Put the images to be compressed into the `input` directory
2. Run the compression command:

```bash
node index.js
```

3. Compressed images will be saved to the `output` directory

#### Advanced Command Line Usage

```bash
# View help information
npm run compress -- --help

# Set compression quality to 90
npm run compress -- -q 90

# Custom input and output directories
npm run compress -- -i ./my-images -o ./compressed

# Do not overwrite existing files
npm run compress -- -w false
```

## 📋 Feature List

| Feature | Description | Supported Formats |
|---------|-------------|-------------------|
| High-Quality Compression | Maintains almost unchanged image quality after compression | JPG/JPEG/PNG/WebP |
| Batch Processing | Compresses all images in a directory at once | All supported formats |
| Format Optimization | Sets optimal compression parameters for different formats | All supported formats |
| Compression Statistics | Displays size comparison before and after compression for each image | All supported formats |
| Command Line Interface | Supports flexible configuration through command line parameters | All supported formats |
| Automatic Directory Management | Automatically creates input and output directories | - |

## 🛠️ Technology Stack

- **Node.js**: JavaScript runtime environment
- **Sharp**: High-performance image processing library built on libvips
- **yargs**: Command line parameter parsing library

### Compression Principles

| Image Format | Compression Method | Optimization Parameters |
|--------------|--------------------|------------------------|
| JPG/JPEG | Lossy Compression | mozjpeg encoder + progressive compression |
| PNG | Lossless Compression | Compression level 9 + adaptive filtering |
| WebP | Lossy Compression | High-quality compression algorithm |
| GIF | Maintain Original Quality | Output as is |

## 📸 Screenshot Showcase

### Command Line Interface

![Command Line Interface](https://via.placeholder.com/800x400?text=Command+Line+Interface+Screenshot)

### Compression Effect Comparison

| Original Image | Compressed Image |
|----------------|------------------|
| ![Original](https://via.placeholder.com/400x300?text=Original+Image) | ![Compressed](https://via.placeholder.com/400x300?text=Compressed+Image) |
| File Size: 2.5 MB | File Size: 512 KB |
| Quality: 100% | Quality: 85% |

## 🎥 Animation Recording Suggestions

Use the following tools to record tool usage animations:

- **Gifox**: macOS platform, simple and easy to use, supports high-quality GIF recording
- **ScreenToGif**: Windows platform, free and open source, rich in features
- **LICEcap**: Cross-platform, lightweight, supports fast recording

## 🤝 Contribution Guidelines

Welcome to submit Issues and Pull Requests!

### Development Process

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push branch: `git push origin feature/your-feature`
5. Submit Pull Request

### Development Specifications

- Code Style: Follow JavaScript standard style
- Commit Messages: Clear and concise, use English
- Testing: Ensure all functions work properly

## 📄 License

MIT License © 2024

## ❓ Frequently Asked Questions

### Q: Will the image quality decrease after compression?
A: When the compression quality is set to 85, the human eye can hardly distinguish the difference between the original and compressed images. You can adjust the compression quality parameter as needed.

### Q: Which image formats are supported?
A: JPG, JPEG, PNG, WebP, GIF formats are supported.

### Q: Can I compress a single image?
A: The current version supports directory batch compression, you can put a single image into the input directory for compression.

### Q: Is the compression speed fast?
A: Based on the Sharp library, the compression speed is very fast, 2-5 times faster than traditional image processing libraries.

### Q: Can it be used on Windows/macOS/Linux?
A: Yes, it supports all mainstream operating systems as long as Node.js environment is installed.

## 📞 Contact Information

If you have any questions or suggestions, please submit an Issue or contact the developer.

---

**Enjoy high-quality image compression experience!** 🎉