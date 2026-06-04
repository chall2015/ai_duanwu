class NationalWindBackground {
  constructor(canvas, rbgType = "home") {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not acquire 2D canvas context");
    }
    this.ctx = context;
    this.rbgType = rbgType;
    this.animFrameId = null;
    this.particles = [];
    this.waves = [];
    this.init();
    this.start();
  }

  init() {
    this.resizeCanvas();
    this.particles = [];

    const colorChoices = {
      home: ["rgba(251,191,36,0.3)", "rgba(5,150,105,0.2)", "rgba(230,240,220,0.15)"],
      sweet: ["rgba(244,63,94,0.35)", "rgba(251,191,36,0.25)", "rgba(255,255,255,0.15)"],
      salty: ["rgba(16,185,129,0.35)", "rgba(217,119,6,0.25)", "rgba(30,58,138,0.15)"]
    }[this.rbgType];

    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.6,
        size: Math.random() * 5 + 3,
        alpha: Math.random() * 0.5 + 0.3,
        color: colorChoices[Math.floor(Math.random() * colorChoices.length)]
      });
    }

    this.waves = [
      {
        y: this.canvas.height - 40,
        length: 120,
        amplitude: 8,
        speed: 0.015,
        phase: 0,
        color: this.rbgType === "sweet" ? "rgba(244,63,94,0.06)" : this.rbgType === "salty" ? "rgba(16,185,129,0.06)" : "rgba(5,150,105,0.06)"
      },
      {
        y: this.canvas.height - 25,
        length: 200,
        amplitude: 15,
        speed: 0.01,
        phase: Math.PI / 2,
        color: this.rbgType === "sweet" ? "rgba(244,63,94,0.08)" : this.rbgType === "salty" ? "rgba(16,185,129,0.08)" : "rgba(13,148,136,0.08)"
      }
    ];
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (parent) {
      this.canvas.width = parent.clientWidth;
      this.canvas.height = parent.clientHeight;
    } else {
      this.canvas.width = 375;
      this.canvas.height = 812;
    }
  }

  start() {
    this.resizeListener = () => {
      this.resizeCanvas();
    };
    window.addEventListener("resize", this.resizeListener);

    const loop = () => {
      this.draw();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.resizeListener) {
      window.removeEventListener("resize", this.resizeListener);
    }
  }

  draw() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createRadialGradient(width / 2, height / 3, 50, width / 2, height / 2, width);
    if (this.rbgType === "sweet") {
      gradient.addColorStop(0, "#1c0a10");
      gradient.addColorStop(1, "#0a0305");
    } else if (this.rbgType === "salty") {
      gradient.addColorStop(0, "#051811");
      gradient.addColorStop(1, "#020705");
    } else {
      gradient.addColorStop(0, "#121a14");
      gradient.addColorStop(1, "#070a08");
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.02)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.4);
    for (let x = 0; x <= width; x += 10) {
      const angle = (x / width) * Math.PI * 2;
      const y = height * 0.4 + Math.sin(angle * 2) * 12 + Math.cos(angle) * 5;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    for (const wave of this.waves) {
      ctx.save();
      ctx.fillStyle = wave.color;
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 5) {
        const y = wave.y + Math.sin(x / wave.length + wave.phase) * wave.amplitude;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      wave.phase += wave.speed;
    }

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.shadowBlur = p.size * 2;
      ctx.shadowColor = p.color;

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}
