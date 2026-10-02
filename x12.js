(()=>{
'use strict';
const $=id=>document.getElementById(id);
const safe=(fn)=>{try{fn()}catch(e){console.warn('LifeOS X12',e)}};
const num=v=>Number(v)||0;
const fmt=v=>typeof money==='function'?money(v):new Intl.NumberFormat('fa-IR').format(Math.round(v));
const iso=n=>typeof daysAgo==='function'?daysAgo(n):__iso(new Date(Date.now()-n*86400000));
function metrics(){
 const today=typeof todayISO==='function'?todayISO():__iso(new Date());
 const week=iso(6);
 const studyToday=sum((db.study||[]).filter(x=>x.date===today),x=>num(x.hours));
 const studyWeek=sum((db.study||[]).filter(x=>x.date>=week),x=>num(x.hours));
 const wasteWeek=sum((db.waste||[]).filter(x=>x.date>=week),x=>num(x.hours));
 const inc=sum((db.incomes||[]).filter(x=>x.date>=week),x=>num(x.amount));
 const exp=sum((db.expenses||[]).filter(x=>x.date>=week),x=>num(x.amount));
 const dep=sum((db.savings||[]).filter(x=>x.date>=week&&x.type==='deposit'),x=>num(x.amount));
 const wd=sum((db.savings||[]).filter(x=>x.date>=week&&x.type==='withdrawal'),x=>num(x.amount));
 const target=Math.max(1,num(db.studyTarget)||3);
 const focus=Math.min(100,Math.round(studyWeek/(target*7)*100));
 const time=Math.max(0,Math.min(100,Math.round((1-Math.min(wasteWeek,28)/28)*100)));
 const moneyScore=inc===0&&exp===0?50:Math.max(0,Math.min(100,Math.round(50+(inc-exp)/Math.max(1,inc,exp)*50)));
 const saving=dep-wd; const saveScore=saving>0?Math.min(100,50+Math.round(Math.min(50,saving/100000))):0;
 const score=Math.round(focus*.35+time*.2+moneyScore*.2+saveScore*.25);
 return {today,studyToday,studyWeek,wasteWeek,inc,exp,saving,focus,time,moneyScore,saveScore,score};
}
function insights(m){
 const out=[];
 if(m.focus>=80) out.push(['تمرکز','ریتم مطالعه‌ات عالیه؛ همین الگو را حفظ کن.']);
 else if(m.focus<35) out.push(['مطالعه','یک جلسه کوتاه ۲۰ تا ۳۰ دقیقه‌ای امروز می‌تواند ریتمت را برگرداند.']);
 if(m.time<45) out.push(['زمان','زمان پرت این هفته بالاست؛ فقط یکی از عوامل پرت را هدف بگیر.']);
 else out.push(['زمان','کنترل زمانت پایدار است؛ همین روند را ادامه بده.']);
 if(m.saving>0) out.push(['سرمایه','این هفته پس‌انداز خالص مثبت بوده؛ مسیر مالی‌ات رو به جلوست.']);
 else if(m.saving<0) out.push(['سرمایه','برداشت‌ها از واریزها بیشتر شده؛ موجودی پس‌انداز را زیر نظر بگیر.']);
 if(m.exp>m.inc&&m.inc>0) out.push(['مالی','هزینه‌های هفته از درآمد ثبت‌شده بیشتر شده؛ دسته‌های پرهزینه را بررسی کن.']);
 else out.push(['مالی','فعلاً تراز درآمد و هزینه کنترل‌شده است.']);
 return out.slice(0,3);
}
function build(){
 if($('x12Command')) return;
 const bar=document.createElement('div');bar.id='x12Command';bar.className='x12-command';bar.innerHTML='<i class="live"></i><span>AURA LIVE</span><kbd>Ctrl Shift Space</kbd><button id="x12Open">نبض کامل</button>';
 document.body.appendChild(bar);
 const modal=document.createElement('div');modal.id='x12Radar';modal.className='x12-radar';modal.innerHTML=`<div class="x12-box"><div class="x12-head"><div><small>APEX BLACK LABEL · X12</small><h2>مرکز فرمان زندگی</h2><p>یک نمای فشرده از تمرکز، زمان، پول و سرمایه‌سازی تو.</p></div><button class="x12-close" id="x12Close">×</button></div><div class="x12-grid"><div class="x12-core"><div class="x12-ring" id="x12Ring"><div><b id="x12Score">۰</b><span>امتیاز کلی</span></div></div><div class="x12-bars"><div class="x12-bar-row"><span>تمرکز</span><div class="x12-bar"><i id="x12FocusBar"></i></div><b id="x12Focus">۰٪</b></div><div class="x12-bar-row"><span>زمان</span><div class="x12-bar"><i id="x12TimeBar"></i></div><b id="x12Time">۰٪</b></div><div class="x12-bar-row"><span>مالی</span><div class="x12-bar"><i id="x12MoneyBar"></i></div><b id="x12Money">۰٪</b></div><div class="x12-bar-row"><span>پس‌انداز</span><div class="x12-bar"><i id="x12SaveBar"></i></div><b id="x12Save">۰٪</b></div><div><small style="color:#748196">۷ روز اخیر</small><div class="x12-streak" id="x12Streak"></div></div></div></div><div class="x12-side"><h3>نبض امروز</h3><div id="x12Insights"></div><div class="x12-actions"><button class="hot" id="x12Quick">＋ ثبت سریع</button><button id="x12Study">📚 ثبت مطالعه</button><button id="x12Saving">💎 پس‌انداز</button><button id="x12Finance">₿ مالی</button></div></div></div><div class="x12-footer"><span>LifeOS X12 · داده‌ها فقط از اطلاعات ثبت‌شده خودت محاسبه می‌شوند.</span><span>Ctrl + Shift + Space · باز/بسته کردن</span></div></div>`;
 document.body.appendChild(modal);
 $('x12Open').onclick=open;$('x12Close').onclick=close;modal.onclick=e=>{if(e.target===modal)close()};
 $('x12Quick').onclick=()=>typeof openModal==='function'&&openModal('quick');
 $('x12Study').onclick=()=>typeof openModal==='function'&&openModal('study');
 $('x12Saving').onclick=()=>typeof openModal==='function'&&openModal('saving');
 $('x12Finance').onclick=()=>typeof go==='function'&&go('money');
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))close();if(e.ctrlKey&&e.shiftKey&&e.code==='Space'){e.preventDefault();modal.classList.contains('open')?close():open()}});
 function open(){refresh();modal.classList.add('open');document.body.classList.add('x12-mode','x12-scanline')}
 function close(){modal.classList.remove('open');document.body.classList.remove('x12-mode','x12-scanline')}
 window.__x12Refresh=refresh;
}
function refresh(){safe(()=>{
 const m=metrics();
 const set=(id,v)=>{if($(id))$(id).textContent=v}; const pct=(id,v)=>{if($(id))$(id).style.width=Math.max(0,Math.min(100,v))+'%'};
 set('x12Score',typeof fa==='function'?fa(m.score):m.score); if($('x12Ring'))$('x12Ring').style.setProperty('--x12-deg',(m.score*3.6)+'deg');
 set('x12Focus',m.focus+'%');set('x12Time',m.time+'%');set('x12Money',m.moneyScore+'%');set('x12Save',m.saveScore+'%');
 pct('x12FocusBar',m.focus);pct('x12TimeBar',m.time);pct('x12MoneyBar',m.moneyScore);pct('x12SaveBar',m.saveScore);
 const st=$('x12Streak');if(st){st.innerHTML='';for(let i=6;i>=0;i--){const d=iso(i);const active=(db.study||[]).some(x=>x.date===d)||(db.savings||[]).some(x=>x.date===d)||(db.incomes||[]).some(x=>x.date===d)||(db.expenses||[]).some(x=>x.date===d);const el=document.createElement('i');if(active)el.className='on';el.title=d;st.appendChild(el)}}
 const ins=$('x12Insights');if(ins)ins.innerHTML=insights(m).map(x=>`<div class="x12-insight"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');
});}
function tilt(){
 document.querySelectorAll('.x11-apex-card,.hero-ultra,.stat').forEach(el=>{if(el.dataset.x12)return;el.dataset.x12='1';el.classList.add('x12-tilt');el.addEventListener('pointermove',e=>{if(window.innerWidth<900)return;const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(900px) rotateX(${(-y*2.2).toFixed(2)}deg) rotateY(${(x*2.2).toFixed(2)}deg) translateY(-1px)`});el.addEventListener('pointerleave',()=>el.style.transform='')});}
function init(){build();refresh();tilt();setInterval(refresh,5000);if(typeof window.renderAll==='function'&&!window.__x12Wrapped){const old=window.renderAll;window.renderAll=function(){old();setTimeout(()=>{refresh();tilt()},60)};window.__x12Wrapped=true}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
