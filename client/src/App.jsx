import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

// 从环境变量读取服务器地址，开发时使用localhost
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

function App() {
  const [socket, setSocket] = useState(null);
  const [gamePhase, setGamePhase] = useState('lobby'); // lobby, waiting, game
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [myRole, setMyRole] = useState('');
  const [gameState, setGameState] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [escapePassword, setEscapePassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [gameState?.messages]);

  // 初始化Socket连接
  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('已连接到服务器');
    });

    newSocket.on('roomCreated', (data) => {
      setRoomId(data.roomId);
      setMyRole(data.role);
      setGameState(data.gameState);
      setGamePhase('waiting');
    });

    newSocket.on('joinedRoom', (data) => {
      setRoomId(data.roomId);
      setMyRole(data.role);
      setGameState(data.gameState);
      setGamePhase('waiting');
    });

    newSocket.on('playerJoined', (data) => {
      setGameState(data.gameState);
    });

    newSocket.on('playerLeft', (data) => {
      setGameState(data.gameState);
    });

    newSocket.on('gameStarted', (data) => {
      setGameState(data.gameState);
      setGamePhase('game');
    });

    newSocket.on('gameStateUpdate', (data) => {
      setGameState(data.gameState);
    });

    newSocket.on('escapeSuccess', () => {
      alert('🎉 恭喜通关第一关！');
    });

    newSocket.on('error', (data) => {
      setError(data.message);
      setTimeout(() => setError(''), 3000);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // 创建房间
  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError('请输入你的名字');
      return;
    }
    socket.emit('createRoom', playerName);
  };

  // 加入房间
  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      setError('请输入你的名字');
      return;
    }
    if (!roomId.trim()) {
      setError('请输入房间号');
      return;
    }
    socket.emit('joinRoom', { roomId: roomId.toUpperCase(), playerName });
  };

  // 开始游戏
  const handleStartGame = () => {
    socket.emit('startGame');
  };

  // 发送关键词
  const handleSendKeyword = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    socket.emit('sendKeyword', keyword);
    setKeyword('');
  };

  // 尝试逃脱
  const handleTryEscape = (e) => {
    e.preventDefault();
    if (!escapePassword.trim()) return;
    socket.emit('tryEscape', escapePassword);
    setEscapePassword('');
  };

  // 发送聊天消息
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    socket.emit('sendMessage', message);
    setMessage('');
  };

  // 渲染大厅界面
  const renderLobby = () => (
    <div className="lobby-container">
      <h1 className="game-title">🎮 三兄弟的冒险</h1>
      <div className="lobby-content">
        <div className="input-group">
          <input
            type="text"
            placeholder="输入你的名字"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="input-field"
          />
        </div>
        
        <div className="button-group">
          <button onClick={handleCreateRoom} className="btn btn-primary">
            创建房间
          </button>
        </div>

        <div className="divider">或</div>

        <div className="input-group">
          <input
            type="text"
            placeholder="输入房间号"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            className="input-field"
          />
        </div>

        <div className="button-group">
          <button onClick={handleJoinRoom} className="btn btn-secondary">
            加入房间
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );

  // 渲染等待界面
  const renderWaiting = () => {
    const playerCount = gameState ? Object.keys(gameState.players).length : 0;
    
    return (
      <div className="waiting-container">
        <h2>房间号: {roomId}</h2>
        <p className="room-info">分享房间号给你的朋友加入游戏</p>
        
        <div className="players-list">
          <h3>玩家列表 ({playerCount}/3)</h3>
          {gameState && Object.entries(gameState.players).map(([role, player]) => (
            <div key={role} className={`player-card ${role === myRole ? 'my-player' : ''}`}>
              <span className="player-name">{player.name}</span>
              <span className="player-role">
                {role === 'player1' ? '玩家1' : role === 'player2' ? '玩家2' : '玩家3'}
              </span>
              {role === myRole && <span className="badge">你</span>}
            </div>
          ))}
        </div>

        {playerCount >= 1 && (
          <div>
            <button onClick={handleStartGame} className="btn btn-primary btn-large">
              开始游戏 {playerCount === 1 && '(测试模式)'}
            </button>
            {playerCount === 1 && (
              <p className="test-mode-tip">🧪 单人测试模式：你将扮演乌龟角色</p>
            )}
            {playerCount === 2 && (
              <p className="waiting-text">已有2名玩家，可以开始游戏或等待第3名玩家</p>
            )}
          </div>
        )}

        {playerCount === 0 && (
          <p className="waiting-text">等待玩家加入...</p>
        )}
      </div>
    );
  };

  // 渲染游戏界面
  const renderGame = () => {
    if (!gameState) return null;

    const isMyTurn = gameState.currentTurn === myRole;
    const myPlayer = gameState.players[myRole];
    const canAct = myPlayer?.canAct;

    return (
      <div className="game-container">
        {/* 左侧面板 */}
        <div className="left-panel">
          {/* 玩家信息 */}
          <div className="players-status">
            <h3>玩家状态</h3>
            {Object.entries(gameState.players).map(([role, player]) => (
              <div 
                key={role} 
                className={`player-status ${role === myRole ? 'my-player' : ''} ${role === gameState.currentTurn ? 'current-turn' : ''}`}
              >
                <div className="player-info">
                  <span className="player-name">{player.name}</span>
                  {role === myRole && <span className="badge-small">你</span>}
                  {role === gameState.currentTurn && <span className="badge-turn">回合中</span>}
                </div>
                <div className="player-hp">
                  <span className="hp-label">HP:</span>
                  <span className="hp-value">{player.hp}</span>
                </div>
                {!player.canAct && <div className="status-locked">🔒 无法行动</div>}
              </div>
            ))}
          </div>

          {/* 道具和字母 */}
          <div className="inventory">
            <h3>可用道具</h3>
            <div className="items-list">
              {gameState.items.map((item, index) => (
                <div key={index} className="item-tag">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {gameState.letters.length > 0 && (
            <div className="letters">
              <h3>已收集字母</h3>
              <div className="letters-list">
                {gameState.letters.map((letter, index) => (
                  <div key={index} className="letter-tag">
                    {letter}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 逃脱密码输入 */}
          {gameState.letters.length >= 4 && !gameState.doorUnlocked && (
            <div className="escape-section">
              <h3>🚪 输入密码逃脱</h3>
              <form onSubmit={handleTryEscape}>
                <input
                  type="text"
                  placeholder="输入密码"
                  value={escapePassword}
                  onChange={(e) => setEscapePassword(e.target.value.toUpperCase())}
                  className="input-field"
                />
                <button type="submit" className="btn btn-success">
                  尝试逃脱
                </button>
              </form>
            </div>
          )}
        </div>

        {/* 中间主面板 */}
        <div className="main-panel">
          {/* 消息区域 */}
          <div className="messages-area">
            {gameState.messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.isSystem ? 'system-message' : 'player-message'}`}>
                {!msg.isSystem && <span className="message-sender">{msg.sender}:</span>}
                <span className="message-text">{msg.text}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 操作区域 */}
          <div className="actions-area">
            {/* 关键词输入 */}
            {isMyTurn && canAct && (
              <form onSubmit={handleSendKeyword} className="action-form">
                <input
                  type="text"
                  placeholder="输入关键词（例如：水潭+乌龟）"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="input-field"
                />
                <button type="submit" className="btn btn-primary">
                  使用关键词
                </button>
              </form>
            )}

            {!canAct && (
              <div className="waiting-unlock">
                <p>⏳ 你当前无法行动，等待队友解救...</p>
              </div>
            )}

            {!isMyTurn && canAct && (
              <div className="waiting-turn">
                <p>⏳ 等待其他玩家的回合...</p>
              </div>
            )}

            {/* 聊天输入 */}
            <form onSubmit={handleSendMessage} className="chat-form">
              <input
                type="text"
                placeholder="发送消息..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field"
              />
              <button type="submit" className="btn btn-chat">
                发送
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      {gamePhase === 'lobby' && renderLobby()}
      {gamePhase === 'waiting' && renderWaiting()}
      {gamePhase === 'game' && renderGame()}
    </div>
  );
}

export default App;
