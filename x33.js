(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const remove=sel=>$$(`${sel}`).forEach(el=>el.remove());
const clean=()=>{
  // Keep one clear hierarchy: Hero → Command Deck → Core data. Remove stacked generations of HUDs.
  remove('#x11ApexCard,.lux-hud,.focus-strip,.orbit-row,.x17-shell,.x18-shell,.x20-shell');
  remove('.x18-overlay,.x17-spot');
  const dash=$('#dashboard'); if(!dash)return;
  dash.classList.add('x33-clean');
  const hero=dash.querySelector('.hero');
  if(hero){
    const score=hero.querySelector('.score');
    if(score && !score.querySelector('.x33-score-caption')){
      const cap=document.createElement('small'); cap.className='x33-score-caption'; cap.textContent='ریتم کلی امروز'; score.appendChild(cap);
    }
  }
  const cockpit=$('.x27-cockpit');
  if(cockpit){
    cockpit.classList.add('x33-prime');
    const head=cockpit.querySelector('.x27-head');
    if(head && !head.querySelector('.x33-live-time')){
      const live=document.createElement('span'); live.className='x33-live-time'; live.id='x33LiveTime'; live.textContent='--:--'; head.appendChild(live);
    }
  }
};
const clock=()=>{const e=$('#x33LiveTime');if(e)e.textContent=new Intl.DateTimeFormat('fa-IR',{hour:'2-digit',minute:'2-digit'}).format(new Date())};
const polish=()=>{
  document.body.classList.add('x33-on');
  const header=$('header'); if(header) header.classList.add('x33-header');
  // Make the existing command button single-click. X27's double-click listener can remain harmlessly behind it.
  const command=$('#commandBtn');
  if(command && !command.dataset.x33){
    command.dataset.x33='1';
    command.addEventListener('click',()=>{
      const overlay=$('.x27-command');
      if(overlay){overlay.classList.add('open');overlay.querySelector('input')?.focus();}
    },{capture:true});
  }
  clean(); clock();
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polish);else polish();
addEventListener('load',()=>{polish();clock();});
setInterval(clock,30000);
window.addEventListener('resize',()=>document.body.classList.toggle('x33-compact',innerWidth<760));
})();
