
(function(){
  const DAY=()=> (typeof dateKey==="function"?dateKey(new Date()):new Date().toISOString().slice(0,10));
  function plan(){
    db.dailyPlan=db.dailyPlan||{};
    db.dailyPlan[DAY()] ||= {priorities:["","",""],done:[false,false,false],energy:60};
    return db.dailyPlan[DAY()];
  }
  function persist(){localStorage.setItem(KEY,JSON.stringify(db));}
  function faLocal(n){try{return new Intl.NumberFormat("fa-IR").format(n)}catch(e){return String(n)}}
  function advice(p){
    const done=p.done.filter(Boolean).length, e=p.energy||60;
    if(done===3) return "هر سه اولویت انجام شد؛ امروزت واقعاً جلو افتاد. 🔥";
    if(e>=80) return "انرژی بالاست؛ سخت‌ترین کار را همین حالا بزن. 🚀";
    if(e<=40) return "امروز سبک ولی پیوسته؛ فقط یک کار مهم را تمام کن. 🌱";
    if(done===2) return "فقط یک ضربه آخر مانده؛ اولویت سوم را جمع کن. 🎯";
    return "یک کار مهم را انتخاب کن و تا پایانش ادامه بده. ⚡";
  }
  function render(){
    const p=plan(), inputs=document.querySelectorAll("[data-priority]");
    inputs.forEach((el,i)=>{el.value=p.priorities[i]||""; const row=el.closest(".priority-row"); if(row) row.classList.toggle("done",!!p.done[i]);});
    document.querySelectorAll(".priority-check").forEach((b,i)=>{b.textContent=p.done[i]?"✓":"○";});
    document.querySelectorAll("#primeEnergy button").forEach(b=>b.classList.toggle("active",+b.dataset.energy===+p.energy));
    const adv=document.getElementById("primeAdvice"); if(adv) adv.textContent=advice(p);
    const d=document.getElementById("primeDate"); if(d){try{d.textContent=typeof faDate==="function"?faDate(DAY()):DAY()}catch(e){d.textContent="امروز"}}
  }
  function bind(){
    document.querySelectorAll("[data-priority]").forEach(el=>el.addEventListener("input",()=>{
      const i=+el.dataset.priority; plan().priorities[i]=el.value; persist();
    }));
    document.querySelectorAll(".priority-check").forEach(b=>b.addEventListener("click",()=>{
      const p=plan(),i=+b.dataset.p;p.done[i]=!p.done[i];persist();render();
    }));
    document.querySelectorAll("#primeEnergy button").forEach(b=>b.addEventListener("click",()=>{
      plan().energy=+b.dataset.energy;persist();render();
    }));
    document.addEventListener("keydown",e=>{
      if((e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==="m") && !/input|textarea/i.test(e.target.tagName)){
        e.preventDefault();document.getElementById("primeCockpit")?.scrollIntoView({behavior:"smooth",block:"center"});
      }
    });
  }
  window.lifeosPrimeDay={render,plan};
  setTimeout(()=>{try{bind();render()}catch(e){}},120);
  setTimeout(render,800);
})();
