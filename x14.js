(()=>{
'use strict';
const $=id=>document.getElementById(id);
const n=v=>Number(v)||0;
const fa=v=>typeof window.fa==='function'?window.fa(v):new Intl.NumberFormat('fa-IR').format(Math.round(v));
const money=v=>typeof window.money==='function'?window.money(v):fa(v)+' تومان';
const today=()=>typeof todayISO==='function'?todayISO():__iso(new Date());
const ago=i=>__iso(new Date(Date.now()-i*86400000));
const sum=(a,f)=>a.reduce((s,x)=>s+n(f(x)),0);
function stats(){
 const t=today(), week=ago(6);
 const study=sum((db.study||[]).filter(x=>x.date>=week),x=>x.hours), todayStudy=sum((db.study||[]).filter(x=>x.date===t),x=>x.hours);
 const waste=sum((db.waste||[]).filter(x=>x.date>=week),x=>x.hours);
 const inc=sum((db.incomes||[]).filter(x=>x.date>=week),x=>x.amount), exp=sum((db.expenses||[]).filter(x=>x.date>=week),x=>x.amount);
 const dep=sum((db.savings||[]).filter(x=>x.date>=week&&x.type==='deposit'),x=>x.amount), wd=sum((db.savings||[]).filter(x=>x.date>=week&&x.type==='withdrawal'),x=>x.amount);
 const save=dep-wd, target=Math.max(1,n(db.studyTarget)||3);
 const focus=Math.min(100,Math.round(study/(target*7)*100));
 const time=Math.max(0,Math.min(100,Math.round((1-Math.min(waste,28)/28)*100)));
 const finance=inc===0&&exp===0?50:Math.max(0,Math.min(100,Math.round(50+(inc-exp)/Math.max(1,inc,exp)*50)));
 const saving=save>0?Math.min(100,50+Math.round(Math.min(50,save/100000))):0;
 const score=Math.round(focus*.35+time*.2+finance*.2+saving*.25);
 const active=new Set();['study','waste','incomes','expenses','savings'].forEach(k=>(db[k]||[]).forEach(x=>{if(x.date>=week)active.add(x.date)}));
 return {t,study,todayStudy,waste,inc,exp,dep,wd,save,focus,time,finance,saving,score,active};
}
function build(){
 if($('x14Dock'))return;
 const dock=document.createElement('div');dock.id='x14Dock';dock.className='x14-dock';dock.innerHTML=`<div class="x14-brand"><span class="x14-orbmini">✦</span><div><small>LIFEOS NEXUS</small><b>مرکز فرمان زندگی</b></div></div><div class="x14-live"><i></i><span id="x14Clock">--:--</span><b id="x14Mood">در حال اسکن…</b></div><div class="x14-actions"><button id="x14Nexus">◈ NEXUS</button><button id="x14Zen">◌ Zen</button><button id="x14Quick" class="hot">＋ ثبت سریع</button></div>`;
 const main=document.querySelector('main'); if(main)main.prepend(dock);
 const overlay=document.createElement('div');overlay.id='x14Overlay';overlay.className='x14-overlay';overlay.innerHTML=`<div class="x14-panel"><div class="x14-head"><div><span>NEXUS PRIME / LIVE OS</span><h2>مرکز فرمان LifeOS</h2><p id="x14Headline">در حال جمع‌کردن نبض امروز…</p></div><button id="x14Close">×</button></div><div class="x14-hero-grid"><div class="x14-scorebox"><div class="x14-ring" id="x14Ring"><div><strong id="x14Score">۰</strong><small>نبض هفته</small></div></div><div class="x14-scorecopy"><b id="x14Verdict">—</b><span id="x14SubVerdict">—</span></div></div><div class="x14-metrics"><div><span>📚 مطالعه</span><b id="x14Study">۰</b><small>ساعت / ۷ روز</small></div><div><span>⏱️ زمان پرت</span><b id="x14Waste">۰</b><small>ساعت / ۷ روز</small></div><div><span>₿ تراز مالی</span><b id="x14Balance">۰</b><small>۷ روز اخیر</small></div><div><span>💎 پس‌انداز</span><b id="x14Save">۰</b><small>خالص / ۷ روز</small></div></div></div><div class="x14-section"><div class="x14-section-head"><b>نبض چهارگانه</b><span>زنده</span></div><div class="x14-bars"><div><label>تمرکز <b id="x14Focus">۰٪</b></label><i><em id="x14FocusBar"></em></i></div><div><label>کنترل زمان <b id="x14Time">۰٪</b></label><i><em id="x14TimeBar"></em></i></div><div><label>مالی <b id="x14Finance">۰٪</b></label><i><em id="x14FinanceBar"></em></i></div><div><label>پس‌انداز <b id="x14Saving">۰٪</b></label><i><em id="x14SavingBar"></em></i></div></div></div><div class="x14-section"><div class="x14-section-head"><b>هفته‌ی تو</b><span id="x14WeekLabel"></span></div><div class="x14-days" id="x14Days"></div></div><div class="x14-bottom"><div class="x14-quote" id="x14Quote">یک حرکت کوچک، امروز را عوض می‌کند.</div><div class="x14-buttons"><button id="x14FocusBtn">⚡ شروع مطالعه</button><button id="x14SaveBtn">💎 ثبت پس‌انداز</button><button id="x14MoneyBtn">₿ رفتن به مالی</button><button id="x14QuickBtn">＋ ثبت سریع</button></div></div></div>`;
 document.body.appendChild(overlay);
 const open=()=>{refresh();overlay.classList.add('open');document.body.classList.add('x14-open')};
 const close=()=>{overlay.classList.remove('open');document.body.classList.remove('x14-open')};
 $('x14Nexus').onclick=open;$('x14Close').onclick=close;overlay.onclick=e=>{if(e.target===overlay)close()};
 const quick=()=>typeof openModal==='function'&&openModal('quick');$('x14Quick').onclick=quick;$('x14QuickBtn').onclick=quick;
 $('x14FocusBtn').onclick=()=>typeof openModal==='function'&&openModal('study');$('x14SaveBtn').onclick=()=>typeof openModal==='function'&&openModal('saving');$('x14MoneyBtn').onclick=()=>typeof go==='function'&&go('money');
 let zen=false;$('x14Zen').onclick=()=>{zen=!zen;document.body.classList.toggle('x14-zen',zen);$('x14Zen').textContent=zen?'◉ Exit Zen':'◌ Zen';localStorage.setItem('lifeos-x14-zen',zen?'1':'0')};
 if(localStorage.getItem('lifeos-x14-zen')==='1'){$('x14Zen').click()}
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='j'){e.preventDefault();open()}if(e.key==='Escape')close()});
 window.__x14Refresh=refresh;
}
function refresh(){try{const s=stats(), set=(id,v)=>{if($(id))$(id).textContent=v}, bar=(id,v)=>{if($(id))$(id).style.width=Math.max(0,Math.min(100,v))+'%'};
 set('x14Clock',new Date().toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'}));set('x14Score',fa(s.score));set('x14Study',fa(s.study));set('x14Waste',fa(s.waste));set('x14Balance',money(s.inc-s.exp));set('x14Save',money(s.save));set('x14Focus',fa(s.focus)+'٪');set('x14Time',fa(s.time)+'٪');set('x14Finance',fa(s.finance)+'٪');set('x14Saving',fa(s.saving)+'٪');
 bar('x14FocusBar',s.focus);bar('x14TimeBar',s.time);bar('x14FinanceBar',s.finance);bar('x14SavingBar',s.saving);if($('x14Ring'))$('x14Ring').style.setProperty('--deg',(s.score*3.6)+'deg');
 const verdict=s.score>=85?'حالت APEX فعال ✦':s.score>=70?'ریتمت خیلی خوبه؛ ثبات رو حفظ کن.':s.score>=50?'تعادل خوبه؛ یک کار مهم رو کامل کن.':'امروز فقط یک حرکت واقعی انجام بده.';set('x14Verdict',verdict);set('x14Mood',s.score>=80?'ریتم عالی':'ریتم در حال ساخت');set('x14Headline',s.todayStudy>0?`امروز ${fa(s.todayStudy)} ساعت مطالعه ثبت شده؛ مسیرت زنده است.`:'هنوز برای امروز مطالعه ثبت نشده؛ یک شروع کوتاه کافی است.');set('x14SubVerdict',s.save>0?`پس‌انداز خالص هفته: ${money(s.save)}`:'این هفته هنوز پس‌انداز خالص مثبتی ثبت نشده.');
 const q=s.waste>10?'امروز یک منبع حواس‌پرتی را حذف کن.':s.save>0?'ثبات مالی کوچک، نتیجه‌ی بزرگ می‌سازد.':s.todayStudy>0?'همین ریتم را حفظ کن؛ لازم نیست بیشتر از ظرفیتت فشار بیاوری.':'یک جلسه ۲۰ دقیقه‌ای شروع کن.';set('x14Quote',q);set('x14WeekLabel',`${fa(s.active.size)} روز فعال`);
 const days=$('x14Days');if(days){days.innerHTML='';for(let i=6;i>=0;i--){const d=ago(i), on=s.active.has(d), h=document.createElement('div');h.className='x14-day '+(on?'on':'');h.innerHTML=`<span>${new Date(d+'T12:00:00').toLocaleDateString('fa-IR',{weekday:'short'}).replace('شنبه','ش').replace('یکشنبه','ی')}</span><i></i><small>${on?'فعال':'—'}</small>`;days.appendChild(h)}}
 }catch(e){console.warn('LifeOS X14',e)}}
function init(){build();refresh();setInterval(refresh,2500);if(typeof window.renderAll==='function'&&!window.__x14Wrapped){const old=window.renderAll;window.renderAll=function(){old();setTimeout(refresh,80)};window.__x14Wrapped=true}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
