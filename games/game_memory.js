// Memory Match: Pair holiday emoji cards.
(function(){
  const EMOJIS = ['🎄','🎁','⭐','🧣','🕯','🍪','🧦','🔔'];
  const DUPLICATED = [...EMOJIS, ...EMOJIS];

  function shuffle(arr){
    for (let i=arr.length-1;i>0;i--){
      const j = Math.floor(Math.random()* (i+1));
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    return arr;
  }

  window.AdventGames.memory = function({root,onStatus}) {
    root.innerHTML = '';
    const board = document.createElement('div');
    board.className = 'board-memory';
    root.appendChild(board);
    const info = document.createElement('div');
    info.className = 'instructions';
    info.innerHTML = 'Find all matching pairs. Lower moves = better!';
    root.appendChild(info);

    let cards = [];
    let first = null;
    let lock = false;
    let moves = 0;
    let matched = 0;
    let startTime = Date.now();

    function updateStatus() {
      onStatus('Moves', moves, 'moves');
      onStatus('Matched', matched+'/'+EMOJIS.length, 'matched');
      const secs = ((Date.now()-startTime)/1000).toFixed(1);
      onStatus('Time', secs+'s', 'time');
    }

    function build() {
      const order = shuffle(DUPLICATED.slice());
      order.forEach((emoji, idx) => {
        const card = document.createElement('button');
        card.className = 'card';
        card.dataset.emoji = emoji;
        card.dataset.index = idx;
        card.innerHTML = '❓';
        card.addEventListener('click', () => handleCard(card));
        board.appendChild(card);
        cards.push(card);
      });
      updateStatus();
    }

    function handleCard(card) {
      if (lock || card.classList.contains('matched') || card === first) return;

      reveal(card);

      if (!first) {
        first = card;
        return;
      }

      moves++;
      updateStatus();

      if (card.dataset.emoji === first.dataset.emoji) {
        // match
        card.classList.add('matched');
        first.classList.add('matched');
        matched++;
        first = null;
        updateStatus();
        if (matched === EMOJIS.length) {
          setTimeout(()=> {
            info.innerHTML = `Completed in ${moves} moves and ${(Date.now()-startTime)/1000|0} seconds! 🎉`;
          }, 250);
        }
      } else {
        lock = true;
        setTimeout(()=> {
          hide(card);
          hide(first);
          first = null;
          lock = false;
        }, 700);
      }
    }

    function reveal(card) {
      card.classList.add('revealed');
      card.textContent = card.dataset.emoji;
    }
    function hide(card) {
      card.classList.remove('revealed');
      card.textContent = '❓';
    }

    function cleanup() {
      cards.forEach(c => c.remove());
      cards = [];
    }

    function restart() {
      cleanup();
      board.innerHTML = '';
      first = null;
      lock = false;
      moves = 0;
      matched = 0;
      startTime = Date.now();
      build();
    }

    build();

    return { cleanup, restart };
  };

})();
