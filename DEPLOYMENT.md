# Railway 部署指南 🚀

本指南将帮助你将《三兄弟的冒险》游戏部署到Railway平台。

## 前置准备

1. **GitHub账号**：用于托管代码
2. **Railway账号**：访问 [railway.app](https://railway.app) 注册
3. **Git已安装**：用于版本控制

## 第一步：推送代码到GitHub

### 1.1 创建GitHub仓库

1. 访问 [github.com](https://github.com)
2. 点击右上角 "+" → "New repository"
3. 仓库名：`three-brothers-adventure`
4. 设置为 Public 或 Private
5. 点击 "Create repository"

### 1.2 上传代码

在项目根目录执行：

```bash
cd three-brothers-adventure

# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 模块A密室逃脱"

# 关联远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/three-brothers-adventure.git

# 推送到main分支
git branch -M main
git push -u origin main
```

## 第二步：部署后端服务器

### 2.1 创建后端服务

1. 登录 [Railway](https://railway.app)
2. 点击 **"New Project"**
3. 选择 **"Deploy from GitHub repo"**
4. 选择你的 `three-brothers-adventure` 仓库
5. 点击 **"Deploy Now"**

### 2.2 配置后端服务

1. 在项目面板中，点击刚创建的服务
2. 进入 **"Settings"** 标签
3. 找到 **"Root Directory"** 设置
   - 输入：`server`
   - 点击保存
4. 进入 **"Variables"** 标签
   - 点击 **"Add Variable"**
   - 添加：
     ```
     PORT = 3001
     ```
5. 等待自动重新部署

### 2.3 获取后端服务地址

1. 在服务页面，进入 **"Settings"** 标签
2. 找到 **"Domains"** 部分
3. 点击 **"Generate Domain"**
4. 复制生成的域名（类似：`your-app.railway.app`）
5. **保存这个地址**，后续部署前端时需要用到

## 第三步：部署前端应用

### 3.1 创建前端服务

1. 在同一个Railway项目中
2. 点击右上角 **"+ New"**
3. 选择 **"GitHub Repo"**
4. 再次选择你的 `three-brothers-adventure` 仓库

### 3.2 配置前端服务

1. 在前端服务页面，进入 **"Settings"** 标签
2. 找到 **"Root Directory"** 设置
   - 输入：`client`
   - 点击保存

3. 进入 **"Variables"** 标签
   - 点击 **"Add Variable"**
   - 添加：
     ```
     VITE_SERVER_URL = https://你的后端服务地址.railway.app
     ```
   - **注意**：替换为第2.3步获取的后端地址
   - **重要**：必须包含 `https://` 前缀

4. 在 **"Settings"** 标签中
   - 找到 **"Build Command"**
   - 确认为：`npm run build`
   - 找到 **"Start Command"**
   - 设置为：`npx serve -s dist -p $PORT`

5. 点击 **"Generate Domain"** 生成前端访问地址

### 3.3 等待部署完成

Railway会自动：
1. 安装依赖
2. 构建前端应用
3. 启动服务

部署完成后，状态会显示为 **"Active"**。

## 第四步：测试游戏

1. 点击前端服务生成的域名
2. 应该能看到游戏大厅界面
3. 测试流程：
   - 输入名字
   - 创建房间
   - 在另外两个浏览器窗口加入房间
   - 开始游戏

## 常见问题排查

### 问题1：前端无法连接后端

**症状**：页面加载但无法创建/加入房间

**解决方案**：
1. 检查前端环境变量 `VITE_SERVER_URL` 是否正确
2. 确保包含 `https://` 前缀
3. 确保后端服务正常运行（状态为 Active）
4. 重新部署前端服务

### 问题2：后端服务启动失败

**症状**：部署日志显示错误

**解决方案**：
1. 检查 `server/package.json` 中的依赖是否完整
2. 确认 Root Directory 设置为 `server`
3. 查看部署日志中的具体错误信息

### 问题3：前端显示空白页

**症状**：访问域名后页面空白

**解决方案**：
1. 打开浏览器控制台（F12）查看错误
2. 确认 Build Command 为 `npm run build`
3. 确认 Start Command 为 `npx serve -s dist -p $PORT`
4. 确认已安装 `serve` 依赖

### 问题4：WebSocket连接失败

**症状**：控制台显示 WebSocket 错误

**解决方案**：
1. 检查后端是否启用 HTTPS
2. Railway默认提供HTTPS，确保前端使用 `https://` 协议
3. 检查 CORS 配置

## 更新代码

当你修改代码后：

```bash
# 提交更改
git add .
git commit -m "描述你的更改"
git push

# Railway会自动检测并重新部署
```

## 环境变量总结

### 后端服务（server）
```
PORT=3001
```

### 前端服务（client）
```
VITE_SERVER_URL=https://你的后端域名.railway.app
```

## 监控和日志

1. 在Railway项目面板中
2. 点击对应的服务
3. 进入 **"Deployments"** 标签查看部署历史
4. 点击 **"View Logs"** 查看运行日志

## 费用说明

Railway提供：
- 免费额度：$5/月
- 每个服务会消耗一定资源
- 建议监控使用情况

## 下一步

游戏部署成功后，你可以：
1. 分享前端域名给朋友一起玩
2. 继续开发其他模块（模块B、C、D等）
3. 添加更多功能和优化

---

**部署完成！现在你的游戏已经可以在互联网上访问了！** 🎉

如有问题，可以查看：
- [Railway文档](https://docs.railway.app)
- [项目GitHub Issues](https://github.com/你的用户名/three-brothers-adventure/issues)
