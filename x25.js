
/* X25 — micro-interactions / AURA polish */
(()=> {
  const ready=()=> {
    document.documentElement.classList.add('x25-ready');

    // Lightweight pointer aura on desktop.
    const glow=document.createElement('div');
    glow.className='x25-cursor-glow';
    document.body.appendChild(glow);
    let raf=0, mx=-999, my=-999;
    const move=e=>{
      mx=e.clientX; my=e.clientY;
      if(!raf) raf=requestAnimationFrame(()=>{
        glow.style.left=mx+'px'; glow.style.top=my+'px'; glow.style.opacity='1'; raf=0;
      });
    };
    window.addEventListener('pointermove',move,{passive:true});
    window.addEventListener('pointerleave',()=>glow.style.opacity='0',{passive:true});

    // Tiny tilt on larger dashboard surfaces; disabled on touch.
    if(!matchMedia('(pointer:coarse)').matches){
      const targets=[...document.querySelectorAll('.hero,.x11-apex-card,.panel,.goal,.stat,.orbit-card')];
      targets.forEach(el=>{
        el.addEventListener('pointermove',e=>{
          const r=el.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
          el.style.transform=`perspective(1100px) rotateX(${(-y*1.8).toFixed(2)}deg) rotateY(${(x*1.8).toFixed(2)}deg) translateY(-3px)`;
        },{passive:true});
        el.addEventListener('pointerleave',()=>{el.style.transform='';},{passive:true});
      });
    }

    // Add a subtle LIVE indicator to the header without touching application logic.
    const title=document.querySelector('header .eyebrow');
    if(title && !document.querySelector('.x25-live')){
      const live=document.createElement('span');
      live.className='x25-live';
      live.innerHTML='<i></i> AURA ONLINE';
      title.style.display='flex'; title.style.alignItems='center'; title.style.gap='12px';
      title.appendChild(live);
    }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ready,{once:true});
  else ready();
})();
