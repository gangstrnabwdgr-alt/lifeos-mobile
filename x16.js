(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),fa=v=>new Intl.NumberFormat('fa-IR').format(Math.round(v)),L=localStorage;
const iso=d=>window.__iso(d),ago=i=>iso(new Date(Date.now()-i*864e5));
const S=(a,f)=>(a||[]).reduce((s,x)=>s+(+f(x)||0),0);
const go=p=>typeof window.go==='function'&&window.go(p);
/* 1 — Accent themes */
const T={aurora:['#c59cff','#54f5d7'],sunset:['#ff9a5c','#ff4f9a'],ocean:['#5cc8ff','#4f7bff'],matrix:['#7dff9a','#1fd1a5'],gold:['#ffd36b','#ff9f43']};
function theme(k){const t=T[k]||T.aurora,r=document.documentElement.style;r.setProperty('--x14a',t[0]);r.setProperty('--x14b',t[1]);r.setProperty('--x16a',t[0]);r.setProperty('--x16b',t[1]);L.setItem('lifeos-x16-theme',k)}
theme(L.getItem('lifeos-x16-theme')||'aurora');
/* 2 — Confetti */
function confetti(n=70){const c=document.createElement('canvas');c.className='x16-confetti';document.body.appendChild(c);const x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;
 const col=[T.aurora[0],T.aurora[1],'#ff70bb','#ffd36b'];const p=Array.from({length:n},()=>({x:innerWidth/2+(Math.random()-.5)*200,y:innerHeight*.6,vx:(Math.random()-.5)*14,vy:-Math.random()*16-4,s:4+Math.random()*5,r:Math.random()*6,c:col[Math.random()*4|0]}));let f=0;
 (function t(){x.clearRect(0,0,c.width,c.height);p.forEach(a=>{a.vy+=.5;a.x+=a.vx;a.y+=a.vy;a.r+=.2;x.fillStyle=a.c;x.save();x.translate(a.x,a.y);x.rotate(a.r);x.fillRect(-a.s/2,-a.s/2,a.s,a.s*.6);x.restore()});if(++f<90)requestAnimationFrame(t);else c.remove()})()}
window.__confetti=confetti;
if(typeof window.toast==='function'&&!window.toast.__x16){const o=window.toast;window.toast=function(m){o.apply(this,arguments);if(/ثبت|ذخیره|اضافه|کامل|تبریک/.test(String(m)))confetti(45)};window.toast.__x16=1}
/* 3 — Smart insights */
function insights(){const db=window.db||{},t=ago(30),w=ago(6),out=[];
 const ex=(db.expenses||[]).filter(x=>x.date>=t),cat={};ex.forEach(x=>cat[x.category||'سایر']=(cat[x.category||'سایر']||0)+(+x.amount||0));
 const top=Object.entries(cat).sort((a,b)=>b[1]-a[1])[0];if(top)out.push(['💸','بیشترین خرج ۳۰ روز اخیر',`${top[0]} — ${fa(top[1])} تومان (${fa(top[1]/S(ex,x=>x.amount)*100)}٪ از کل)`]);
 const wd={};(db.study||[]).forEach(x=>{const d=new Date(x.date+'T12:00:00').toLocaleDateString('fa-IR',{weekday:'long'});wd[d]=(wd[d]||0)+(+x.hours||0)});const bd=Object.entries(wd).sort((a,b)=>b[1]-a[1])[0];if(bd)out.push(['📚','قوی‌ترین روز مطالعه',`${bd[0]} — مجموع ${fa(bd[1])} ساعت`]);
 const sw=S((db.study||[]).filter(x=>x.date>=w),x=>x.hours),ww=S((db.waste||[]).filter(x=>x.date>=w),x=>x.hours);out.push(['⚖️','تعادل هفته',sw>=ww?`مطالعه (${fa(sw)}س) از زمان پرت (${fa(ww)}س) جلوتره 👌`:`زمان پرت (${fa(ww)}س) از مطالعه (${fa(sw)}س) بیشتره؛ یک بازه‌ی بدون حواس‌پرتی بساز`]);
 const inc=S((db.incomes||[]).filter(x=>x.date>=t),x=>x.amount),e=S(ex,x=>x.amount);if(inc)out.push(['🧭','نرخ مصرف از درآمد',`${fa(e/inc*100)}٪ از درآمد ۳۰ روزت خرج شده`+(e>inc?' — بیشتر از درآمد!':'')]);
 const g=(db.goals||[]).filter(x=>x.target>0).sort((a,b)=>b.current/b.target-a.current/a.target).find(x=>x.current<x.target);if(g)out.push(['🎯','نزدیک‌ترین هدف',`${g.name} — ${fa(g.current/g.target*100)}٪ انجام شده`]);
 return out}
