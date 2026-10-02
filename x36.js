/* LifeOS X36 — premium polish + deduped UX layer */
(()=>{
'use strict';
const boot=()=>{
 document.body.classList.add('x36-on');
 const main=document.querySelector('main');
 if(main && !document.querySelector('.x36-hero')){
  const hero=document.createElement('section');
  hero.className='x36-hero x36-reveal';
  hero.innerHTML='<div><div class="x36-kicker">AURA NEXUS / PERSONAL OPERATING SYSTEM</div><h2>همه‌چیز زیر کنترل تو.</h2><p>کمتر شلوغی. بیشتر سیگنال. یک مرکز فرمان برای زندگی روزمره.</p></div><div class="x36-hero-meta"><span class="x36-command-chip"><i></i> SYSTEM ONLINE</span><span class="x36-command-chip">⌘ K · COMMAND</span><span class="x36-command-chip">SHIFT F · FOCUS</span></div>';
  const first=main.firstElementChild; main.insertBefore(hero,first||null);
 }
 document.querySelectorAll('.panel').forEach((el,i)=>{if(!el.classList.contains('x36-reveal')){el.classList.add('x36-reveal');el.style.animationDelay=Math.min(i*35,350)+'ms'}});
 // Add accessible labels to chart canvases without touching the chart engine.
 document.querySelectorAll('canvas').forEach((c,i)=>{if(!c.getAttribute('aria-label')){const p=c.closest('.panel');const h=p?.querySelector('h3')?.textContent?.trim();if(h)c.setAttribute('aria-label',h)}});
 // Lightweight pointer glow only on desktop.
 if(matchMedia('(pointer:fine)').matches){document.addEventListener('pointermove',e=>{document.documentElement.style.setProperty('--x36-mx',e.clientX+'px');document.documentElement.style.setProperty('--x36-my',e.clientY+'px')},{passive:true})}
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
