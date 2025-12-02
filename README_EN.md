# 📸 Image Compressor - Free, Efficient Online Image Compression Solution

[![GitHub Stars](https://img.shields.io/github/stars/jinzhao-rjb/image-compressor.svg?style=social&label=Star&maxAge=2592000)](https://github.com/jinzhao-rjb/image-compressor/stargazers)
[![GitHub License](https://img.shields.io/github/license/jinzhao-rjb/image-compressor.svg)](https://github.com/jinzhao-rjb/image-compressor/blob/master/LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/jinzhao-rjb/image-compressor.svg)](https://github.com/jinzhao-rjb/image-compressor/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/jinzhao-rjb/image-compressor.svg)](https://github.com/jinzhao-rjb/image-compressor/pulls)

## 🌟 Core Features

### 📱 Mobile-Friendly Batch Processing
- Support for mobile album batch selection
- Responsive design, adapting to various screen sizes
- Touch-friendly interface with smooth operation

### 🎨 Flexible Settings with Real-time Preview
- Adjustable compression quality (10%-100%)
- Support for multiple output formats (JPEG, PNG, WebP)
- Real-time display of compression before/after comparison

### 🔒 Local Processing, Privacy Protection
- All compression operations are completed locally in the browser
- No images are uploaded to any server
- Data is secure and controllable, protecting your privacy

## 🚀 Quick Start

### Online Usage
Directly access the online preview link:

[🌐 https://jinzhao-rjb.github.io/image-compressor/](https://jinzhao-rjb.github.io/image-compressor/)

### Frontend Local Installation

#### Environment Requirements
- Modern browsers (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- No dependencies required

#### Installation Steps

1. **Clone the project**
   ```bash
   git clone https://github.com/jinzhao-rjb/image-compressor.git
   cd image-compressor
   ```

2. **Start local server**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or using Node.js
   npx serve
   ```

3. **Access the application**
   Open your browser and visit: `http://localhost:8000`

### CLI Command Line Usage

#### Environment Requirements
- Node.js 16+ 
- npm or yarn package manager

#### Installation Steps

1. **Clone the project**
   ```bash
   git clone https://github.com/jinzhao-rjb/image-compressor.git
   cd image-compressor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Use CLI to compress images**
   ```bash
   # Basic usage
   npm run compress -- --input ./input --output ./output
   
   # Custom compression quality
   npm run compress -- --input ./input --output ./output --quality 80
   
   # Batch process specific format
   npm run compress -- --input ./input --output ./output --format jpeg
   ```

#### CLI Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--input, -i` | Input directory path | Required |
| `--output, -o` | Output directory path | Required |
| `--quality, -q` | Compression quality (10-100) | 80 |
| `--format, -f` | Output format (jpeg/png/webp) | Keep original format |
| `--width, -w` | Output width | Keep original width |
| `--height, -h` | Output height | Keep original height |

### Frontend Usage Example

1. **Upload Images**
   - Click on the upload area or drag images to the upload area
   - On mobile devices, you can directly select multiple images from the album

2. **Adjust Compression Settings**
   - Drag the slider to adjust compression quality
   - Select the desired output format

3. **Start Compression**
   - Click the "Start Compression" button
   - Wait for compression to complete (progress displayed in real-time)

4. **Download Images**
   - Click the "Download" button for a single image to get individual files
   - Click the "Download All" button to batch download all compressed images

## ✨ Feature List

| Feature | Description |
|---------|-------------|
| **Batch Upload** | Support drag-and-drop and selection methods for uploading multiple images |
| **Adjustable Compression Quality** | 10%-100% adjustable compression quality |
| **Multiple Output Formats** | Support JPEG, PNG, WebP format output |
| **Real-time Preview** | Clear before/after compression comparison |
| **Batch Download** | Support single and batch download of compressed images |
| **Mobile Optimization** | Support mobile album selection upload |
| **Privacy Protection** | Local compression, no data upload |
| **Responsive Design** | Adapt to various device screen sizes |

## 🛠️ Technology Stack

### Frontend Technology

| Technology | Usage |
|------------|-------|
| **HTML5** | Page structure design |
| **CSS3** | Responsive style design |
| **JavaScript (ES6+)** | Core functionality implementation |
| **Canvas API** | Image compression processing |
| **Tailwind CSS** | Rapid style development |
| **Vue 3** | Component-based development (partial functionality) |
| **Element Plus** | UI component library |
| **JSZip** | Batch download packaging |

### Backend/CLI Technology

| Technology | Usage |
|------------|-------|
| **Node.js** | Runtime environment |
| **Sharp** | High-performance image processing library |
| **Yargs** | Command-line argument parsing |
| **Node.js Streams** | Efficient file processing |

## 📸 Screenshot Gallery

### Desktop Interface

![Desktop Main Interface](https://via.placeholder.com/800x450?text=Desktop%20Main%20Interface)

### Mobile Interface

![Mobile Main Interface](https://via.placeholder.com/375x667?text=Mobile%20Main%20Interface)

### Compression Comparison

![Compression Comparison](https://via.placeholder.com/800x200?text=Compression%20Comparison)

### Batch Download Feature

![Batch Download Feature](https://via.placeholder.com/800x450?text=Batch%20Download%20Feature)

## 🎥 Video Demonstrations

### Drag and Drop Upload Demo

![Drag and Drop Upload Demo](https://via.placeholder.com/800x450?text=Drag%20and%20Drop%20Upload%20Demo.gif)

### Batch Compression Demo

![Batch Compression Demo](https://via.placeholder.com/800x450?text=Batch%20Compression%20Demo.gif)

> **Recording Suggestions**: Use [Gifox](https://gifox.app/) or [ScreenToGif](https://www.screentogif.com/) to record high-quality GIF animations, recommended size: 800x450 pixels, frame rate: 15-20fps.

## 🤝 Contribution Guide

Welcome to submit Issues and Pull Requests to improve this project!

### Contribution Process

1. **Fork the project**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Ensure code quality and performance
- Add tests for new features
- Update documentation (if needed)

## ❓ Frequently Asked Questions (FAQ)

### Q: How is the quality of compressed images?
A: Compression quality is adjustable (10%-100%), we recommend using 50%-80% compression quality to balance file size and image quality.

### Q: What image formats are supported?
A: Supported input formats: JPEG, PNG, WebP, GIF, BMP; Output formats: JPEG, PNG, WebP.

### Q: How many images can I compress at once?
A: Theoretically, it supports unlimited images, but we recommend compressing 50-100 images at a time for optimal performance.

### Q: Will my images be uploaded to the server?
A: No, all compression operations are completed locally in the browser, no images are uploaded to any server, protecting your privacy.

### Q: Why is the compressed image larger than the original file?
A: This usually happens when the original image is already highly compressed, or when the output format is inappropriate (e.g., converting a small JPEG to PNG). We recommend choosing the appropriate output format based on the image type.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact Information

If you have any questions or suggestions, please contact us through:

- Submit a [GitHub Issue](https://github.com/jinzhao-rjb/image-compressor/issues)
- Send an email to: example@example.com

---

**Enjoy free, efficient image compression!** 🎉

---

## 📖 中文README

For Chinese README, please see [README.md](README.md)