function mountInsights(){const d=$('#dashboard');if(!d)return;let b=$('#x16Ins');if(!b){b=document.createElement('div');b.id='x16Ins';b.className='panel x16-ins';const a=$('.cards',d);a?a.after(b):d.append(b)}
 const r=insights();b.innerHTML=`<div class="panel-head"><h3>✨ بینش هوشمند</h3><span>بر اساس داده‌های خودت</span></div><div class="x16-ins-grid">${r.map(i=>`<div><em>${i[0]}</em><div><small>${i[1]}</small><b>${i[2]}</b></div></div>`).join('')||'<p class="muted">با ثبت چند فعالیت، بینش‌ها اینجا ظاهر می‌شن.</p>'}</div>`}
/* 4 — Auto snapshots + restore */
const SK='lifeos_snaps';function snap(){try{const raw=L.getItem('lifeos_v1');if(!raw)return;const a=JSON.parse(L.getItem(SK)||'[]');if(a[0]&&a[0].d===raw)return;a.unshift({t:Date.now(),d:raw});L.setItem(SK,JSON.stringify(a.slice(0,5)))}catch(e){}}
function snapUI(){const a=JSON.parse(L.getItem(SK)||'[]');const o=document.createElement('div');o.className='x16-modal';o.innerHTML=`<div class="x16-box"><button class="x16-x">×</button><h2>♻ نسخه‌های خودکار</h2><p class="muted">آخرین ۵ نسخه‌ی ذخیره‌شده؛ با بازیابی، اطلاعات فعلی جایگزین می‌شه.</p>${a.map((s,i)=>`<div class="x16-row"><span>${new Date(s.t).toLocaleString('fa-IR')} · ${fa(s.d.length/1024)} KB</span><button data-i="${i}">بازیابی</button></div>`).join('')||'<p>هنوز نسخه‌ای نیست.</p>'}</div>`;document.body.appendChild(o);
 o.onclick=e=>{if(e.target===o||e.target.className==='x16-x')o.remove();const i=e.target.dataset.i;if(i!=null&&confirm('اطلاعات فعلی با این نسخه جایگزین بشه؟')){L.setItem('lifeos_v1',a[i].d);location.reload()}}}
/* 5 — UI: theme picker, snapshots btn, tilt, mobile dock */
function ui(){const h=$('.header-actions');if(h&&!$('#x16Theme')){const b=document.createElement('button');b.id='x16Theme';b.className='icon-btn';b.title='تم رنگی';b.textContent='🎨';b.onclick=()=>{const k=Object.keys(T),c=L.getItem('lifeos-x16-theme')||'aurora';theme(k[(k.indexOf(c)+1)%k.length]);confetti(25)};h.prepend(b)}
 const sb=$('.side-bottom');if(sb&&!$('#x16Snap')){const b=document.createElement('button');b.id='x16Snap';b.textContent='♻ نسخه‌های خودکار';b.onclick=snapUI;sb.prepend(b)}
 if(!$('#x16Dock')){const d=document.createElement('nav');d.id='x16Dock';d.innerHTML=[['dashboard','◈','خانه'],['money','₿','مالی'],['time','◷','زمان'],['study','⌁','مطالعه'],['goals','◎','اهداف']].map(x=>`<button data-p="${x[0]}"><b>${x[1]}</b><span>${x[2]}</span></button>`).join('');d.onclick=e=>{const b=e.target.closest('button');if(b)go(b.dataset.p)};document.body.appendChild(d)}
 document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.panel,.stat,.orbit-card');if(!c||matchMedia('(hover:none)').matches)return;const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true});
 const mark=()=>{const a=$('.nav.active');document.querySelectorAll('#x16Dock button').forEach(b=>b.classList.toggle('on',a&&a.dataset.page===b.dataset.p))};document.addEventListener('click',()=>setTimeout(mark,30));mark()}
/* 6 — Count-up on page change */
function countUp(){document.querySelectorAll('.page.active .stat strong').forEach(el=>{const m=el.textContent.trim();el.classList.remove('x16-pop');void el.offsetWidth;el.classList.add('x16-pop')})}
function init(){ui();mountInsights();snap();setInterval(snap,6e5);document.addEventListener('click',e=>{if(e.target.closest('.nav,#x16Dock'))setTimeout(()=>{countUp();mountInsights()},60)});
 if(typeof window.renderAll==='function'){const o=window.renderAll;let t;window.renderAll=function(){o.apply(this,arguments);clearTimeout(t);t=setTimeout(mountInsights,120)}}
 const k=localStorage;if(!k.getItem('lifeos-x16-hello')){k.setItem('lifeos-x16-hello','1');setTimeout(()=>confetti(80),600)}}
addEventListener('load',init);
})();
