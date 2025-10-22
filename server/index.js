const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const gameData = require('./gameData');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 存储所有房间
const rooms = new Map();

// 游戏房间类
class GameRoom {
  constructor(roomId) {
    this.roomId = roomId;
    this.players = {};
    this.playerOrder = []; // player1, player2, player3
    this.gameState = {
      phase: 'lobby', // lobby, game, finished
      currentTurn: 0,
      items: [...gameData.initialItems],
      letters: [],
      brokenItems: [],
      unlockedPlayers: ['player1'], // 初始只有player1可以行动
      messages: [],
      doorUnlocked: false
    };
  }

  addPlayer(socketId, playerName) {
    const roleKeys = ['player1', 'player2', 'player3'];
    const availableRole = roleKeys.find(key => !this.players[key]);
    
    if (!availableRole) return null;

    this.players[availableRole] = {
      socketId,
      role: availableRole,
      name: playerName,
      hp: gameData.roles[availableRole].initialHp,
      animal: gameData.roles[availableRole].animal, // 服务器知道动物身份，但不发给客户端
      canAct: gameData.roles[availableRole].canAct
    };

    this.playerOrder.push(availableRole);
    return availableRole;
  }

  removePlayer(socketId) {
    for (const [role, player] of Object.entries(this.players)) {
      if (player.socketId === socketId) {
        delete this.players[role];
        this.playerOrder = this.playerOrder.filter(r => r !== role);
        break;
      }
    }
  }

  getPlayerBySocket(socketId) {
    for (const [role, player] of Object.entries(this.players)) {
      if (player.socketId === socketId) {
        return { ...player, role };
      }
    }
    return null;
  }

  startGame() {
    const playerCount = Object.keys(this.players).length;
    if (playerCount < 1) return false;
    
    this.gameState.phase = 'game';
    this.gameState.currentTurn = 0;
    
    // 单人模式提示
    if (playerCount === 1) {
      this.addMessage('系统', '🧪 测试模式：单人游戏开始！你扮演乌龟角色。');
    }
    
    this.addMessage('系统', '游戏开始！你们醒来后发现被困在一个密室中。你好像听到了有人在哭泣，密室的布局很奇怪，有一汪水潭，一个行李箱，一个衣柜。');
    this.addMessage('系统', `当前回合：${this.getCurrentPlayer().name}`);
    return true;
  }

  getCurrentPlayer() {
    const currentRole = this.playerOrder[this.gameState.currentTurn];
    return this.players[currentRole];
  }

  // 获取下一个可以行动的玩家
  getNextActivePlayerIndex() {
    const startIndex = this.gameState.currentTurn;
    let nextIndex = (startIndex + 1) % this.playerOrder.length;
    let attempts = 0;
    
    // 最多尝试3次（3个玩家），找到可以行动的玩家
    while (attempts < this.playerOrder.length) {
      const role = this.playerOrder[nextIndex];
      if (this.gameState.unlockedPlayers.includes(role)) {
        return nextIndex;
      }
      nextIndex = (nextIndex + 1) % this.playerOrder.length;
      attempts++;
    }
    
    // 如果没有玩家可以行动，返回当前索引
    return startIndex;
  }

  nextTurn() {
    this.gameState.currentTurn = this.getNextActivePlayerIndex();
    const currentPlayer = this.getCurrentPlayer();
    this.addMessage('系统', `当前回合：${currentPlayer.name}`);
  }

  addMessage(sender, text, isSystem = false) {
    this.gameState.messages.push({
      id: uuidv4(),
      sender,
      text,
      isSystem,
      timestamp: Date.now()
    });
  }

  processKeyword(keyword, playerRole) {
    const player = this.players[playerRole];
    if (!player) return { success: false, message: '玩家不存在' };

    // 检查玩家是否可以行动
    if (!this.gameState.unlockedPlayers.includes(playerRole)) {
      return { success: false, message: '你当前无法行动！' };
    }

    // 规范化关键词（处理不同格式）
    keyword = keyword.trim().replace(/\s+/g, '');
    
    // 尝试匹配关键词（考虑道具+道具、玩家+道具）
    let effect = null;
    let effectKey = null;

    // 检查是否有对应的关键词效果
    const possibleKeys = this.generatePossibleKeys(keyword, playerRole);
    
    for (const key of possibleKeys) {
      if (gameData.keywordEffects[key]) {
        effect = gameData.keywordEffects[key];
        effectKey = key;
        break;
      }
    }

    if (!effect) {
      return { success: false, message: '无效的关键词组合！' };
    }

    // 应用效果
    this.applyEffects(effect.effects, playerRole);
    this.addMessage(player.name, `使用关键词：${keyword}`);
    this.addMessage('系统', effect.text, true);

    // 检查是否已收集所有字母
    if (this.gameState.letters.length === 4 && 
        this.gameState.letters.includes('E') &&
        this.gameState.letters.includes('C') &&
        this.gameState.letters.includes('H') &&
        this.gameState.letters.includes('O')) {
      this.addMessage('系统', '你们已经收集了所有字母：E、C、H、O！试着输入密码逃离密室吧！', true);
    }

    return { success: true, message: '关键词生效！', effect: effect.text };
  }

