(()=>{'use strict';
// local-date helper (fixes UTC off-by-one for Iran timezone)
window.__iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
// Timer governor: 14 competing intervals -> throttled, paused in background tabs
const _si=window.setInterval.bind(window);
const keep=f=>{try{return f.name==='updateSystemClock'||/remaining/.test(String(f))}catch(e){return false}};
window.setInterval=function(f,d,...a){
 if(typeof f!=='function'||keep(f))return _si(f,d,...a);
 return _si(function(){if(!document.hidden)f.apply(this,arguments)},Math.max(d||0,6000),...a);
};
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('x15-hidden',document.hidden));
// Coalesce the 10-layer renderAll chain
addEventListener('load',()=>{
 const r=window.renderAll;
 if(typeof r==='function'&&!r.__x15){let t=0,last=0;
  const w=function(){const now=performance.now();if(now-last>250){last=now;return r.apply(this,arguments)}clearTimeout(t);t=setTimeout(()=>{last=performance.now();r()},250)};
  w.__x15=1;window.renderAll=w;}
 if(window.Chart){Chart.defaults.animation={duration:350};Chart.defaults.font.family='Vazirmatn,sans-serif'}
});
})();
