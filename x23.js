/* LifeOS X23 — stability, boot recovery, safer language + command wiring */
(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  function boot(){
    if(!document.getElementById('x23Boot')){
      const b=document.createElement('div'); b.id='x23Boot'; b.innerHTML='<div class="x23-boot-card"><div class="x23-logo">L</div><h2>LifeOS</h2><p>NEXUS ULTIMATE+ • آماده‌سازی سیستم</p><div class="x23-loader"><i></i></div></div>'; document.body.appendChild(b);
    }
    requestAnimationFrame(()=>setTimeout(()=>$('#x23Boot')?.classList.add('hide'),220));
  }
  function health(title,msg){
    let n=$('#x23Health'); if(!n){n=document.createElement('div');n.id='x23Health';n.className='x23-health';document.body.appendChild(n)}
    n.innerHTML='<b>'+title+'</b><span>'+msg+'</span><br><button>بستن</button>';n.classList.add('show');n.querySelector('button').onclick=()=>n.classList.remove('show');setTimeout(()=>n.classList.remove('show'),7000);
  }
  function repairLanguageObserver(){
    // X21's original observer could retrigger itself forever when it rewrote text nodes.
    // Disable only that observer safely; language.js still handles manual language changes.
    if(window.MutationObserver && window.__lifeosLanguageObserver){
      try{window.__lifeosLanguageObserver.disconnect()}catch(e){}
      window.__lifeosLanguageObserver=null;
    }
  }
  function safeLanguage(){
    repairLanguageObserver();
    const L=window.LifeOSLanguage;
    if(!L||typeof L.apply!=='function')return;
    const saved=(()=>{try{return localStorage.getItem('lifeos.language')||'fa'}catch(e){return'fa'}})();
    try{L.apply(saved)}catch(e){console.warn('LifeOS language recovery',e)}
  }
  function wireNexus(){
    const overlay=$('#x22Overlay'); if(!overlay)return;
    // Prevent X22 quick navigation from clicking itself recursively.
    $$('#x22Overlay [data-go]').forEach(btn=>{
      btn.addEventListener('click',e=>{
        e.stopImmediatePropagation();
        const page=btn.dataset.go;
        overlay.classList.remove('open');
        const nav=document.querySelector(`.nav[data-page="${CSS.escape(page)}"]`);
        if(nav) nav.click();
      },true);
    });
    // If an X22 action has no matching modal, fail softly instead of doing nothing.
    $$('#x22Overlay [data-act]').forEach(btn=>{
      btn.addEventListener('click',e=>{
        const type=btn.dataset.act;
        const modal=document.querySelector(`[data-modal="${CSS.escape(type)}"]`);
        if(!modal && typeof window.openModal==='function'){
          e.stopImmediatePropagation(); overlay.classList.remove('open'); window.openModal(type);
        }
      },true);
    });
  }
  function init(){
    boot();
    setTimeout(safeLanguage,80);
    setTimeout(wireNexus,1200);
    // Avoid a blank screen if a non-critical extension throws.
    window.addEventListener('error',e=>{
      if(/x22|language|x23/.test(String(e.filename||''))) health('LifeOS Recovery','یک افزونه جانبی خطا داد؛ هسته اصلی برنامه فعال است.');
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
