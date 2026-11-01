// Animated starfield with twinkling stars and shooting stars
(function () {
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, dpr, stars = [], shooters = [];
  let nextShot = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round((width * height) / 5000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.3 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.002 + 0.0006,
      tint: Math.random() < 0.18
    }));
    if (reduceMotion) draw(0);
  }

  function spawnShooter() {
    // Travel down-left or down-right from the upper portion of the screen
    const dir = Math.random() < 0.5 ? -1 : 1;
    const angle = (Math.random() * 20 + 25) * Math.PI / 180;
    const speed = Math.random() * 6 + 9;
    shooters.push({
      x: dir === 1 ? Math.random() * width * 0.6 : width * 0.4 + Math.random() * width * 0.6,
      y: Math.random() * height * 0.4,
      vx: Math.cos(angle) * speed * dir,
      vy: Math.sin(angle) * speed,
      len: Math.random() * 120 + 100,
      life: 0,
      maxLife: Math.random() * 40 + 55
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, width, height);

    for (const s of stars) {
      const a = reduceMotion ? 0.7 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.phase + t * s.speed));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.tint ? `rgba(125,211,252,${a})` : `rgba(255,255,255,${a})`;
      ctx.fill();
    }

    for (let i = shooters.length - 1; i >= 0; i--) {
      const m = shooters[i];
      m.x += m.vx;
      m.y += m.vy;
      m.life++;

      const progress = m.life / m.maxLife;
      const alpha = progress < 0.15 ? progress / 0.15 : 1 - (progress - 0.15) / 0.85;
      const mag = Math.hypot(m.vx, m.vy);
      const tailX = m.x - (m.vx / mag) * m.len;
      const tailY = m.y - (m.vy / mag) * m.len;

      const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
      grad.addColorStop(0.3, `rgba(56,189,248,${alpha * 0.6})`);
      grad.addColorStop(1, 'rgba(56,189,248,0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      // Glowing head
      ctx.beginPath();
      ctx.arc(m.x, m.y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (m.life >= m.maxLife || m.x < -m.len || m.x > width + m.len || m.y > height + m.len) {
        shooters.splice(i, 1);
      }
    }
  }

  function loop(t) {
    if (t >= nextShot) {
      spawnShooter();
      if (Math.random() < 0.25) spawnShooter();
      nextShot = t + Math.random() * 2200 + 800;
    }
    draw(t);
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();
  if (!reduceMotion) requestAnimationFrame(loop);
})();
