# 三兄弟的冒险 - 密室逃脱

一个支持三人在线协作的文字冒险游戏，基于WebSocket实时通信。

## ✨ 功能特点

- 🎮 **三人协作**：支持3名玩家实时在线游戏
- 🏠 **多房间系统**：支持多个房间同时进行游戏
- 💾 **自动存档**：每回合自动保存游戏进度
- 🔌 **断线重连**：支持玩家断线后60秒内重连
- 🎨 **可视化场景**：使用CSS绘制的密室场景
- 📱 **响应式设计**：支持桌面端和移动端

## 🏗️ 技术栈

### 后端
- Node.js
- Express
- Socket.IO (WebSocket)

### 前端
- React
- Socket.IO Client
- CSS3 (场景可视化)

## 📦 项目结构

```
three-brothers-adventure/
├── server/                 # 后端服务器
│   ├── index.js           # 主服务器文件
│   ├── roomManager.js     # 房间管理器
│   ├── gameState.js       # 游戏状态管理
│   └── keywordMatcher.js  # 关键词匹配引擎
├── client/                # 前端应用
│   ├── public/
│   └── src/
│       ├── App.js         # 主应用组件
│       ├── components/    # React组件
│       │   ├── Lobby.js
│       │   ├── GameRoom.js
│       │   ├── GameScene.js
│       │   ├── PlayerStatus.js
│       │   ├── GameLog.js
│       │   └── InputPanel.js
│       └── index.js       # 入口文件
└── package.json
```

## 🚀 快速开始

### 本地开发

1. **安装依赖**

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

2. **启动服务器**

```bash
# 启动后端服务器（默认端口3001）
npm start

# 新开一个终端，启动前端开发服务器（默认端口3000）
cd client
npm start
```

3. **访问游戏**

打开浏览器访问：`http://localhost:3000`

### Railway部署

1. **准备工作**

确保你的代码已推送到GitHub仓库。

2. **在Railway创建项目**

- 登录 [Railway.app](https://railway.app/)
- 点击 "New Project" → "Deploy from GitHub repo"
- 选择你的仓库
- Railway会自动检测Node.js项目

3. **配置环境变量**

在Railway项目设置中添加环境变量：
- `NODE_ENV=production`
- `PORT=3001` (Railway会自动注入，通常不需要手动设置)

4. **构建设置**

Railway会自动使用以下命令：
- Build: `cd client && npm install && npm run build && cd .. && npm install`
- Start: `npm start`

如果需要自定义，可以在Railway设置中修改。

5. **访问应用**

部署完成后，Railway会提供一个公网URL。

## 📝 构建和部署脚本

创建 `build.sh` 文件（用于Railway构建）：

```bash
#!/bin/bash

# 构建前端
cd client
npm install
npm run build

# 安装后端依赖
cd ..
npm install

echo "Build completed!"
```

在 `package.json` 中添加启动脚本：

```json
{
  "scripts": {
    "start": "node server/index.js",
    "dev": "nodemon server/index.js",
    "client": "cd client && npm start",
    "build": "cd client && npm run build",
    "heroku-postbuild": "cd client && npm install && npm run build"
  }
}
```

## 🎮 游戏玩法

### 基本规则

1. **玩家角色**：三个玩家会被随机分配为猫、狗、龟（玩家不知道自己的身份）
2. **初始状态**：
   - 猫被困在行李箱（无法行动）
   - 狗被困在囚笼（无法行动）
   - 龟可以自由行动

3. **回合制**：玩家轮流输入关键词进行探索
4. **关键词格式**：`道具+道具` 或 `玩家名+道具`
5. **通关目标**：找到4个字母（C、E、H、O），组成密码"ECHO"打开大门

### 关键词示例

- `水潭+龟` - 潜水获得木盒
- `行李箱+龟` - 解锁行李箱救出猫
- `钥匙+囚笼` - 打开囚笼救出狗
- `显示器+电脑` - 获得字母H
- `衣柜+龟` - 发现隐藏的小房间

### 复活机制

- 玩家阵亡后，队友可消耗2点生命值复活
- 复活后生命值为1点

### 容错机制

- **断线重连**：玩家断线后60秒内可重连
- **自动跳过**：无法行动的玩家回合自动跳过
- **房间保留**：无活动的房间保留1小时后清理
- **全灭判定**：所有玩家阵亡游戏结束

## 🔧 开发说明

### 添加新的关键词组合

在 `server/keywordMatcher.js` 的 `buildEffectsDatabase()` 方法中添加：

```javascript
effects['新道具+新道具'] = () => ({
  description: '效果描述',
  hpChanges: [
    { target: '猫', amount: -1 }  // 生命值变化
  ],
  stateChanges: [
    { type: 'obtainLetter', letter: 'X' }  // 获得字母
  ]
});
```

### 修改场景

在 `client/src/components/GameScene.js` 中修改场景布局和样式。

### 调试模式

在浏览器控制台中可以查看WebSocket事件：

```javascript
// 查看所有Socket.IO事件
socket.onAny((event, ...args) => {
  console.log(event, args);
});
```

## 🐛 常见问题

### 1. 端口冲突

如果3000或3001端口被占用，修改以下文件：
- 后端：`server/index.js` 中的 `PORT` 变量
- 前端：`client/package.json` 中添加 `"start": "PORT=3002 react-scripts start"`

### 2. WebSocket连接失败

检查防火墙设置，确保WebSocket端口未被阻止。

### 3. Railway部署后无法连接

确保：
- 前端环境变量 `REACT_APP_SOCKET_URL` 指向正确的后端URL
- Railway项目已正确绑定域名
- WebSocket协议使用 `wss://` (生产环境)

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交Issue和Pull Request！

## 📧 联系方式

如有问题，请在GitHub上创建Issue。
