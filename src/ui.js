let activeBg = null;
let activeGame = null;

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

    // Bind Choice Buttons
    document.getElementById("btn-home-sweet")?.addEventListener("click", () => {
      castVote("sweet");
      renderUI();
    });

    document.getElementById("btn-home-salty")?.addEventListener("click", () => {
      castVote("salty");
      renderUI();
    });

  } else {
    // Stage 2: Chosen! Show layout with live counts, percentage & progress bar.
    // Determine leading status
    const isSweetLeading = sweetVotes >= saltyVotes;
    const isSaltyLeading = saltyVotes >= sweetVotes;
    const isUserLeading = (state.userCamp === "sweet" && isSweetLeading) || (state.userCamp === "salty" && isSaltyLeading);

    appContainer.innerHTML = `
      <!-- Top Chinese Calligraphy Banner Title -->
      <div class="w-full max-w-md mx-auto pt-10 px-6 flex flex-col items-center text-center z-10 relative">
        <div class="mb-1.5 px-3 py-0.5 rounded-full border ${
          state.userCamp === "sweet" ? "border-rose-605/30 bg-rose-950/20 text-rose-400" : "border-emerald-600/30 bg-emerald-950/20 text-emerald-400"
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

        <!-- Conditional generation buttons based on Leading status -->
        <div class="flex flex-col gap-3">
          ${
            isUserLeading
              ? `
              <div class="text-[11px] text-emerald-400 font-medium bg-emerald-950/30 border border-emerald-800/30 px-3.5 py-3 rounded-xl text-center leading-relaxed">
                🎉 捷报！您所支持的阵营在实时票数中正值<strong>占优</strong>！拥有定制专属表情包特权！
              </div>
              
              <!-- Direct camera/photo input hidden selector -->
              <input type="file" id="direct-image-upload" accept="image/*" class="hidden" />

              <button id="btn-goto-generate" class="w-full py-4 rounded-xl font-bold text-sm tracking-widest bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white transition active:scale-[0.98] cursor-pointer shadow-lg shadow-indigo-950/40 border-t border-white/10 relative overflow-hidden group">
                <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition duration-150"></div>
                🎭 定制专属表情包
              </button>

              <button id="btn-goto-game-fun" class="w-full py-3.5 rounded-xl border border-amber-600/30 bg-amber-950/10 hover:bg-amber-950/20 text-amber-200 text-xs font-bold tracking-wider transition active:scale-[0.98] cursor-pointer text-center">
                🚣 擂鼓竞舟挑战
              </button>
            `
              : `
              <div class="text-[11px] text-rose-400 font-medium bg-rose-950/30 border border-rose-800/30 px-3.5 py-3 rounded-xl text-center leading-relaxed">
                ⚠️ 战局焦灼！您拥护的阵营目前<strong>暂未占优</strong>，无法通过表情包定制。快去打鼓拉票、助其完成逆袭吧！
              </div>

              <button id="btn-goto-game-fight" class="w-full py-4 rounded-xl font-bold text-sm tracking-wide bg-amber-600 hover:bg-amber-500 text-stone-100 shadow-md transition active:scale-[0.98] cursor-pointer pointer-events-auto border-t border-amber-400/20 relative group overflow-hidden">
                <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition duration-150"></div>
                🚣 擂鼓竞舟挑战
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
      window.location.href = "https://wap.cztv.com/h5/news/10376960";
    });

    document.getElementById("btn-goto-game-fight")?.addEventListener("click", () => {
      window.location.href = "https://wap.cztv.com/h5/news/10376960";
    });
  }
}

// 2. Sticker Custom Modal Dialog Render helper template
function renderModal() {
  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

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
            🚣 龙舟竞舟玩法，打鼓助威为本队拉票！
          </p>
        </div>

        <button id="btn-loader-go-game" class="w-full max-w-xs py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-stone-100 font-bold text-xs shadow-lg tracking-widest cursor-pointer pointer-events-auto transition active:scale-95 animate-pulse">
          🚣 立即前往擂鼓挑战 ↗
        </button>
      </div>
    `;

    document.getElementById("btn-loader-go-game")?.addEventListener("click", () => {
      window.location.href = "https://wap.cztv.com/h5/news/10376960";
    });
    return;
  }

  if (!state.showStickersModal) {
    modalContainer.innerHTML = "";
    modalContainer.className = "absolute inset-0 z-40 pointer-events-none";
    return;
  }

  modalContainer.className = "absolute inset-0 z-40 pointer-events-auto flex items-center justify-center";
  modalContainer.innerHTML = `
    <!-- Backdrop Overlay -->
    <div id="modal-backdrop" class="absolute inset-0 bg-stone-950/80 backdrop-blur-xs z-30"></div>
    
    <!-- Modal Dialog Window -->
    <div class="bg-stone-900 border border-stone-800 rounded-2xl w-[90%] max-w-sm flex flex-col max-h-[80vh] shadow-2xl select-none relative overflow-hidden z-40 animate-in zoom-in-95 duration-150">
      
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
  } else {
    // Generate background structure and sub page content container
    appContainer.innerHTML = `
      <div class="absolute inset-0 overflow-hidden flex flex-col justify-between">
        <canvas id="bg-canvas" class="absolute inset-0 w-full h-full pointer-events-none z-0"></canvas>
        
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
      }
    }

    // Bind Persistent UI Elements
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
