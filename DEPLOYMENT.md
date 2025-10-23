# 部署指南

## 🚀 Railway 部署（推荐）

### 前提条件
- GitHub账号
- Railway账号（可用GitHub登录）

### 部署步骤

#### 1. 准备GitHub仓库

```bash
# 初始化Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 关联GitHub仓库
git remote add origin https://github.com/你的用户名/three-brothers-adventure.git

# 推送到GitHub
git push -u origin main
```

#### 2. 在Railway部署

1. 访问 [railway.app](https://railway.app/)
2. 点击 **"New Project"**
3. 选择 **"Deploy from GitHub repo"**
4. 授权Railway访问GitHub
5. 选择你的 `three-brothers-adventure` 仓库
6. Railway会自动检测并开始部署

#### 3. 配置环境变量（可选）

在Railway项目的 **Variables** 标签页添加：

```
NODE_ENV=production
```

Railway会自动提供 `PORT` 环境变量，不需要手动设置。

#### 4. 自定义域名（可选）

在Railway项目的 **Settings** → **Domains** 中可以：
- 使用Railway提供的免费域名（如 `your-app.up.railway.app`）
- 绑定自定义域名

#### 5. 获取应用URL

部署完成后，在 **Deployments** 标签页找到你的应用URL。

### 构建配置

Railway会自动运行以下命令：

```json
{
  "build": "npm install && cd client && npm install && npm run build",
  "start": "npm start"
}
```

如果需要自定义，可以在Railway的 **Settings** → **Build & Deploy** 中修改。

---

## 🔧 Heroku 部署（备选）

### 部署步骤

1. **安装Heroku CLI**

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# 下载安装包：https://devcenter.heroku.com/articles/heroku-cli
```

2. **登录Heroku**

```bash
heroku login
```

3. **创建Heroku应用**

```bash
heroku create 你的应用名称
```

4. **推送代码**

```bash
git push heroku main
```

5. **查看应用**

```bash
heroku open
```

### Heroku配置文件

创建 `Procfile`（已包含在项目中）：

```
web: npm start
```

---

## 🐳 Docker 部署（高级）

### 创建Dockerfile

```dockerfile
# 多阶段构建
FROM node:18 AS builder

# 构建前端
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# 生产镜像
FROM node:18-slim

WORKDIR /app

# 复制后端代码
COPY server/ ./server/
COPY package*.json ./

# 安装生产依赖
RUN npm install --production

# 复制前端构建产物
COPY --from=builder /app/client/build ./client/build

EXPOSE 3001

CMD ["npm", "start"]
```

### 构建和运行

```bash
# 构建镜像
docker build -t three-brothers-adventure .

# 运行容器
docker run -p 3001:3001 three-brothers-adventure
```

---

## 🌐 Vercel 部署（仅前端）

> 注意：Vercel主要用于静态网站和API路由，WebSocket支持有限。推荐用Railway或Heroku。

如果要分离部署：

### 后端部署到Railway
按照上述Railway步骤部署后端。

### 前端部署到Vercel

1. 访问 [vercel.com](https://vercel.com/)
2. 导入GitHub仓库
3. 配置项目：
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   
4. 添加环境变量：
   ```
   REACT_APP_SOCKET_URL=https://你的后端URL.railway.app
   ```

---

## 📱 环境变量配置

### 开发环境

创建 `client/.env.development`：

```env
REACT_APP_SOCKET_URL=http://localhost:3001
```

### 生产环境

创建 `client/.env.production`：

```env
REACT_APP_SOCKET_URL=https://your-backend-url.railway.app
```

或在Railway/Heroku的环境变量中设置。

---

## 🔍 部署验证

部署完成后，检查以下内容：

### 1. 健康检查

访问 `https://your-app-url/api/health`

应该返回：
```json
{
  "status": "ok"
}
```

### 2. WebSocket连接

打开浏览器控制台，查看是否有WebSocket连接成功的日志。

### 3. 创建房间测试

1. 创建一个房间
2. 复制房间号
3. 在另一个浏览器/无痕窗口加入房间
4. 测试游戏功能

---

## 🐛 常见部署问题

### 1. 构建失败

**错误**：`npm install` 失败

**解决**：
- 检查 `package.json` 是否正确
- 确保Node版本 >= 16
- 删除 `package-lock.json` 重新生成

### 2. 应用无法访问

**错误**：504 Gateway Timeout

**解决**：
- 检查端口配置，确保使用 `process.env.PORT`
- 查看部署日志是否有错误
- 确认服务器正在运行

### 3. WebSocket连接失败

**错误**：WebSocket connection failed

**解决**：
- 确认 `REACT_APP_SOCKET_URL` 环境变量正确
- 生产环境使用 `wss://` 而非 `ws://`
- 检查防火墙和CORS配置

### 4. 静态文件404

**错误**：前端资源加载失败

**解决**：
- 确认 `client/build` 目录存在
- 检查Express静态文件配置
- 重新构建前端：`npm run build`

---

## 📊 监控和日志

### Railway日志

在Railway项目页面的 **Logs** 标签查看实时日志。

### 添加日志

在 `server/index.js` 中添加：

```javascript
// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// 错误日志
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});
```

---

## 🔐 安全建议

### 生产环境配置

1. **启用HTTPS**（Railway自动启用）
2. **设置CORS白名单**

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-frontend-domain.com'
    : '*'
}));
```

3. **添加速率限制**

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制100个请求
});

app.use('/api/', limiter);
```

---

## 📝 更新部署

### 更新代码

```bash
# 提交更改
git add .
git commit -m "Update: 描述你的更改"

# 推送到GitHub
git push origin main
```

Railway会自动检测GitHub仓库的更改并重新部署。

### 回滚版本

在Railway的 **Deployments** 标签页可以回滚到之前的部署版本。

---

## 💡 优化建议

1. **启用CDN**：使用Cloudflare加速静态资源
2. **数据库集成**：添加Redis或MongoDB持久化游戏数据
3. **负载均衡**：多实例部署提高并发能力
4. **监控告警**：集成Sentry或其他APM工具

---

## 📞 需要帮助？

- 查看 [Railway文档](https://docs.railway.app/)
- 查看项目的 [README.md](./README.md)
- 在GitHub上创建Issue
