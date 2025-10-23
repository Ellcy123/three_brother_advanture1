const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const RoomManager = require('./roomManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

const roomManager = new RoomManager();

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log(`新玩家连接: ${socket.id}`);
  
  // 创建房间
  socket.on('createRoom', (data) => {
    try {
      const { playerName } = data;
      const room = roomManager.createRoom(socket.id, playerName);
      socket.join(room.roomId);
      socket.emit('roomCreated', {
        roomId: room.roomId,
        playerInfo: room.players[0]
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
  
  // 加入房间
  socket.on('joinRoom', (data) => {
    try {
      const { roomId, playerName } = data;
      const result = roomManager.joinRoom(roomId, socket.id, playerName);
      socket.join(roomId);
      
      // 通知该玩家
      socket.emit('roomJoined', {
        roomId,
        playerInfo: result.playerInfo,
        gameState: result.gameState
      });
      
      // 通知房间内所有人
      io.to(roomId).emit('playerJoined', {
        players: result.gameState.players
      });
      
      // 如果3人到齐，开始游戏
      if (result.gameState.players.length === 3) {
        setTimeout(() => {
          const startResult = roomManager.startGame(roomId);
          io.to(roomId).emit('gameStarted', startResult);
        }, 2000);
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
  
  // 玩家输入关键词
  socket.on('submitKeyword', (data) => {
    try {
      const { roomId, keyword } = data;
      const result = roomManager.processKeyword(roomId, socket.id, keyword);
      
      if (result.success) {
        // 广播游戏状态更新
        io.to(roomId).emit('gameUpdate', result.gameState);
        
        // 检查是否通关
        if (result.gameState.stage === 'passwordInput') {
          io.to(roomId).emit('showPasswordInput', {
            letters: result.gameState.obtainedLetters
          });
        }
      } else {
        // 只通知当前玩家错误
        socket.emit('keywordError', { message: result.message });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
  
  // 提交密码
  socket.on('submitPassword', (data) => {
    try {
      const { roomId, password } = data;
      const result = roomManager.checkPassword(roomId, password);
      
      if (result.success) {
        io.to(roomId).emit('stageComplete', {
          stage: 'escapeRoom',
          message: '恭喜！你们成功逃出了密室！',
          nextStage: 'hiding'
        });
      } else {
        io.to(roomId).emit('passwordError', {
          message: result.message
        });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
  
  // 复活队友
  socket.on('revivePlayer', (data) => {
    try {
      const { roomId, targetPlayerId } = data;
      const result = roomManager.revivePlayer(roomId, socket.id, targetPlayerId);
      
      if (result.success) {
        io.to(roomId).emit('gameUpdate', result.gameState);
      } else {
        socket.emit('error', { message: result.message });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
  
  // 断线处理
  socket.on('disconnect', () => {
    console.log(`玩家断线: ${socket.id}`);
    const roomId = roomManager.handleDisconnect(socket.id);
    
    if (roomId) {
      // 通知房间内其他玩家
      io.to(roomId).emit('playerDisconnected', {
        socketId: socket.id
      });
      
      // 启动60秒倒计时
      setTimeout(() => {
        const room = roomManager.getRoom(roomId);
        if (room && room.disconnectedPlayers.has(socket.id)) {
          // 玩家未重连，跳过该玩家回合
          const result = roomManager.skipDisconnectedPlayer(roomId, socket.id);
          if (result) {
            io.to(roomId).emit('gameUpdate', result.gameState);
          }
        }
      }, 60000); // 60秒
    }
  });
  
  // 重连处理
  socket.on('reconnect', (data) => {
    try {
      const { roomId, oldSocketId } = data;
      const result = roomManager.handleReconnect(roomId, oldSocketId, socket.id);
      
      if (result.success) {
        socket.join(roomId);
        socket.emit('reconnected', {
          playerInfo: result.playerInfo,
          gameState: result.gameState
        });
        
        io.to(roomId).emit('playerReconnected', {
          playerId: result.playerInfo.id
        });
      } else {
        socket.emit('error', { message: result.message });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
});

// HTTP 路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

// 清理过期房间（每小时执行一次）
setInterval(() => {
  roomManager.cleanupExpiredRooms();
}, 3600000); // 1小时