  generatePossibleKeys(keyword, playerRole) {
    const player = this.players[playerRole];
    const keys = [];
    
    // 分割关键词 - 使用let以便后续修改
    let parts = keyword.split('+').map(p => p.trim());
    if (parts.length !== 2) {
      // 尝试其他分隔符
      const otherParts = keyword.split(/[+、，,]/).map(p => p.trim());
      if (otherParts.length === 2) {
        parts = otherParts;
      }
    }

    if (parts.length === 2) {
      const [part1, part2] = parts;
      
      // 道具+道具
      keys.push(`${part1}+${part2}`);
      keys.push(`${part2}+${part1}`);
      
      // 动物+道具
      keys.push(`${player.animal}+${part1}`);
      keys.push(`${player.animal}+${part2}`);
      keys.push(`${part1}+${player.animal}`);
      keys.push(`${part2}+${player.animal}`);
      
      // 检查囚笼状态（是否已解锁）
      if (part1 === '囚笼' || part2 === '囚笼') {
        const cageUnlocked = this.gameState.unlockedPlayers.includes('player3');
        const suffix = cageUnlocked ? '_后续' : '';
        keys.push(`${part1}+${part2}${suffix}`);
        keys.push(`${part2}+${part1}${suffix}`);
        keys.push(`${player.animal}+囚笼${suffix}`);
        keys.push(`囚笼+${player.animal}${suffix}`);
      }
    }

    return keys;
  }

  applyEffects(effects, playerRole) {
    // 添加道具
    if (effects.addItems) {
      effects.addItems.forEach(item => {
        if (!this.gameState.items.includes(item)) {
          this.gameState.items.push(item);
        }
      });
    }

    // 移除道具
    if (effects.removeItems) {
      effects.removeItems.forEach(item => {
        const index = this.gameState.items.indexOf(item);
        if (index > -1) {
          this.gameState.items.splice(index, 1);
        }
      });
    }

    // 标记损坏的道具
    if (effects.markBroken) {
      if (!this.gameState.brokenItems.includes(effects.markBroken)) {
        this.gameState.brokenItems.push(effects.markBroken);
      }
    }

    // 添加字母
    if (effects.addLetter) {
      if (!this.gameState.letters.includes(effects.addLetter)) {
        this.gameState.letters.push(effects.addLetter);
      }
    }

    // 添加特殊道具
    if (effects.addItem) {
      if (!this.gameState.items.includes(effects.addItem)) {
        this.gameState.items.push(effects.addItem);
      }
    }

    // 解锁玩家
    if (effects.unlockPlayer) {
      if (!this.gameState.unlockedPlayers.includes(effects.unlockPlayer)) {
        this.gameState.unlockedPlayers.push(effects.unlockPlayer);
        const unlockedPlayer = this.players[effects.unlockPlayer];
        unlockedPlayer.canAct = true;
        this.addMessage('系统', `${unlockedPlayer.name} 恢复了行动能力！`, true);
      }
    }

    // 解锁区域
    if (effects.unlockArea) {
      this.addMessage('系统', `解锁了新区域：${effects.unlockArea}！`, true);
    }

    // 生命值变化
    if (effects.currentPlayerHp) {
      this.players[playerRole].hp += effects.currentPlayerHp;
      if (this.players[playerRole].hp < 0) this.players[playerRole].hp = 0;
    }

    if (effects.player2Hp) {
      this.players['player2'].hp += effects.player2Hp;
      if (this.players['player2'].hp < 0) this.players['player2'].hp = 0;
    }

    if (effects.player3Hp) {
      this.players['player3'].hp += effects.player3Hp;
      if (this.players['player3'].hp < 0) this.players['player3'].hp = 0;
    }

    if (effects.allPlayersHp) {
      Object.values(this.players).forEach(p => {
        p.hp += effects.allPlayersHp;
        if (p.hp < 0) p.hp = 0;
      });
    }
  }

