(()=>{
  'use strict';
  const q=id=>document.getElementById(id);
  const safe=(fn)=>{try{fn()}catch(e){console.warn('LifeOS X11',e)}};
  function refresh(){safe(()=>{
    const t=todayISO();
    const weekStart=daysAgo(6);
    const study=sum((db.study||[]).filter(x=>x.date>=weekStart),x=>+x.hours);
    const waste=sum((db.waste||[]).filter(x=>x.date>=weekStart),x=>+x.hours);
    const inc=sum((db.incomes||[]).filter(x=>x.date>=weekStart),x=>+x.amount);
    const exp=sum((db.expenses||[]).filter(x=>x.date>=weekStart),x=>+x.amount);
    const dep=sum((db.savings||[]).filter(x=>x.date>=weekStart&&x.type==='deposit'),x=>+x.amount);
    const wd=sum((db.savings||[]).filter(x=>x.date>=weekStart&&x.type==='withdrawal'),x=>+x.amount);
    const target=Math.max(1,+(db.studyTarget||3));
    const studyScore=Math.min(100,Math.round(study/(target*7)*100));
    const timeScore=Math.max(0,Math.min(100,Math.round((1-Math.min(waste,24)/24)*100)));
    const moneyScore=inc===0&&exp===0?50:Math.max(0,Math.min(100,Math.round(50+(inc-exp)/Math.max(1,inc||exp)*50)));
    const saving=(dep-wd);
    const saveScore=saving>0?Math.min(100,50+Math.round(Math.min(50,saving/100000))):0;
    const score=Math.round(studyScore*.35+timeScore*.25+moneyScore*.2+saveScore*.2);
    q('x11Score').textContent=fa(score); q('x11ScoreRing').style.setProperty('--p',score+'%');
    q('x11WeekStudy').textContent=fa(study)+'س'; q('x11NetSave').textContent=money(saving);
    const streak=typeof calcStreak==='function'?calcStreak():0;
    q('x11Streak').textContent=fa(streak)+' روز';
    const gp=typeof goalsProgress==='function'?Math.round(goalsProgress()*100):0;
    q('x11Goals').textContent=fa(gp)+'٪';
    const heat=q('x11Heat');
    if(heat){heat.innerHTML=''; for(let i=13;i>=0;i--){const d=daysAgo(i),st=sum((db.study||[]).filter(x=>x.date===d),x=>+x.hours),sv=sum((db.savings||[]).filter(x=>x.date===d&&x.type==='deposit'),x=>+x.amount),ex=sum((db.expenses||[]).filter(x=>x.date===d),x=>+x.amount),ac=(db.customEntries||[]).filter(x=>x.date===d).length+(db.waste||[]).filter(x=>x.date===d).length;let n=(st?2:0)+(sv?2:0)+(ex?1:0)+(ac?1:0);let cls=n>=5?'l4':n>=3?'l3':n>=2?'l2':n>=1?'l1':'';let c=document.createElement('i');c.className='x11-cell '+cls+(d===t?' today':'');c.title=faDate(d);heat.appendChild(c)}}
  })}
  function achievements(){
    const study=sum(db.study||[],x=>+x.hours), exp=sum(db.expenses||[],x=>+x.amount), dep=sum((db.savings||[]).filter(x=>x.type==='deposit'),x=>+x.amount), goals=(db.goals||[]).length, streak=typeof calcStreak==='function'?calcStreak():0;
    const list=[
      ['🔥','شروع قدرتمند','حداقل ۳ روز پیوسته مطالعه',streak>=3],
      ['📚','دانش‌جو','۱۰ ساعت مطالعه ثبت کن',study>=10],
      ['💎','سازنده سرمایه','۱ میلیون تومان پس‌انداز کن',dep>=1000000],
      ['🎯','هدف‌گذار','حداقل یک هدف بساز',goals>=1],
      ['⚡','ریتم پایدار','۷ روز پیوسته مطالعه',streak>=7],
      ['🏆','تمرکز بالا','۳۰ ساعت مطالعه ثبت کن',study>=30],
      ['🛡️','کنترل مالی','این هفته هزینه‌ای کمتر از درآمد داشته باش',(()=>{const a=daysAgo(6);return sum((db.incomes||[]).filter(x=>x.date>=a),x=>+x.amount)>=sum((db.expenses||[]).filter(x=>x.date>=a),x=>+x.amount)})()],
      ['💠','هدف دوم','دو هدف فعال داشته باش',goals>=2]
    ];
    const overlay=document.createElement('div');overlay.className='x11-overlay';overlay.id='x11Achievements';
    overlay.innerHTML='<div class="x11-achieve-box"><div class="x11-ach-head"><div><small>APEX ACHIEVEMENTS</small><h3>تالار دستاوردها</h3><p>هر دستاورد از داده‌های واقعی LifeOS باز می‌شود.</p></div><button class="x11-close2">×</button></div><div class="x11-ach-grid">'+list.map(a=>`<div class="x11-ach ${a[3]?'unlocked':''}"><div class="ico">${a[0]}</div><b>${a[1]}</b><span>${a[2]}</span><em>${a[3]?'باز شده ✓':'قفل است'}</em></div>`).join('')+'</div></div>';
    document.body.appendChild(overlay);overlay.classList.add('open');overlay.onclick=e=>{if(e.target===overlay)overlay.remove()};overlay.querySelector('.x11-close2').onclick=()=>overlay.remove();
  }
  q('x11Achieve').onclick=achievements;
  q('x11Focus').onclick=()=>{const b=q('x10Focus');if(b)b.click();else if(typeof openModal==='function')openModal('quick')};
  q('x11Quick').onclick=()=>{if(typeof openModal==='function')openModal('quick')};
  refresh();setInterval(refresh,5000);
  if(typeof window.renderAll==='function'&&!window.__x11Wrapped){const old=window.renderAll;window.renderAll=function(){old();setTimeout(refresh,50)}}
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='a'){e.preventDefault();achievements()}});
})();
