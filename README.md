# 三兄弟的冒险 🎮

一个三人在线协作的文字冒险游戏，基于宠物视角的剧情故事。

## 📋 项目概述

这是一个多人在线文字冒险游戏的**第一关：密室逃脱**模块。三名玩家需要通过输入关键词来触发剧情，解开谜题，最终逃离密室。

### 当前实现功能（模块A）

- ✅ 游戏大厅/房间系统
- ✅ 三人在线实时游戏
- ✅ 关键词组合系统（100+种组合）
- ✅ 生命值管理系统
- ✅ 回合制机制
- ✅ 道具收集与字母收集
- ✅ 密室逃脱密码系统
- ✅ 实时聊天功能

## 🚀 技术栈

### 后端
- Node.js + Express
- Socket.IO（WebSocket实时通信）
- UUID（房间管理）

### 前端
- React 18
- Vite
- Socket.IO Client
- 原生CSS

### 部署
- Railway（服务器 + 前端）
- GitHub（代码管理）

## 📦 项目结构

```
three-brothers-adventure/
├── server/                 # 后端服务器
│   ├── index.js           # 服务器主文件
│   ├── gameData.js        # 游戏数据配置
│   └── package.json       # 后端依赖
├── client/                 # 前端应用
│   ├── src/
│   │   ├── App.jsx        # 主应用组件
│   │   ├── App.css        # 样式文件
│   │   ├── main.jsx       # React入口
│   │   └── index.css      # 全局样式
│   ├── index.html         # HTML入口
│   ├── vite.config.js     # Vite配置
│   └── package.json       # 前端依赖
└── README.md              # 项目文档
```

## 🎯 游戏玩法

### 角色设定
- **玩家1（乌龟）**：初始可行动，需要救出其他玩家
- **玩家2（猫）**：初始被困在行李箱，需要被救出
- **玩家3（狗）**：初始被困在囚笼，需要被救出

**注意**：在第二幕（模块C）被破解之前，玩家不知道自己对应的动物身份！

### 初始生命值
每个玩家初始生命值为 8 点

### 关键词系统
玩家通过输入关键词触发剧情，格式：
- `道具+道具`（例如：水潭+木盒）
- `道具+道具`（例如：行李箱+钥匙）

### 通关条件
1. 收集所有字母：E、C、H、O
2. 组合成密码"ECHO"
3. 输入密码逃离密室

## 🛠️ 本地开发

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖

```bash
# 安装服务器依赖
cd server
npm install

# 安装客户端依赖
cd ../client
npm install
```

### 启动开发服务器

```bash
# 启动后端服务器（终端1）
cd server
npm start

# 启动前端开发服务器（终端2）
cd client
npm run dev
```

访问：http://localhost:3000

## 🚢 部署到Railway

### 方法1：通过GitHub自动部署（推荐）

1. **将代码推送到GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/three-brothers-adventure.git
git push -u origin main
```

2. **部署后端服务器**
   - 登录 [Railway.app](https://railway.app)
   - 点击 "New Project" → "Deploy from GitHub repo"
   - 选择你的仓库
   - 设置 Root Directory 为 `server`
   - 添加环境变量：
     ```
     PORT=3001
     ```
   - Railway会自动部署

3. **部署前端应用**
   - 在同一个项目中点击 "New Service" → "GitHub Repo"
   - 选择同一个仓库
   - 设置 Root Directory 为 `client`
   - 添加环境变量：
     ```
     VITE_SERVER_URL=https://你的后端服务地址.railway.app
     ```
   - 设置 Build Command: `npm run build`
   - 设置 Start Command: `npx serve -s dist -p $PORT`
   - 安装 serve: 在 client/package.json 添加：
     ```json
     {
       "dependencies": {
         "serve": "^14.2.0"
       }
     }
     ```

### 方法2：Railway CLI部署

```bash
# 安装Railway CLI
npm install -g @railway/cli

# 登录Railway
railway login

# 部署服务器
cd server
railway init
railway up

# 部署前端
cd ../client
railway init
railway up
```

## 🎮 游戏说明

### 初始场景
密室中有：
- 水潭
- 行李箱（玩家2被困其中）
- 衣柜

### 关键词示例

**救出玩家2（猫）**：
```
行李箱+乌龟
```

**获取钥匙**：
```
行李箱+猫
```

**救出玩家3（狗）**：
```
钥匙+囚笼
```

**获取字母**：
- `衣柜+猫` → 获得字母 C
- `木盒+狗` → 获得字母 E
- `显示器+电脑` → 获得字母 H
- `花瓶+猫` → 获得字母 O

### 注意事项
- 某些组合会扣除生命值，请谨慎尝试
- 道具可能会被损坏或消失
- 不同顺序的组合可能有不同效果
- 玩家之间可以互动

## 🔧 环境变量配置

### 服务器 (.env)
```
PORT=3001
```

### 客户端 (.env)
```
VITE_SERVER_URL=http://localhost:3001
```

生产环境记得修改为实际的服务器地址。

## 📝 后续开发计划

- [ ] 模块B：藏匿玩法
- [ ] 模块C：YES/NO问答系统
- [ ] 模块D：个人剧情分支
- [ ] 模块E：Boss战系统
- [ ] 模块F：结局系统

## 🐛 已知问题

- 玩家断线重连功能待完善
- 游戏存档功能待实现

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交Issue和Pull Request！

---

祝游戏愉快！🎉