  tryEscape(password) {
    if (password.toUpperCase() === gameData.escapePassword) {
      this.gameState.doorUnlocked = true;
      this.gameState.phase = 'finished';
      this.addMessage('系统', '🎉 恭喜！你们成功打开了密室大门，完成了第一关！', true);
      return true;
    }
    this.addMessage('系统', '❌ 密码错误！', true);
    return false;
  }

  // 获取客户端游戏状态（不包含动物身份）
  getClientGameState() {
    const clientPlayers = {};
    for (const [role, player] of Object.entries(this.players)) {
      clientPlayers[role] = {
        name: player.name,
        hp: player.hp,
        canAct: player.canAct,
        role: player.role
        // 注意：不发送 animal 字段
      };
    }

    return {
      phase: this.gameState.phase,
      currentTurn: this.playerOrder[this.gameState.currentTurn],
      items: this.gameState.items,
      letters: this.gameState.letters,
      brokenItems: this.gameState.brokenItems,
      messages: this.gameState.messages.slice(-50), // 只发送最近50条消息
      players: clientPlayers,
      doorUnlocked: this.gameState.doorUnlocked
    };
  }
}

// Socket.IO 连接处理
io.on('connection', (socket) => {
  console.log('新用户连接:', socket.id);

  // 创建房间
  socket.on('createRoom', (playerName) => {
    const roomId = uuidv4().substring(0, 6).toUpperCase();
    const room = new GameRoom(roomId);
    rooms.set(roomId, room);
    
    const role = room.addPlayer(socket.id, playerName);
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.role = role;

    socket.emit('roomCreated', {
      roomId,
      role,
      gameState: room.getClientGameState()
    });

    console.log(`房间创建: ${roomId}, 玩家: ${playerName}`);
  });

  // 加入房间
  socket.on('joinRoom', ({ roomId, playerName }) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: '房间不存在' });
      return;
    }

    if (Object.keys(room.players).length >= 3) {
      socket.emit('error', { message: '房间已满' });
      return;
    }

    const role = room.addPlayer(socket.id, playerName);
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.role = role;

    socket.emit('joinedRoom', {
      roomId,
      role,
      gameState: room.getClientGameState()
    });

    io.to(roomId).emit('playerJoined', {
      playerName,
      role,
      gameState: room.getClientGameState()
    });

    console.log(`玩家 ${playerName} 加入房间 ${roomId}`);
  });

  // 开始游戏
  socket.on('startGame', () => {
    const roomId = socket.data.roomId;
    const room = rooms.get(roomId);
    
    if (!room) return;

    if (room.startGame()) {
      io.to(roomId).emit('gameStarted', {
        gameState: room.getClientGameState()
      });
      console.log(`房间 ${roomId} 游戏开始`);
    } else {
      socket.emit('error', { message: '需要3名玩家才能开始游戏' });
    }
  });

  // 发送关键词
  socket.on('sendKeyword', (keyword) => {
    const roomId = socket.data.roomId;
    const role = socket.data.role;
    const room = rooms.get(roomId);
    
    if (!room) return;

    const currentPlayer = room.getCurrentPlayer();
    if (currentPlayer.socketId !== socket.id) {
      socket.emit('error', { message: '现在不是你的回合' });
      return;
    }

    const result = room.processKeyword(keyword, role);
    
    if (result.success) {
      room.nextTurn();
    }

    io.to(roomId).emit('gameStateUpdate', {
      gameState: room.getClientGameState()
    });
  });

  // 尝试逃脱（输入密码）
  socket.on('tryEscape', (password) => {
    const roomId = socket.data.roomId;
    const room = rooms.get(roomId);
    
    if (!room) return;

    const success = room.tryEscape(password);
    
    io.to(roomId).emit('gameStateUpdate', {
      gameState: room.getClientGameState()
    });

    if (success) {
      io.to(roomId).emit('escapeSuccess');
    }
  });

  // 发送聊天消息
  socket.on('sendMessage', (message) => {
    const roomId = socket.data.roomId;
    const room = rooms.get(roomId);
    
    if (!room) return;

    const player = room.getPlayerBySocket(socket.id);
    if (player) {
      room.addMessage(player.name, message);
      io.to(roomId).emit('gameStateUpdate', {
        gameState: room.getClientGameState()
      });
    }
  });

  // 断开连接
  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    const room = rooms.get(roomId);
    
    if (room) {
      const player = room.getPlayerBySocket(socket.id);
      room.removePlayer(socket.id);
      
      if (Object.keys(room.players).length === 0) {
        rooms.delete(roomId);
        console.log(`房间 ${roomId} 已删除`);
      } else {
        io.to(roomId).emit('playerLeft', {
          playerName: player?.name,
          gameState: room.getClientGameState()
        });
      }
    }
    
    console.log('用户断开连接:', socket.id);
  });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
