# GitHub 使用教程

本教程介绍 GitHub 的基本使用方法，适合新手入门。

## 一、前期准备

### 1. 创建 GitHub 账号
- 访问 https://github.com
- 点击 "Sign up" 注册账号
- 填写用户名、邮箱和密码

### 2. 安装 Git
1. 访问 https://git-scm.com/downloads 下载 Git
2. 运行安装程序，使用默认配置即可
3. 安装完成后，打开命令行工具验证:
```bash
git --version
```

## 二、基础配置

### 1. 配置用户信息
```bash
# 设置用户名
git config --global user.name "Coeic01"

# 设置邮箱
git config --global user.email "Coeic.Zhang@gmail.com"

# 验证配置
git config --list
```

### 2. 配置 SSH 密钥
1. 生成 SSH 密钥:
```bash
ssh-keygen -t rsa -b 4096 -C "你的GitHub邮箱"
# 按回车使用默认设置
```

2. 查看公钥内容:
```bash
# Windows:
type %userprofile%\.ssh\id_rsa.pub

# Mac/Linux:
cat ~/.ssh/id_rsa.pub
```

3. 添加到 GitHub:
- 打开 GitHub 网站
- 点击右上角头像 -> Settings
- 选择 SSH and GPG keys
- 点击 New SSH key
- 粘贴公钥内容并保存

## 三、上传项目

### 1. 创建新仓库
1. 在 GitHub 网站点击 "+" -> New repository
2. 填写仓库名称和描述
3. 选择是否公开
4. 不要初始化仓库（不要选择 Add README file）

### 2. 初始化本地仓库
```bash
# 进入项目目录
cd 项目路径

# 初始化 Git 仓库
git init

# 创建 .gitignore 文件（根据需要配置）
# 示例内容：
# .DS_Store
# node_modules/
# dist/
# *.log

# 添加文件到暂存区
git add .

# 提交更改
git commit -m "Initial commit: 项目描述"
```

### 3. 连接远程仓库
```bash
# 添加远程仓库
git remote add origin git@github.com:用户名/仓库名.git

# 推送到 GitHub
git push -u origin main
```

## 四、常用命令

### 1. 基本操作
```bash
# 克隆仓库
git clone 仓库地址

# 查看状态
git status

# 查看变更
git diff

# 添加文件
git add 文件名
git add .  # 添加所有文件

# 提交更改
git commit -m "提交说明"

# 推送到远程
git push

# 拉取更新
git pull
```

### 2. 分支操作
```bash
# 查看分支
git branch

# 创建分支
git branch 分支名

# 切换分支
git checkout 分支名

# 创建并切换分支
git checkout -b 分支名

# 合并分支
git merge 分支名
```

## 五、常见问题

### 1. 推送失败
- 检查是否已添加 SSH key
- 确认远程仓库地址是否正确
- 检查是否有权限

### 2. 合并冲突
1. 打开冲突文件
2. 查找冲突标记 <<<<<<< HEAD
3. 手动解决冲突
4. 重新提交

## 六、最佳实践

1. 经常提交代码，每次提交要有清晰的说明
2. 使用有意义的分支名称
3. 保持 .gitignore 文件的更新
4. 在进行重要操作前先备份
5. 定期同步远程仓库的更新

## 七、参考资源

- [Git 官方文档](https://git-scm.com/doc)
- [GitHub 帮助文档](https://docs.github.com)
- [GitHub 官方教程](https://guides.github.com)

## 八、注意事项

1. 不要上传敏感信息（密码、密钥等）
2. 大文件使用 Git LFS 管理
3. 注意项目的开源协议
4. 保护好自己的 SSH 私钥

---
本教程会持续更新，欢迎提出建议和问题。 