(()=>{
'use strict';
const $=id=>document.getElementById(id);
const n=v=>Number(v)||0;
const today=()=>typeof todayISO==='function'?todayISO():__iso(new Date());
const daysAgo=i=>typeof window.daysAgo==='function'?window.daysAgo(i):__iso(new Date(Date.now()-i*86400000));
const sum=(a,f)=>a.reduce((s,x)=>s+n(f(x)),0);
const fa=v=>typeof window.fa==='function'?window.fa(v):new Intl.NumberFormat('fa-IR').format(Math.round(v));
const moneyFmt=v=>typeof window.money==='function'?window.money(v):fa(v)+' تومان';
function calc(){
 const t=today(), d7=daysAgo(6);
 const studyToday=sum((db.study||[]).filter(x=>x.date===t),x=>x.hours);
 const study7=sum((db.study||[]).filter(x=>x.date>=d7),x=>x.hours);
 const waste7=sum((db.waste||[]).filter(x=>x.date>=d7),x=>x.hours);
 const inc7=sum((db.incomes||[]).filter(x=>x.date>=d7),x=>x.amount);
 const exp7=sum((db.expenses||[]).filter(x=>x.date>=d7),x=>x.amount);
 const dep7=sum((db.savings||[]).filter(x=>x.date>=d7&&x.type==='deposit'),x=>x.amount);
 const wd7=sum((db.savings||[]).filter(x=>x.date>=d7&&x.type==='withdrawal'),x=>x.amount);
 const saving=dep7-wd7;
 const target=Math.max(1,n(db.studyTarget)||3);
 const focus=Math.min(100,Math.round(study7/(target*7)*100));
 const time=Math.max(0,Math.min(100,Math.round((1-Math.min(waste7,28)/28)*100)));
 const finance=inc7===0&&exp7===0?50:Math.max(0,Math.min(100,Math.round(50+(inc7-exp7)/Math.max(1,inc7,exp7)*50)));
 const save= saving>0?Math.min(100,50+Math.round(Math.min(50,saving/100000))):0;
 const score=Math.round(focus*.35+time*.2+finance*.2+save*.25);
 const activeDays=new Set();
 ['study','waste','incomes','expenses','savings'].forEach(k=>(db[k]||[]).forEach(x=>{if(x.date>=d7)activeDays.add(x.date)}));
 return {t,studyToday,study7,waste7,inc7,exp7,dep7,wd7,saving,focus,time,finance,save,score,activeDays};
}
function build(){
 if($('x13Dock'))return;
 const dock=document.createElement('div');dock.id='x13Dock';dock.className='x13-dock';dock.innerHTML=`<div class="x13-live"><i></i><span>AURA PRIME</span><b id="x13Clock">--:--</b></div><div class="x13-dock-actions"><button data-x13="brief">✦ بریف امروز</button><button data-x13="focus">⚡ Focus</button><button data-x13="saving">💎 پس‌انداز</button><button data-x13="quick" class="hot">＋ ثبت سریع</button></div><div class="x13-score"><small>نبض</small><strong id="x13Score">۰</strong></div>`;
 const main=document.querySelector('main'); if(main) main.prepend(dock); else document.body.appendChild(dock);
 const overlay=document.createElement('div');overlay.id='x13Overlay';overlay.className='x13-overlay';overlay.innerHTML=`<div class="x13-card"><div class="x13-head"><div><span>APEX DAILY BRIEF</span><h2>بریف شخصی امروز</h2><p id="x13Subtitle">بر اساس داده‌های ثبت‌شده خودت.</p></div><button id="x13Close">×</button></div><div class="x13-grid"><div class="x13-orb"><div><strong id="x13BigScore">۰</strong><span>نبض امروز</span></div></div><div class="x13-bars"><div><label>تمرکز <b id="x13Focus">۰٪</b></label><i><em id="x13FocusBar"></em></i></div><div><label>کنترل زمان <b id="x13Time">۰٪</b></label><i><em id="x13TimeBar"></em></i></div><div><label>وضعیت مالی <b id="x13Finance">۰٪</b></label><i><em id="x13FinanceBar"></em></i></div><div><label>پس‌انداز <b id="x13Save">۰٪</b></label><i><em id="x13SaveBar"></em></i></div></div></div><div class="x13-insights" id="x13Insights"></div><div class="x13-week"><div class="x13-week-head"><b>ریتم ۷ روز اخیر</b><span id="x13WeekText"></span></div><div id="x13Week"></div></div><div class="x13-actions"><button id="x13Quick">＋ ثبت سریع</button><button id="x13Study">📚 مطالعه</button><button id="x13Saving">💎 پس‌انداز</button><button id="x13Money">₿ مالی</button></div></div>`;
 document.body.appendChild(overlay);
 const open=()=>{refresh();overlay.classList.add('open');document.body.classList.add('x13-cinema')};
 const close=()=>{overlay.classList.remove('open');document.body.classList.remove('x13-cinema')};
 $('x13Close').onclick=close; overlay.onclick=e=>{if(e.target===overlay)close()};
 dock.querySelectorAll('[data-x13]').forEach(b=>b.onclick=()=>{const a=b.dataset.x13;if(a==='brief')open();if(a==='focus'&&typeof openModal==='function')openModal('study');if(a==='saving'&&typeof openModal==='function')openModal('saving');if(a==='quick'&&typeof openModal==='function')openModal('quick')});
 $('x13Quick').onclick=()=>typeof openModal==='function'&&openModal('quick'); $('x13Study').onclick=()=>typeof openModal==='function'&&openModal('study'); $('x13Saving').onclick=()=>typeof openModal==='function'&&openModal('saving'); $('x13Money').onclick=()=>typeof go==='function'&&go('money');
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.altKey&&e.key.toLowerCase()==='b'){e.preventDefault();overlay.classList.contains('open')?close():open()}if(e.key==='Escape')close()});
 window.__x13Refresh=refresh;
}
function refresh(){try{
 const m=calc(); const set=(id,v)=>{if($(id))$(id).textContent=v}; const bar=(id,v)=>{if($(id))$(id).style.width=Math.max(0,Math.min(100,v))+'%'};
 set('x13Score',fa(m.score));set('x13BigScore',fa(m.score));set('x13Focus',fa(m.focus)+'٪');set('x13Time',fa(m.time)+'٪');set('x13Finance',fa(m.finance)+'٪');set('x13Save',fa(m.save)+'٪');bar('x13FocusBar',m.focus);bar('x13TimeBar',m.time);bar('x13FinanceBar',m.finance);bar('x13SaveBar',m.save);
 const title=m.score>=85?'امروز در حالت APEX هستی ✦':m.score>=65?'ریتمت خوبه؛ فقط ادامه بده.':'امروز یک حرکت کوچک اما واقعی انتخاب کن.';
 set('x13Subtitle',title+'  '+(m.studyToday>0?'مطالعه امروز ثبت شده.':'هنوز مطالعه‌ای برای امروز ثبت نشده.'));
 const insights=[];
 if(m.studyToday>0) insights.push(['📚','مطالعه',`${fa(m.studyToday)} ساعت امروز ثبت شده.`]); else insights.push(['📚','مطالعه','یک جلسه کوتاه ۲۰ تا ۳۰ دقیقه‌ای می‌تواند شروع خوبی باشد.']);
 if(m.waste7>8) insights.push(['⏱️','زمان','زمان پرت ۷ روز اخیر بالاست؛ یک عامل اصلی را حذف یا محدود کن.']); else insights.push(['⏱️','زمان','کنترل زمانت در محدوده خوبی است.']);
 if(m.saving>0) insights.push(['💎','سرمایه',`پس‌انداز خالص ۷ روز اخیر: ${moneyFmt(m.saving)}.`]); else insights.push(['💎','سرمایه','برای این هفته هنوز پس‌انداز خالص مثبتی ثبت نشده.']);
 if(m.exp7>m.inc7&&m.inc7>0) insights.push(['₿','مالی','هزینه‌های ثبت‌شده این هفته از درآمد بیشتر بوده‌اند.']); else insights.push(['₿','مالی','تراز ثبت‌شده این هفته کنترل‌شده است.']);
 const ins=$('x13Insights');if(ins)ins.innerHTML=insights.map(x=>`<div><span>${x[0]}</span><b>${x[1]}</b><p>${x[2]}</p></div>`).join('');
 const w=$('x13Week');if(w){w.innerHTML='';for(let i=6;i>=0;i--){const d=daysAgo(i), active=m.activeDays.has(d), h=document.createElement('div');h.className='x13-day '+(active?'on':'');h.innerHTML=`<span>${new Date(d+'T12:00:00').toLocaleDateString('fa-IR',{weekday:'short'}).replace('شنبه','ش').replace('یکشنبه','ی')}</span><i></i>`;h.title=d;w.appendChild(h)}}
 const clock=new Date().toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'});set('x13Clock',clock);
 }catch(e){console.warn('LifeOS X13',e)}}
function polish(){
 document.querySelectorAll('button').forEach(b=>{if(b.dataset.x13Ripple)return;b.dataset.x13Ripple='1';b.addEventListener('pointerdown',()=>{b.classList.remove('x13-ripple');void b.offsetWidth;b.classList.add('x13-ripple')})});
}
function init(){build();refresh();polish();setInterval(refresh,3000);if(typeof window.renderAll==='function'&&!window.__x13Wrapped){const old=window.renderAll;window.renderAll=function(){old();setTimeout(()=>{refresh();polish()},80)};window.__x13Wrapped=true}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
