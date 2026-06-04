class DragonBoatGame {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;

    this.isPlaying = false;
    this.isGameOver = false;
    this.score = 0;
    this.mistakes = 0;
    this.maxMistakes = 3;
    this.level = 1;

    this.flagState = "NONE";
    this.flagSpawnTime = 0;
    this.targetDuration = 1800; // milliseconds
    this.targetProgress = 0;
    this.promptTimer = null;

    this.feedbackText = "";
    this.feedbackTimer = 0;
    this.feedbackColor = "text-yellow-400";

    this.leftDrumstickActive = false;
    this.rightDrumstickActive = false;
    this.leftStuckTime = 0;
    this.rightStuckTime = 0;
    this.splashParticles = [];
    this.boatPositionX = 120;
    this.wavePhase = 0;

    this.audioCtx = null;
    this.initAudio();
  }

  initAudio() {
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  playSound(type) {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === "left") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.35);
        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "right") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "fail") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.4);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (e) {
      console.error(e);
    }
  }

  start() {
    this.isPlaying = true;
    this.isGameOver = false;
    this.score = 0;
    this.mistakes = 0;
    this.feedbackText = "";
    this.flagState = "NONE";
    this.splashParticles = [];
    this.level = 1;

    this.renderLayout();
    this.bindControls();
    this.queueNextFlag(1500);
    this.tick();
  }

  destroy() {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.promptTimer) {
      clearTimeout(this.promptTimer);
    }
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="absolute inset-0 flex flex-col justify-between overflow-hidden text-amber-50">
        <!-- 1. Header Display: Scores and Lives -->
        <div class="px-6 pt-10 pb-4 bg-gradient-to-b from-stone-950 to-transparent flex justify-between items-center z-10">
          <div>
            <div class="text-[10px] uppercase font-mono tracking-widest text-emerald-400">汨罗江赛道</div>
            <div class="text-xl font-bold font-mono text-stone-100 flex items-center gap-1">
              <span class="text-amber-400">得分:</span>
              <span id="score-val" class="font-bold">000</span>
            </div>
          </div>
          
          <div class="flex flex-col items-end">
            <span class="text-[10px] text-stone-400 mb-1">出错限度: 3次</span>
            <div id="mistakes-count-container" class="flex gap-2">
              <div class="w-5 h-5 rounded-full bg-red-500 border border-red-400 shadow-inner inline-flex items-center justify-center font-bold text-stone-100 text-[11px] select-none">1</div>
              <div class="w-5 h-5 rounded-full bg-red-500 border border-red-400 shadow-inner inline-flex items-center justify-center font-bold text-stone-100 text-[11px] select-none">2</div>
              <div class="w-5 h-5 rounded-full bg-red-500 border border-red-400 shadow-inner inline-flex items-center justify-center font-bold text-stone-100 text-[11px] select-none">3</div>
            </div>
          </div>
        </div>

        <!-- 2. Target Flags Alert & Dynamic Indicator View -->
        <div class="flex-1 relative flex flex-col items-center justify-center">
          <canvas id="game-canvas" class="absolute inset-0 w-full h-full pointer-events-none"></canvas>

          <div class="absolute top-1/4 left-0 right-0 flex justify-around px-8 pointer-events-none">
            <div class="flex flex-col items-center">
              <div id="flag-left" class="w-14 h-14 rounded-xl border-2 border-stone-700 bg-stone-900 flex items-center justify-center relative transition-all duration-100">
                <span class="font-bold text-stone-500 text-lg">左</span>
                <div class="absolute inset-0 rounded-xl opacity-0 bg-red-500/20 border-2 border-red-500 animate-ping absolute-center"></div>
              </div>
              <span class="text-[11px] text-stone-400 mt-2">鼓槌[左]</span>
            </div>

            <div class="flex flex-col items-center justify-center max-w-[130px] text-center">
              <div id="rhythm-feedback" class="h-10 text-xl font-bold text-shadow animate-bounce"></div>
              <div id="rhythm-instructions" class="text-xs text-stone-400 mt-1">鼓声渐起，预备！</div>
            </div>

            <div class="flex flex-col items-center">
              <div id="flag-right" class="w-14 h-14 rounded-xl border-2 border-stone-700 bg-stone-900 flex items-center justify-center relative transition-all duration-100">
                <span class="font-bold text-stone-500 text-lg">右</span>
                <div class="absolute inset-0 rounded-xl opacity-0 bg-red-500/20 border-2 border-red-500 animate-ping absolute-center"></div>
              </div>
              <span class="text-[11px] text-stone-400 mt-2">鼓槌[右]</span>
            </div>
          </div>

          <div id="target-ring-container" class="absolute w-28 h-28 border border-amber-300/40 rounded-full flex items-center justify-center opacity-0 pointer-events-none transform -translate-y-5">
            <div id="target-ring" class="w-28 h-28 rounded-full border-[3px] border-amber-400 scale-[2.0]"></div>
            <div class="absolute w-16 h-16 rounded-full bg-amber-400/20 flex items-center justify-center text-[10px] text-amber-300 font-bold tracking-widest uppercase">敲击点</div>
          </div>
          
          <div id="jointly-alert" class="absolute top-[48%] mt-4 text-center px-4 py-2 bg-red-950/90 border border-red-600 rounded-lg text-red-100 font-bold text-sm tracking-widest hidden animate-pulse shadow-lg z-10">
            ⚠️ 双旗齐亮！双手离开，切勿鸣鼓！
          </div>
        </div>

        <!-- 3. Bottom Drumsticks Controls Section -->
        <div class="p-6 pb-12 bg-gradient-to-t from-stone-950/90 via-stone-950/70 to-transparent flex flex-col items-center relative z-10">
          <div class="text-[11px] text-stone-400 mb-4 flex items-center gap-1.5 bg-stone-900/60 leading-3 py-1.5 px-3 rounded-full border border-stone-800">
            <span class="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-ping"></span>
            节奏点击：红旗亮起时在圆环重合一瞬间鸣鼓！
          </div>
          
          <div class="w-full h-36 flex justify-between gap-6 px-1">
            <button id="btn-drum-left" class="flex-1 bg-stone-900 hover:bg-stone-850 active:bg-amber-950/20 active:scale-95 border-2 border-amber-500/40 rounded-2xl flex flex-col items-center justify-center gap-2 relative transition-all shadow-lg active:border-amber-400 shadow-md transform overflow-hidden cursor-pointer select-none">
              <div class="w-2.5 h-12 bg-amber-600 rounded-full relative shadow-md flex justify-center items-start origin-bottom" id="stick-left-shaft">
                <div class="w-5 h-5 bg-yellow-400 rounded-full border-2 border-amber-500 -mt-3 shadow-inner"></div>
              </div>
              <span class="text-xs sm:text-sm font-bold tracking-widest text-amber-200 uppercase font-calligraphy">鸣鼓·左</span>
              <span class="text-[10px] font-mono text-amber-500/60 leading-none">A 键 或 点击</span>
            </button>

            <button id="btn-drum-right" class="flex-1 bg-stone-900 hover:bg-stone-850 active:bg-amber-950/20 active:scale-95 border-2 border-amber-500/40 rounded-2xl flex flex-col items-center justify-center gap-2 relative transition-all shadow-lg active:border-amber-400 shadow-md transform overflow-hidden cursor-pointer select-none">
              <div class="w-2.5 h-12 bg-amber-600 rounded-full relative shadow-md flex justify-center items-start origin-bottom" id="stick-right-shaft">
                <div class="w-5 h-5 bg-yellow-400 rounded-full border-2 border-amber-500 -mt-3 shadow-inner"></div>
              </div>
              <span class="text-xs sm:text-sm font-bold tracking-widest text-amber-200 uppercase font-calligraphy">鸣鼓·右</span>
              <span class="text-[10px] font-mono text-amber-500/60 leading-none">D 键 或 点击</span>
            </button>
          </div>

          <div class="w-full flex justify-between items-center mt-6 text-xs text-stone-400 px-2">
            <button id="game-btn-back" class="hover:text-stone-200 transition underline flex items-center gap-0.5 pointer-events-auto cursor-pointer">
              ← 返回挑选战队
            </button>
            <a href="https://g.co/doodle/dragonboat" target="_blank" id="external-link-btn" class="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 font-bold pointer-events-auto">
              跳转高精龙舟赛 ↗
            </a>
          </div>
        </div>
      </div>

      <!-- Game Over Modal Screen Overlay -->
      <div id="gameover-modal" class="absolute inset-0 bg-stone-950/95 flex flex-col items-center justify-center px-8 text-center z-20 hidden">
        <div class="w-16 h-16 rounded-full bg-red-950 border border-red-500 flex items-center justify-center mb-6">
          <span class="text-4xl">🚣</span>
        </div>
        
        <h2 class="text-2xl font-bold font-calligraphy text-amber-400 mb-2">端午鼓点竞渡 终局！</h2>
        <p class="text-xs text-stone-400 mb-6 max-w-[280px]">“鼓声止步，舟人归港。”你在激浪翻滚的汨罗江中完成竞渡！</p>

        <div class="w-full max-w-[280px] bg-stone-900 border border-stone-800 rounded-xl p-4 mb-8">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs text-stone-500">本次得分:</span>
            <span id="final-score" class="text-xl font-bold font-mono text-yellow-500">0</span>
          </div>
          <div class="w-full border-t border-stone-800/85 my-2"></div>
          <div class="flex justify-between items-center">
            <span class="text-xs text-stone-500">江山霸主高分:</span>
            <span id="high-score-display" class="text-base font-bold font-mono text-emerald-400">0</span>
          </div>
        </div>

        <div class="flex flex-col gap-3 w-full max-w-[240px]">
          <button id="btn-retry-game" class="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-stone-100 font-bold text-sm tracking-wider shadow-md transform active:scale-95 transition pointer-events-auto cursor-pointer">
            擂鼓再战
          </button>
          
          <button id="btn-back-to-generate" class="w-full py-3 rounded-full bg-stone-800 hover:bg-stone-750 text-stone-300 font-bold text-xs tracking-wider border border-transparent hover:border-stone-750 transition pointer-events-auto cursor-pointer">
            返回定制我的表情包
          </button>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector("#game-canvas");
    if (this.canvas) {
      this.ctx = this.canvas.getContext("2d");
      const parent = this.canvas.parentElement;
      if (parent) {
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;
      }
    }
  }

  bindControls() {
    const btnLeft = this.container.querySelector("#btn-drum-left");
    const btnRight = this.container.querySelector("#btn-drum-right");
    const btnBack = this.container.querySelector("#game-btn-back");
    const btnRetry = this.container.querySelector("#btn-retry-game");
    const btnBackToGen = this.container.querySelector("#btn-back-to-generate");

    btnLeft?.addEventListener("click", () => this.handleDrumming("LEFT"));
    btnRight?.addEventListener("click", () => this.handleDrumming("RIGHT"));

    this.keydownHandler = (e) => {
      if (!this.isPlaying || this.isGameOver) return;
      if (e.key === "a" || e.key === "A") {
        this.handleDrumming("LEFT");
      } else if (e.key === "d" || e.key === "D") {
        this.handleDrumming("RIGHT");
      }
    };
    window.addEventListener("keydown", this.keydownHandler);

    btnBack?.addEventListener("click", () => {
      this.destroy();
      const e = new CustomEvent("route-change", { detail: "sticker" });
      window.dispatchEvent(e);
    });

    btnBackToGen?.addEventListener("click", () => {
      this.destroy();
      const e = new CustomEvent("route-change", { detail: "sticker" });
      window.dispatchEvent(e);
    });

    btnRetry?.addEventListener("click", () => {
      this.start();
    });
  }

  handleDrumming(side) {
    if (this.isGameOver) return;

    if (side === "LEFT") {
      this.leftDrumstickActive = true;
      this.leftStuckTime = Date.now();
      this.playSound("left");
    } else {
      this.rightDrumstickActive = true;
      this.rightStuckTime = Date.now();
      this.playSound("right");
    }

    this.spawnSplashes();

    const now = Date.now();
    const age = now - this.flagSpawnTime;

    if (this.flagState === "NONE") {
      this.triggerMistake("空槌！等待红旗升旗");
      return;
    }

    if (this.flagState === "BOTH") {
      this.triggerMistake("犯规！双旗齐亮须静止手部！");
      return;
    }

    if (side !== this.flagState) {
      this.triggerMistake("方向错误！看清对应的红旗");
      return;
    }

    if (this.targetProgress < 0.6) {
      this.triggerMistake("敲击过快！等圆圈与红圈重合");
    } else if (this.targetProgress <= 1.0) {
      const scoreGain = Math.round((1 - Math.abs(0.92 - this.targetProgress)) * 105);
      this.score += scoreGain;

      // Realtime in-game camp vote booster!
      if (state.userCamp) {
        if (state.userCamp === "sweet") {
          state.votes.sweet += 10; // Extra fun boost for gameplay
        } else {
          state.votes.salty += 10;
        }
        // Throttled server sync to update official tally
        if (this.score % 4 === 0) {
          castVote(state.userCamp);
        }
      }

      this.feedbackText = scoreGain > 90 ? "完美！" : "优秀！";
      this.feedbackColor = scoreGain > 90 ? "text-amber-400" : "text-emerald-400";
      this.feedbackTimer = 25;
      
      this.playSound("success");
      this.boatPositionX = Math.min(this.boatPositionX + 25, 230);

      this.flagState = "NONE";
      const hint = this.container.querySelector("#rhythm-instructions");
      if (hint) hint.innerHTML = `佳绩！${scoreGain} 分`;
      this.updateScoreUI();

      this.queueNextFlag(1000 - Math.min(this.level * 40, 400));
    }
  }

  triggerMistake(msg) {
    this.mistakes += 1;
    this.feedbackText = "失误";
    this.feedbackColor = "text-red-500";
    this.feedbackTimer = 25;
    this.playSound("fail");

    this.boatPositionX = Math.max(this.boatPositionX - 15, 60);

    const hint = this.container.querySelector("#rhythm-instructions");
    if (hint) hint.innerHTML = msg;

    this.updateMistakesUI();
    this.flagState = "NONE";

    if (this.mistakes >= this.maxMistakes) {
      this.gameOver();
    } else {
      this.queueNextFlag(1400);
    }
  }

  updateScoreUI() {
    const scoreVal = this.container.querySelector("#score-val");
    if (scoreVal) {
      scoreVal.textContent = this.score.toString().padStart(3, "0");
    }
  }

  updateMistakesUI() {
    const hearts = this.container.querySelectorAll("#mistakes-count-container div");
    hearts.forEach((h, index) => {
      if (index < this.mistakes) {
        h.classList.add("bg-stone-800", "border-stone-700", "text-stone-500");
        h.classList.remove("bg-red-500", "border-red-400", "text-stone-100");
      }
    });
  }

  queueNextFlag(delay) {
    if (this.promptTimer) clearTimeout(this.promptTimer);
    if (!this.isPlaying || this.isGameOver) return;

    this.targetProgress = 0;

    const ringContainer = this.container.querySelector("#target-ring-container");
    if (ringContainer) ringContainer.style.opacity = "0";

    const jointAlert = this.container.querySelector("#jointly-alert");
    if (jointAlert) jointAlert.classList.add("hidden");

    this.flagState = "NONE";
    this.updateFlagsUI();

    this.promptTimer = setTimeout(() => {
      if (!this.isPlaying || this.isGameOver) return;

      const rng = Math.random();
      if (rng < 0.15 + (this.level * 0.03)) {
        this.flagState = "BOTH";
      } else if (rng < 0.58) {
        this.flagState = "LEFT";
      } else {
        this.flagState = "RIGHT";
      }

      this.flagSpawnTime = Date.now();
      this.level = Math.min(10, 1 + Math.floor(this.score / 350));
      this.targetDuration = Math.max(1000, 1900 - (this.level * 80));

      this.updateFlagsUI();

      const instructions = this.container.querySelector("#rhythm-instructions");
      if (instructions) {
        if (this.flagState === "BOTH") {
          instructions.innerHTML = `<span class="text-red-400 font-bold animate-pulse">齐亮，停手！</span>`;
          const alert = this.container.querySelector("#jointly-alert");
          if (alert) alert.classList.remove("hidden");
        } else {
          instructions.innerHTML = `击打 <span class="text-amber-300 font-bold">${this.flagState === "LEFT" ? "左侧" : "右侧"}</span> 鼓！`;
        }
      }

      if (this.flagState === "BOTH") {
        setTimeout(() => {
          if (this.flagState === "BOTH" && this.isPlaying && !this.isGameOver) {
            this.flagState = "NONE";
            this.score += 80;
            this.feedbackText = "稳重！";
            this.feedbackColor = "text-emerald-400";
            this.feedbackTimer = 25;
            this.updateScoreUI();
            this.playSound("success");
            const alert = this.container.querySelector("#jointly-alert");
            if (alert) alert.classList.add("hidden");
            this.queueNextFlag(800);
          }
        }, 1200);
      }

    }, delay);
  }

  updateFlagsUI() {
    const fLeft = this.container.querySelector("#flag-left");
    const fRight = this.container.querySelector("#flag-right");

    if (!fLeft || !fRight) return;

    fLeft.className = "w-14 h-14 rounded-xl border-2 border-stone-700 bg-stone-900 flex items-center justify-center relative transition-all duration-100";
    fLeft.querySelector(".font-bold").className = "font-bold text-stone-500 text-lg";
    fLeft.querySelector(".animate-ping").classList.add("opacity-0");

    fRight.className = "w-14 h-14 rounded-xl border-2 border-stone-700 bg-stone-900 flex items-center justify-center relative transition-all duration-100";
    fRight.querySelector(".font-bold").className = "font-bold text-stone-500 text-lg";
    fRight.querySelector(".animate-ping").classList.add("opacity-0");

    if (this.flagState === "LEFT" || this.flagState === "BOTH") {
      fLeft.className = "w-14 h-14 rounded-xl border-2 border-red-500 bg-red-950 flex items-center justify-center relative transition-all duration-100 shadow-lg shadow-red-950/50 scale-105";
      fLeft.querySelector(".font-bold").className = "font-bold text-red-100 text-lg";
      fLeft.querySelector(".animate-ping").classList.remove("opacity-0");
    }

    if (this.flagState === "RIGHT" || this.flagState === "BOTH") {
      fRight.className = "w-14 h-14 rounded-xl border-2 border-red-500 bg-red-950 flex items-center justify-center relative transition-all duration-100 shadow-lg shadow-red-950/50 scale-105";
      fRight.querySelector(".font-bold").className = "font-bold text-red-100 text-lg";
      fRight.querySelector(".animate-ping").classList.remove("opacity-0");
    }
  }

  gameOver() {
    this.isGameOver = true;
    updateGameScore(this.score);

    const modal = this.container.querySelector("#gameover-modal");
    const finalScoreDisplay = this.container.querySelector("#final-score");
    const highScoreDisplay = this.container.querySelector("#high-score-display");

    if (finalScoreDisplay) finalScoreDisplay.textContent = this.score.toString();
    if (highScoreDisplay) highScoreDisplay.textContent = localStorage.getItem("dragon_boat_high_score") || "0";

    if (modal) {
      modal.classList.remove("hidden");
    }
  }

  spawnSplashes() {
    for (let i = 0; i < 15; i++) {
      this.splashParticles.push({
        x: this.boatPositionX + 45 + (Math.random() - 0.5) * 40,
        y: (this.canvas?.height || 500) * 0.58 + (Math.random() - 0.5) * 20,
        vx: -2 - Math.random() * 4,
        vy: -1 - Math.random() * 3,
        size: Math.random() * 4 + 2,
        alpha: 1.0
      });
    }
  }

  tick() {
    if (!this.isPlaying || this.isGameOver) return;

    const ctx = this.ctx;
    const canvas = this.canvas;
    
    if (ctx && canvas) {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "rgba(16,185,129,0.06)";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.7);
      for (let x = 0; x <= w; x += 10) {
        const y = h * 0.58 + Math.sin(x * 0.015 + this.wavePhase) * 8;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(10,120,80,0.1)";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.61);
      for (let x = 0; x <= w; x += 10) {
        const y = h * 0.59 + Math.sin(x * 0.02 + this.wavePhase + Math.PI / 3) * 6;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      for (let i = this.splashParticles.length - 1; i >= 0; i--) {
        const p = this.splashParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.alpha -= 0.022;
        p.size = Math.max(0, p.size - 0.05);

        if (p.alpha <= 0 || p.size <= 0) {
          this.splashParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      const boatY = h * 0.57 + Math.sin(this.wavePhase * 1.5) * 4;
      ctx.translate(this.boatPositionX, boatY);

      ctx.fillStyle = "#e11d48";
      ctx.beginPath();
      ctx.moveTo(-45, -15);
      ctx.lineTo(-70, -28);
      ctx.lineTo(-65, -12);
      ctx.lineTo(-75, 4);
      ctx.lineTo(-45, -2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#854d0e";
      ctx.beginPath();
      ctx.moveTo(-60, 0);
      ctx.quadraticCurveTo(-45, 12, 10, 12);
      ctx.quadraticCurveTo(65, 12, 85, -18);
      ctx.quadraticCurveTo(70, 0, 10, 5);
      ctx.quadraticCurveTo(-45, 5, -60, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ca8a04";
      ctx.beginPath();
      ctx.moveTo(-35, 4);
      ctx.quadraticCurveTo(10, 9, 65, 3);
      ctx.lineTo(60, 6);
      ctx.quadraticCurveTo(10, 11, -35, 6);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#b91c1c";
      ctx.beginPath();
      ctx.moveTo(85, -18);
      ctx.lineTo(95, -28);
      ctx.lineTo(84, -26);
      ctx.lineTo(76, -11);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ca8a04";
      ctx.beginPath();
      ctx.arc(77, -13, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(77.5, -13, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#059669";
      ctx.beginPath();
      ctx.moveTo(-5, -5);
      ctx.lineTo(15, -25);
      ctx.lineTo(35, -5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#dc2626";
      ctx.fillRect(8, -22, 14, 3);

      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(10, -11, 2, 0, Math.PI * 2);
      ctx.arc(20, -11, 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = "rgba(244,63,94,0.6)";
      ctx.beginPath();
      ctx.arc(8, -8, 2, 0, Math.PI * 2);
      ctx.arc(22, -8, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#991b1b";
      ctx.fillRect(10, -3, 11, 10);
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(9, -5, 13, 2.5);

      ctx.restore();

      this.boatPositionX = Math.max(105, this.boatPositionX - 0.22);
      this.wavePhase += 0.05 + (this.level * 0.005);
    }

    if (this.flagState === "LEFT" || this.flagState === "RIGHT") {
      const now = Date.now();
      const age = now - this.flagSpawnTime;
      this.targetProgress = Math.min(1.0, age / this.targetDuration);

      const rContainer = this.container.querySelector("#target-ring-container");
      const rRing = this.container.querySelector("#target-ring");

      if (rContainer && rRing) {
        rContainer.style.opacity = "1.0";
        const scale = 2.0 - (this.targetProgress * 1.0);
        rRing.style.transform = `scale(${scale})`;
        
        if (this.targetProgress >= 0.82 && this.targetProgress <= 0.98) {
          rRing.style.borderColor = "#fbbf24";
          rRing.style.borderWidth = "4px";
        } else {
          rRing.style.borderColor = "rgba(251, 191, 36, 0.4)";
          rRing.style.borderWidth = "3px";
        }
      }

      if (this.targetProgress >= 1.0) {
        this.triggerMistake("漏拍！把握好鼓点时机");
      }
    }

    const stickLeftShaft = this.container.querySelector("#stick-left-shaft");
    if (stickLeftShaft) {
      if (this.leftDrumstickActive) {
        const elapsed = Date.now() - this.leftStuckTime;
        if (elapsed < 120) {
          stickLeftShaft.style.transform = "rotate(-25deg)";
        } else if (elapsed < 250) {
          stickLeftShaft.style.transform = "rotate(10deg)";
        } else {
          stickLeftShaft.style.transform = "rotate(0deg)";
          this.leftDrumstickActive = false;
        }
      }
    }

    const stickRightShaft = this.container.querySelector("#stick-right-shaft");
    if (stickRightShaft) {
      if (this.rightDrumstickActive) {
        const elapsed = Date.now() - this.rightStuckTime;
        if (elapsed < 120) {
          stickRightShaft.style.transform = "rotate(25deg)";
        } else if (elapsed < 250) {
          stickRightShaft.style.transform = "rotate(-10deg)";
        } else {
          stickRightShaft.style.transform = "rotate(0deg)";
          this.rightDrumstickActive = false;
        }
      }
    }

    const feedbackBox = this.container.querySelector("#rhythm-feedback");
    if (feedbackBox) {
      if (this.feedbackTimer > 0) {
        feedbackBox.textContent = this.feedbackText;
        feedbackBox.className = `h-10 text-xl font-bold text-shadow animate-bounce ${this.feedbackColor}`;
        this.feedbackTimer--;
      } else {
        feedbackBox.textContent = "";
      }
    }

    this.animationId = requestAnimationFrame(() => this.tick());
  }
}
