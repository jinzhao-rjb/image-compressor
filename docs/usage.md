# 使用指南

## 基础使用

### 方式一：直接运行

1. 将需要压缩的图片放入 `input` 目录
2. 运行压缩命令：

```bash
node src/index.js
```

3. 压缩后的图片将保存到 `output` 目录

### 方式二：使用npm脚本

```bash
npm start
```

### 方式三：使用命令行工具

```bash
npm run compress
```

## 命令行参数

```
Options:
  --help              Show help                                        [boolean]
  --version           Show version number                              [boolean]
  -q, --quality       Compression quality (1-100)               [default: 85]
  -i, --input         Input directory                        [default: "input"]
  -o, --output        Output directory                      [default: "output"]
  -w, --overwrite     Overwrite existing files                [default: true]
  -r, --recursive     Recursively process subdirectories      [default: false]
```

## 高级使用

### 自定义压缩质量

```bash
npm run compress -- -q 90
```

### 自定义输入输出目录

```bash
npm run compress -- -i ./my-images -o ./compressed
```

### 不覆盖已存在的文件

```bash
npm run compress -- -w false
```

### 递归处理子目录

```bash
npm run compress -- -r true
```

## 批量处理示例

### 示例1：压缩当前目录下的所有图片

1. 创建临时输入目录并复制图片：

```bash
mkdir -p temp-input
cp *.jpg temp-input/
```

2. 压缩图片：

```bash
npm run compress -- -i temp-input -o temp-output
```

3. 查看压缩结果：

```bash
ls -la temp-output/
```

### 示例2：压缩不同格式的图片

```bash
# 准备不同格式的图片
mkdir -p mixed-formats
cp image1.jpg image2.png image3.webp mixed-formats/

# 压缩所有图片
npm run compress -- -i mixed-formats -o mixed-output
```

## 常见问题

### Q: 如何查看压缩前后的大小对比？
A: 运行压缩命令后，会在控制台显示每张图片压缩前后的大小对比信息。

### Q: 可以压缩GIF动图吗？
A: 支持GIF格式，但目前保持原质量输出，不进行压缩。

### Q: 压缩后的图片会自动重命名吗？
A: 不会，压缩后的图片会保持原文件名，除非设置了不覆盖选项且目标文件已存在。