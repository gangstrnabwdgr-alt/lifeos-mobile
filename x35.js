(()=>{'use strict';
function boot(){
 document.body.classList.add('x35-on');
 // Remove known duplicate legacy shells; keep LifeOS's original feature modules intact.
 ['#x11ApexCard','.lux-hud','.focus-strip','.orbit-row','#x17Core','#x18Shell','#x20Shell','.x18-overlay','.x17-spot'].forEach(sel=>document.querySelectorAll(sel).forEach(e=>e.remove()));
 // Add compact chart status without adding another dashboard card.
 document.querySelectorAll('.panel:has(canvas) .panel-head span').forEach(s=>{if(!s.dataset.x35){s.dataset.x35='1';s.textContent=s.textContent||'LIVE'}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
addEventListener('load',boot,{once:true});
})();
