/* LifeOS X20 — NEXUS ULTIMATE+ | habits, XP, weekly review, command boost */
(function(){
  const DAY=()=>typeof todayISO==='function'?todayISO():new Date().toISOString().slice(0,10);
  const KEY20='lifeos_x20';
  const defaults=[
    {id:'study',name:'مطالعه',icon:'📚',hint:'حداقل ۳۰ دقیقه'},
    {id:'focus',name:'تمرکز',icon:'⚡',hint:'یک بازه بدون حواس‌پرتی'},
    {id:'money',name:'کنترل مالی',icon:'💰',hint:'یک ثبت یا مرور مالی'},
    {id:'save',name:'پس‌انداز',icon:'💎',hint:'حتی یک قدم کوچک'},
    {id:'move',name:'حرکت',icon:'🏃',hint:'فعالیت بدنی یا پیاده‌روی'},
    {id:'sleep',name:'خواب خوب',icon:'🌙',hint:'خواب منظم'}
  ];
  function state(){let s={};try{s=JSON.parse(localStorage.getItem(KEY20)||'{}')}catch(e){};s.habits=s.habits||{};s.customHabits=s.customHabits||[];return s}
  let s=state();
  function persist(){localStorage.setItem(KEY20,JSON.stringify(s))}
  function dayObj(d){s.habits[d]=s.habits[d]||{};return s.habits[d]}
  function allHabits(){return defaults.concat(s.customHabits)}
  function completed(d){const o=dayObj(d);return allHabits().filter(h=>!!o[h.id]).length}
  function score(){
    const t=DAY(), o=dayObj(t), habits=allHabits();
    const h=habits.length?completed(t)/habits.length*30:0;
    const study=sumSafe((db.study||[]).filter(x=>x.date===t),x=>+x.hours);
    const waste=sumSafe((db.waste||[]).filter(x=>x.date===t),x=>+x.hours);
    const inc=sumSafe((db.incomes||[]).filter(x=>x.date===t),x=>+x.amount);
    const exp=sumSafe((db.expenses||[]).filter(x=>x.date===t),x=>+x.amount);
    const focus=Math.min(30,study/Math.max(1,+(db.studyTarget||3))*30);
    const time=Math.max(0,Math.min(20,(1-Math.min(waste,8)/8)*20));
    const money=exp===0&&inc===0?10:Math.max(0,Math.min(20,10+(inc-exp)/Math.max(1,inc||exp)*10));
    return Math.round(Math.min(100,h+focus+time+money));
  }
  function sumSafe(a,f){return a.reduce((n,x)=>n+f(x),0)}
  function xp(){const base=score();const c=completed(DAY());const streak=habitStreak();return Math.max(0,base*8+c*15+streak*20)}
  function level(){return Math.floor(xp()/500)+1}
  function streak(){let n=0,d=new Date();for(let i=0;i<365;i++){const k=typeof dateKey==='function'?dateKey(d):d.toISOString().slice(0,10);if(completed(k)>0){n++;d.setDate(d.getDate()-1)}else break}return n}
  function habitStreak(){let n=0,d=new Date();for(let i=0;i<365;i++){const k=typeof dateKey==='function'?dateKey(d):d.toISOString().slice(0,10);if(completed(k)>=Math.max(1,Math.ceil(allHabits().length/2))){n++;d.setDate(d.getDate()-1)}else break}return n}
  function esc20(v){return typeof esc==='function'?esc(v):String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function fa20(n){try{return new Intl.NumberFormat('fa-IR').format(n)}catch(e){return String(n)}}
  function build(){
    const dash=document.getElementById('dashboard');if(!dash||document.getElementById('x20Shell'))return;
    const wrap=document.createElement('section');wrap.id='x20Shell';wrap.className='x20-shell';wrap.innerHTML=`
      <div class="x20-card pad"><div class="x20-top"><div><span class="x20-kicker">NEXUS ULTIMATE+ • LIFE ENGINE</span><h3>سیستم زندگی تو، در یک نگاه.</h3><p>عادت‌ها، XP، ریتم هفتگی و چند اقدام مهم را همین‌جا کنترل کن.</p></div><div class="x20-live"><i class="x20-dot"></i><span>LIVE CORE</span></div></div></div>
      <div class="x20-grid">
        <div class="x20-card pad"><div class="x20-top"><div><span class="x20-kicker">DAILY HABITS</span><h3>عادت‌های امروز</h3></div><button class="secondary small" id="x20ManageHabits">＋ عادت سفارشی</button></div><div class="x20-habits" id="x20Habits" style="margin-top:15px"></div></div>
        <div class="x20-card pad"><span class="x20-kicker">XP CORE</span><div class="x20-xp" style="margin-top:10px"><div class="x20-level"><b id="x20Level">۱</b></div><div><div class="x20-bigxp" id="x20XP">۰ XP</div><div class="x20-xpbar"><i id="x20XPBar"></i></div><div class="x20-xptext"><span id="x20XPNext">تا سطح بعد</span><span id="x20Streak">۰ روز زنجیره</span></div></div><div style="font-size:20px">🏆</div></div><div class="x20-actions"><button id="x20FocusBtn">⚡ Focus</button><button id="x20QuickBtn">＋ ثبت سریع</button><button id="x20ReviewBtn">📋 مرور هفته</button></div></div>
      </div>
      <div class="x20-card pad"><div class="x20-top"><div><span class="x20-kicker">WEEKLY RHYTHM</span><h3>ریتم ۷ روز اخیر</h3></div><span class="muted" id="x20WeekScore">۰٪ میانگین</span></div><div class="x20-week" id="x20Week" style="margin-top:14px"></div></div>
      <div class="x20-card pad"><div class="x20-top"><div><span class="x20-kicker">SMART INSIGHTS</span><h3>نبض هوشمند</h3></div></div><div class="x20-insights" id="x20Insights" style="margin-top:14px"></div><div class="x20-footer-note">این تحلیل‌ها فقط از داده‌های ذخیره‌شده روی همین دستگاه ساخته می‌شوند.</div></div>`;
    const hero=dash.querySelector('.hero');hero?.after(wrap);render();bind();
  }
  function render(){
    if(!document.getElementById('x20Shell'))return;
    const hs=document.getElementById('x20Habits');const today=dayObj(DAY());
    hs.innerHTML=allHabits().map(h=>`<div class="x20-habit ${today[h.id]?'done':''}" data-habit="${esc20(h.id)}"><div class="x20-habit-check">${today[h.id]?'✓':'○'}</div><div class="x20-habit-main"><b>${esc20(h.icon||'✦')} ${esc20(h.name)}</b><span>${esc20(h.hint||'')}</span></div></div>`).join('');
    const cur=xp(),lv=level(),base=(lv-1)*500,pct=Math.min(100,Math.round((cur-base)/500*100));
    document.getElementById('x20Level').textContent=fa20(lv);document.getElementById('x20XP').textContent=fa20(cur)+' XP';document.getElementById('x20XPBar').style.width=pct+'%';document.getElementById('x20XPNext').textContent=fa20(Math.max(0,lv*500-cur))+' XP تا سطح بعد';document.getElementById('x20Streak').textContent=fa20(habitStreak())+' روز زنجیره';
    const labels=['ش','ی','د','س','چ','پ','ج'];let days=[];for(let i=6;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);let k=typeof dateKey==='function'?dateKey(d):d.toISOString().slice(0,10);days.push({k,d})}const vals=days.map(x=>allHabits().length?Math.round(completed(x.k)/allHabits().length*100):0);document.getElementById('x20Week').innerHTML=days.map((x,i)=>`<div class="x20-day ${x.k===DAY()?'today':''}"><b>${labels[(x.d.getDay()+1)%7]}</b><span>${fa20(vals[i])}٪</span><i style="--w:${vals[i]}%"></i></div>`).join('');document.getElementById('x20WeekScore').textContent=fa20(Math.round(vals.reduce((a,b)=>a+b,0)/7))+'٪ میانگین';
    const st=sumSafe((db.study||[]).filter(x=>x.date===DAY()),x=>+x.hours), wa=sumSafe((db.waste||[]).filter(x=>x.date===DAY()),x=>+x.hours), inc=sumSafe((db.incomes||[]).filter(x=>x.date===DAY()),x=>+x.amount), exp=sumSafe((db.expenses||[]).filter(x=>x.date===DAY()),x=>+x.amount), sv=sumSafe((db.savings||[]).filter(x=>x.date===DAY()),x=>x.type==='deposit'?+x.amount:-+x.amount);
    const ins=[];ins.push(`<div class="x20-insight"><span>امتیاز امروز</span><b>${fa20(score())} / ۱۰۰</b></div>`);ins.push(`<div class="x20-insight"><span>مطالعه</span><b>${fa20(st)} ساعت</b></div>`);ins.push(`<div class="x20-insight"><span>تراز امروز</span><b>${typeof money==='function'?money(inc-exp):fa20(inc-exp)}</b></div>`);ins.push(`<div class="x20-insight"><span>پس‌انداز خالص</span><b>${typeof money==='function'?money(sv):fa20(sv)}</b></div>`);ins.push(`<div class="x20-insight"><span>زمان پرت</span><b>${fa20(wa)} ساعت</b></div>`);ins.push(`<div class="x20-insight"><span>زنجیره عادت</span><b>${fa20(habitStreak())} روز 🔥</b></div>`);document.getElementById('x20Insights').innerHTML=ins.join('');
  }
  function bind(){
    document.querySelectorAll('[data-habit]').forEach(el=>el.onclick=()=>{const id=el.dataset.habit,o=dayObj(DAY());o[id]=!o[id];persist();render();toast(o[id]?'عادت ثبت شد ✦':'علامت عادت برداشته شد')});
    document.getElementById('x20FocusBtn').onclick=()=>document.getElementById('x10Focus')?.click();
    document.getElementById('x20QuickBtn').onclick=()=>document.getElementById('quickAdd')?.click();
    document.getElementById('x20ReviewBtn').onclick=review;
    document.getElementById('x20ManageHabits').onclick=addHabit;
  }
  function addHabit(){
    const modal=document.createElement('div');modal.className='x20-modal open';modal.innerHTML=`<div class="x20-modalbox"><div class="x20-modalhead"><div><span class="x20-kicker">CUSTOM HABIT</span><h3>عادت جدید</h3></div><button class="x20-close">×</button></div><form class="x20-form"><div><label>نام عادت</label><input id="x20HN" maxlength="35" placeholder="مثلاً آب کافی"></div><div><label>ایموجی</label><input id="x20HI" maxlength="3" value="✦"></div><div><label>توضیح کوتاه</label><input id="x20HT" maxlength="50" placeholder="یک قدم کوچک"></div><button>افزودن عادت</button></form></div>`;document.body.appendChild(modal);modal.querySelector('.x20-close').onclick=()=>modal.remove();modal.onclick=e=>{if(e.target===modal)modal.remove()};modal.querySelector('form').onsubmit=e=>{e.preventDefault();const n=modal.querySelector('#x20HN').value.trim();if(!n)return;const id='custom_'+Date.now();s.customHabits.push({id,name:n,icon:modal.querySelector('#x20HI').value.trim()||'✦',hint:modal.querySelector('#x20HT').value.trim()});persist();modal.remove();render();toast('عادت جدید اضافه شد ✦')};
  }
  function review(){
    const modal=document.createElement('div');modal.className='x20-modal open';let vals=[];for(let i=6;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);let k=typeof dateKey==='function'?dateKey(d):d.toISOString().slice(0,10);vals.push(completed(k))}const avg=allHabits().length?Math.round(vals.reduce((a,b)=>a+b,0)/7/allHabits().length*100):0;const best=Math.max(...vals);modal.innerHTML=`<div class="x20-modalbox"><div class="x20-modalhead"><div><span class="x20-kicker">WEEKLY REVIEW</span><h3>مرور هفته</h3></div><button class="x20-close">×</button></div><div class="x20-insights" style="margin-top:18px"><div class="x20-insight"><span>میانگین عادت‌ها</span><b>${fa20(avg)}٪</b></div><div class="x20-insight"><span>بهترین روز</span><b>${fa20(best)} عادت</b></div><div class="x20-insight"><span>XP فعلی</span><b>${fa20(xp())}</b></div></div><div class="prime-note" style="margin-top:15px"><span>💡</span><b>${avg>=70?'ریتمت عالیه؛ هفته بعد فقط ثبات رو حفظ کن.':avg>=40?'ریتمت شکل گرفته؛ دو عادت کلیدی رو جدی‌تر کن.':'کم شروع کن: فقط دو عادت اصلی رو برای هفته بعد انتخاب کن.'}</b></div></div>`;document.body.appendChild(modal);modal.querySelector('.x20-close').onclick=()=>modal.remove();modal.onclick=e=>{if(e.target===modal)modal.remove()}
  }
  const old=window.renderAll;if(typeof old==='function'&&!window.__x20Wrapped){window.__x20Wrapped=true;window.renderAll=function(){old();setTimeout(render,0)}}
  function init(){build();setTimeout(render,100)}
  setTimeout(init,250);setTimeout(init,1200);setInterval(()=>{if(document.getElementById('x20Shell'))render()},5000);
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='h'){e.preventDefault();document.getElementById('x20Shell')?.scrollIntoView({behavior:'smooth',block:'center'})}});
})();
