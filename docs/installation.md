# 安装指南

## 环境要求

- Node.js >= 14.x
- npm >= 6.x

## 安装步骤

### 1. 克隆仓库

```bash
git clone https://github.com/jinzhao-rjb/jin.git
cd jin
```

### 2. 安装依赖

```bash
npm install
```

### 3. 验证安装

```bash
npm run compress -- --help
```

如果看到帮助信息，则安装成功。

## 全局安装（可选）

```bash
npm install -g .
```

全局安装后，您可以直接使用 `image-compress` 命令：

```bash
image-compress --help
```