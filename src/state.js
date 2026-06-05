const state = {
  currentPage: "home",
  userCamp: null,
  votes: { sweet: 12580, salty: 12845 },
  myStickers: [],
  username: "",
  stickerGenerating: false,
  userPhotoBase64: "",
  showGameReturnTip: false,
  scores: {
    currentGame: 0,
    highScore: parseInt(localStorage.getItem("dragon_boat_high_score") || "0", 10)
  }
};

const listeners = [];

function subscribeState(listener) {
  listeners.push(listener);
}

function notifyStateChange() {
  listeners.forEach(fn => fn(state));
}

// Fetch Initial Vote Counts
async function fetchVotes() {
  try {
    const res = await fetch("/api/votes");
    if (res.ok) {
      state.votes = await res.json();
      notifyStateChange();
    }
  } catch (err) {
    console.error("Failed to fetch votes:", err);
  }
}

// Cast Vote
async function castVote(camp) {
  state.userCamp = camp;
  notifyStateChange();

  try {
    const res = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ camp })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        state.votes = data.votes;
        notifyStateChange();
      }
    }
  } catch (err) {
    console.error("Failed to cast vote:", err);
    if (camp === "sweet") state.votes.sweet += 1;
    else state.votes.salty += 1;
    notifyStateChange();
  }
}

// Local Fallbacks Data for offline dynamic simulation
const LOCAL_TEMPLATES = {
  sweet: [
    {
      title: "蜜糖红豆追魂刺",
      declaration: "若能捍卫白糖的尊严，哪怕汨罗江里也泛着甜！",
      funnyAnalysis: "少侠印堂隐现一缕绛红之气，此乃蜜枣红光。端午时节，必定有甜美大福相伴，能克尽一切咸苦邪祟！"
    },
    {
      title: "八宝莲子软糯仙君",
      declaration: "世间浮躁，唯有在满口软糯与蜜香中，方可体味端午的温存与雅致！",
      funnyAnalysis: "少侠目含春水，气质端庄，和清爽而甜过初恋的八宝莲子粽简直是命中注定的天作之合！"
    },
    {
      title: "万物皆甜神隐掌门",
      declaration: "谁敢说甜粽只配当点心？我们甜粽党一统江湖，誓将蜜香洒满汨罗江！",
      funnyAnalysis: "你的眼神闪烁着傲岸与睿智的光芒，说明体内经络已被清甜糯米层层淬炼，自愈力和抗压值点满！"
    },
    {
      title: "赤豆蜜枣九段狂战士",
      declaration: "生活已经够苦了，吃粽子当然要甜到心里去！红白糖万岁！",
      funnyAnalysis: "从你红润饱满的面色来看，你血管里流淌的必定是纯正的糖分。端午期间，财运与福运一甜到底！"
    },
    {
      title: "冰晶糖霜穿云箭",
      declaration: "蜜枣藏心，红豆生情，唯有极致的甘甜，才是端午唯一的圣律！",
      funnyAnalysis: "天庭饱满，双颊带笑。生来就具有无与伦比的甜美亲和力，乃是端午时节不可多得的吉祥元气化身！"
    }
  ],
  salty: [
    {
      title: "金沙蛋黄劈风斩",
      declaration: "五花肉 and 咸蛋黄，才是汨罗江最闪耀的龙晶！",
      funnyAnalysis: "阁下双目有神，太阳穴隐隐突起，眉宇间有一股极其霸道的咸鱼翻身... 咳，是咸鲜酱香正气，定能劈风斩浪！"
    },
    {
      title: "五花极品咸肉大将军",
      declaration: "香气裹在猪肉中，油脂渗入糯米里！咸香油润，这才是端午的铁血浪漫！",
      funnyAnalysis: "浑身散发着纯正的肉食系威严！面相显示你性格雷厉风行，做事稳健丰腴，如同分量十足的肉粽，大富大贵！"
    },
    {
      title: "山珍海味咸香特工",
      declaration: "板栗菌菇加鲜肉，层次丰富到尖叫！咸粽是艺术，甜粽不过是水稻的敷衍！",
      funnyAnalysis: "面相显示阁下极其注重品质，精神面貌富有层次感。只有馅料爆棚的极品五花肉粽，才能填补你挑剔的胃！"
    },
    {
      title: "金牌咸蛋黄破浪斩",
      declaration: "无蛋黄，不端午！那一抹沙沙的咸，才是撬动汨罗江灵魂的黄金支点！",
      funnyAnalysis: "少侠目光深邃且意志极其沉稳，对热爱的事物有着金子般坚定的执念，犹如那一颗起沙流油的咸蛋黄！"
    },
    {
      title: "黑松露咸肉至尊尊者",
      declaration: "咸鲜入骨，酱香弥漫，才是对端午英魂最热烈、最饱满的铁血向往！",
      funnyAnalysis: "面容线条冷峻刚毅，自带大侠骨气。阁下的坚强意志就如同极品黑松露肉粽，骨骼清奇，品级极高！"
    }
  ]
};

function getStringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Generate Personalized Expression Sticker (Pure Frontend Simulation)
async function generateSticker(username, photoBase64) {
  if (!state.userCamp) return null;
  state.username = username || "端午少侠";
  state.stickerGenerating = true;
  notifyStateChange();

  // Simulate an 800ms thinking delay for aesthetic realism
  await new Promise(resolve => setTimeout(resolve, 800));

  const targetCamp = state.userCamp === "sweet" ? "sweet" : "salty";
  const list = LOCAL_TEMPLATES[targetCamp];
  
  // Hash the user's name to give them a deterministic custom sticker
  const hashVal = getStringHash(state.username);
  const item = list[hashVal % list.length];

  const newSticker = {
    id: Date.now().toString(),
    username: state.username,
    camp: state.userCamp,
    title: item.title,
    declaration: item.declaration,
    funnyAnalysis: item.funnyAnalysis,
    avatarUrl: photoBase64 || "",
    createdAt: Date.now()
  };

  state.myStickers.unshift(newSticker);
  try {
    localStorage.setItem("my_zongzi_stickers", JSON.stringify(state.myStickers));
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
  }

  state.stickerGenerating = false;
  notifyStateChange();
  return newSticker;
}

// Load saved stickers from LocalStorage
function loadSavedStickers() {
  try {
    const raw = localStorage.getItem("my_zongzi_stickers");
    if (raw) {
      state.myStickers = JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error loading saved stickers:", err);
  }
}

// Update game high scores
function updateGameScore(score) {
  state.scores.currentGame = score;
  if (score > state.scores.highScore) {
    state.scores.highScore = score;
    localStorage.setItem("dragon_boat_high_score", score.toString());
  }
  notifyStateChange();
}
