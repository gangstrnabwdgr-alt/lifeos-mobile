/* LIFEOS X24 — Global Search + Theme Studio. No external dependencies. */
(()=>{
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const searchOverlay=$('#x24SearchOverlay'), themeOverlay=$('#x24ThemeOverlay'), input=$('#x24SearchInput'), results=$('#x24SearchResults');
  const KEY='lifeos.x24.theme';
  const presets=[
    {name:'Violet Neon',bg:'#080b12',a:'#7c5cff',b:'#35e0c1'},
    {name:'Midnight Blue',bg:'#07101c',a:'#4f8cff',b:'#36d7ff'},
    {name:'Emerald',bg:'#07130f',a:'#20c997',b:'#7cf29a'},
    {name:'Ruby Night',bg:'#14080d',a:'#ff4f81',b:'#ff9b5c'},
    {name:'Solar Gold',bg:'#131007',a:'#ffb84d',b:'#ffe082'},
    {name:'Arctic',bg:'#081116',a:'#67d9ff',b:'#b7f7ff'},
    {name:'Cyber Pink',bg:'#120812',a:'#ff5bd6',b:'#8b7cff'},
    {name:'Forest',bg:'#08110c',a:'#72e06a',b:'#b8f27e'}
  ];
  let selected=-1;
  const iconFor=page=>({dashboard:'◈',money:'₿',time:'◷',study:'⌁',goals:'◎',custom:'✦',calendar:'▦'}[page]||'✦');
  function openSearch(){searchOverlay?.classList.add('open');searchOverlay?.setAttribute('aria-hidden','false');setTimeout(()=>input?.focus(),30);render('');}
  function closeSearch(){searchOverlay?.classList.remove('open');searchOverlay?.setAttribute('aria-hidden','true');selected=-1}
  function openTheme(){themeOverlay?.classList.add('open');themeOverlay?.setAttribute('aria-hidden','false')}
  function closeTheme(){themeOverlay?.classList.remove('open');themeOverlay?.setAttribute('aria-hidden','true')}
  function esc(s){return String(s||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function collect(q){
    const out=[]; const needle=q.trim().toLowerCase();
    $$('.page').forEach(page=>{
      const title=page.querySelector('h2')?.textContent?.trim()||page.id;
      const text=page.innerText||'';
      if(!needle || text.toLowerCase().includes(needle)) out.push({type:'page',page:page.id,title,desc:needle?`نتیجه در ${title}`:'صفحه و بخش‌های این قسمت',icon:iconFor(page.id)});
      if(needle){
        page.querySelectorAll('.stat,.goal,.transaction,.study-item,.custom-entry,.custom-type,.saving-goal-box,.panel').forEach(el=>{
          const t=(el.innerText||'').replace(/\s+/g,' ').trim(); if(t.toLowerCase().includes(needle)){
            const heading=el.querySelector('h3,h2,b')?.textContent?.trim()||title;
            out.push({type:'item',page:page.id,title:heading,desc:t.slice(0,150),icon:iconFor(page.id),el});
          }
        });
      }
    });
    const seen=new Set(); return out.filter(x=>{const k=x.page+'|'+x.title+'|'+x.type;if(seen.has(k))return false;seen.add(k);return true}).slice(0,24);
  }
  function render(q){
    if(!results)return; const data=collect(q); selected=data.length?0:-1;
    $('#x24SearchCount').textContent=q?`${data.length} نتیجه پیدا شد`:'صفحه‌ها و محتوای LifeOS را جستجو کن';
    if(!data.length){results.innerHTML='<div class="x24-empty">نتیجه‌ای پیدا نشد.<br><small>عبارت دیگری را امتحان کن.</small></div>';return}
    results.innerHTML=data.map((r,i)=>`<div class="x24-result ${i===0?'selected':''}" data-i="${i}"><div class="x24-result-icon">${r.icon}</div><div><b>${esc(r.title)}</b><span>${esc(r.desc)}</span></div><small>${esc(r.page)}</small></div>`).join('');
    results.querySelectorAll('.x24-result').forEach((el,i)=>el.addEventListener('click',()=>go(data[i])));
  }
  function go(r){
    const nav=$(`.nav[data-page="${r.page}"]`); if(nav){nav.click(); setTimeout(()=>r.el?.scrollIntoView({behavior:'smooth',block:'center'}),100)}
    closeSearch();
  }
  function move(delta){const els=$$('.x24-result');if(!els.length)return;selected=(selected+delta+els.length)%els.length;els.forEach((e,i)=>e.classList.toggle('selected',i===selected));els[selected]?.scrollIntoView({block:'nearest'})}
  function apply(t,save=true){document.documentElement.style.setProperty('--x24-bg',t.bg);document.documentElement.style.setProperty('--x24-bg2',t.bg);document.documentElement.style.setProperty('--x24-accent',t.a);document.documentElement.style.setProperty('--x24-accent2',t.b); if(save)localStorage.setItem(KEY,JSON.stringify(t)); const c=$('#x24BgColor');if(c)c.value=t.bg}
  function loadTheme(){try{const t=JSON.parse(localStorage.getItem(KEY)||'null');if(t?.bg)apply(t,false)}catch(e){}}
  function buildThemes(){const box=$('#x24ThemePresets');if(!box)return;box.innerHTML=presets.map((p,i)=>`<button class="x24-theme-card" data-theme="${i}"><i style="background:linear-gradient(120deg,${p.a},${p.b},${p.bg})"></i><b>${p.name}</b></button>`).join('');box.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>apply(presets[+b.dataset.theme]))}
  $('#globalSearchBtn')?.addEventListener('click',openSearch); $('#x24SearchClose')?.addEventListener('click',closeSearch); $('#themeBtn')?.addEventListener('click',openTheme); $('#x24ThemeClose')?.addEventListener('click',closeTheme);
  input?.addEventListener('input',e=>render(e.target.value));
  input?.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();move(1)}else if(e.key==='ArrowUp'){e.preventDefault();move(-1)}else if(e.key==='Enter'){const q=input.value;const d=collect(q)[selected>=0?selected:0];if(d)go(d)}else if(e.key==='Escape')closeSearch()});
  results?.addEventListener('keydown',e=>{if(e.key==='Escape')closeSearch()});
  searchOverlay?.addEventListener('click',e=>{if(e.target===searchOverlay)closeSearch()}); themeOverlay?.addEventListener('click',e=>{if(e.target===themeOverlay)closeTheme()});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()} if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();openSearch()} if(e.key==='Escape'){closeSearch();closeTheme()}});
  $('#x24ApplyBg')?.addEventListener('click',()=>{const bg=$('#x24BgColor')?.value||'#080b12';const cur=JSON.parse(localStorage.getItem(KEY)||'{}');apply({bg,a:cur.a||'#7c5cff',b:cur.b||'#35e0c1'})});
  $('#x24ResetTheme')?.addEventListener('click',()=>apply(presets[0]));
  buildThemes(); loadTheme();
  window.LifeOSX24={openSearch,openTheme,applyTheme:apply};
})();
