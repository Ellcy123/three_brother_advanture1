// 游戏数据配置
const gameData = {
  // 初始角色配置
  roles: {
    player1: { name: '玩家1', animal: '乌龟', initialHp: 8, canAct: true },
    player2: { name: '玩家2', animal: '猫', initialHp: 8, canAct: false },
    player3: { name: '玩家3', animal: '狗', initialHp: 8, canAct: false }
  },

  // 初始道具和区域
  initialItems: ['水潭', '行李箱', '衣柜'],
  
  // 密室解谜的所有关键词组合效果
  keywordEffects: {
    // 水潭区域
    '水潭+乌龟': {
      text: '你潜入水中获得了一个木盒，水下似乎还有其他物品但无法拿取。',
      effects: { addItems: ['木盒'] }
    },
    '水潭+猫': {
      text: '你跳入水中（不会游泳），因为"要面子"未呼救。',
      effects: { player2Hp: -1 }
    },
    '水潭+狗': {
      text: '你从水潭中捞起一个显示器，摸起来感觉"凑凑的"。',
      effects: { addItems: ['显示器'] }
    },
    '水潭+行李箱': {
      text: '你将行李箱做成了"梅利号"船，船沉了之后又取回了行李箱。',
      effects: {}
    },
    '水潭+衣柜': {
      text: '搬衣柜时不小心碰到头，你意识到这个世界是有引力的。',
      effects: { currentPlayerHp: -1 }
    },
    '水潭+显示器': {
      text: '你把显示器扔回水潭，它消失了。',
      effects: { removeItems: ['显示器'] }
    },
    '水潭+电脑': {
      text: '电脑入水后出现了河神！河神问你掉的是什么。如实回答后，你的生命值+1。',
      effects: { currentPlayerHp: 1 }
    },
    '水潭+钥匙': {
      text: '你用钥匙打水漂，其他玩家在背后吐槽你"智力不健全"。',
      effects: {}
    },
    '水潭+囚笼': {
      text: '你试图浸泡囚笼，被里面的狗咬伤。',
      effects: { currentPlayerHp: -2 }
    },
    '水潭+囚笼_后续': {
      text: '囚笼入水后出现河神，但河神打了你一耳光。',
      effects: { currentPlayerHp: -1 }
    },
    '水潭+花瓶': {
      text: '你饮用了花瓶内带细菌的水，得了肠胃炎。',
      effects: { currentPlayerHp: -1 }
    },
    '水潭+木盒': {
      text: '木盒被扔回水潭后消失了。',
      effects: { removeItems: ['木盒'] }
    },

    // 行李箱区域
    '行李箱+乌龟': {
      text: '行李箱有三位初始密码（000）。主持人帮你解锁后，救出了被困的猫！猫恢复了行动能力。',
      effects: { unlockPlayer: 'player2' }
    },
    '行李箱+猫': {
      text: '你撕烂了行李箱，获得了里面的钥匙。',
      effects: { addItems: ['钥匙'] }
    },
    '行李箱+狗': {
      text: '你在行李箱上做了标记，不过效果未知。',
      effects: {}
    },
    '行李箱+显示器': {
      text: '你的组合被吐槽"智商异于常人"，建议你停手。',
      effects: {}
    },
    '行李箱+电脑': {
      text: '你被吐槽"打算出差吗"，建议去医院检查一下。',
      effects: {}
    },
    '行李箱+钥匙': {
      text: '钥匙放回行李箱后消失了。（下次触发关键词时会提醒你）',
      effects: { removeItems: ['钥匙'] }
    },
    '行李箱+囚笼': {
      text: '你用行李箱砸囚笼想救出狗，但不慎砸伤了狗。',
      effects: { player3Hp: -1 }
    },
    '行李箱+囚笼_后续': {
      text: '你将行李箱锁入囚笼，认为这样"更安全"。',
      effects: {}
    },
    '行李箱+衣柜': {
      text: '你将行李箱放入衣柜，打扫后发现这并非自己的房间。',
      effects: {}
    },
    '行李箱+花瓶': {
      text: '你将花瓶误认作青花瓷装入，但被指出仅值20元，建议放弃鉴宝。',
      effects: {}
    },
    '行李箱+木盒': {
      text: '因为同情木盒"不自由"，你将它锁进了行李箱。',
      effects: {}
    },

    // 衣柜区域
    '衣柜+乌龟': {
      text: '你在衣柜下方发现了一个按钮，打开后出现了小房间！房间内有囚笼、狗、花瓶、电脑，出口门需要四位密码。',
      effects: { addItems: ['囚笼', '花瓶', '电脑'], unlockArea: '小房间' }
    },
    '衣柜+猫': {
      text: '你在衣柜顶部发现了字母"C"。',
      effects: { addLetter: 'C' }
    },
    '衣柜+狗': {
      text: '你在衣柜上做了标记，不过效果未知。',
      effects: {}
    },
    '衣柜+行李箱': {
      text: '你将行李箱放入衣柜，打扫后发现这并非自己的房间。',
      effects: {}
    },
    '衣柜+水潭': {
      text: '搬衣柜时不小心碰到头，你意识到这个世界是有引力的。',
      effects: { currentPlayerHp: -1 }
    },
    '衣柜+显示器': {
      text: '你的组合触发了"作者崇拜"，获得提醒："行李箱+显示器"。',
      effects: {}
    },
    '衣柜+电脑': {
      text: '你将电脑放入衣柜开机，没有效果，被其他玩家嘲笑了。',
      effects: {}
    },
    '衣柜+钥匙': {
      text: '你打开了衣柜暗格，获得红水晶心！食用后生命值+1。（钥匙可复用）',
      effects: { currentPlayerHp: 1 }
    },
    '衣柜+囚笼': {
      text: '你将囚笼锁入衣柜，被里面的狗咬伤。',
      effects: { currentPlayerHp: -2 }
    },
    '衣柜+囚笼_后续': {
      text: '你给囚笼内的狗穿上衣服（不合身），被其他玩家疏远了。',
      effects: {}
    },
    '衣柜+花瓶': {
      text: '你给花瓶穿上衣服（不合身），被其他玩家疏远了。',
      effects: {}
    },
    '衣柜+木盒': {
      text: '你将木盒放入衣柜，讲了个冷笑话导致其他玩家冻感冒。',
      effects: { allPlayersHp: -0.5 }
    },

    // 木盒区域
    '木盒+乌龟': {
      text: '你无法打开木盒。',
      effects: {}
    },
    '木盒+猫': {
      text: '你无法打开木盒。',
      effects: {}
    },
    '木盒+狗': {
      text: '你咬开了木盒，获得字条"E"。',
      effects: { addLetter: 'E' }
    },
    '木盒+水潭': {
      text: '木盒被扔回水潭后消失了。',
      effects: { removeItems: ['木盒'] }
    },
    '木盒+行李箱': {
      text: '木盒被锁进了行李箱。',
      effects: {}
    },
    '木盒+衣柜': {
      text: '木盒被放入衣柜，触发冷笑话导致其他玩家生命值-0.5。',
      effects: { allPlayersHp: -0.5 }
    },
    '木盒+显示器': {
      text: '木盒砸坏了显示器。（备注：显示器无法使用，密码需"瞎猜"）',
      effects: { removeItems: ['显示器'], markBroken: '显示器' }
    },
    '木盒+电脑': {
      text: '没有效果。',
      effects: {}
    },
    '木盒+钥匙': {
      text: '钥匙型号不匹配，无法打开木盒。',
      effects: {}
    },
    '木盒+囚笼': {
      text: '你将木盒给了狗，狗咬开后获得字条"E"。',
      effects: { addLetter: 'E' }
    },
    '木盒+囚笼_后续': {
      text: '你将木盒关入囚笼，被其他玩家吐槽了。',
      effects: {}
    },
    '木盒+花瓶': {
      text: '花瓶砸木盒后碎裂，获得字母"O"。（备注：花瓶无法使用）',
      effects: { addLetter: 'O', removeItems: ['花瓶'], markBroken: '花瓶' }
    },

    // 电脑区域
    '电脑+猫': {
      text: '你发现电脑已经损坏，无法维修。',
      effects: {}
    },
    '电脑+乌龟': {
      text: '你发现电脑已经损坏，无法维修。',
      effects: {}
    },
    '电脑+狗': {
      text: '你在电脑上做了标记，不过效果未知。',
      effects: {}
    },
    '电脑+水潭': {
      text: '电脑入水后出现了河神！如实回答后生命值+1。',
      effects: { currentPlayerHp: 1 }
    },
    '电脑+行李箱': {
      text: '你被吐槽"打算出差吗"，建议去医院检查。',
      effects: {}
    },
    '电脑+衣柜': {
      text: '你将电脑放入衣柜开机，没有效果，被其他玩家嘲笑了。',
      effects: {}
    },
    '电脑+木盒': {
      text: '没有效果。',
      effects: {}
    },
    '电脑+钥匙': {
      text: '钥匙插入电脑后没有效果。',
      effects: {}
    },
    '电脑+囚笼': {
      text: '你将电脑给狗玩，狗陷入了沉思。',
      effects: {}
    },
    '电脑+囚笼_后续': {
      text: '你将电脑关入囚笼，命名为"赛博监狱"。',
      effects: {}
    },
    '电脑+花瓶': {
      text: '你用花瓶砸电脑，花瓶碎裂、手划伤，获得字母"O"。',
      effects: { addLetter: 'O', currentPlayerHp: -1, removeItems: ['花瓶'], markBroken: '花瓶' }
    },
    '电脑+花瓶_密码后': {
      text: '你砸电脑获得字母"O"，同时获得"跳关卡卡"！（最后关卡可用）',
      effects: { addLetter: 'O', addItem: '跳关卡卡' }
    },

    // 钥匙区域
    '钥匙+狗': {
      text: '你将钥匙含在嘴里（个人习惯）。',
      effects: {}
    },
    '钥匙+猫': {
      text: '你用钥匙挠后背，体感舒适。',
      effects: {}
    },
    '钥匙+乌龟': {
      text: '你认为钥匙是用于打开"桌扇门"的。',
      effects: {}
    },
    '钥匙+水潭': {
      text: '你用钥匙打水漂，被其他玩家背后吐槽"智力不健全"。',
      effects: {}
    },
    '钥匙+行李箱': {
      text: '钥匙放回行李箱后消失了。（下次触发关键词时会提醒你）',
      effects: { removeItems: ['钥匙'] }
    },
    '钥匙+衣柜': {
      text: '你打开了衣柜暗格，获得红水晶心！食用后生命值+1。（钥匙可复用）',
      effects: { currentPlayerHp: 1 }
    },
    '钥匙+木盒': {
      text: '钥匙型号不匹配，无法打开木盒。',
      effects: {}
    },
    '钥匙+电脑': {
      text: '钥匙插入电脑后没有效果。',
      effects: {}
    },
    '钥匙+显示器': {
      text: '你用钥匙砸显示器，显示器损坏了。（备注：显示器无法使用，密码需"瞎猜"）',
      effects: { removeItems: ['显示器'], markBroken: '显示器' }
    },
    '钥匙+囚笼': {
      text: '你打开了囚笼，狗恢复了行动能力！',
      effects: { unlockPlayer: 'player3' }
    },
    '钥匙+囚笼_后续': {
      text: '你将囚笼重新锁上了。',
      effects: {}
    },
    '钥匙+花瓶': {
      text: '你试图用钥匙打开花瓶，被建议去医院检查。',
      effects: {}
    },

    // 显示器区域
    '显示器+猫': {
      text: '你砸坏了显示器，它消失了。（备注：显示器无法使用，密码需"瞎猜"）',
      effects: { removeItems: ['显示器'], markBroken: '显示器' }
    },
    '显示器+狗': {
      text: '你发现显示器防水，性能优于当前电脑。',
      effects: {}
    },
    '显示器+乌龟': {
      text: '你通过显示器反光"臭美"，生命值+1。',
      effects: { currentPlayerHp: 1 }
    },
    '显示器+水潭': {
      text: '显示器被扔回水潭后消失了。',
      effects: { removeItems: ['显示器'] }
    },
    '显示器+行李箱': {
      text: '获得提醒："显示器+衣柜"。',
      effects: {}
    },
    '显示器+衣柜': {
      text: '你被夸"天才"，触发"作者崇拜"！',
      effects: {}
    },
    '显示器+木盒': {
      text: '被木盒砸坏。（备注：显示器无法使用，密码需"瞎猜"）',
      effects: { removeItems: ['显示器'], markBroken: '显示器' }
    },
    '显示器+电脑': {
      text: '更换显示器后打开电脑，获得字母"H"！',
      effects: { addLetter: 'H' }
    },
    '显示器+钥匙': {
      text: '你用钥匙砸显示器，显示器损坏了。（备注：显示器无法使用，密码需"瞎猜"）',
      effects: { removeItems: ['显示器'], markBroken: '显示器' }
    },
    '显示器+花瓶': {
      text: '获得提醒："显示器+衣柜"。',
      effects: {}
    },

    // 花瓶区域
    '花瓶+猫': {
      text: '你把脑袋探进了花瓶里，观察到瓶内居然有一个字母：O。',
      effects: { addLetter: 'O' }
    },
    '花瓶+狗': {
      text: '你在花瓶上做了标记，不过效果未知。',
      effects: {}
    },
    '花瓶+乌龟': {
      text: '你未发现花瓶的玄机，让其他玩家试试吧。',
      effects: {}
    },
    '花瓶+囚笼': {
      text: '你将花瓶递给狗，狗将其弄坏了。',
      effects: {}
    },
    '花瓶+囚笼_后续': {
      text: '你将花瓶关入囚笼，没有效果（仅被其他玩家嘲笑）。',
      effects: {}
    },

    // 角色互动
    '猫+狗': {
      text: '你嘲讽了狗的身材，二人打了一架，你惨败。',
      effects: { player2Hp: -1 }
    },
    '猫+乌龟': {
      text: '你嘲笑乌龟"长得奇怪"，但乌龟没有理会你。',
      effects: {}
    },
    '狗+乌龟': {
      text: '你感谢乌龟救了自己，约定共同弄清这个处境。',
      effects: {}
    },
    '狗+猫': {
      text: '你们互相感觉"眼熟"，认为有特殊的羁绊。',
      effects: {}
    },
    '乌龟+猫': {
      text: '你督促猫快点行动，猫吐槽你是"装货"。',
      effects: {}
    },
    '乌龟+狗': {
      text: '你教狗强身的方法，狗学会后生命值+1。',
      effects: { player3Hp: 1 }
    },

    // 囚笼相关
    '猫+囚笼': {
      text: '你嘲笑被囚的狗，被狗怒骂了。',
      effects: {}
    },
    '乌龟+囚笼': {
      text: '你安慰狗，说会想办法救他。',
      effects: {}
    },
    '猫+囚笼_后续': {
      text: '你将自己关入囚笼，称"好玩"并让其他人救自己。',
      effects: {}
    },
    '乌龟+囚笼_后续': {
      text: '你检查囚笼下方，获得跳关卡卡！（最后关卡可用）',
      effects: { addItem: '跳关卡卡' }
    },
    '狗+囚笼': {
      text: '你在囚笼上做了标记，不过效果未知。',
      effects: {}
    }
  },

  // 密室密码（用于最终逃脱）
  escapePassword: 'ECHO'
};

module.exports = gameData;
