// Implementations for all previously stubbed games.
// Each game kept intentionally concise; feel free to expand depth & polish.

(function(){
  const rand = (min,max)=>Math.random()*(max-min)+min;
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

  // 1. Light Pattern (Simon)
  window.AdventGames.lightpattern = function({root,onStatus}) {
    root.innerHTML = '';
    const colors = ['#ff4d4d','#4dd2ff','#ffe04d','#7dfc5b'];
    let sequence = [];
    let userIndex = 0;
    let level = 0;
    let accepting = false;
    const wrap = document.createElement('div');
    wrap.style.display='flex';
    wrap.style.gap='1rem';
    wrap.style.justifyContent='center';
    wrap.style.margin='1.2rem 0';
    const msg = document.createElement('div');
    msg.className='instructions';
    msg.textContent='Repeat the flashing light sequence.';
    root.appendChild(wrap);
    root.appendChild(msg);

    const pads = colors.map((c,i)=>{
      const b=document.createElement('button');
      b.style.width='90px';
      b.style.height='90px';
      b.style.borderRadius='18px';
      b.style.background=c;
      b.style.border='3px solid rgba(255,255,255,.2)';
      b.style.cursor='pointer';
      b.style.boxShadow='0 4px 10px -3px rgba(0,0,0,.6)';
      b.addEventListener('click',()=> {
        if(!accepting) return;
        flash(b,180);
        if(i===sequence[userIndex]) {
          userIndex++;
          if(userIndex===sequence.length){
            accepting=false;
            level++;
            onStatus('Level',level,'level');
            setTimeout(nextRound,600);
          }
        } else {
          msg.textContent='Wrong! Sequence reset.';
          sequence=[];
          userIndex=0;
          level=0;
          onStatus('Level',level,'level');
          accepting=false;
          setTimeout(nextRound,1000);
        }
      });
      wrap.appendChild(b);
      return b;
    });

    function flash(el,dur=400){
      const orig=el.style.filter;
      el.style.filter='brightness(160%)';
      setTimeout(()=> el.style.filter=orig,dur);
    }

    function playSequence(){
      accepting=false;
      let i=0;
      const playStep=()=>{
        if(i>=sequence.length){ accepting=true; userIndex=0; return;}
        const idx=sequence[i];
        flash(pads[idx]);
        i++;
        setTimeout(playStep,650);
      };
      playStep();
    }

    function nextRound(){
      sequence.push(Math.floor(Math.random()*pads.length));
      msg.textContent='Watch...';
      playSequence();
    }

    function restart(){
      sequence=[]; level=0; userIndex=0;
      onStatus('Level',level,'level');
      nextRound();
    }
    function cleanup(){}

    restart();
    return {restart,cleanup};
  };

  // 2. Reaction Elf
  window.AdventGames.reactionelf = function({root,onStatus}) {
    root.innerHTML='';
    const area=document.createElement('div');
    area.className='flex-center';
    area.style.flex='1';
    const btn=document.createElement('button');
    btn.className='secondary-btn';
    btn.style.fontSize='1.2rem';
    btn.textContent='Start Round';
    const info=document.createElement('div');
    info.className='instructions';
    info.innerHTML='Click when elf appears! Lower ms is better.';
    root.append(area,info);
    area.append(btn);
    let times=[];
    let waiting=false;
    let start=0;
    btn.addEventListener('click', ()=>{
      if(waiting) return;
      btn.disabled=true;
      btn.textContent='...';
      const delay=rand(900,2600);
      waiting=true;
      setTimeout(()=>{
        btn.disabled=false;
        btn.textContent='🧝 CLICK!';
        start=performance.now();
      }, delay);
    });
    btn.addEventListener('mousedown', ()=>{
      if(!waiting || start===0) return;
      const t=performance.now()-start;
      times.push(t);
      waiting=false;
      start=0;
      btn.textContent='Start Round';
      const avg= times.reduce((a,b)=>a+b,0)/times.length;
      const best=Math.min(...times);
      onStatus('Rounds', times.length,'rounds');
      onStatus('Avg', avg.toFixed(1)+'ms','avg');
      onStatus('Best', best.toFixed(1)+'ms','best');
    });
    function restart(){ times=[]; start=0; waiting=false; btn.textContent='Start Round'; ['rounds','avg','best'].forEach(id=>onStatus(id,'-',[id])); }
    function cleanup(){}
    restart();
    return {restart,cleanup};
  };

  // 3. Word Guess (Hangman)
  window.AdventGames.wordguess = function({root,onStatus}) {
    root.innerHTML='';
    const words=['holly','garland','snowflake','reindeer','candle','present','cookie','elf','tinsel','winter'];
    let secret='', revealed=[], wrong=0, maxWrong=7, used=new Set();
    const display=document.createElement('div');
    display.style.fontSize='2rem';
    display.style.letterSpacing='.4rem';
    display.style.textAlign='center';
    display.style.margin='1rem 0';
    const kwrap=document.createElement('div');
    kwrap.style.display='grid';
    kwrap.style.gridTemplateColumns='repeat(auto-fill,minmax(42px,1fr))';
    kwrap.style.gap='.4rem';
    const msg=document.createElement('div');
    msg.className='instructions';
    root.append(display,kwrap,msg);
    const alphabet='abcdefghijklmnopqrstuvwxyz'.split('');
    alphabet.forEach(ch=>{
      const b=document.createElement('button');
      b.textContent=ch;
      b.style.padding='.55rem 0';
      b.style.background='#224363';
      b.style.border='1px solid #335b7d';
      b.style.color='#fff';
      b.style.borderRadius='8px';
      b.style.cursor='pointer';
      b.addEventListener('click', ()=> guess(ch,b));
      kwrap.appendChild(b);
    });

    function updateDisplay() {
      display.textContent=revealed.join(' ');
      onStatus('Wrong', wrong+'/'+maxWrong,'wrong');
    }

    function guess(ch,btn){
      if(used.has(ch) || wrong>=maxWrong) return;
      used.add(ch);
      btn.style.opacity='.4';
      if(secret.includes(ch)){
        secret.split('').forEach((c,i)=> { if(c===ch) revealed[i]=c; });
        updateDisplay();
        if(!revealed.includes('_')) {
          msg.textContent='You solved it! 🎉 Word: '+secret;
        }
      } else {
        wrong++;
        updateDisplay();
        if(wrong>=maxWrong) {
          msg.textContent='Game Over. Word was '+secret;
        }
      }
    }

    function restart(){
      secret=pick(words);
      revealed=secret.split('').map(()=> '_');
      wrong=0; used.clear();
      msg.textContent='Guess the holiday word.';
      kwrap.querySelectorAll('button').forEach(b=> b.style.opacity='1');
      updateDisplay();
    }
    function cleanup(){}
    restart();
    return {restart,cleanup};
  };

  // 4. Tree Builder (drag ornaments)
  window.AdventGames.treebuilder = function({root,onStatus}) {
    root.innerHTML='';
    const container=document.createElement('div');
    container.style.display='flex';
    container.style.gap='1rem';
    container.style.flex='1';
    const palette=document.createElement('div');
    palette.style.width='140px';
    palette.style.display='flex';
    palette.style.flexDirection='column';
    palette.style.gap='.5rem';
    const treeArea=document.createElement('div');
    treeArea.style.flex='1';
    treeArea.style.position='relative';
    treeArea.style.display='flex';
    treeArea.style.alignItems='center';
    treeArea.style.justifyContent='center';
    const tree=document.createElement('div');
    tree.style.width='260px'; tree.style.height='360px';
    tree.style.background='linear-gradient(#1e4327,#276636)';
    tree.style.clipPath='polygon(50% 0%, 90% 30%, 72% 30%, 96% 55%, 75% 55%, 100% 80%, 0 80%, 25% 55%, 4% 55%, 28% 30%, 10% 30%)';
    tree.style.position='relative';
    tree.style.border='2px solid #1b3a23';
    tree.style.borderRadius='12px';
    tree.style.boxShadow='0 0 25px -6px rgba(0,0,0,.6) inset';
    treeArea.appendChild(tree);
    const msg=document.createElement('div');
    msg.className='instructions';
    msg.textContent='Drag ornaments onto the tree.';
    root.append(container,msg);
    container.append(palette,treeArea);

    const ornamentTypes=['🔴','🟡','🟢','🔵','⭐','💜'];
    ornamentTypes.forEach(o=>{
      const d=document.createElement('div');
      d.textContent=o;
      d.style.fontSize='2rem';
      d.style.background='#20384e';
      d.style.padding='.5rem';
      d.style.border='1px solid #335b7d';
      d.style.borderRadius='10px';
      d.style.cursor='grab';
      d.draggable=true;
      d.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', o));
      palette.appendChild(d);
    });
    tree.addEventListener('dragover', e=> e.preventDefault());
    let placed=[];
    tree.addEventListener('drop', e=> {
      e.preventDefault();
      const o=e.dataTransfer.getData('text/plain');
      const rect=tree.getBoundingClientRect();
      const x=e.clientX-rect.left;
      const y=e.clientY-rect.top;
      const span=document.createElement('span');
      span.textContent=o;
      span.style.position='absolute';
      span.style.left=(x-16)+'px';
      span.style.top=(y-16)+'px';
      span.style.fontSize='1.8rem';
      tree.appendChild(span);
      placed.push(o);
      score();
    });

    function score(){
      const unique=new Set(placed).size;
      const total=placed.length;
      const diversity = total? (unique/ornamentTypes.length)*100:0;
      onStatus('Placed', total,'placed');
      onStatus('Diversity', diversity.toFixed(1)+'%','div');
    }

    function restart(){
      placed=[];
      tree.querySelectorAll('span').forEach(s=>s.remove());
      score();
    }
    function cleanup(){}

    restart();
    return {restart,cleanup};
  };

  // 5. Sliding Puzzle (3x3)
  window.AdventGames.slidingpuzzle = function({root,onStatus}) {
    root.innerHTML='';
    const board=document.createElement('div');
    board.style.width='300px';
    board.style.height='300px';
    board.style.display='grid';
    board.style.gridTemplateColumns='repeat(3,1fr)';
    board.style.gap='.4rem';
    board.style.margin='0 auto';
    const info=document.createElement('div');
    info.className='instructions';
    info.textContent='Arrange tiles 1-8; blank bottom right.';
    root.append(board,info);
    let tiles=[], moves=0, startTime=0;

    function shuffle(arr){
      for(let i=arr.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [arr[i],arr[j]]=[arr[j],arr[i]];
      }
      return arr;
    }

    function build(){
      board.innerHTML='';
      const set = shuffle([1,2,3,4,5,6,7,8,null]);
      tiles=set;
      set.forEach(v=>{
        const b=document.createElement('button');
        b.style.fontSize='1.6rem';
        b.style.background='#1f3a55';
        b.style.border='2px solid #335b7d';
        b.style.borderRadius='10px';
        b.style.height='94px';
        b.textContent=v||'';
        if(!v){ b.style.opacity='.2'; }
        b.addEventListener('click', ()=> move(v));
        board.appendChild(b);
      });
      startTime=Date.now();
      moves=0;
      updateStatus();
    }

    function move(val){
      if(val==null) return;
      const idx=tiles.indexOf(val);
      const blank=tiles.indexOf(null);
      const adj=[blank-3, blank+3];
      if(blank%3!==0) adj.push(blank-1);
      if(blank%3!==2) adj.push(blank+1);
      if(!adj.includes(idx)) return;
      tiles[blank]=val;
      tiles[idx]=null;
      moves++;
      render();
      updateStatus();
      if(isSolved()) {
        info.textContent='Solved in '+moves+' moves!';
      }
    }

    function isSolved(){
      for(let i=0;i<8;i++){
        if(tiles[i]!==i+1) return false;
      }
      return tiles[8]===null;
    }

    function render(){
      [...board.children].forEach((b,i)=>{
        b.textContent=tiles[i]||'';
        b.style.opacity= tiles[i] ? '1' : '.25';
      });
    }

    function updateStatus(){
      onStatus('Moves', moves,'moves');
      const secs=((Date.now()-startTime)/1000).toFixed(1);
      onStatus('Time', secs+'s','time');
    }

    function restart(){ build(); }
    function cleanup(){}

    build();
    return {restart,cleanup};
  };

  // 6. Ornament Painter
  window.AdventGames.ornamentpaint = function({root,onStatus}) {
    root.innerHTML='';
    const size=14;
    const grid=document.createElement('div');
    grid.style.display='grid';
    grid.style.gridTemplateColumns=`repeat(${size},1fr)`;
    grid.style.gap='2px';
    grid.style.width='min(420px,100%)';
    grid.style.margin='0 auto';
    const palette=document.createElement('div');
    palette.style.display='flex';
    palette.style.gap='.5rem';
    palette.style.justifyContent='center';
    palette.style.margin='0.8rem 0';
    const colors=['#ff4d4d','#ffe04d','#4dd2ff','#7dfc5b','#ffffff','#aa66ff','#ff9f1c','#ff89b3','#444'];
    let current=colors[0];
    colors.forEach(c=>{
      const b=document.createElement('button');
      b.style.background=c;
      b.style.width='36px';
      b.style.height='36px';
      b.style.border='2px solid #20384e';
      b.style.borderRadius='8px';
      b.addEventListener('click', ()=> current=c);
      palette.appendChild(b);
    });
    root.append(grid,palette);
    const exportBtn=document.createElement('button');
    exportBtn.className='secondary-btn';
    exportBtn.textContent='Export';
    exportBtn.style.display='block';
    exportBtn.style.margin='0.4rem auto';
    root.append(exportBtn);
    const msg=document.createElement('div');
    msg.className='instructions';
    msg.textContent='Paint ornament; click Export for pattern.';
    root.append(msg);

    function build(){
      grid.innerHTML='';
      for(let i=0;i<size*size;i++){
        const cell=document.createElement('div');
        cell.style.background='#142536';
        cell.style.paddingTop='100%';
        cell.style.position='relative';
        cell.style.border='1px solid #1f3a55';
        cell.style.cursor='pointer';
        cell.addEventListener('click', ()=>{
          cell.style.background=current;
          updateStatus();
        });
        grid.appendChild(cell);
      }
      updateStatus();
    }

    function updateStatus(){
      const usedColors=new Set();
      [...grid.children].forEach(c=> usedColors.add(c.style.background));
      onStatus('Colored', usedColors.size-1,'colored');
    }

    exportBtn.addEventListener('click', ()=>{
      const pattern=[...grid.children].map(c=> c.style.background);
      const text=pattern.map((c,i)=>{
        const row=i%size===0?'\n':'';
        return row + (c==='#142536'?'.':'#');
      }).join('');
      msg.textContent='Pattern:\n'+text;
    });

    function restart(){ build(); msg.textContent='Paint ornament; click Export for pattern.'; }
    function cleanup(){}

    restart();
    return {restart,cleanup};
  };

  // 7. Candy Sort
  window.AdventGames.candysort = function({root,onStatus}) {
    root.innerHTML='';
    const area=document.createElement('div');
    area.style.flex='1';
    area.style.position='relative';
    area.style.border='1px solid #335b7d';
    area.style.borderRadius='12px';
    area.style.overflow='hidden';
    const jars=document.createElement('div');
    jars.style.display='flex';
    jars.style.gap='1rem';
    jars.style.justifyContent='center';
    jars.style.margin='.6rem 0';
    const msg=document.createElement('div');
    msg.className='instructions';
    msg.textContent='Click candy and then correct jar (Red/Green/Blue).';
    root.append(area,jars,msg);
    const types=[{name:'Red',color:'#ff4d4d'},{name:'Green',color:'#4caf50'},{name:'Blue',color:'#4da6ff'}];
    types.forEach(t=>{
      const b=document.createElement('button');
      b.className='secondary-btn';
      b.textContent=t.name;
      b.dataset.type=t.name;
      jars.appendChild(b);
    });

    let spawnTimer, score=0, wrong=0, selected=null, running=true;

    function spawn(){
      if(!running) return;
      const candy=document.createElement('div');
      candy.style.position='absolute';
      candy.style.left=rand(0, area.clientWidth-40)+'px';
      candy.style.top='-40px';
      candy.style.width='40px';
      candy.style.height='40px';
      candy.style.borderRadius='50%';
      const t=pick(types);
      candy.dataset.type=t.name;
      candy.style.background=t.color;
      candy.style.display='flex';
      candy.style.alignItems='center';
      candy.style.justifyContent='center';
      candy.style.fontSize='1.2rem';
      candy.style.cursor='pointer';
      candy.textContent='🍬';
      area.appendChild(candy);
      const start=Date.now();
      function fall(){
        const p=(Date.now()-start)/3000;
        candy.style.transform=`translateY(${p*(area.clientHeight+60)}px)`;
        if(p>=1) { candy.remove(); return; }
        requestAnimationFrame(fall);
      }
      requestAnimationFrame(fall);
      candy.addEventListener('click', ()=>{
        selected=candy;
        candy.style.outline='3px solid #fff';
      });
      spawnTimer=setTimeout(spawn, rand(800,1500));
    }

    jars.addEventListener('click', e=>{
      const btn=e.target.closest('button');
      if(!btn || !selected) return;
      if(btn.dataset.type===selected.dataset.type){
        score++;
        selected.remove();
      } else {
        wrong++;
      }
      selected=null;
      updateStatus();
    });

    function updateStatus(){
      onStatus('Score', score,'score');
      onStatus('Wrong', wrong,'wrong');
    }

    function restart(){
      running=true; score=0; wrong=0;
      [...area.children].forEach(c=>c.remove());
      updateStatus();
      spawn();
    }

    function cleanup(){ running=false; clearTimeout(spawnTimer); }

    restart();
    return {restart,cleanup};
  };

  // 8. Gift Wrap Rush
  window.AdventGames.giftwrap = function({root,onStatus}) {
    root.innerHTML='';
    const bar=document.createElement('div');
    bar.style.height='34px';
    bar.style.border='2px solid #335b7d';
    bar.style.borderRadius='14px';
    bar.style.position='relative';
    bar.style.overflow='hidden';
    bar.style.margin='1rem 0';
    const fill=document.createElement('div');
    fill.style.height='100%';
    fill.style.width='0%';
    fill.style.background='#ffca3a';
    bar.appendChild(fill);
    const zone=document.createElement('div');
    zone.style.position='absolute';
    zone.style.top='0'; zone.style.height='100%';
    zone.style.background='rgba(76,175,80,.35)';
    // success zone random later
    bar.appendChild(zone);
    const msg=document.createElement('div');
    msg.className='instructions';
    msg.textContent='Hold mouse (or touch) to wrap; release within green zone.';
    root.append(bar,msg);
    let progress=0, holding=false, wins=0, fails=0;

    function newZone(){
      const start=rand(40,65), width=rand(8,16);
      zone.style.left=start+'%';
      zone.style.width=width+'%';
    }

    function frame(){
      if(holding){
        progress=Math.min(100, progress+0.6);
        fill.style.width=progress+'%';
        if(progress>=100){
          fails++;
          holding=false;
          msg.textContent='Over-wrapped! Failed.';
          finish();
        }
      } else if(progress>0){
        progress=Math.max(0, progress-0.4);
        fill.style.width=progress+'%';
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    function finish(){
      const p=progress;
      const zStart=parseFloat(zone.style.left);
      const zEnd=zStart+parseFloat(zone.style.width);
      if(p>=zStart && p<=zEnd){
        wins++;
        msg.textContent='Well wrapped! 🎁';
      } else if(progress<100) {
        fails++;
        msg.textContent='Missed zone.';
      }
      progress=0;
      fill.style.width='0%';
      newZone();
      updateStatus();
    }

    bar.addEventListener('mousedown', ()=> { holding=true; msg.textContent='Wrapping...'; });
    document.addEventListener('mouseup', ()=> {
      if(holding){ holding=false; finish(); }
    });
    bar.addEventListener('touchstart', e=> { e.preventDefault(); holding=true; });
    document.addEventListener('touchend', ()=> {
      if(holding){ holding=false; finish(); }
    });

    function updateStatus(){
      onStatus('Wins', wins,'wins');
      onStatus('Fails', fails,'fails');
    }
    function restart(){ wins=0; fails=0; progress=0; newZone(); updateStatus(); msg.textContent='Hold to wrap; release in zone.'; }
    function cleanup(){}

    restart();
    return {restart,cleanup};
  };

  // 9. Sleigh Dodge
  window.AdventGames.sleighdodge = function({root,onStatus}) {
    root.innerHTML='';
    const area=document.createElement('div');
    area.style.flex='1';
    area.style.position='relative';
    area.style.background='radial-gradient(circle at 50% 30%, #264b6b, #142536)';
    area.style.overflow='hidden';
    root.append(area);
    const player=document.createElement('div');
    player.textContent='🛷';
    player.style.position='absolute';
    player.style.bottom='20px';
    player.style.left='50%';
    player.style.transform='translateX(-50%)';
    player.style.fontSize='2.2rem';
    area.appendChild(player);
    let x=area.clientWidth/2, speed=6, score=0, running=true, objs=new Set(), spawnTimer;

    function spawn(){
      if(!running) return;
      const o=document.createElement('div');
      const type=Math.random()<0.75?'ob':'star';
      o.textContent= type==='ob' ? '🧊' : '⭐';
      o.dataset.type=type;
      o.style.position='absolute';
      o.style.left=rand(0, area.clientWidth-40)+'px';
      o.style.top='-50px';
      o.style.fontSize='2rem';
      area.appendChild(o);
      objs.add(o);
      const start=Date.now();
      const dur=5000;
      function fall(){
        if(!running) return;
        const p=(Date.now()-start)/dur;
        o.style.transform=`translateY(${p*(area.clientHeight+80)}px)`;
        if(p>=1){ o.remove(); objs.delete(o); return; }
        // collision
        const pr=player.getBoundingClientRect();
        const or=o.getBoundingClientRect();
        if(!(or.right<pr.left || or.left>pr.right || or.bottom<pr.top || or.top>pr.bottom)) {
          if(type==='ob'){
            running=false;
            onStatus('Score',score,'score');
          } else {
            score+=10;
            onStatus('Score',score,'score');
            o.remove(); objs.delete(o);
          }
        }
        requestAnimationFrame(fall);
      }
      requestAnimationFrame(fall);
      spawnTimer=setTimeout(spawn, rand(800,1400));
    }

    function key(e){
      if(!running) return;
      if(['ArrowLeft','a','A'].includes(e.key)) x-=speed*8;
      if(['ArrowRight','d','D'].includes(e.key)) x+=speed*8;
      x=Math.max(0, Math.min(area.clientWidth-50,x));
      player.style.left=x+'px';
    }
    document.addEventListener('keydown', key);

    function restart(){
      running=true; score=0; x=area.clientWidth/2;
      objs.forEach(o=>o.remove()); objs.clear();
      onStatus('Score',score,'score');
      player.style.left='50%';
      clearTimeout(spawnTimer);
      spawn();
    }
    function cleanup(){ running=false; clearTimeout(spawnTimer); document.removeEventListener('keydown', key); objs.forEach(o=>o.remove()); objs.clear(); }

    restart();
    return {restart,cleanup};
  };

  // 10. Star Path
  window.AdventGames.starpath = function({root,onStatus}) {
    root.innerHTML='';
    const area=document.createElement('div');
    area.style.flex='1';
    area.style.position='relative';
    area.style.border='1px solid #335b7d';
    area.style.borderRadius='12px';
    root.append(area);
    let order=[], next=1, startTime=Date.now(), penalty=0;
    const count=12;
    function build(){
      area.innerHTML='';
      order=[];
      for(let i=1;i<=count;i++){
        const s=document.createElement('button');
        s.textContent='⭐';
        s.style.position='absolute';
        s.style.left=rand(10,90)+'%';
        s.style.top=rand(10,90)+'%';
        s.style.transform='translate(-50%,-50%)';
        s.style.fontSize='1.6rem';
        s.dataset.num=i;
        s.addEventListener('click',()=> clickStar(s));
        area.appendChild(s);
        order.push(s);
      }
      next=1; startTime=Date.now(); penalty=0;
      updateStatus();
    }
    function clickStar(star){
      const n=parseInt(star.dataset.num,10);
      if(n===next){
        star.style.opacity='.2';
        next++;
        if(next>count){
          const t=((Date.now()-startTime)/1000)+penalty;
            onStatus('Time', t.toFixed(1)+'s','time');
        }
      } else {
        penalty+=1.5;
      }
      updateStatus();
    }
    function updateStatus(){
      const elapsed=((Date.now()-startTime)/1000)+penalty;
      onStatus('Next', next>count?'Done':next,'next');
      onStatus('Time', elapsed.toFixed(1)+'s','time');
      onStatus('Penalty', penalty.toFixed(1)+'s','pen');
    }
    function restart(){ build(); }
    function cleanup(){}

    restart();
    return {restart,cleanup};
  };

  // 11. Snowball Toss
  window.AdventGames.snowballtoss = function({root,onStatus}) {
    root.innerHTML='';
    const controls=document.createElement('div');
    controls.style.display='flex';
    controls.style.gap='.6rem';
    controls.style.justifyContent='center';
    const angleInput=document.createElement('input');
    angleInput.type='range'; angleInput.min='10'; angleInput.max='80'; angleInput.value='45';
    const powerInput=document.createElement('input');
    powerInput.type='range'; powerInput.min='30'; powerInput.max='100'; powerInput.value='60';
    const fireBtn=document.createElement('button');
    fireBtn.className='secondary-btn'; fireBtn.textContent='Throw';
    controls.append(angleInput,powerInput,fireBtn);
    const area=document.createElement('div');
    area.style.flex='1';
    area.style.position='relative';
    area.style.border='1px solid #335b7d';
    area.style.borderRadius='12px';
    area.style.overflow='hidden';
    root.append(controls,area);
    let targets=new Set(), score=0;

    function spawnTargets(){
      targets.forEach(t=>t.remove());
      targets.clear();
      for(let i=0;i<5;i++){
        const t=document.createElement('div');
        t.textContent='⛄';
        t.style.position='absolute';
        t.style.left=rand(40, area.clientWidth-40)+'px';
        t.style.bottom=rand(40, area.clientHeight-160)+'px';
        t.style.fontSize='2rem';
        area.appendChild(t);
        targets.add(t);
      }
    }

    function throwBall(){
      const angle= parseFloat(angleInput.value)*(Math.PI/180);
      const power=parseFloat(powerInput.value);
      const ball=document.createElement('div');
      ball.textContent='❄';
      ball.style.position='absolute';
      ball.style.left='20px'; ball.style.bottom='20px';
      ball.style.fontSize='1.4rem';
      area.appendChild(ball);
      const vx=Math.cos(angle)*power/10;
      const vy=Math.sin(angle)*power/10;
      let x=20, y=20;
      function step(){
        x+=vx;
        y+=vy;
        vy-=0.3; // gravity
        ball.style.left=x+'px';
        ball.style.bottom=y+'px';
        if(y<0 || x>area.clientWidth){
          ball.remove();
          return;
        }
        // collision
        targets.forEach(t=>{
          const br=ball.getBoundingClientRect();
          const tr=t.getBoundingClientRect();
          if(!(tr.right<br.left || tr.left>br.right || tr.bottom<br.top || tr.top>br.bottom)){
            t.remove(); targets.delete(t);
            score+=15;
            onStatus('Score',score,'score');
            if(targets.size===0){
              spawnTargets();
            }
          }
        });
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    fireBtn.addEventListener('click', throwBall);

    function restart(){
      score=0; onStatus('Score',score,'score'); spawnTargets();
    }
    function cleanup(){ targets.forEach(t=>t.remove()); targets.clear(); }

    restart();
    return {restart,cleanup};
  };

  // 12. Garland Connect
  window.AdventGames.garlandconnect = function({root,onStatus}) {
    root.innerHTML='';
    const area=document.createElement('div');
    area.style.flex='1';
    area.style.position='relative';
    area.style.border='1px solid #335b7d';
    area.style.borderRadius='12px';
    area.style.cursor='crosshair';
    root.append(area);
    const startDot=document.createElement('div');
    const endDot=document.createElement('div');
    [startDot,endDot].forEach(d=>{
      d.style.position='absolute';
      d.style.width='26px';
      d.style.height='26px';
      d.style.borderRadius='50%';
      d.style.background='#ffca3a';
      d.style.border='3px solid #e0a800';
    });
    startDot.style.left='30px'; startDot.style.top='30px';
    endDot.style.right='30px'; endDot.style.bottom='30px';
    area.append(startDot,endDot);
    let points=[], drawing=false, bends=0;

    area.addEventListener('mousedown', e=>{
      drawing=true; points=[{x:e.offsetX,y:e.offsetY}];
      render();
    });
    area.addEventListener('mousemove', e=>{
      if(!drawing) return;
      const p={x:e.offsetX,y:e.offsetY};
      const prev=points[points.length-1];
      if(Math.hypot(p.x-prev.x,p.y-prev.y) > 12){
        points.push(p);
        if(points.length>=3){
          const a=points[points.length-3];
          const b=points[points.length-2];
          const c=points[points.length-1];
          const ang = Math.abs(Math.atan2(c.y-b.y,c.x-b.x)-Math.atan2(b.y-a.y,b.x-a.x));
          if(ang>0.7) bends++;
        }
        render();
      }
    });
    document.addEventListener('mouseup', ()=>{
      if(drawing){
        drawing=false;
        score();
      }
    });

    function render(){
      area.querySelectorAll('canvas').forEach(c=>c.remove());
      const c=document.createElement('canvas');
      c.width=area.clientWidth; c.height=area.clientHeight;
      c.style.position='absolute'; c.style.left='0'; c.style.top='0';
      const ctx=c.getContext('2d');
      ctx.lineWidth=6; ctx.strokeStyle='#ff5461'; ctx.lineJoin='round';
      ctx.beginPath();
      points.forEach((p,i)=>{
        if(i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);
      });
      ctx.stroke();
      area.appendChild(c);
    }

    function score(){
      const last=points[points.length-1];
      if(!last) return;
      const endRect=endDot.getBoundingClientRect();
      const areaRect=area.getBoundingClientRect();
      const endCenter={x:endRect.left-areaRect.left+13,y:endRect.top-areaRect.top+13};
      const dist=Math.hypot(last.x-endCenter.x,last.y-endCenter.y);
      const base= Math.max(0, 200-dist);
      const penalty=bends*8;
      const total=Math.max(0, Math.round(base-penalty));
      onStatus('Score', total,'score');
      onStatus('Bends', bends,'bends');
    }

    function restart(){
      bends=0; points=[]; area.querySelectorAll('canvas').forEach(c=>c.remove());
      onStatus('Score',0,'score'); onStatus('Bends',0,'bends');
    }
    function cleanup(){}

    restart();
    return {restart,cleanup};
  };

  // 13. Chimney Stack
  window.AdventGames.chimneystack = function({root,onStatus}) {
    root.innerHTML='';
    const area=document.createElement('div');
    area.style.flex='1';
    area.style.position='relative';
    area.style.overflow='hidden';
    root.append(area);
    let current=null, stack=[], speed=2.4, running=true, width=160;
    function spawn(){
      current=document.createElement('div');
      current.style.position='absolute';
      current.style.top='20px';
      current.style.left='0px';
      current.style.background='#b34d28';
      current.style.height='30px';
      current.style.width=width+'px';
      current.style.border='3px solid #7a2e11';
      current.style.borderRadius='8px';
      area.appendChild(current);
      current.dataset.dir='1';
      animate();
    }
    function animate(){
      if(!running || !current) return;
      let x=parseFloat(current.style.left);
      const dir=current.dataset.dir==='1'?1:-1;
      x+=dir*speed;
      if(x+current.offsetWidth>area.clientWidth){ current.dataset.dir='-1'; }
      if(x<0){ current.dataset.dir='1'; }
      current.style.left=(parseFloat(current.style.left)+dir*speed)+'px';
      requestAnimationFrame(animate);
    }
    area.addEventListener('click', ()=> {
      if(!current) return;
      // drop logic
      const y= area.clientHeight - (stack.length+1)*30 - 10;
      const stoppedLeft=parseFloat(current.style.left);
      current.style.top=y+'px';
      // alignment with previous
      if(stack.length>0){
        const prev=stack[stack.length-1];
        const overlapLeft=Math.max(stoppedLeft, parseFloat(prev.style.left));
        const overlapRight=Math.min(stoppedLeft+current.offsetWidth, parseFloat(prev.style.left)+prev.offsetWidth);
        const overlap=overlapRight-overlapLeft;
        if(overlap<=0){
          running=false;
          onStatus('Height', stack.length,'height');
          return;
        }
        width=overlap;
        current.style.left=overlapLeft+'px';
        current.style.width=width+'px';
      }
      stack.push(current);
      current=null;
      onStatus('Height', stack.length,'height');
      spawn();
    });

    function restart(){
      running=true; width=160;
      area.innerHTML='';
      stack=[]; current=null;
      onStatus('Height',0,'height');
      spawn();
    }
    function cleanup(){ running=false; }

    restart();
    return {restart,cleanup};
  };

  // 14. Carol Typer
  window.AdventGames.caroltyper = function({root,onStatus}) {
    root.innerHTML='';
    const lyrics=[
      'jingle bells jingle bells jingle all the way',
      'silent night holy night all is calm',
      'we wish you a merry christmas'
    ];
    let target=pick(lyrics);
    const display=document.createElement('div');
    display.style.padding='1rem';
    display.style.background='#1f3a55';
    display.style.borderRadius='12px';
    display.style.fontSize='1rem';
    display.style.lineHeight='1.4';
    display.textContent=target;
    const input=document.createElement('textarea');
    input.style.width='100%';
    input.style.height='120px';
    input.style.background='#142536';
    input.style.color='#fff';
    input.style.border='1px solid #335b7d';
    input.style.borderRadius='8px';
    input.style.padding='.6rem';
    const msg=document.createElement('div');
    msg.className='instructions';
    msg.textContent='Type the lyric accurately.';
    root.append(display,input,msg);
    let start=Date.now();

    input.addEventListener('input', ()=>{
      const typed=input.value;
      let correct=0;
      for(let i=0;i<typed.length && i<target.length;i++){
        if(typed[i]===target[i]) correct++;
      }
      const accuracy = typed.length? (correct/typed.length)*100:0;
      const elapsedMinutes = (Date.now()-start)/60000;
      const wpm = typed.trim().split(/\s+/).filter(Boolean).length / (elapsedMinutes||1/60);
      onStatus('Acc', accuracy.toFixed(1)+'%','acc');
      onStatus('WPM', wpm.toFixed(1),'wpm');
      if(typed.length>=target.length){
        msg.textContent='Finished! Accuracy '+accuracy.toFixed(1)+'%';
      }
    });

    function restart(){ target=pick(lyrics); display.textContent=target; input.value=''; start=Date.now(); onStatus('Acc','0%','acc'); onStatus('WPM','0','wpm'); msg.textContent='Type the lyric accurately.'; }
    function cleanup(){}

    restart();
    return {restart,cleanup};
  };

  // 15. Ice Maze
  window.AdventGames.icemaze = function({root,onStatus}) {
    root.innerHTML='';
    const size=10;
    const grid=document.createElement('div');
    grid.style.display='grid';
    grid.style.gridTemplateColumns=`repeat(${size},32px)`;
    grid.style.gap='3px';
    grid.style.margin='0 auto';
    root.append(grid);
    const msg=document.createElement('div');
    msg.className='instructions';
    msg.textContent='Use arrow keys. Slide until wall. Reach ⭐.';
    root.append(msg);
    let cells=[], playerPos={x:0,y:0}, goal={x:size-1,y:size-1}, moves=0;
    function build(){
      grid.innerHTML='';
      cells=[];
      for(let y=0;y<size;y++){
        for(let x=0;x<size;x++){
          const c=document.createElement('div');
          c.style.width='32px'; c.style.height='32px';
          c.style.background='#1f3a55';
          c.style.border='2px solid #335b7d';
          c.style.borderRadius='6px';
          c.dataset.x=x; c.dataset.y=y;
          grid.appendChild(c);
          cells.push(c);
        }
      }
      render();
    }
    function render(){
      cells.forEach(c=>{
        c.textContent='';
        if(parseInt(c.dataset.x)==playerPos.x && parseInt(c.dataset.y)==playerPos.y) c.textContent='🧊';
        if(parseInt(c.dataset.x)==goal.x && parseInt(c.dataset.y)==goal.y) c.textContent='⭐';
      });
      onStatus('Moves', moves,'moves');
    }
    function slide(dx,dy){
      let {x,y}=playerPos;
      while(true){
        const nx=x+dx, ny=y+dy;
        if(nx<0 || ny<0 || nx>=size || ny>=size) break;
        x=nx; y=ny;
        if(x===goal.x && y===goal.y){
          playerPos={x,y}; moves++; render(); msg.textContent='Reached goal! Moves: '+moves;
          return;
        }
      }
      if(x!==playerPos.x || y!==playerPos.y){
        playerPos={x,y}; moves++; render();
      }
    }
    function key(e){
      if(e.key==='ArrowLeft') slide(-1,0);
      if(e.key==='ArrowRight') slide(1,0);
      if(e.key==='ArrowUp') slide(0,-1);
      if(e.key==='ArrowDown') slide(0,1);
    }
    document.addEventListener('keydown', key);

    function restart(){ moves=0; playerPos={x:0,y:0}; goal={x:size-1,y:size-1}; msg.textContent='Use arrow keys. Slide until wall. Reach ⭐.'; build(); }
    function cleanup(){ document.removeEventListener('keydown',key); }

    restart();
    return {restart,cleanup};
  };

  // 16. Reindeer Pair (attribute match)
  window.AdventGames.reindeerpair = function({root,onStatus}) {
    root.innerHTML='';
    const attrs=[
      {speed:'fast',color:'brown'},
      {speed:'slow',color:'white'},
      {speed:'swift',color:'gold'},
      {speed:'steady',color:'gray'}
    ];
    const pool=[...attrs, ...attrs];
    const board=document.createElement('div');
    board.style.display='grid';
    board.style.gridTemplateColumns='repeat(auto-fill,minmax(110px,1fr))';
    board.style.gap='.5rem';
    board.style.margin='0 auto';
    root.append(board);
    const msg=document.createElement('div');
    msg.className='instructions';
    msg.textContent='Match pairs by attributes.';
    root.append(msg);
    function shuffle(a){
      for(let i=a.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [a[i],a[j]]=[a[j],a[i]];
      }
      return a;
    }
    let order=[], first=null, lock=false, matched=0, moves=0, start=Date.now();

    function build(){
      board.innerHTML='';
      order=shuffle(pool.slice());
      order.forEach((attr,i)=>{
        const b=document.createElement('button');
        b.className='card';
        b.style.fontSize='.75rem';
        b.dataset.idx=i;
        b.dataset.speed=attr.speed;
        b.dataset.color=attr.color;
        b.textContent='🦌';
        b.addEventListener('click',()=> flip(b));
        board.appendChild(b);
      });
      updateStatus();
    }

    function flip(b){
      if(lock || b===first || b.classList.contains('matched')) return;
      reveal(b);
      if(!first){ first=b; return; }
      moves++;
      if(b.dataset.speed===first.dataset.speed && b.dataset.color===first.dataset.color){
        b.classList.add('matched'); first.classList.add('matched');
        matched++;
        first=null;
        if(matched===attrs.length){
          msg.textContent='All matched! '+((Date.now()-start)/1000).toFixed(1)+'s';
        }
      } else {
        lock=true;
        setTimeout(()=>{
          hide(b); hide(first); first=null; lock=false;
        },700);
      }
      updateStatus();
    }

    function reveal(b){ b.textContent=b.dataset.speed+' '+b.dataset.color; b.classList.add('revealed'); }
    function hide(b){ b.textContent='🦌'; b.classList.remove('revealed'); }

    function updateStatus(){
      onStatus('Moves', moves,'moves');
      onStatus('Matched', matched+'/'+attrs.length,'matched');
    }

    function restart(){ first=null; lock=false; matched=0; moves=0; start=Date.now(); build(); msg.textContent='Match pairs by attributes.'; }
    function cleanup(){}

    restart();
    return {restart,cleanup};
  };

  // 17. Cookie Bake (timed multitask)
  window.AdventGames.cookiebake = function({root,onStatus}) {
    root.innerHTML='';
    const tasks=[
      {name:'Mix', time:4000},
      {name:'Shape', time:6000},
      {name:'Bake', time:8000},
      {name:'Decorate', time:5000},
    ];
    const wrap=document.createElement('div');
    wrap.style.display='flex';
    wrap.style.flexDirection='column';
    wrap.style.gap='.7rem';
    root.append(wrap);
    const msg=document.createElement('div');
    msg.className='instructions';
    msg.textContent='Click task to start; click again to finish near end time for max score.';
    root.append(msg);
    let score=0, running=true, timers=new Map();

    tasks.forEach(t=>{
      const row=document.createElement('div');
      row.style.display='flex';
      row.style.alignItems='center';
      row.style.gap='.7rem';
      const btn=document.createElement('button');
      btn.className='secondary-btn';
      btn.textContent=t.name;
      const bar=document.createElement('div');
      bar.style.flex='1';
      bar.style.height='18px';
      bar.style.background='#142536';
      bar.style.border='1px solid #335b7d';
      bar.style.borderRadius='8px';
      const fill=document.createElement('div');
      fill.style.height='100%'; fill.style.width='0%';
      fill.style.background='#ffca3a';
      fill.style.borderRadius='8px';
      bar.appendChild(fill);
      row.append(btn,bar);
      wrap.appendChild(row);
      btn.addEventListener('click', ()=>{
        if(!running) return;
        if(!timers.has(t.name)){
          // start
          timers.set(t.name,{start:Date.now(), finished:false});
        } else {
          const data=timers.get(t.name);
          if(data.finished) return;
          data.finished=true;
          const elapsed=Date.now()-data.start;
            const diff=Math.abs(t.time-elapsed);
          const gained=Math.max(0, Math.round(25 - diff/200));
          score+=gained;
          onStatus('Score',score,'score');
          btn.textContent=t.name+' ✓';
        }
      });
      function update(){
        if(!running) return;
        const data=timers.get(t.name);
        if(data && !data.finished){
          const p=Math.min(1,(Date.now()-data.start)/t.time)*100;
          fill.style.width=p+'%';
          if(p>=100){
            data.finished=true;
            btn.textContent=t.name+' (Overdone)';
            score-=5; onStatus('Score',score,'score');
          }
        }
        requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });

    function restart(){
      score=0; timers.clear();
      [...wrap.querySelectorAll('button')].forEach(b=>{
        b.textContent=b.textContent.split(' ')[0];
      });
      [...wrap.querySelectorAll('div > div > div')].forEach(f=> f.style.width='0%');
      onStatus('Score',score,'score');
    }
    function cleanup(){ running=false; }

    restart();
    return {restart,cleanup};
  };

  // 18. Blizzard Balance
  window.AdventGames.blizzardbalance = function({root,onStatus}) {
    root.innerHTML='';
    const stats=['Temp','Pressure','Visibility'];
    const sliders=[];
    const wrap=document.createElement('div');
    wrap.style.display='flex'; wrap.style.flexDirection='column';
    wrap.style.gap='.6rem';
    root.append(wrap);
    const msg=document.createElement('div');
    msg.className='instructions';
    msg.textContent='Keep values near 50 by adjusting sliders. They drift!';
    root.append(msg);
    let values=[50,50,50], score=0, running=true;

    stats.forEach((s,i)=>{
      const row=document.createElement('div');
      row.style.display='flex'; row.style.gap='.6rem'; row.style.alignItems='center';
      const lab=document.createElement('div');
      lab.textContent=s;
      lab.style.width='90px';
      const input=document.createElement('input');
      input.type='range'; input.min='0'; input.max='100'; input.value='50';
      input.addEventListener('input', ()=> values[i]=parseInt(input.value,10));
      row.append(lab,input);
      wrap.appendChild(row);
      sliders.push(input);
    });

    function frame(){
      if(!running) return;
      // drift
      values=values.map(v=> Math.min(100, Math.max(0, v+rand(-1.2,1.2))));
      sliders.forEach((sl,i)=> sl.value=values[i]);
      const dev= values.reduce((a,v)=> a+Math.abs(v-50),0);
      score+= Math.max(0, 30 - dev/5)/60;
      onStatus('Score', Math.round(score),'score');
      onStatus('Deviation', dev.toFixed(1),'dev');
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    function restart(){
      values=[50,50,50]; score=0; running=true;
      sliders.forEach(sl=> sl.value='50');
      onStatus('Score',0,'score'); onStatus('Deviation','0','dev');
    }
    function cleanup(){ running=false; }

    restart();
    return {restart,cleanup};
  };

  // 19. North Pole Quiz
  window.AdventGames.northpolequiz = function({root,onStatus}) {
    root.innerHTML='';
    const questions=[
      {q:'Who guides Santa\'s sleigh on foggy nights?', options:['Dasher','Rudolph','Comet'], a:1},
      {q:'Traditional tree type?', options:['Pine','Oak','Maple'], a:0},
      {q:'Candy associated with stripes?', options:['Candy cane','Marshmallow','Truffle'], a:0},
    ];
    let idx=0, score=0, streak=0;
    const qWrap=document.createElement('div');
    qWrap.style.padding='1rem';
    qWrap.style.background='#1f3a55';
    qWrap.style.borderRadius='12px';
    const opts=document.createElement('div');
    opts.style.display='flex'; opts.style.flexDirection='column'; opts.style.gap='.5rem';
    root.append(qWrap,opts);
    function render(){
      opts.innerHTML='';
      if(idx>=questions.length){
        qWrap.textContent='Quiz complete! Score: '+score;
        return;
      }
      const cur=questions[idx];
      qWrap.textContent=cur.q;
      cur.options.forEach((o,i)=>{
        const b=document.createElement('button');
        b.className='secondary-btn';
        b.textContent=o;
        b.addEventListener('click', ()=>{
          if(i===cur.a){
            streak++;
            score += 10 * streak;
          } else {
            streak=0;
            score -=5;
          }
          idx++;
          onStatus('Score',score,'score');
          onStatus('Streak',streak,'streak');
          render();
        });
        opts.appendChild(b);
      });
    }
    function restart(){ idx=0; score=0; streak=0; onStatus('Score',0,'score'); onStatus('Streak',0,'streak'); render(); }
    function cleanup(){}
    restart();
    return {restart,cleanup};
  };

  // 20. Pixel Tree (pixel art + export)
  window.AdventGames.pixeltree = function({root,onStatus}) {
    root.innerHTML='';
    const size=12;
    const grid=document.createElement('div');
    grid.style.display='grid';
    grid.style.gridTemplateColumns=`repeat(${size},1fr)`;
    grid.style.gap='2px';
    grid.style.width='min(360px,100%)';
    const colors=['#276636','#1e4327','#ffca3a','#ffffff','#ff5461','#7dfc5b','#4dd2ff'];
    let current=colors[0];
    const palette=document.createElement('div');
    palette.style.display='flex'; palette.style.flexWrap='wrap'; palette.style.gap='.4rem'; palette.style.margin='.6rem 0';
    colors.forEach(c=>{
      const b=document.createElement('button');
      b.style.background=c; b.style.width='34px'; b.style.height='34px'; b.style.border='2px solid #20384e'; b.style.borderRadius='8px';
      b.addEventListener('click',()=> current=c);
      palette.appendChild(b);
    });
    const exportBtn=document.createElement('button');
    exportBtn.className='secondary-btn'; exportBtn.textContent='Export';
    const msg=document.createElement('div');
    msg.className='instructions'; msg.textContent='Design a tree; export pattern.';
    root.append(grid,palette,exportBtn,msg);
    function build(){
      grid.innerHTML='';
      for(let i=0;i<size*size;i++){
        const cell=document.createElement('div');
        cell.style.paddingTop='100%';
        cell.style.position='relative';
        cell.style.background='#142536';
        cell.style.border='1px solid #335b7d';
        cell.style.cursor='pointer';
        cell.addEventListener('click', ()=>{
          cell.style.background=current;
          updateStatus();
        });
        grid.appendChild(cell);
      }
      updateStatus();
    }
    function updateStatus(){
      const painted=[...grid.children].filter(c=>c.style.background!=='rgb(20, 37, 54)' && c.style.background!=='#142536').length;
      onStatus('Pixels', painted,'pix');
    }
    exportBtn.addEventListener('click', ()=>{
      const pattern=[];
      [...grid.children].forEach(c=>{
        const col=c.style.background;
        pattern.push(col==='#142536'?'.':'#');
      });
      const text=pattern.map((ch,i)=> (i%size===0?'\n':'')+ch).join('');
      msg.textContent='Pattern:'+text;
    });
    function restart(){ build(); msg.textContent='Design a tree; export pattern.'; }
    function cleanup(){}
    restart();
    return {restart,cleanup};
  };

  // 21. Santa Sprint (runner)
  window.AdventGames.santasprint = function({root,onStatus}) {
    root.innerHTML='';
    const area=document.createElement('div');
    area.style.flex='1';
    area.style.position='relative';
    area.style.overflow='hidden';
    area.style.background='linear-gradient(#1f3a55,#142536)';
    root.append(area);
    const player=document.createElement('div');
    player.textContent='🎅';
    player.style.position='absolute';
    player.style.left='40px';
    player.style.bottom='40px';
    player.style.fontSize='2.2rem';
    area.appendChild(player);
    let y=40, vy=0, gravity=0.6, jumping=false, score=0, running=true, obs=new Set(), spawnTimer;

    function key(e){
      if(e.key===' ' || e.key==='ArrowUp'){
        if(!jumping){
          vy=11; jumping=true;
        }
      }
    }
    document.addEventListener('keydown', key);

    function frame(){
      if(!running) return;
      vy-=gravity;
      y+=vy;
      if(y<40){ y=40; vy=0; jumping=false; }
      player.style.bottom=y+'px';
      obs.forEach(o=>{
        const left = parseFloat(o.style.left)-4;
        o.style.left=left+'px';
        if(left<-60){ o.remove(); obs.delete(o); score+=5; onStatus('Score',score,'score'); }
        // collision
        const pr=player.getBoundingClientRect();
        const or=o.getBoundingClientRect();
        if(!(or.right<pr.left || or.left>pr.right || or.bottom<pr.top || or.top>pr.bottom)){
          running=false;
          onStatus('Score',score,'score');
        }
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    function spawn(){
      if(!running) return;
      const o=document.createElement('div');
      o.textContent='🎄';
      o.style.position='absolute';
      o.style.left=area.clientWidth+'px';
      o.style.bottom='40px';
      o.style.fontSize='2rem';
      area.appendChild(o);
      obs.add(o);
      spawnTimer=setTimeout(spawn, rand(900,1600));
    }

    function restart(){
      running=true; score=0; y=40; vy=0; jumping=false;
      obs.forEach(o=>o.remove()); obs.clear();
      onStatus('Score',score,'score');
      clearTimeout(spawnTimer);
      spawn();
    }
    function cleanup(){ running=false; clearTimeout(spawnTimer); document.removeEventListener('keydown', key); obs.forEach(o=>o.remove()); obs.clear(); }

    restart();
    return {restart,cleanup};
  };

})();
