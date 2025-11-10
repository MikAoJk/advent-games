// Present Catch: Move elf horizontally to catch presents and avoid coal.
(function(){
  const CONFIG = {
    spawnRateStart: 1200,
    spawnRateMin: 450,
    speedIncrease: 0.985,
    presentScore: 5,
    coalPenalty: 7,
    maxLives: 3
  };

  window.AdventGames.presentcatch = function({root,onStatus}) {
    root.innerHTML = '';
    const area = document.createElement('div');
    area.className = 'catch-area';
    root.appendChild(area);
    const instructions = document.createElement('div');
    instructions.className = 'instructions';
    instructions.innerHTML = '← → or A D to move. Catch presents 🎁, avoid coal 🪨. Lose all lives = game over.';
    root.appendChild(instructions);

    let playerX = 50;
    let score = 0;
    let lives = CONFIG.maxLives;
    let spawnRate = CONFIG.spawnRateStart;
    let running = true;
    let spawnTimer;
    const player = document.createElement('div');
    player.className = 'player';
    player.textContent = '🧝';
    area.appendChild(player);

    const objects = new Set();

    function updateStatus() {
      onStatus('Score', score, 'score');
      onStatus('Lives', lives, 'lives');
      onStatus('Spawn', (spawnRate/1000).toFixed(2)+'s', 'spawn');
    }

    function positionPlayer() {
      const max = area.clientWidth - player.offsetWidth - 4;
      const px = Math.max(0, Math.min(max, playerX));
      player.style.left = px + 'px';
    }

    function spawnObject() {
      if (!running) return;
      const el = document.createElement('div');
      el.className = 'falling';
      const type = Math.random() < 0.75 ? 'present' : 'coal';
      el.classList.add(type);
      el.textContent = type === 'present' ? '🎁' : '🪨';
      const left = Math.random() * (area.clientWidth - 46);
      el.style.left = left + 'px';
      const duration = (Math.random()*4+4)+'s';
      el.style.animationDuration = duration;
      area.appendChild(el);
      objects.add(el);

      const start = Date.now();
      const tick = () => {
        if (!running) return;
        const elapsed = Date.now()-start;
        const progress = elapsed / (parseFloat(duration)*1000);
        const y = progress * (area.clientHeight + 120);
        el.style.transform = `translateY(${y}px)`;
        if (progress >= 1) {
          objects.delete(el);
          el.remove();
          return;
        }
        // Collision
        const playerRect = player.getBoundingClientRect();
        const objRect = el.getBoundingClientRect();
        if (rectsOverlap(playerRect, objRect)) {
          if (type === 'present') {
            score += CONFIG.presentScore;
            spawnRate = Math.max(CONFIG.spawnRateMin, spawnRate * CONFIG.speedIncrease);
          } else {
            lives--;
            score = Math.max(0, score - CONFIG.coalPenalty);
            if (lives <= 0) endGame();
          }
          objects.delete(el);
            el.remove();
          updateStatus();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    function rectsOverlap(a,b){
      return !(b.left > a.right || b.right < a.left || b.top > a.bottom || b.bottom < a.top);
    }

    function scheduleSpawn() {
      clearTimeout(spawnTimer);
      spawnTimer = setTimeout(() => {
        spawnObject();
        scheduleSpawn();
      }, spawnRate);
    }

    function endGame() {
      running = false;
      instructions.innerHTML = `Game Over. Final Score: ${score}. Press Restart to play again.`;
      clearTimeout(spawnTimer);
      objects.forEach(o => o.remove());
      objects.clear();
    }

    function keyHandler(e){
      if (!running) return;
      if (['ArrowLeft','a','A'].includes(e.key)) playerX -= 28;
      if (['ArrowRight','d','D'].includes(e.key)) playerX += 28;
      positionPlayer();
    }

    document.addEventListener('keydown', keyHandler);

    function start() {
      updateStatus();
      positionPlayer();
      scheduleSpawn();
    }

    function cleanup() {
      running = false;
      document.removeEventListener('keydown', keyHandler);
      clearTimeout(spawnTimer);
      objects.forEach(o => o.remove());
      objects.clear();
    }

    function restart() {
      cleanup();
      score = 0; lives = CONFIG.maxLives;
      spawnRate = CONFIG.spawnRateStart;
      running = true;
      instructions.innerHTML = '← → or A D to move. Catch presents 🎁, avoid coal 🪨.';
      start();
    }

    start();

    return { cleanup, restart };
  };

})();