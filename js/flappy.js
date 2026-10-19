/**
 * BUBBLE - Embedded Playable Flappy Bird Engine
 * Ultra-smooth, responsive HTML5 Canvas game running inside the Hero Phone mockup.
 * Features Web Audio synthesized sound effects, 60fps physics, parallax scenery,
 * high-score persistence, and reactive integration with the visual block code demo.
 */

(function (window) {
  'use strict';

  // Game States
  const STATES = {
    READY: 0,
    PLAYING: 1,
    GAMEOVER: 2
  };

  class FlappyBirdEngine {
    constructor() {
      this.canvas = document.getElementById('flappy-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');

      this.soundEnabled = true;
      this.audioCtx = null;

      // Physics & Game Tuning
      this.gravity = 0.23;
      this.jumpStrength = -4.7;
      this.pipeSpeed = 1.25;
      this.pipeSpawnInterval = 115;
      this.pipeWidth = 34;
      this.pipeGap = 76;
      this.groundHeight = 40;

      // Bird State
      this.bird = {
        x: 42,
        y: 120,
        radius: 10,
        vy: 0,
        rotation: 0,
        wingPhase: 0
      };

      this.pipes = [];
      this.particles = [];
      this.clouds = [
        { x: 20, y: 35, scale: 0.85, speed: 0.25 },
        { x: 95, y: 75, scale: 0.65, speed: 0.18 },
        { x: 155, y: 25, scale: 1.0, speed: 0.3 }
      ];

      this.groundOffset = 0;
      this.frameCount = 0;
      this.score = 0;
      this.bestScore = parseInt(localStorage.getItem('bubble_flappy_best') || '0', 10);
      this.state = STATES.READY;
      this.flashAlpha = 0;

      this.initDisplay();
      this.setupAudio();
      this.bindEvents();
      this.updateBestBadge();

      // Start main game loop
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }

    initDisplay() {
      const wrapper = this.canvas.parentElement;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = wrapper.clientWidth || 184;
      this.height = wrapper.clientHeight || 306;

      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.ctx.resetTransform?.();
      this.ctx.scale(dpr, dpr);

      this.bird.x = Math.round(this.width * 0.26);
      this.bird.y = Math.round(this.height * 0.44);
    }

    setupAudio() {
      const toggleBtn = document.getElementById('flappy-sound-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.soundEnabled = !this.soundEnabled;
          toggleBtn.textContent = this.soundEnabled ? '🔊' : '🔇';
        });
      }
    }

    getAudioContext() {
      if (!this.audioCtx) {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (AudioClass) {
          this.audioCtx = new AudioClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    }

    playSound(type) {
      if (!this.soundEnabled) return;
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        if (type === 'flap') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(360, now);
          osc.frequency.exponentialRampToValueAtTime(620, now + 0.08);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
        } else if (type === 'score') {
          // Cheerful two-tone chime
          [880, 1175].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.07);
            gain.gain.setValueAtTime(0.12, now + i * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.07);
            osc.stop(now + i * 0.07 + 0.12);
          });
        } else if (type === 'hit') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.15);
        }
      } catch (e) {
        // Audio error silent fallback
      }
    }

    updateBestBadge() {
      const badge = document.getElementById('phone-best-score-badge');
      if (badge) {
        badge.textContent = `BEST: ${this.bestScore}`;
      }
    }

    bindEvents() {
      const handleAction = (e) => {
        if (e && e.cancelable && e.type !== 'keydown') {
          e.preventDefault();
        }
        this.handleTap();
      };

      this.canvas.addEventListener('mousedown', handleAction);
      this.canvas.addEventListener('touchstart', handleAction, { passive: false });

      // Tablet Run Button also controls the flappy jump
      const tabletRunBtn = document.getElementById('btn-tablet-run-demo');
      if (tabletRunBtn) {
        tabletRunBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleTap();
        });
      }

      // Spacebar controls
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp') {
          const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
          if (activeTag === 'input' || activeTag === 'textarea') return;

          // Only intercept space if hero section is currently visible in viewport
          const hero = document.querySelector('.hero-section');
          if (hero) {
            const rect = hero.getBoundingClientRect();
            if (rect.bottom > 50 && rect.top < window.innerHeight - 50) {
              e.preventDefault();
              this.handleTap();
            }
          }
        }
      });

      // Window resize
      window.addEventListener('resize', () => {
        this.initDisplay();
      });
    }

    handleTap() {
      if (this.state === STATES.READY) {
        this.state = STATES.PLAYING;
        this.pipes = [];
        this.score = 0;
        this.jump();
      } else if (this.state === STATES.PLAYING) {
        this.jump();
      } else if (this.state === STATES.GAMEOVER) {
        // Restart game
        this.state = STATES.READY;
        this.bird.y = Math.round(this.height * 0.44);
        this.bird.vy = 0;
        this.bird.rotation = 0;
        this.pipes = [];
        this.particles = [];
        this.score = 0;
      }
    }

    jump() {
      this.bird.vy = this.jumpStrength;
      this.playSound('flap');

      // Spawn subtle jump puff particles
      for (let i = 0; i < 3; i++) {
        this.particles.push({
          x: this.bird.x - 6,
          y: this.bird.y + 4 + (Math.random() * 6 - 3),
          vx: -1 - Math.random() * 1.5,
          vy: Math.random() * 1.5 - 0.75,
          radius: 2 + Math.random() * 2,
          alpha: 0.8,
          color: '#ffffff'
        });
      }

      // Animate reactive Dart card pulse on hero
      const dartCard = document.getElementById('demo-dart-card');
      if (dartCard) {
        dartCard.style.transform = 'scale(1.05)';
        dartCard.style.boxShadow = '0 25px 40px -5px rgba(99, 102, 241, 0.4)';
        setTimeout(() => {
          dartCard.style.transform = '';
          dartCard.style.boxShadow = '';
        }, 220);
      }
    }

    triggerGameOver() {
      if (this.state === STATES.GAMEOVER) return;
      this.state = STATES.GAMEOVER;
      this.flashAlpha = 0.7;
      this.playSound('hit');

      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem('bubble_flappy_best', this.bestScore.toString());
        this.updateBestBadge();
      }
    }

    update() {
      this.frameCount++;

      // Update clouds
      this.clouds.forEach(c => {
        c.x -= c.speed;
        if (c.x < -60) c.x = this.width + 20;
      });

      // Ground movement
      if (this.state !== STATES.GAMEOVER) {
        this.groundOffset = (this.groundOffset + this.pipeSpeed) % 18;
      }

      // Particles update
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.04;
        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }

      const playableBottom = this.height - this.groundHeight;

      if (this.state === STATES.READY) {
        // Floating sine wave animation
        this.bird.y = Math.round(this.height * 0.44) + Math.sin(this.frameCount * 0.08) * 6;
        this.bird.rotation = 0;
        this.bird.wingPhase = Math.floor(this.frameCount / 6) % 3;
      } else if (this.state === STATES.PLAYING) {
        // Gravity & physics
        this.bird.vy += this.gravity;
        this.bird.y += this.bird.vy;

        // Dynamic angle
        if (this.bird.vy < 0) {
          this.bird.rotation = -0.38;
        } else {
          this.bird.rotation = Math.min(1.2, this.bird.rotation + 0.04);
        }

        this.bird.wingPhase = Math.floor(this.frameCount / 4) % 3;

        // Ground / ceiling collision
        if (this.bird.y + this.bird.radius >= playableBottom) {
          this.bird.y = playableBottom - this.bird.radius;
          this.triggerGameOver();
        }
        if (this.bird.y - this.bird.radius <= 0) {
          this.bird.y = this.bird.radius;
          this.bird.vy = 0;
        }

        // Spawn pipes
        if (this.frameCount % this.pipeSpawnInterval === 0) {
          const minPipe = 36;
          const maxPipe = playableBottom - this.pipeGap - minPipe;
          const topHeight = Math.floor(minPipe + Math.random() * (maxPipe - minPipe));
          this.pipes.push({
            x: this.width + 10,
            top: topHeight,
            bottom: topHeight + this.pipeGap,
            passed: false
          });
        }

        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
          const pipe = this.pipes[i];
          pipe.x -= this.pipeSpeed;

          // Check score pass
          if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
            pipe.passed = true;
            this.score++;
            this.playSound('score');

            // Sparkle particles
            for (let s = 0; s < 5; s++) {
              this.particles.push({
                x: this.bird.x + 8,
                y: this.bird.y + (Math.random() * 14 - 7),
                vx: Math.random() * 2 - 1,
                vy: Math.random() * 2 - 1,
                radius: 2,
                alpha: 1,
                color: '#facc15'
              });
            }
          }

          // Pipe Collision check (AABB with circle)
          const birdBox = {
            left: this.bird.x - this.bird.radius + 3,
            right: this.bird.x + this.bird.radius - 3,
            top: this.bird.y - this.bird.radius + 3,
            bottom: this.bird.y + this.bird.radius - 3
          };

          const inPipeX = birdBox.right > pipe.x && birdBox.left < pipe.x + this.pipeWidth;
          if (inPipeX) {
            const hitTop = birdBox.top < pipe.top;
            const hitBottom = birdBox.bottom > pipe.bottom;
            if (hitTop || hitBottom) {
              this.triggerGameOver();
            }
          }

          // Remove offscreen pipes
          if (pipe.x < -this.pipeWidth - 10) {
            this.pipes.splice(i, 1);
          }
        }
      } else if (this.state === STATES.GAMEOVER) {
        // Fall to ground if in air
        if (this.bird.y + this.bird.radius < playableBottom) {
          this.bird.vy += this.gravity * 1.5;
          this.bird.y += this.bird.vy;
          this.bird.rotation = Math.min(1.4, this.bird.rotation + 0.08);
          if (this.bird.y + this.bird.radius >= playableBottom) {
            this.bird.y = playableBottom - this.bird.radius;
          }
        }
      }

      // Flash fadeout
      if (this.flashAlpha > 0) {
        this.flashAlpha = Math.max(0, this.flashAlpha - 0.07);
      }
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);

      // 1. Sky Gradient Background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height - this.groundHeight);
      skyGrad.addColorStop(0, '#60c5cf');
      skyGrad.addColorStop(0.7, '#88d9e2');
      skyGrad.addColorStop(1, '#c0edf2');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.height - this.groundHeight);

      // 2. Parallax Clouds
      this.clouds.forEach(c => {
        this.drawCloud(c.x, c.y, c.scale);
      });

      // 3. Distant City/Hills Skyline
      this.drawBackdropHills();

      // 4. Pipes
      this.pipes.forEach(pipe => {
        this.drawPipe(pipe);
      });

      // 5. Particles
      this.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 6. Ground
      this.drawGround();

      // 7. Bird
      this.drawBird();

      // 8. Screen Flash Effect
      if (this.flashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
        ctx.fillRect(0, 0, this.width, this.height);
      }

      // 9. UI / HUD Overlays
      if (this.state === STATES.READY) {
        this.renderReadyScreen();
      } else if (this.state === STATES.PLAYING) {
        this.renderPlayingScore();
      } else if (this.state === STATES.GAMEOVER) {
        this.renderGameOverScreen();
      }
    }

    drawCloud(x, y, scale) {
      const ctx = this.ctx;
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
      ctx.beginPath();
      ctx.arc(x, y, 14 * scale, 0, Math.PI * 2);
      ctx.arc(x + 12 * scale, y - 6 * scale, 16 * scale, 0, Math.PI * 2);
      ctx.arc(x + 26 * scale, y - 2 * scale, 13 * scale, 0, Math.PI * 2);
      ctx.arc(x + 36 * scale, y + 2 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawBackdropHills() {
      const ctx = this.ctx;
      const baseY = this.height - this.groundHeight;
      ctx.fillStyle = '#9fe099';
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.quadraticCurveTo(30, baseY - 22, 65, baseY);
      ctx.quadraticCurveTo(105, baseY - 32, 145, baseY);
      ctx.quadraticCurveTo(175, baseY - 18, this.width, baseY);
      ctx.lineTo(this.width, baseY);
      ctx.lineTo(0, baseY);
      ctx.fill();

      // Tree silhouettes on hills
      ctx.fillStyle = '#83d27b';
      [25, 50, 95, 125, 160].forEach(tx => {
        ctx.beginPath();
        ctx.arc(tx, baseY - 10, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    drawPipe(pipe) {
      const ctx = this.ctx;
      const w = this.pipeWidth;
      const collarH = 13;
      const collarOverlap = 3;

      // Pipe Gradient
      const makePipeGrad = (x, width) => {
        const g = ctx.createLinearGradient(x, 0, x + width, 0);
        g.addColorStop(0, '#53a830');
        g.addColorStop(0.25, '#7ee056');
        g.addColorStop(0.65, '#5bb836');
        g.addColorStop(1, '#34751f');
        return g;
      };

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#1d4d12';

      // --- Top Pipe ---
      const topBodyH = Math.max(0, pipe.top - collarH);
      ctx.fillStyle = makePipeGrad(pipe.x, w);
      ctx.fillRect(pipe.x, 0, w, topBodyH);
      ctx.strokeRect(pipe.x, -2, w, topBodyH + 2);

      // Top Pipe Lip/Collar
      ctx.fillStyle = makePipeGrad(pipe.x - collarOverlap, w + collarOverlap * 2);
      ctx.fillRect(pipe.x - collarOverlap, pipe.top - collarH, w + collarOverlap * 2, collarH);
      ctx.strokeRect(pipe.x - collarOverlap, pipe.top - collarH, w + collarOverlap * 2, collarH);

      // --- Bottom Pipe ---
      const bottomY = pipe.bottom;
      const groundY = this.height - this.groundHeight;
      const bottomBodyH = Math.max(0, groundY - bottomY - collarH);

      // Bottom Pipe Lip/Collar
      ctx.fillStyle = makePipeGrad(pipe.x - collarOverlap, w + collarOverlap * 2);
      ctx.fillRect(pipe.x - collarOverlap, bottomY, w + collarOverlap * 2, collarH);
      ctx.strokeRect(pipe.x - collarOverlap, bottomY, w + collarOverlap * 2, collarH);

      // Bottom Pipe Column
      ctx.fillStyle = makePipeGrad(pipe.x, w);
      ctx.fillRect(pipe.x, bottomY + collarH, w, bottomBodyH);
      ctx.strokeRect(pipe.x, bottomY + collarH, w, bottomBodyH + 2);
    }

    drawGround() {
      const ctx = this.ctx;
      const y = this.height - this.groundHeight;
      const h = this.groundHeight;

      // Top green grass bar
      ctx.fillStyle = '#68c430';
      ctx.fillRect(0, y, this.width, 8);
      ctx.fillStyle = '#4c9920';
      ctx.fillRect(0, y + 8, this.width, 2);

      // Sandy earth body
      ctx.fillStyle = '#ded895';
      ctx.fillRect(0, y + 10, this.width, h - 10);

      // Animated diagonal ground hash marks
      ctx.strokeStyle = '#cfc67a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = -20; x < this.width + 20; x += 14) {
        const sx = x - this.groundOffset;
        ctx.moveTo(sx, y + 10);
        ctx.lineTo(sx - 8, y + h);
      }
      ctx.stroke();

      // Ground separator line
      ctx.strokeStyle = '#1d4d12';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    drawBird() {
      const ctx = this.ctx;
      const b = this.bird;

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rotation);

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#1e293b';

      // 1. Bird Body (Vibrant Yellow Oval)
      ctx.fillStyle = '#fbc02d';
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 2. Belly Highlight Patch
      ctx.fillStyle = '#fff59d';
      ctx.beginPath();
      ctx.ellipse(-2, 3, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Cute Red Cheek
      ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
      ctx.beginPath();
      ctx.arc(3, 2, 2.8, 0, Math.PI * 2);
      ctx.fill();

      // 4. Wing
      ctx.fillStyle = '#f57f17';
      ctx.beginPath();
      if (b.wingPhase === 0) {
        // Wing Up
        ctx.ellipse(-5, -4, 5, 3, -0.4, 0, Math.PI * 2);
      } else if (b.wingPhase === 1) {
        // Wing Neutral
        ctx.ellipse(-5, 0, 5.5, 3.2, 0, 0, Math.PI * 2);
      } else {
        // Wing Down
        ctx.ellipse(-5, 3, 5, 3, 0.4, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();

      // 5. Beak
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(6, -2);
      ctx.lineTo(15, 1);
      ctx.lineTo(6, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Beak center line
      ctx.strokeStyle = '#c2410c';
      ctx.beginPath();
      ctx.moveTo(7, 1);
      ctx.lineTo(14, 1);
      ctx.stroke();

      // 6. Eye
      ctx.strokeStyle = '#1e293b';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(4, -3, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pupil
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(5.2, -3, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Eye Reflection Star
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(6, -3.8, 0.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    renderPlayingScore() {
      const ctx = this.ctx;
      ctx.save();
      ctx.font = '900 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#0f172a';
      ctx.fillStyle = '#ffffff';

      const text = this.score.toString();
      ctx.strokeText(text, this.width / 2, 40);
      ctx.fillText(text, this.width / 2, 40);
      ctx.restore();
    }

    renderReadyScreen() {
      const ctx = this.ctx;
      ctx.save();
      ctx.textAlign = 'center';

      // Tap to Fly Button Badge
      const btnY = this.height * 0.62;
      const pulse = 1 + Math.sin(this.frameCount * 0.1) * 0.05;

      ctx.save();
      ctx.translate(this.width / 2, btnY);
      ctx.scale(pulse, pulse);

      // Button shadow & background
      ctx.fillStyle = '#4f46e5';
      ctx.shadowColor = 'rgba(79, 70, 229, 0.45)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(-54, -15, 108, 30, 15);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.font = '800 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('TAP TO FLY 🚀', 0, 4);
      ctx.restore();

      // Instruction Hint Subtitle
      ctx.font = '600 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Click screen or press [Space]', this.width / 2, btnY + 28);

      ctx.restore();
    }

    renderGameOverScreen() {
      const ctx = this.ctx;
      ctx.save();
      ctx.textAlign = 'center';

      // Scoreboard Card
      const cardW = 146;
      const cardH = 112;
      const cardX = (this.width - cardW) / 2;
      const cardY = this.height * 0.22;

      // Card Background with smooth rounded edges & shadow
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 14);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Title
      ctx.font = '900 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('GAME OVER', this.width / 2, cardY + 22);

      // Score / Best Labels
      ctx.font = '700 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('SCORE', cardX + 40, cardY + 44);
      ctx.fillText('BEST', cardX + 106, cardY + 44);

      // Numbers
      ctx.font = '900 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(this.score.toString(), cardX + 40, cardY + 66);
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(this.bestScore.toString(), cardX + 106, cardY + 66);

      // Medal check
      if (this.score >= 5) {
        let medal = '🥉';
        if (this.score >= 20) medal = '🥇';
        else if (this.score >= 10) medal = '🥈';
        ctx.font = '16px serif';
        ctx.fillText(medal, cardX + 73, cardY + 62);
      }

      // Replay Button
      const replayY = cardY + cardH - 18;
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(cardX + 24, replayY - 10, cardW - 48, 22, 11);
      ctx.fill();

      ctx.font = '800 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('PLAY AGAIN ↻', this.width / 2, replayY + 5);

      ctx.restore();
    }

    loop() {
      this.update();
      this.render();
      requestAnimationFrame(this.loop);
    }
  }

  // Auto-instantiate when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new FlappyBirdEngine());
  } else {
    new FlappyBirdEngine();
  }

  window.FlappyBirdEngine = FlappyBirdEngine;
})(window);
