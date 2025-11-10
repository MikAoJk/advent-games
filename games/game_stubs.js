// Stub implementations for remaining games.
// Each returns basic structure so you can extend quickly.

(function(){
  const makeStub = (title, idea) => function({root,onStatus}) {
    root.innerHTML = `
      <div class="flex-center" style="flex:1; padding:1rem; text-align:center; flex-direction:column;">
        <h3 style="margin:.2rem 0 1rem;">${title} (Stub)</h3>
        <p style="max-width:560px; line-height:1.4;">${idea}</p>
        <p style="font-size:.85rem; opacity:.8;">Implement logic in this file. Use onStatus(label,value,id) for HUD items.</p>
      </div>
    `;
    onStatus('Status','Not Implemented','impl');
    function restart() {}
    function cleanup() {}
    return { restart, cleanup };
  };

  const stubs = {
    lightpattern: 'Repeat an increasingly long sequence of flashing holiday lights (Simon-style memory).',
    reactionelf: 'Tap/click as soon as an elf pops up; measure reaction time over rounds.',
    wordguess: 'Holiday word guess (Hangman-like) with limited attempts.',
    treebuilder: 'Drag ornaments to decorate a tree; score based on balance & symmetry.',
    slidingpuzzle: 'Solve a sliding tile puzzle of a festive image.',
    ornamentpaint: 'Simple pixel/paint grid to design an ornament pattern.',
    candysort: 'Sort candy pieces into correct jars before time runs out.',
    giftwrap: 'Click & hold to wrap gifts without over-wrapping / under-wrapping.',
    sleighdodge: 'Steer a sleigh to avoid obstacles; collect stars.',
    starpath: 'Connect stars in numerical order without crossing lines.',
    snowballtoss: 'Angle + power mechanic to hit targets (snowmen).',
    garlandconnect: 'Lay garland path connecting points with minimal turns.',
    chimneystack: 'Stack chimney segments as high as possible (timed alignment).',
    caroltyper: 'Type carol lyrics accurately; accuracy & speed score.',
    icemaze: 'Navigate slippery grid maze with momentum.',
    reindeerpair: 'Match reindeer by attributes (speed, color) under time pressure.',
    cookiebake: 'Sequence mini steps (mix, shape, bake) while timers run.',
    blizzardbalance: 'Keep indicators within safe zone by adjusting vents (resource balancing).',
    northpolequiz: 'Multiple choice trivia with streak bonuses.',
    pixeltree: 'Design a pixel-art tree; export as text pattern.',
    santasprint: 'Endless runner: jump & slide to avoid obstacles.'
  };

  Object.entries(stubs).forEach(([key, idea]) => {
    window.AdventGames[key] = makeStub(key, idea);
  });

})();
