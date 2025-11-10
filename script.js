// Core calendar + modal + game lifecycle.
const calendarEl = document.getElementById('calendar');
const modalEl = document.getElementById('gameModal');
const gameRoot = document.getElementById('gameRoot');
const gameTitleEl = document.getElementById('gameTitle');
const gameStatusEl = document.getElementById('gameStatus');
const closeModalBtn = document.getElementById('closeModal');
const restartBtn = document.getElementById('restartGame');

let activeGame = null;

// Define games meta (title + initializer key)
const games = [
  { day:1,  key:'snowfall',      title:'Snowfall Clicker' },
  { day:2,  key:'memory',        title:'Memory Match' },
  { day:3,  key:'presentcatch',  title:'Present Catch' },
  { day:4,  key:'lightpattern',  title:'Light Pattern' },
  { day:5,  key:'reactionelf',   title:'Reaction Elf' },
  { day:6,  key:'wordguess',     title:'Word Guess' },
  { day:7,  key:'treebuilder',   title:'Tree Builder' },
  { day:8,  key:'slidingpuzzle', title:'Sliding Puzzle' },
  { day:9,  key:'ornamentpaint', title:'Ornament Painter' },
  { day:10, key:'candysort',     title:'Candy Sort' },
  { day:11, key:'giftwrap',      title:'Gift Wrap Rush' },
  { day:12, key:'sleighdodge',   title:'Sleigh Dodge' },
  { day:13, key:'starpath',      title:'Star Path' },
  { day:14, key:'snowballtoss',  title:'Snowball Toss' },
  { day:15, key:'garlandconnect',title:'Garland Connect' },
  { day:16, key:'chimneystack',  title:'Chimney Stack' },
  { day:17, key:'caroltyper',    title:'Carol Typer' },
  { day:18, key:'icemaze',       title:'Ice Maze' },
  { day:19, key:'reindeerpair',  title:'Reindeer Pair' },
  { day:20, key:'cookiebake',    title:'Cookie Bake (Stub)' },
  { day:21, key:'blizzardbalance',title:'Blizzard Balance (Stub)' },
  { day:22, key:'northpolequiz', title:'North Pole Quiz (Stub)' },
  { day:23, key:'pixeltree',     title:'Pixel Tree (Stub)' },
  { day:24, key:'santasprint',   title:'Santa Sprint (Stub)' },
];

// Determine today's day (cheat: allow all unlocked; optionally restrict)
const now = new Date();
const currentMonth = now.getMonth(); // 0-based
// If you want strict unlocking only in December, uncomment below:
// const isDecember = currentMonth === 11;
const isDecember = true; // For demo: always treat as December.
const todayDay = now.getDate();

// Build calendar
games.forEach(game => {
  const door = document.createElement('button');
  door.className = 'door';
  door.innerHTML = `
    <span class="door-number">${game.day}</span>
    <span class="door-title">${game.title}</span>
  `;
  // Lock logic: in real Advent restrict to <= todayDay
  const locked = isDecember ? (game.day > todayDay) : false;
  if (locked) door.classList.add('locked');

  door.addEventListener('click', () => {
    if (door.classList.contains('locked')) return;
    launchGame(game);
  });

  calendarEl.appendChild(door);
});

// Launch game
function launchGame(gameMeta) {
  gameRoot.innerHTML = '';
  gameStatusEl.innerHTML = '';
  gameTitleEl.textContent = `${gameMeta.day}. ${gameMeta.title}`;
  modalEl.classList.remove('hidden');

  // Acquire initializer from global registry "AdventGames"
  const init = AdventGames[gameMeta.key];
  if (!init) {
    gameRoot.innerHTML = `<div class="flex-center" style="flex:1;">
      <p>Game not implemented yet. Check stubs to build it. 💡</p>
    </div>`;
    return;
  }
  activeGame = init({
    root: gameRoot,
    statusBar: gameStatusEl,
    onStatus: addStatusItem,
  });
}

// Add status item
function addStatusItem(label, value, id) {
  let el = id ? gameStatusEl.querySelector(`[data-id="${id}"]`) : null;
  if (!el) {
    el = document.createElement('div');
    el.className = 'status-item';
    if (id) el.dataset.id = id;
    gameStatusEl.appendChild(el);
  }
  el.textContent = `${label}: ${value}`;
}

// Close modal
closeModalBtn.addEventListener('click', closeModal);
function closeModal() {
  modalEl.classList.add('hidden');
  if (activeGame && typeof activeGame.cleanup === 'function') {
    activeGame.cleanup();
  }
  activeGame = null;
}

// Restart button
restartBtn.addEventListener('click', () => {
  if (activeGame && typeof activeGame.restart === 'function') {
    activeGame.restart();
  }
});

// Click outside to close
modalEl.addEventListener('click', e => {
  if (e.target === modalEl) closeModal();
});

// Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modalEl.classList.contains('hidden')) {
    closeModal();
  }
});

// Global registry object
window.AdventGames = window.AdventGames || {};
