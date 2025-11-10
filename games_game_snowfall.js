// Snowfall Clicker: Click snowflakes before they fade.
// Difficulty scales; track score & misses.
(function(){
  const CONFIG = {
    spawnIntervalStart: 1000,
    spawnIntervalMin: 350,
    decayTime: 6000,
    acceleration: 0.985,
    scorePerHit: 10,
    missPenalty: 3,
  };

  window.AdventGames.snowfall = function({root,onStatus,statusBar}) {
    root.innerHTML = '';
    const area = document.createElement('div');
    area.className = 'snow-area';
    root.appendChild(area);
    const instructions = document.createElement('div');
    instructions.className = 'instructions';
    instructions.innerHTML = 'Click snowflakes ❄️ before they melt. Speed increases. Misses reduce score.';
    root.appendChild(instructions);

    let score = 0;
    let misses = 0;
    let interval = CONFIG.spawnIntervalStart;
    let running = true;
    let spawnTimer;
    let flakes = new Set();

    function updateStatus() {
      onStatus('Score', score, 'score');
      onStatus('Misses', misses, 'misses');
      onStatus('Spawn', (interval/1000).toFixed(2)+'s', 'interval');
    }

    function spawnFlake() {
      if (!running) return;
      const flake = document.createElement('div');
      flake.className = 'snowflake';
      flake.textContent = ['❄','❅','❆'][Math.floor(Math.random()*3)];
      const left = Math.random()* (area.clientWidth - 40);
      flake.style.left = left+'px';
      const fallDuration = (Math.random()*6+5)+'s';
      flake.style.animationDuration = fallDuration;

      let clicked = false;
      const removeTimeout = setTimeout(() => {
        if (!clicked) {
          misses++;
          score = Math.max(0, score - CONFIG.missPenalty);
          flakes.delete(flake);
          flake.remove();
          updateStatus();
        }
      }, CONFIG.decayTime);

      flake.addEventListener('click', () => {
        if (clicked) return;
        clicked = true;
        score += CONFIG.scorePerHit;
        interval = Math.max(CONFIG.spawnIntervalMin, interval * CONFIG.acceleration);
        flake.style.opacity = '0';
        flake.style.transition = 'opacity .25s';
        setTimeout(()=> {
          flakes.delete(flake);
          flake.remove();
        },240);
        clearTimeout(removeTimeout);
        updateStatus();
        scheduleNext();
      });

      flakes.add(flake);
      area.appendChild(flake);
    }

    function scheduleNext() {
      clearTimeout(spawnTimer);
      spawnTimer = setTimeout(() => {
        spawnFlake();
      }, interval);
    }

    function start() {
      updateStatus();
      spawnFlake();
      scheduleNext();
    }

    function cleanup() {
      running = false;
      clearTimeout(spawnTimer);
      flakes.forEach(f => f.remove());
      flakes.clear();
    }

    function restart() {
      cleanup();
      score = 0; misses = 0;
      interval = CONFIG.spawnIntervalStart;
      running = true;
      start();
    }

    start();

    return { cleanup, restart };
  };
})();