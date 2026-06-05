let activeBg = null;
let activeGame = null;
let gameTimer = null;
let hasSubmittedVotes = false;

function startBoatGameIframe() {
  state.currentPage = "game-iframe";
  renderUI();
}

// Re-generate visual stickers canvas and export PNG
async function drawStickerCanvasAndSave(sticker, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="p-5 rounded-2xl border bg-stone-900 border-stone-800 text-center relative shadow-2xl max-w-[340px] mx-auto overflow-hidden">
      <!-- Traditional Elegant Background Patterns -->
      <div class="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <!-- Top Camp Bar Indicator -->
      <div class="flex justify-between items-center mb-4 pb-3 border-b border-stone-800/80">
        <span class="text-[10px] font-mono tracking-widest text-stone-500 uppercase">汨罗江端午大典</span>
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-stone-300 ${
          sticker.camp === "sweet" ? "bg-rose-950/80 border border-rose-800 text-rose-300" : "bg-emerald-950/80 border border-emerald-800 text-emerald-300"
        }">
          ${sticker.camp === "sweet" ? "甜 粽 党" : "咸 粽 党"}
        </span>
      </div>

      <!-- Avatar Banner Frame -->
      <div class="relative w-36 h-36 mx-auto mb-4 group">
        <!-- Dragon Scale Frame Borders -->
        <div class="absolute -inset-1 rounded-full bg-gradient-to-tr ${
          sticker.camp === "sweet" ? "from-pink-600 via-amber-400 to-rose-600" : "from-emerald-600 via-yellow-400 to-teal-600"
        } opacity-75 blur-xs"></div>
        
        <div class="relative w-full h-full bg-stone-950 rounded-full overflow-hidden border-2 border-stone-800 flex items-center justify-center">
          ${
            sticker.avatarUrl
              ? `<img src="${sticker.avatarUrl}" class="w-full h-full object-cover scale-102" alt="Avatar" referrerPolicy="no-referrer" />`
              : `<div class="text-3xl">${sticker.camp === "sweet" ? "🍧" : "🥩"}</div>`
          }
        </div>
      </div>

      <!-- Name & Title -->
      <h3 class="text-stone-100 font-bold text-lg font-serif tracking-wide mb-1 flex items-center justify-center gap-1">
        ${sticker.username}
      </h3>
      <div class="inline-block px-3 py-1 bg-stone-950/90 border border-stone-800 rounded-lg text-xs font-bold text-amber-400 tracking-wider font-calligraphy mb-3 shadow">
        称号：${sticker.title}
      </div>

      <!-- Scroll Declaration Banner -->
      <div class="relative px-3 py-3 bg-stone-950/60 rounded-xl border border-stone-800/80 mb-4">
        <span class="absolute top-1 left-2 text-stone-700 text-xs select-none">“</span>
        <p class="text-stone-300 text-xs italic tracking-wider leading-relaxed px-5 py-0.5 select-none font-sans">
          ${sticker.declaration}
        </p>
        <span class="absolute bottom-1 right-2 text-stone-700 text-xs select-none">”</span>
      </div>

      <!-- Funny Facial Feature Analysis -->
      <div class="px-2.5 py-2.5 rounded-lg bg-stone-850/40 text-left border border-white/[0.02]">
        <div class="text-[9px] uppercase tracking-widest text-[#a855f7] font-bold mb-1">🔮 AI 智感面相剖析</div>
        <p class="text-[11px] text-stone-400 leading-snug">${sticker.funnyAnalysis}</p>
      </div>

      <!-- Bottom Traditional Seal Stamp -->
      <div class="mt-4 pt-3 border-t border-stone-800/50 flex justify-between items-center text-[10px] text-stone-500">
        <span>签发日期：端午大吉</span>
        <div class="w-7 h-7 border border-red-800/60 rotate-6 rounded-md flex items-center justify-center font-bold text-[9px] text-red-600 font-calligraphy tracking-tighter cursor-default select-none bg-red-950/20 select-none">
          粽情
        </div>
      </div>
    </div>
  `;
}

const QUIZ_QUESTIONS = {
  sweet: [
    {
      question: "甜粽的“黄金吃法”应当蘸什么？",
      options: [
        { key: "A", text: "尊贵的白砂糖（这才是甜食党唯一圣律！）", isCorrect: true },
        { key: "B", text: "老陈醋（魔鬼行为，拖出去！）", isCorrect: false }
      ],
      desc: "没错！经典白砂糖与软糯糯米的绝妙酥沙感，才是甜粽的最佳伴侣！"
    },
    {
      question: "在甜粽中，哪种馅料被誉为“甜中之魂”？",
      options: [
        { key: "A", text: "蜜香红豆与起沙蜜枣（甜过初恋，糯到心底！）", isCorrect: true },
        { key: "B", text: "纯白肥肉（那是隔壁咸粽的肉食浪漫！）", isCorrect: false }
      ],
      desc: "回答正确！蜜枣红豆带来极其温柔的甜蜜，甜食党听到都留下了感动的眼泪。"
    },
    {
      question: "将甜粽放凉了之后吃，口感会有什么神奇变化？",
      options: [
        { key: "A", text: "Q弹软糯，仿佛在吃神仙冰凉甜点！", isCorrect: true },
        { key: "B", text: "硬如钢铁，可以用来锤核桃砸钉子", isCorrect: false }
      ],
      desc: "明智的选择！冰镇或放凉的甜粽口感极为柔韧紧实，是不可多得的消暑良品。"
    },
    {
      question: "端午节吃甜粽，相传能带来什么民俗玄学好运？",
      options: [
        { key: "A", text: "“粽”情甜蜜，日子甜美，金榜高“粽”！", isCorrect: true },
        { key: "B", text: "体能大涨，可以徒步绕行赤道两圈", isCorrect: false }
      ],
      desc: "太赞了！“高粽”谐音“高中”，香甜软糯的端午甜粽寓意福星高照、喜事连连！"
    },
    {
      question: "在甜粽拥护者眼里，将浓鲜咸五花肉放进粽皮是何等行为？",
      options: [
        { key: "A", text: "一场离经叛道的酱油魔法陷阱！", isCorrect: true },
        { key: "B", text: "完全合理，甜咸都爱", isCorrect: false }
      ],
      desc: "有趣！在原教旨甜粽党看来，端午必须是纯粹甘甜，咸粽那是一本正经的“肉包子大变装”！"
    }
  ],
  salty: [
    {
      question: "咸粽派最核心、最不可妥协的“铁血真理”是什么？",
      options: [
        { key: "A", text: "极品咸蛋黄 + 爆汁五花肉（油脂深入米粒，鲜香绝顶！）", isCorrect: true },
        { key: "B", text: "蘸着浓稠炼乳当下午茶小点心（这是对绝美肉香的奇袭！）", isCorrect: false }
      ],
      desc: "完全正确！汪着油的五花肉配上沙软蛋黄，是刻在咸党体内的无上荣光！"
    },
    {
      question: "咸粽里的极品五花肉，最极致美味的境界是什么？",
      options: [
        { key: "A", text: "肥肉蒸至完全化开，温润油脂彻底浸透每一粒糯米", isCorrect: true },
        { key: "B", text: "整块干如牛肉干，塞在牙缝里拽不出来", isCorrect: false }
      ],
      desc: "肉食美学满分！肥瘦相间，入口酥烂，油脂和米饭融为一体才是咸粽的最高礼赞。"
    },
    {
      question: "对于咸粽派的大侠而言，粽子里不加酱油意味着什么？",
      options: [
        { key: "A", text: "失去了灵魂保护色，这简直不能称之为粽！", isCorrect: true },
        { key: "B", text: "健康减盐，虽然看起来有点苍白", isCorrect: false }
      ],
      desc: "正解！酱香色泽带来浓厚的视觉与味觉双重震撼，是必不可少的仪式感。"
    },
    {
      question: "吃咸肉蛋黄粽时，最让人极其惊艳的“金光宝藏”在何处？",
      options: [
        { key: "A", text: "咬到那一颗金黄起沙、流油烫口的极品咸蛋黄！", isCorrect: true },
        { key: "B", text: "咬到了外层坚硬厚实的干枯老粽叶", isCorrect: false }
      ],
      desc: "英雄所见略同！那一颗沙软冒油的蛋黄在口中爆开，任何烦恼都会一扫而空！"
    },
    {
      question: "咸粽大将军认为，“白糖蘸一切”在端午应该怎么定性？",
      options: [
        { key: "A", text: "甜党最后的尊严，但唯有酱香咸粽能主宰江山！", isCorrect: true },
        { key: "B", text: "甘拜下风，甜的更好吃", isCorrect: false }
      ],
      desc: "太霸气了！甜粽虽有甜意，但能作为能量担当、扛起端午节饱腹满足感大旗的，还得是肉粽大将军！"
    }
  ]
};

// 1. Home Page UI Render Function
function renderHome(appContainer) {
  const sweetVotes = state.votes.sweet;
  const saltyVotes = state.votes.salty;
  const total = sweetVotes + saltyVotes || 1;
  const sweetPercent = Math.round((sweetVotes / total) * 100);
  const saltyPercent = 100 - sweetPercent;

  if (!state.userCamp) {
    // Stage 1: No camp chosen yet. Show simple invitation with clean design.
    appContainer.innerHTML = `
      <!-- Top Chinese Calligraphy Banner Title -->
      <div class="w-full max-w-md mx-auto pt-16 px-6 flex flex-col items-center text-center z-10 relative">
        <div class="mb-2 px-3 py-0.5 rounded-full border border-amber-600/30 bg-amber-950/20 text-[10px] tracking-widest text-amber-500 uppercase font-mono shadow-xs">
          端 午 创 意 国 风 擂 台
        </div>
        <h1 class="text-3xl sm:text-4xl font-black font-calligraphy text-amber-100 mt-2 select-none">
          端 午 终 极 难 题
        </h1>
        <p class="text-xs sm:text-sm text-stone-400 mt-2.5 max-w-[280px]">
          端午节你是傲立江湖的甜党，还是热血偏执的咸党？请投下神圣的一票，捍卫舌尖上的荣耀！
        </p>
      </div>

      <!-- Action Choice Panel Buttons -->
      <div class="w-full max-w-sm mx-auto px-6 mt-12 mb-10 z-10 relative flex-1 flex flex-col justify-center gap-5">
        <button id="btn-home-sweet" class="w-full py-4 rounded-xl font-bold text-sm tracking-wider bg-rose-600 hover:bg-rose-500 shadow-lg text-rose-50 transition active:scale-[0.98] cursor-pointer pointer-events-auto border-t border-rose-400/20 shadow-rose-950/40 relative group overflow-hidden">
          <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition duration-150"></div>
          🏮 加入 甜 粽 刺客 团
        </button>

        <button id="btn-home-salty" class="w-full py-4 rounded-xl font-bold text-sm tracking-wider bg-emerald-600 hover:bg-emerald-500 shadow-lg text-emerald-50 transition active:scale-[0.98] cursor-pointer pointer-events-auto border-t border-emerald-400/20 shadow-emerald-950/40 relative group overflow-hidden">
          <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition duration-150"></div>
          ⚔️ 投奔 咸 粽 铁 血 军
        </button>
      </div>
    `;

    // Bind Choice Buttons & transition to Quiz page instead of casting vote immediately
    document.getElementById("btn-home-sweet")?.addEventListener("click", () => {
      state.selectedCampTemp = "sweet";
      state.quizCurrentIndex = 0;
      state.quizScore = 0;
      state.currentPage = "quiz";
      renderUI();
    });

    document.getElementById("btn-home-salty")?.addEventListener("click", () => {
      state.selectedCampTemp = "salty";
      state.quizCurrentIndex = 0;
      state.quizScore = 0;
      state.currentPage = "quiz";
      renderUI();
    });

  } else {
    // Stage 2: Chosen! Show layout with live counts, percentage & progress bar.
    // Determine leading status
    const isSweetLeading = sweetVotes >= saltyVotes;
    const isSaltyLeading = saltyVotes >= sweetVotes;
    const isUserLeading = (state.userCamp === "sweet" && isSweetLeading) || (state.userCamp === "salty" && isSaltyLeading);
    const hasStickerPermissions = isUserLeading || state.stickerUnlocked;

    appContainer.innerHTML = `
      <!-- Top Chinese Calligraphy Banner Title -->
      <div class="w-full max-w-md mx-auto pt-10 px-6 flex flex-col items-center text-center z-10 relative">
        <div class="mb-1.5 px-3 py-0.5 rounded-full border ${
          state.userCamp === "sweet" ? "border-rose-600/30 bg-rose-950/20 text-rose-400" : "border-emerald-600/30 bg-emerald-950/20 text-emerald-400"
        } text-[10px] tracking-widest uppercase font-mono shadow-xs">
          ${state.userCamp === "sweet" ? "您已加入甜粽刺客团 🏮" : "您已投奔咸粽铁血军 ⚔️"}
        </div>
      </div>

      <!-- Active Voting Box Section -->
      <div class="w-full max-w-sm mx-auto px-6 mt-6 z-10 relative flex-1 flex flex-col justify-center gap-6">
        <!-- 甜咸比分对垒图 -->
        <div class="bg-stone-900/80 border border-stone-850 rounded-2xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div class="flex justify-between items-center mb-4">
            <div class="flex flex-col items-start ${state.userCamp === "sweet" ? "ring-2 ring-rose-500/20 p-1.5 rounded-lg bg-rose-950/10" : ""}">
              <span class="text-[11px] text-stone-400 font-bold flex items-center gap-0.5">
                甜粽守城者 ${state.userCamp === "sweet" ? "⭐" : ""}
              </span>
              <span class="text-lg font-bold font-mono text-rose-500 mt-0.5" id="val-sweet">${sweetVotes.toLocaleString()}</span>
            </div>

            <!-- Dual Seal Badge -->
            <div class="w-7 h-7 rounded-full border border-red-500/20 flex items-center justify-center font-calligraphy text-xs text-red-600 font-bold bg-amber-950/5 select-none rotate-12">
              决
            </div>

            <div class="flex flex-col items-end ${state.userCamp === "salty" ? "ring-2 ring-emerald-500/20 p-1.5 rounded-lg bg-emerald-950/10" : ""}">
              <span class="text-[11px] text-stone-400 font-bold flex items-center gap-0.5">
                ${state.userCamp === "salty" ? "⭐" : ""} 咸粽主宰军
              </span>
              <span class="text-lg font-bold font-mono text-emerald-400 mt-0.5" id="val-salty">${saltyVotes.toLocaleString()}</span>
            </div>
          </div>

          <!-- Custom Styled Progress Grid Tracker -->
          <div class="w-full h-7 bg-stone-950 rounded-xl relative overflow-hidden flex shadow-inner">
            <div class="h-full bg-gradient-to-r from-red-600 to-rose-500 duration-500 transition-all flex items-center px-2 text-[10px] font-bold text-rose-100" style="width: ${sweetPercent}%" id="bar-sweet">
              ${sweetPercent}%
            </div>
            <div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 duration-500 transition-all flex items-center justify-end px-2 text-[10px] font-bold text-emerald-100" style="width: ${saltyPercent}%" id="bar-salty">
              ${saltyPercent}%
            </div>
          </div>
          
          <!-- Legend labels -->
          <div class="flex justify-between text-[9px] text-stone-500 mt-2 px-1">
            <span>白糖蜜枣红豆，清甜治愈</span>
            <span>五花咸蛋黄，丰腴鲜润</span>
          </div>
        </div>

        <!-- Conditional generation buttons based on Unlock status -->
        <div class="flex flex-col gap-3">
          ${
            hasStickerPermissions
              ? `
              <div class="text-[11px] text-emerald-400 font-medium bg-emerald-950/30 border border-emerald-800/30 px-3.5 py-3 rounded-xl text-center leading-relaxed">
                🎉 恭喜少侠！专属土味表情包定制特权已成功解锁！
              </div>
              
              <!-- Direct camera/photo input hidden selector -->
              <input type="file" id="direct-image-upload" accept="image/*" class="hidden" />

              <button id="btn-goto-generate" class="w-full py-4 rounded-xl font-bold text-sm tracking-widest bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white transition active:scale-[0.98] cursor-pointer shadow-lg shadow-indigo-950/40 border-t border-white/10 relative overflow-hidden group">
                <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition duration-150"></div>
                🎭 定制专属表情包
              </button>

              <button id="btn-goto-game-fun" class="w-full py-3.5 rounded-xl border border-amber-600/30 bg-amber-950/10 hover:bg-amber-950/20 text-amber-200 text-xs font-bold tracking-wider transition active:scale-[0.98] cursor-pointer text-center">
                🚣 龙舟竞速挑战
              </button>

              <button id="btn-more-interactions-fun" class="w-full py-3 rounded-xl border border-stone-800/80 bg-stone-950/60 hover:bg-stone-900/80 text-stone-300 text-xs font-bold tracking-wider transition active:scale-[0.98] cursor-pointer text-center mt-1">
                ✨ 参与更多互动
              </button>
            `
              : `
              <div class="text-[11px] text-rose-400 font-medium bg-rose-950/30 border border-rose-800/30 px-3.5 py-3 rounded-xl text-center leading-relaxed">
                <div class="font-bold text-xs text-rose-300 mb-1">🔥 阵营暂时落后</div>
                您拥立的阵营目前积分暂时落后。<br/>通关龙舟竞速挑战，即可解锁专属表情包定制特权！
              </div>

              <button id="btn-goto-game-fight" class="w-full py-4 rounded-xl font-bold text-sm tracking-wide bg-amber-600 hover:bg-amber-500 text-stone-100 shadow-md transition active:scale-[0.98] cursor-pointer pointer-events-auto border-t border-amber-400/20 relative group overflow-hidden">
                <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition duration-150"></div>
                🚣 龙舟竞速挑战
              </button>

              <button id="btn-more-interactions-fight" class="w-full py-3 rounded-xl border border-stone-800/80 bg-stone-950/60 hover:bg-stone-900/80 text-stone-300 text-xs font-bold tracking-wider transition active:scale-[0.98] cursor-pointer text-center mt-1">
                ✨ 参与更多互动
              </button>
            `
          }
        </div>
      </div>
    `;

    // Bind Choice file upload Trigger
    const fileSelector = document.getElementById("direct-image-upload");

    document.getElementById("btn-goto-generate")?.addEventListener("click", () => {
      fileSelector?.click();
    });

    fileSelector?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert("照片不能超过 5MB！请选择较小体积图片。");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result;

        // Custom list based on user choices
        const sweetNames = ["蜜糖少侠", "红豆游侠", "蜜枣剑客", "八宝仙子", "糖霜隐士"];
        const saltyNames = ["蛋黄大侠", "五花狂客", "板栗硬汉", "酱香刺客", "至尊肉圣"];
        const campNames = state.userCamp === "sweet" ? sweetNames : saltyNames;
        const randomName = campNames[Math.floor(Math.random() * campNames.length)];

        // Force overlay loaders
        state.stickerGenerating = true;
        renderModal();

        const sticker = await generateSticker(randomName, base64);
        state.stickerGenerating = false;

        if (sticker) {
          state.showStickersModal = true;
          renderUI();
        } else {
          alert("特签表情包算计错误，请稍后重试！");
          renderUI();
        }
      };
      reader.readAsDataURL(file);
    });

    // Navigation triggers
    document.getElementById("btn-goto-game-fun")?.addEventListener("click", () => {
      startBoatGameIframe();
    });

    document.getElementById("btn-goto-game-fight")?.addEventListener("click", () => {
      startBoatGameIframe();
    });

    document.getElementById("btn-more-interactions-fun")?.addEventListener("click", () => {
      window.open("https://wap.cztv.com/h5/news/10376960", "_blank");
    });

    document.getElementById("btn-more-interactions-fight")?.addEventListener("click", () => {
      window.open("https://wap.cztv.com/h5/news/10376960", "_blank");
    });
  }
}

// 1.5. Interactive Quiz Page UI Render Function
function renderQuiz(appContainer) {
  const currentCamp = state.selectedCampTemp || "sweet";
  const questions = QUIZ_QUESTIONS[currentCamp];
  const questionIndex = state.quizCurrentIndex;
  
  if (questionIndex >= questions.length) {
    // End of quiz: Show result summary card, and allow submitting
    const score = state.quizScore;
    
    appContainer.innerHTML = `
      <div class="w-full max-w-md mx-auto pt-10 px-6 flex flex-col items-center text-center z-10 relative">
        <div class="mb-2 px-3 py-0.5 rounded-full border border-amber-600/30 bg-amber-950/20 text-[10px] tracking-widest text-amber-500 uppercase font-mono shadow-xs animate-pulse">
          五 题 趣 味 答 题 告 捷
        </div>
      </div>

      <div class="w-full max-w-sm mx-auto px-6 mt-6 z-10 relative flex-1 flex flex-col justify-center">
        <div class="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 shadow-2xl text-center backdrop-blur-md relative overflow-hidden">
          <div class="absolute -inset-1 opacity-5 bg-gradient-to-tr from-amber-500 to-yellow-500 blur-xl pointer-events-none"></div>

          <p class="text-xs text-stone-300 leading-relaxed mb-6 font-sans">
            恭喜少侠在端午趣味冷知识试炼中，一共答对了 <span class="text-amber-400 font-bold text-base font-mono">${score}</span> 道题！
            <br/>将直接为本阵营（${currentCamp === "sweet" ? "甜粽刺客团" : "咸粽铁血军"}）累计贡献 <span class="text-emerald-400 font-bold text-sm font-mono">+${score}</span> 票！
          </p>

          <button id="btn-quiz-submit" class="w-full py-4 rounded-xl font-bold text-sm tracking-widest bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-stone-950 transition active:scale-[0.98] cursor-pointer shadow-lg border-t border-amber-400/20">
            加入阵营
          </button>
        </div>
      </div>
    `;
    
    document.getElementById("btn-quiz-submit")?.addEventListener("click", async () => {
      // Show loader
      appContainer.innerHTML = `
        <div class="absolute inset-0 flex flex-col justify-center items-center text-center p-6 bg-stone-950/80">
          <div class="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin mb-4"></div>
          <p class="text-sm text-amber-200 font-bold tracking-wider">正在将积分同步至全网宗盟中...</p>
        </div>
      `;
      
      // Perform voting cast
      await castVote(currentCamp, score);
      
      // Get latest state data and set locks
      const sweetVotes = state.votes.sweet;
      const saltyVotes = state.votes.salty;
      
      state.currentPage = "home";
      renderUI();
    });
    return;
  }
  
  const currentQuestion = questions[questionIndex];
  
  appContainer.innerHTML = `
    <!-- Top Progress Indicators -->
    <div class="w-full max-w-md mx-auto pt-10 px-6 flex flex-col items-center text-center z-10 relative">
      <div class="mb-2 px-3 py-0.5 rounded-full border border-amber-600/30 bg-amber-950/20 text-[10px] tracking-widest text-amber-500 uppercase font-mono shadow-xs">
        端 午 阵 营 趣 味 轻 答 题（${questionIndex + 1} / 5）
      </div>
      <!-- Progress Bar -->
      <div class="w-[180px] h-1 bg-stone-950 rounded-full overflow-hidden mt-1 md:mt-2 border border-stone-850">
        <div class="h-full bg-amber-500 duration-300 transition-all rounded-full" style="width: ${(questionIndex + 1) * 20}%"></div>
      </div>
    </div>

    <!-- Active Question Card -->
    <div class="w-full max-w-sm mx-auto px-6 mt-6 z-10 relative flex-1 flex flex-col justify-center">
      <div id="quiz-card-box" class="bg-stone-900/85 border border-stone-800 rounded-2xl p-5 md:p-6 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
        
        <!-- Question Text Header -->
        <div class="mb-5 md:mb-6">
          <span class="text-[10px] font-bold ${currentCamp === "sweet" ? "text-rose-400 bg-rose-950/40 border border-rose-900/50" : "text-emerald-400 bg-emerald-950/40 border border-emerald-900/50"} px-2.5 py-0.5 rounded-full select-none">
            ${currentCamp === "sweet" ? "🍡 甜粽派" : "🥩 咸粽派"}
          </span>
          <h2 class="text-sm font-serif font-bold text-stone-100 leading-relaxed mt-4">
            ${currentQuestion.question}
          </h2>
        </div>

        <!-- Options List Group -->
        <div class="space-y-3" id="options-group">
          ${currentQuestion.options.map((opt, oIdx) => `
            <button data-idx="${oIdx}" class="btn-quiz-option w-full py-3.5 px-4 rounded-xl text-xs text-left font-medium text-stone-300 border border-stone-800 bg-stone-950/50 hover:bg-stone-850 hover:border-stone-700 transition duration-150 cursor-pointer flex items-start gap-2.5 group relative">
              <span class="font-mono text-amber-500 font-bold bg-amber-950/30 border border-amber-900/30 rounded-md w-5 h-5 flex items-center justify-center text-center shrink-0 group-hover:bg-amber-500 group-hover:text-stone-950 duration-150">${opt.key}</span>
              <span class="leading-relaxed select-none shrink-1">${opt.text}</span>
            </button>
          `).join("")}
        </div>

      </div>
    </div>
  `;
  
  // Bind Quiz Options clicks
  const optionButtons = appContainer.querySelectorAll(".btn-quiz-option");
  optionButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Disable further clicks
      optionButtons.forEach(b => {
        b.setAttribute("disabled", "true");
        b.classList.add("opacity-50", "pointer-events-none");
      });
      
      const idx = parseInt(btn.getAttribute("data-idx"), 10);
      const chosenOpt = currentQuestion.options[idx];
      const isCorrect = chosenOpt.isCorrect;
      
      if (isCorrect) {
        state.quizScore += 1;
        btn.classList.remove("opacity-50", "border-stone-800", "bg-stone-950/50");
        btn.classList.add("border-emerald-600", "bg-emerald-950/20", "opacity-100");
      } else {
        btn.classList.remove("opacity-50", "border-stone-800", "bg-stone-950/50");
        btn.classList.add("border-rose-600", "bg-rose-950/20", "opacity-100");
        
        // Highlight correct button option too
        optionButtons.forEach(b => {
          const bIdx = parseInt(b.getAttribute("data-idx"), 10);
          const otherOpt = currentQuestion.options[bIdx];
          if (otherOpt && otherOpt.isCorrect) {
            b.classList.remove("opacity-50");
            b.classList.add("border-emerald-600/40", "bg-emerald-950/10", "opacity-100");
          }
        });
      }
      
      // Auto-advance to the next question after a very brief delay
      setTimeout(() => {
        state.quizCurrentIndex += 1;
        renderUI();
      }, 800);
    });
  });
}

function renderModal() {
  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  // Reset inline styles
  modalContainer.style.cssText = "";

  if (state.showRulesModal) {
    modalContainer.className = "fixed pointer-events-auto flex items-center justify-center animate-in fade-in duration-200";
    modalContainer.style.cssText = "width: 100%; height: 100%; z-index: 999999; background: rgba(0,0,0,0.65);";
    modalContainer.innerHTML = `
      <!-- Backdrop container -->
      <div id="rules-backdrop" class="fixed inset-0 w-full h-full flex items-center justify-center" style="background: rgba(0, 0, 0, 0.1);">
        <!-- Inner child popup container, beautifully centered -->
        <div class="bg-stone-900 border border-stone-800 rounded-2xl w-[90%] max-w-[320px] p-6 shadow-2xl relative text-left flex flex-col transform scale-100 transition-all pointer-events-auto max-h-[80vh] overflow-hidden">
          
          <!-- Close button -->
          <button id="btn-close-rules" class="absolute top-4 right-4 text-stone-400 hover:text-stone-200 text-xl font-bold cursor-pointer w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-800/50 transition">
            &times;
          </button>

          <!-- Title -->
          <h3 class="text-sm font-bold font-serif text-amber-200 tracking-wider mb-4 flex items-center gap-1.5 shadow-xs shrink-0 select-none">
            🏮 活动规则
          </h3>

          <!-- Rules Content (Scrollable if needed) -->
          <div class="flex-1 overflow-y-auto space-y-3.5 pr-1 text-[11px] text-stone-300 leading-relaxed font-sans scrollbar-thin scrollbar-thumb-stone-800 animate-in fade-in duration-300">
            <div>
              <p class="text-stone-300"><span class="font-bold text-amber-400">1.</span> 选择甜粽/咸粽任一阵营，作答对应阵营5道专属题目，答对1题积1分，积分计入阵营总票数；</p>
            </div>
            
            <div>
              <p class="text-stone-300"><span class="font-bold text-amber-400">2.</span> 答题结束实时显示双方票数、占比数据，阵营领先可直接解锁头像专属土味表情包制作机会；</p>
            </div>

            <div>
              <p class="text-stone-300"><span class="font-bold text-amber-400">3.</span> 阵营落后可进行龙舟竞速挑战，通关成功即可解锁表情包定制资格；</p>
            </div>

            <div>
              <p class="text-stone-300"><span class="font-bold text-amber-400">4.</span> 微信端一次表情包生成机会，中国蓝新闻客户端不限次数；</p>
            </div>
          </div>

          <!-- Bottom Action button -->
          <button id="btn-close-rules-bottom" class="w-full mt-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs tracking-widest cursor-pointer transition-all active:scale-[0.98] shrink-0">
            我知道了
          </button>
        </div>
      </div>
    `;

    const closeRulesModal = () => {
      state.showRulesModal = false;
      renderModal();
    };

    document.getElementById("btn-close-rules")?.addEventListener("click", closeRulesModal);
    document.getElementById("btn-close-rules-bottom")?.addEventListener("click", closeRulesModal);
    document.getElementById("rules-backdrop")?.addEventListener("click", (e) => {
      if (e.target === document.getElementById("rules-backdrop")) {
        closeRulesModal();
      }
    });
    return;
  }

  if (state.showGameReturnTip) {
    modalContainer.className = "fixed pointer-events-auto flex items-center justify-center";
    modalContainer.style.cssText = "width: 100%; height: 100%; z-index: 999999; background: rgba(0,0,0,0.6);";
    modalContainer.innerHTML = `
      <!-- Parent custom fixed full-screen outer container with requested transparent backdrop -->
      <div id="game-return-backdrop" class="fixed inset-0 w-full h-full flex items-center justify-center" style="background: rgba(0, 0, 0, 0.1);">
        <!-- Inner child popup container, beautifully centered -->
        <div class="bg-stone-900 border border-stone-800 rounded-2xl w-[85%] max-w-[280px] p-6 shadow-2xl relative text-center flex flex-col items-center justify-center transform scale-100 transition-all pointer-events-auto">
          
          <!-- Elegant top icon -->
          <div class="w-14 h-14 rounded-full bg-amber-950/45 border border-amber-500/30 flex items-center justify-center mb-4">
            <span class="text-2xl select-none">🏆</span>
          </div>

          <!-- Title -->
          <h3 class="text-sm font-bold font-serif text-amber-200 tracking-wider mb-5">
            擂鼓助威告捷
          </h3>

          <!-- Action button -->
          <button id="btn-close-game-return-tip" class="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs tracking-widest cursor-pointer transition-all active:scale-[0.98]">
            我知道了
          </button>
        </div>
      </div>
    `;

    document.getElementById("btn-close-game-return-tip")?.addEventListener("click", () => {
      state.showGameReturnTip = false;
      renderModal();
    });

    document.getElementById("game-return-backdrop")?.addEventListener("click", (e) => {
      if (e.target === document.getElementById("game-return-backdrop")) {
        state.showGameReturnTip = false;
        renderModal();
      }
    });
    return;
  }

  if (state.stickerGenerating) {
    modalContainer.className = "absolute inset-0 z-40 pointer-events-auto flex items-center justify-center bg-stone-950/95";
    modalContainer.innerHTML = `
      <div class="absolute inset-0 bg-stone-950/90 z-30 backdrop-blur-md flex flex-col justify-center items-center p-6 text-center animate-in fade-in duration-200">
        <!-- Animated icon -->
        <div class="relative w-20 h-20 mb-6">
          <div class="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-pulse"></div>
          <div class="absolute inset-0 rounded-full border-4 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div class="absolute inset-0 flex items-center justify-center text-3xl animate-bounce">
            ${state.userCamp === "sweet" ? "🍡" : "🥩"}
          </div>
        </div>

        <h3 class="text-base font-bold font-calligraphy text-amber-200 mb-2">
          🎭 专属表情包生成中...
        </h3>
        <p class="text-xs text-stone-400 max-w-[260px] leading-relaxed mb-6">
          可在【我的表情包】查看生成结果
        </p>

        <!-- Guidance Card to Battle play -->
        <div class="bg-amber-950/20 border border-amber-600/30 rounded-xl p-3.5 max-w-xs mb-8">
          <p class="text-[10px] text-amber-500 leading-relaxed font-bold">
            💡 趁着神机算计期间，前往体验：
          </p>
          <p class="text-xs text-stone-300 font-medium mt-1 leading-relaxed">
            🚣 龙舟竞速挑战，通关可获得本阵营助力！
          </p>
        </div>

        <button id="btn-loader-go-game" class="w-full max-w-xs py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-stone-100 font-bold text-xs shadow-lg tracking-widest cursor-pointer pointer-events-auto transition active:scale-95 animate-pulse">
          🚣 龙舟竞速挑战 ↗
        </button>
      </div>
    `;

    document.getElementById("btn-loader-go-game")?.addEventListener("click", () => {
      state.stickerGenerating = false;
      startBoatGameIframe();
    });
    return;
  }

  if (state.showAwardPopup) {
    state.showAwardPopup = false;
  }

  if (!state.showStickersModal) {
    modalContainer.innerHTML = "";
    modalContainer.className = "absolute inset-0 z-40 pointer-events-none";
    return;
  }

  modalContainer.className = "absolute inset-0 z-50 pointer-events-auto flex items-center justify-center";
  modalContainer.innerHTML = `
    <!-- Backdrop Overlay at the lowest layer -->
    <div id="modal-backdrop" class="absolute inset-0 bg-stone-950/80 backdrop-blur-xs z-1"></div>
    
    <!-- Modal Dialog Window on top -->
    <div class="bg-stone-900 border border-stone-800 rounded-2xl w-[90%] max-w-sm flex flex-col max-h-[80vh] shadow-2xl select-none relative overflow-hidden z-10 animate-in zoom-in-95 duration-150">
      
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-stone-800 flex justify-between items-center bg-stone-950/40">
        <h3 class="font-serif font-bold text-amber-200 text-sm flex items-center gap-1.5">
          📜 我的表情包
        </h3>
        <button id="btn-close-modal" class="text-stone-400 hover:text-stone-200 text-xl font-bold cursor-pointer w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-800/50 transition">
          &times;
        </button>
      </div>

      <!-- Modal Body / Scrolling list -->
      <div class="flex-1 overflow-y-auto p-4 space-y-6">
        ${state.myStickers.length === 0 ? `
          <div class="text-center py-16 flex flex-col items-center justify-center">
            <span class="text-4xl mb-4 select-none opacity-40">🏮</span>
            <p class="text-xs text-stone-500 font-serif leading-relaxed">
              阁下暂无生成的定制表情包。<br/>加入领先阵营并上传美照即可极速生成！
            </p>
          </div>
        ` : `
          <div class="space-y-4">
            ${state.myStickers.map((sticker) => `
              <div class="w-full rounded-2xl overflow-hidden border border-stone-800 bg-stone-904 shadow-2xl relative group" style="aspect-ratio: 1 / 1; width: 100%;">
                <!-- Outer decorative subtle border glow -->
                <div class="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none z-10"></div>
                ${
                  sticker.avatarUrl
                    ? `<img src="${sticker.avatarUrl}" class="w-full h-full object-cover block" style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: 1 / 1;" alt="表情包图片" referrerPolicy="no-referrer" />`
                    : `
                      <div class="w-full h-full flex flex-col items-center justify-center text-stone-500 font-serif">
                        <span class="text-4xl mb-2 select-none block">🍧</span>
                        <span class="text-[10px] tracking-widest text-stone-600">暂无图片</span>
                      </div>
                    `
                }
              </div>
            `).join("")}
          </div>
        `}
      </div>

    </div>
  `;

  // Bind Close triggers
  document.getElementById("btn-close-modal")?.addEventListener("click", () => {
    state.showStickersModal = false;
    renderModal();
  });
  document.getElementById("modal-backdrop")?.addEventListener("click", () => {
    state.showStickersModal = false;
    renderModal();
  });

  // Bind Delete triggers inside modal
  document.querySelectorAll(".btn-modal-delete-sticker").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = btn.getAttribute("data-id");
      if (confirm("确认虔诚地焚毁并销毁此款端午战帖吗？此过程无法逆转。")) {
        state.myStickers = state.myStickers.filter((s) => s.id !== id);
        localStorage.setItem("my_zongzi_stickers", JSON.stringify(state.myStickers));
        
        // Render updated dialog in-place
        renderModal();
        
        // Also trigger renderUI to update counter badge in Home
        const homeBtn = document.getElementById("btn-show-stickers-modal");
        if (homeBtn) {
          homeBtn.innerHTML = `
            📜 我的表情包
            ${state.myStickers.length > 0 ? `<span class="bg-red-600 text-white text-[9px] px-1 rounded-full flex items-center justify-center font-mono">${state.myStickers.length}</span>` : ""}
          `;
        }
      }
    });
  });
}

// 3. Game Challenge View UI Render Function
function renderGame(appContainer) {
  if (activeGame) {
    activeGame.destroy();
  }
  activeGame = new DragonBoatGame(appContainer);
  activeGame.start();
}

function renderGameIframe(appContainer) {
  hasSubmittedVotes = false;
  
  appContainer.innerHTML = `
    <div class="absolute inset-0 flex flex-col justify-between bg-stone-950 font-sans z-50 text-white">
      <!-- Game Top Status Bar -->
      <div class="px-4 py-3 bg-stone-900 border-b border-stone-850 flex justify-between items-center shadow-md">
        <div class="flex items-center gap-2">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span class="text-xs text-stone-200 font-medium font-serif tracking-wider">🚣 擂鼓劲渡，竞舟争流！</span>
        </div>
        <div class="text-[11px] text-amber-400 font-mono font-bold bg-amber-950/50 border border-amber-800/40 px-2.5 py-0.5 rounded-full shadow-inner animate-pulse" id="game-countdown-text">
          10 秒后自动结算
        </div>
      </div>
      
      <!-- Safe interactive container -->
      <div class="flex-1 w-full bg-stone-900 relative">
        <iframe 
          src="https://chinablue.epub360.com.cn/v2/manage/book/ryg5pg/" 
          class="absolute inset-0 w-full h-full border-0 select-none" 
          allow="autoplay; geolocation; microphone; camera"
          style="width: 100%; height: 100%;">
        </iframe>
      </div>
      
      <!-- Bottom Safe Back Panel just in case they want to leave early -->
      <div class="p-3.5 bg-stone-950 border-t border-stone-850 flex justify-center shadow-lg">
        <button id="btn-abort-game" class="px-6 py-2 text-xs font-bold text-stone-400 hover:text-stone-200 hover:bg-stone-850 border border-stone-800 rounded-full transition cursor-pointer select-none">
          [ 提前折返 ]
        </button>
      </div>
    </div>
  `;

  let secondsLeft = 10;
  
  if (gameTimer) {
    clearInterval(gameTimer);
  }

  const handleGameFinished = async (isSuccess = true) => {
    if (gameTimer) {
      clearInterval(gameTimer);
      gameTimer = null;
    }
    
    if (hasSubmittedVotes) return;
    hasSubmittedVotes = true;

    if (isSuccess) {
      const activeCamp = state.userCamp || "sweet";
      try {
        const res = await fetch("/api/votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ camp: activeCamp, amount: 100 })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            state.votes = data.votes;
          }
        } else {
          if (activeCamp === "sweet") state.votes.sweet += 100;
          else state.votes.salty += 100;
        }
      } catch (err) {
        console.error("Failed to post batch votes:", err);
        if (activeCamp === "sweet") state.votes.sweet += 100;
        else state.votes.salty += 100;
      }
      notifyStateChange();

      state.currentPage = "home";
      state.showGameReturnTip = true;
      state.stickerUnlocked = true;
      renderUI();
    } else {
      state.currentPage = "home";
      renderUI();
    }
  };

  gameTimer = setInterval(() => {
    secondsLeft -= 1;
    const txt = document.getElementById("game-countdown-text");
    if (txt) {
      txt.textContent = `${secondsLeft} 秒后自动结算`;
    }
    
    if (secondsLeft <= 0) {
      handleGameFinished(true);
    }
  }, 1000);

  document.getElementById("btn-abort-game")?.addEventListener("click", () => {
    handleGameFinished(false);
  });

  const messageHandler = (e) => {
    if (e.data && typeof e.data === "string" && (e.data.includes("gameOver") || e.data.includes("gameEnd") || e.data.includes("finish"))) {
      handleGameFinished(true);
    }
  };
  window.addEventListener("message", messageHandler);
}

// Unified Render Router Layer
function renderUI() {
  const appContainer = document.getElementById("app-container");
  if (!appContainer) return;

  // Cleanup old structures
  if (activeBg) {
    activeBg.destroy();
    activeBg = null;
  }
  if (activeGame) {
    activeGame.destroy();
    activeGame = null;
  }

  // Handle Game Layout or Custom National Wind Animated Background Page Canvas
  if (state.currentPage === "game") {
    renderGame(appContainer);
  } else if (state.currentPage === "game-iframe") {
    renderGameIframe(appContainer);
  } else {
    // Generate background structure and sub page content container
    appContainer.innerHTML = `
      <div class="absolute inset-0 overflow-hidden flex flex-col justify-between">
        <canvas id="bg-canvas" class="absolute inset-0 w-full h-full pointer-events-none z-0"></canvas>
        
        <!-- Persistent Float Header / Activity Rules Button at Top Left -->
        <div class="absolute top-4 left-4 z-20">
          <button id="btn-show-rules-modal" class="px-3 py-1.5 rounded-full border border-stone-800 bg-stone-900/95 hover:bg-stone-850 duration-150 text-[11px] text-stone-300 font-bold shadow-md flex items-center gap-1 cursor-pointer pointer-events-auto">
            🏮 活动规则
          </button>
        </div>

        <!-- Persistent Float Header / My Stickers Button at Top Right -->
        <div class="absolute top-4 right-4 z-20">
          <button id="btn-show-stickers-modal" class="px-3 py-1.5 rounded-full border border-amber-500/30 bg-stone-900/95 hover:bg-stone-850 duration-150 text-[11px] text-amber-200 font-bold shadow-md flex items-center gap-1 cursor-pointer pointer-events-auto">
            📜 我的表情包
            ${state.myStickers.length > 0 ? `<span class="bg-red-600 text-white text-[9px] px-1 rounded-full flex items-center justify-center font-mono">${state.myStickers.length}</span>` : ""}
          </button>
        </div>

        <div id="sub-page-container" class="absolute inset-0 flex flex-col justify-between overflow-hidden"></div>
        
        <!-- Popups and Modal Containers -->
        <div id="modal-container" class="absolute inset-0 z-40 pointer-events-none"></div>
      </div>
    `;

    // Initialize Animated Background
    const bgCanvas = document.getElementById("bg-canvas");
    if (bgCanvas) {
      activeBg = new NationalWindBackground(bgCanvas, state.userCamp ? state.userCamp : "home");
    }

    const subContainer = document.getElementById("sub-page-container");
    if (subContainer) {
      if (state.currentPage === "home") {
        renderHome(subContainer);
      } else if (state.currentPage === "quiz") {
        renderQuiz(subContainer);
      }
    }

    // Bind Persistent UI Elements
    document.getElementById("btn-show-rules-modal")?.addEventListener("click", () => {
      state.showRulesModal = true;
      renderModal();
    });

    document.getElementById("btn-show-stickers-modal")?.addEventListener("click", () => {
      state.showStickersModal = true;
      renderModal();
    });

    // Handle any outstanding modal renders (e.g. loader/generation)
    renderModal();
  }
}

// Handle global custom events
window.addEventListener("route-change", (e) => {
  if (e.detail) {
    state.currentPage = e.detail;
    renderUI();
  }
});
