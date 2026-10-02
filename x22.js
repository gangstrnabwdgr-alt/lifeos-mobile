/* LifeOS X22 — NEXUS ULTIMATE+ */
(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const key='lifeos_x22_settings';
  const load=()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return{}}};
  const save=s=>localStorage.setItem(key,JSON.stringify(s));
  let settings=Object.assign({accent:'#a78bfa',compact:false,reduced:false,ambient:true},load());
  function apply(){
    document.documentElement.style.setProperty('--x22-accent',settings.accent);
    document.body.classList.toggle('x22-compact',!!settings.compact);
    document.body.classList.toggle('x22-reduced',!!settings.reduced);
    document.body.classList.toggle('x22-ambient',!!settings.ambient);
  }
  function getState(){
    try{ return window.state || window.appState || JSON.parse(localStorage.getItem('lifeos')||'{}'); }catch{return{};}
  }
  function num(v){return Number(v)||0}
  function today(){return new Date().toISOString().slice(0,10)}
  function dateOf(x){return x?.date||x?.day||x?.createdAt?.slice?.(0,10)||''}
  function arr(...names){const s=getState();for(const n of names)if(Array.isArray(s[n]))return s[n];return[]}
  function score(){
    const s=getState(), d=today();
    const study=arr('studies','studySessions').filter(x=>dateOf(x)===d).reduce((a,x)=>a+num(x.hours??x.duration),0);
    const waste=arr('waste','wastes','timeWaste').filter(x=>dateOf(x)===d).reduce((a,x)=>a+num(x.hours??x.duration),0);
    const inc=arr('incomes','income').filter(x=>dateOf(x)===d).reduce((a,x)=>a+num(x.amount),0);
    const exp=arr('expenses','expense').filter(x=>dateOf(x)===d).reduce((a,x)=>a+num(x.amount),0);
    const dep=arr('savings','saving').filter(x=>dateOf(x)===d).reduce((a,x)=>a+num(x.amount||x.value)*(String(x.type||x.kind||'deposit').toLowerCase().includes('withdraw')?-1:1),0);
    const habits=arr('habits').filter(h=>h.completed===true||h.done===true).length;
    const a=Math.min(100,Math.round(Math.min(study/3,1)*30+Math.min(Math.max(8-waste,0)/8,1)*20+Math.min(Math.max(inc-exp+Math.max(dep,0),0)/1000000,1)*20+Math.min(Math.max(dep,0)/500000,1)*15+Math.min(habits/5,1)*15));
    return {score:a,study,waste,inc,exp,dep};
  }
  function build(){
    const b=document.createElement('button');b.id='x22Launch';b.className='icon-btn x22-launch';b.title='NEXUS';b.textContent='✦';
    const anchor=$('#commandBtn')||$('#quickAdd'); if(anchor)anchor.parentElement?.insertBefore(b,anchor); else document.body.appendChild(b);
    const o=document.createElement('div');o.className='x22-overlay';o.id='x22Overlay';
    o.innerHTML=`<div class="x22-shell" role="dialog" aria-modal="true">
      <div class="x22-top"><div><div class="x22-kicker">LIFEOS • X22 NEXUS ULTIMATE+</div><h2>مرکز فرمان زندگی</h2></div><button class="x22-close" id="x22Close">×</button></div>
      <div class="x22-grid">
        <div class="x22-card"><h3>نبض امروز</h3><div class="x22-score"><div class="x22-ring" id="x22Ring"><div><b id="x22Score">0</b><span>امتیاز</span></div></div><div class="x22-statgrid"><div class="x22-mini"><span>📚 مطالعه</span><b id="x22Study">۰</b></div><div class="x22-mini"><span>⏱️ زمان پرت</span><b id="x22Waste">۰</b></div><div class="x22-mini"><span>💰 تراز</span><b id="x22Balance">۰</b></div><div class="x22-mini"><span>💎 پس‌انداز</span><b id="x22Save">۰</b></div></div></div>
          <div class="x22-tip" id="x22Tip">یک حرکت کوچک، امروز را بهتر می‌کند.</div>
          <div class="x22-actions"><button data-act="expense">＋ هزینه</button><button data-act="income">＋ درآمد</button><button data-act="study">＋ مطالعه</button><button data-act="saving">＋ پس‌انداز</button><button data-act="goal">🎯 هدف</button><button data-act="waste">⏱️ زمان پرت</button></div>
        </div>
        <div class="x22-card"><h3>سیستم سلامت</h3><div class="x22-bars"><div class="x22-bar"><span>تمرکز</span><div class="x22-track"><i id="x22FocusBar"></i></div><b id="x22FocusPct">0%</b></div><div class="x22-bar"><span>زمان</span><div class="x22-track"><i id="x22TimeBar"></i></div><b id="x22TimePct">0%</b></div><div class="x22-bar"><span>مالی</span><div class="x22-track"><i id="x22MoneyBar"></i></div><b id="x22MoneyPct">0%</b></div><div class="x22-bar"><span>پس‌انداز</span><div class="x22-track"><i id="x22SaveBar"></i></div><b id="x22SavePct">0%</b></div></div>
          <div class="x22-tip">این پنل از داده‌های ثبت‌شده خود LifeOS استفاده می‌کند؛ چیزی خارج از برنامه ارسال نمی‌شود.</div>
        </div>
        <div class="x22-card"><h3>ظاهر و تجربه</h3>
          <div class="x22-setting"><div><b>حالت Ambient</b><br><small>نور پس‌زمینه آرام</small></div><div class="x22-switch" data-set="ambient"><i></i></div></div>
          <div class="x22-setting"><div><b>Compact</b><br><small>اطلاعات بیشتر، فضای کمتر</small></div><div class="x22-switch" data-set="compact"><i></i></div></div>
          <div class="x22-setting"><div><b>Reduced Motion</b><br><small>انیمیشن‌های کمتر</small></div><div class="x22-switch" data-set="reduced"><i></i></div></div>
          <div class="x22-setting"><div><b>رنگ اصلی</b><br><small>ظاهر LifeOS را شخصی کن</small></div><select class="x22-select" id="x22Accent"><option value="#a78bfa">Violet</option><option value="#22d3ee">Cyan</option><option value="#34d399">Emerald</option><option value="#fb7185">Rose</option><option value="#f59e0b">Amber</option></select></div>
        </div>
        <div class="x22-card"><h3>دسترسی‌های سریع</h3><div class="x22-actions"><button data-go="dashboard">🏠 داشبورد</button><button data-go="money">💰 مالی</button><button data-go="time">⏱️ زمان</button><button data-go="study">📚 مطالعه</button><button data-go="goals">🎯 اهداف</button><button data-go="custom">🧩 ثبت‌های من</button><button data-go="calendar">📅 تقویم</button></div><div class="x22-tip">میانبر: <b>Ctrl + Shift + N</b> برای باز کردن این مرکز.</div></div>
      </div></div>`;
    document.body.appendChild(o);
    b.addEventListener('click',()=>{o.classList.add('open');refresh();});
    $('#x22Close').addEventListener('click',()=>o.classList.remove('open'));
    o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open');});
    $$('[data-set]',o).forEach(el=>el.addEventListener('click',()=>{const k=el.dataset.set;settings[k]=!settings[k];save(settings);apply();syncSwitches();}));
    $('#x22Accent').addEventListener('change',e=>{settings.accent=e.target.value;save(settings);apply();refresh();});
    $$('[data-act]',o).forEach(btn=>btn.addEventListener('click',()=>{o.classList.remove('open');const target=document.querySelector(`[data-modal="${btn.dataset.act}"]`);if(target)target.click();else if(btn.dataset.act==='goal')document.querySelector('[data-modal="goal"]')?.click();}));
    $$('[data-go]',o).forEach(btn=>btn.addEventListener('click',()=>{o.classList.remove('open');document.querySelector(`[data-go="${btn.dataset.go}"]`)?.click();document.querySelector(`[data-id="${btn.dataset.go}"]`)?.click();const nav=document.querySelector(`nav [data-go="${btn.dataset.go}"]`);if(nav)nav.click();}));
    syncSwitches();
  }
  function syncSwitches(){$$('[data-set]',$('#x22Overlay')).forEach(el=>{el.classList.toggle('on',!!settings[el.dataset.set])})}
  function refresh(){
    const m=score(), pct={focus:Math.min(100,Math.round(m.study/3*100)),time:Math.max(0,Math.min(100,Math.round((8-m.waste)/8*100))),money:Math.min(100,Math.round((Math.max(m.inc-m.exp,0)/1000000)*100)),save:Math.min(100,Math.round((Math.max(m.dep,0)/500000)*100))};
    $('#x22Score').textContent=m.score.toLocaleString('fa-IR');$('#x22Ring').style.setProperty('--p',m.score);$('#x22Study').textContent=m.study.toFixed(1)+'س';$('#x22Waste').textContent=m.waste.toFixed(1)+'س';$('#x22Balance').textContent=Math.round(m.inc-m.exp).toLocaleString('fa-IR');$('#x22Save').textContent=Math.round(m.dep).toLocaleString('fa-IR');
    [['Focus',pct.focus],['Time',pct.time],['Money',pct.money],['Save',pct.save]].forEach(([n,v])=>{$('#x22'+n+'Bar').style.width=v+'%';$('#x22'+n+'Pct').textContent=v+'%';});
    $('#x22Tip').textContent=m.score>=80?'امروز ریتمت عالیه؛ کار مهم را ببند و بعد استراحت کن.':m.waste>2?'زمان پرت امروز بالاست؛ یک بازه ۲۵ دقیقه‌ای Focus شروع کن.':m.study<1?'یک جلسه کوتاه مطالعه می‌تواند امتیازت را سریع بالا ببرد.':m.dep<=0?'یک مبلغ کوچک کنار بگذار؛ استمرار از مقدار مهم‌تر است.':'ریتم خوبه؛ فقط ادامه بده.';
    syncSwitches();
  }
  apply();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
  document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='n'){e.preventDefault();$('#x22Overlay')?.classList.add('open');refresh();}if(e.key==='Escape')$('#x22Overlay')?.classList.remove('open');});
  setInterval(()=>{if($('#x22Overlay')?.classList.contains('open'))refresh()},2000);
})();
