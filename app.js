const KEY="lifeos_v1";
const fa=n=>new Intl.NumberFormat("fa-IR").format(Math.round(n||0));
const todayISO=()=>__iso(new Date());
const uid=()=>Date.now()+Math.floor(Math.random()*1000);
let db=JSON.parse(localStorage.getItem(KEY)||'null')||{
  profile:null,budget:30000000,budgets:{},incomes:[],expenses:[],waste:[],study:[],
  goals:[{id:1,name:"مطالعه روزانه",target:30,current:12,unit:"روز",deadline:"2026-12-31"}],
  customTypes:[],customEntries:[],savings:[],savingsGoal:null,
  studyTarget:3,productiveTarget:8
};
// Migration for older versions
if(!db.profile) db.profile=null;
if(!db.budgets) db.budgets={};
if(!Array.isArray(db.savings)) db.savings=[];
if(db.savingsGoal===undefined) db.savingsGoal=null;
if(db.budget!=null && !db.budgets[monthKey()]) db.budgets[monthKey()]=+db.budget||30000000;
function save(){localStorage.setItem(KEY,JSON.stringify(db));renderAll()}
function dateKey(d=new Date()){return __iso(new Date(d))}
function monthKey(d=new Date()){return dateKey(d).slice(0,7)}
function currentBudget(){return +(db.budgets?.[monthKey()] ?? db.budget ?? 0)}
function g2j(gy,gm,gd){let g_d_m=[0,31,59,90,120,151,181,212,243,273,304,334],jy=(gy<=1600)?0:979;gy-=(gy<=1600)?621:1600;let gy2=(gm>2)?gy+1:gy;let days=365*gy+Math.floor((gy2+3)/4)-Math.floor((gy2+99)/100)+Math.floor((gy2+399)/400)-80+gd+g_d_m[gm-1];let jy2=jy+33*Math.floor(days/12053);days%=12053;jy2+=4*Math.floor(days/1461);days%=1461;if(days>365){jy2+=Math.floor((days-1)/365);days=(days-1)%365}let jm=(days<186)?1+Math.floor(days/31):7+Math.floor((days-186)/30);let jd=1+((days<186)?days%31:(days-186)%30);return[jy2,jm,jd]}
function j2g(jy,jm,jd){let gy=(jy<=979)?621:1600;jy-=(jy<=979)?0:979;let days=365*jy+Math.floor(jy/33)*8+Math.floor(((jy%33)+3)/4)+78+jd+((jm<7)?(jm-1)*31:(jm-7)*30+186);gy+=400*Math.floor(days/146097);days%=146097;if(days>36524){gy+=100*Math.floor(--days/36524);days%=36524;if(days>=365)days++}gy+=4*Math.floor(days/1461);days%=1461;if(days>365){gy+=Math.floor((days-1)/365);days=(days-1)%365}let gd=days+1,sal_a=[0,31,((gy%4===0&&gy%100!==0)||gy%400===0)?29:28,31,30,31,30,31,31,30,31,30,31],gm=0;while(gd>sal_a[gm]){gd-=sal_a[gm];gm++}return[gy,gm,gd]}
function jalaliToISO(jy,jm,jd){let g=j2g(jy,jm,jd);return`${g[0]}-${String(g[1]).padStart(2,"0")}-${String(g[2]).padStart(2,"0")}`}
function isoToJalali(iso){let d=new Date(iso+"T12:00:00");return g2j(d.getFullYear(),d.getMonth()+1,d.getDate())}
function jalaliMonthName(jm){return["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"][jm-1]}
function jalaliDaysInMonth(jy,jm){return jm<=6?31:jm<=11?30:(isLeapJalali(jy)?30:29)}
function isLeapJalali(jy){let a=j2g(jy,12,30);return a[1]===12&&a[2]===30}
function jalaliMonthTitle(jy,jm){return`${jalaliMonthName(jm)} ${fa(jy)}`}
function faDate(iso){if(!iso)return"—";return new Intl.DateTimeFormat("fa-IR-u-ca-persian",{year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(iso+"T12:00:00"))}
function sum(a,f){return a.reduce((s,x)=>s+(f?f(x):x),0)}
function money(n){return fa(n)+" تومان"}
function monthExpenses(m=monthKey()){return sum(db.expenses.filter(x=>x.date?.startsWith(m)),x=>+x.amount)}
function monthIncome(m=monthKey()){return sum(db.incomes.filter(x=>x.date?.startsWith(m)),x=>+x.amount)}
function daysAgo(n){let d=new Date();d.setDate(d.getDate()-n);return dateKey(d)}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function avatarLevel(){let st=sum(db.study,x=>+x.hours),goals=goalsProgress()*100,streak=calcStreak();let xp=st*2+goals+streak*5;return Math.min(5,Math.max(1,1+Math.floor(xp/80)))}
function avatarEmoji(){return["🌱","🌿","🧑‍💻","🦸","👑"][avatarLevel()-1]}
function profileName(){return db.profile?.name||"رفیق"}
function updateSystemClock(){
 const now=new Date();
 const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||"زمان سیستم";
 const time=new Intl.DateTimeFormat("fa-IR",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(now);
 const el=document.getElementById("systemClock"); if(el) el.textContent=`${time} · ${tz}`;
 const today=document.getElementById("today"); if(today) today.textContent=new Intl.DateTimeFormat("fa-IR",{dateStyle:"full"}).format(now);
}
function setup(){
 updateSystemClock(); setInterval(updateSystemClock,1000);
 document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>go(b.dataset.page));
 document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
 document.querySelectorAll("[data-modal]").forEach(b=>b.onclick=()=>openModal(b.dataset.modal));
 document.getElementById("quickAdd").onclick=()=>openModal("quick");
 document.getElementById("profileButton").onclick=()=>openModal("profile",null,null,!db.profile);
 document.getElementById("closeModal").onclick=closeModal;
 document.getElementById("modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
 document.getElementById("exportBtn").onclick=exportData;document.getElementById("importFile").onchange=importData;
 document.getElementById("resetBtn").onclick=()=>{if(confirm("همه اطلاعات پاک شود؟")){localStorage.removeItem(KEY);location.reload()}};
 document.getElementById("prevMonth").onclick=()=>changeMonth(-1);document.getElementById("nextMonth").onclick=()=>changeMonth(1);
 renderAll();
 if(!db.profile)setTimeout(()=>openModal("profile",null,null,true),250);
}
function go(page){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));document.getElementById(page).classList.add("active");document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.page===page));document.getElementById("pageTitle").textContent=document.querySelector(`.nav[data-page="${page}"] span`)?.textContent||"داشبورد";if(page==="calendar")renderCalendar()}
function renderAll(){renderProfile();renderDashboard();renderMoney();renderSavings();renderTime();renderStudy();renderGoals();renderCustomPage();renderCalendar()}
function renderProfile(){let p=db.profile||{};set("profileName",p.name||"ثبت اطلاعات");set("profileMeta",p.age?`${fa(p.age)} ساله`:`سطح ${fa(avatarLevel())}`);set("avatarEmoji",avatarEmoji());set("sideAvatar",avatarEmoji());set("greeting",`سلام ${p.name?esc(p.name):"رفیق"} 👋`);set("levelText",`سطح ${fa(avatarLevel())} · ${["شروع مسیر","در حال رشد","باانگیزه","قدرتمند","استاد زندگی"][avatarLevel()-1]}`)}
function renderDashboard(){const exp=monthExpenses(),inc=monthIncome(),bal=sum(db.incomes,x=>+x.amount)-sum(db.expenses,x=>+x.amount),st=sum(db.study.filter(x=>x.date===todayISO()),x=>+x.hours),wt=sum(db.waste.filter(x=>x.date===todayISO()),x=>+x.hours),bud=currentBudget();set("balance",money(bal));set("monthExpense",money(exp));set("todayStudy",fa(st));set("todayWaste",fa(wt));set("expenseSub",bud?`${fa(exp/bud*100)}٪ از بودجه`:"بودجه تعیین نشده");let score=Math.min(100,Math.round(st/Math.max(db.studyTarget||3,1)*45+Math.max(0,1-wt/8)*35+goalsProgress()*20));set("score",score);renderMonthlyReport();renderMoneyChart();renderCategoryChart();renderProductivity();renderGoalMini()}
function goalsProgress(){return db.goals.length?sum(db.goals,x=>Math.min(1,(+x.current||0)/(+x.target||1)))/db.goals.length:0}
function renderMonthlyReport(){const m=monthKey(),e=monthExpenses(m),i=monthIncome(m),study=sum(db.study.filter(x=>x.date?.startsWith(m)),x=>+x.hours),waste=sum(db.waste.filter(x=>x.date?.startsWith(m)),x=>+x.hours),bud=+(db.budgets?.[m]||0),net=i-e,saveRate=i?Math.max(0,net/i*100):0,top=[...db.expenses.filter(x=>x.date?.startsWith(m))].sort((a,b)=>b.amount-a.amount)[0];let notes=[];if(!i&&!e&&!study&&!waste)notes.push("هنوز داده کافی برای قضاوت این ماه ثبت نشده؛ از ثبت‌های کوچک روزانه شروع کن.");else{if(bud){let pct=e/bud*100;notes.push(pct>100?`هزینه‌ها از بودجه این ماه حدود ${fa(pct-100)}٪ عبور کرده‌اند.`:`حدود ${fa(Math.max(0,100-pct))}٪ از بودجه ماهانه‌ات هنوز باقی مانده.`)}if(study)notes.push(`${fa(study)} ساعت مطالعه ثبت کرده‌ای.`);if(waste)notes.push(`${fa(waste)} ساعت زمان پرت ثبت شده؛ اگر ${fa(waste/Math.max(1,study)*100)}٪ کمتر شود، زمان مفیدت بیشتر می‌شود.`);if(net>=0&&i)notes.push(`خالص این ماه ${money(net)} است و نرخ پس‌انداز ثبت‌شده حدود ${fa(saveRate)}٪ است.`);if(top)notes.push(`بیشترین هزینه ثبت‌شده: ${esc(top.title)} با ${money(top.amount)}.`)}document.getElementById("monthlyReport").innerHTML=`<div class="report-main"><span class="report-kicker">گزارش هوشمند ${faDate(todayISO()).slice(0,7)}</span><h3>${study>=((db.studyTarget||3)*20)?"این ماه داری جدی جلو می‌ری 🔥":"هنوز جا برای بهتر شدن هست؛ مهم استمرارته 💪"}</h3><p>${notes.join(" ")}</p></div><div class="report-stats"><div><b>${money(e)}</b><span>هزینه</span></div><div><b>${fa(study)}س</b><span>مطالعه</span></div><div><b>${fa(waste)}س</b><span>زمان پرت</span></div><div><b>${fa(Math.round(goalsProgress()*100))}٪</b><span>اهداف</span></div></div>`}
function renderMoney(){
 const e=monthExpenses(),i=monthIncome(),all=sum(db.expenses,x=>+x.amount),bud=currentBudget();
 set("budgetValue",money(bud));set("budgetRemain",money(bud-e)+" باقی‌مانده");set("incomeValue",money(i));set("expenseValue",money(all));
 set("savingRate",fa(i?Math.max(0,(i-e)/i*100):0)+"٪");
 const pct=bud?Math.min(100,e/bud*100):0;set("budgetPercent",fa(pct)+"%");
 const ring=document.querySelector(".budget-ring");if(ring)ring.style.setProperty("--deg",(pct*3.6)+"deg");
 const t=[...db.expenses.map(x=>({...x,type:"expense"})),...db.incomes.map(x=>({...x,type:"income"}))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8);
 document.getElementById("transactions").innerHTML=t.length?t.map(x=>`<div class="transaction"><div><b>${esc(x.title)}</b><div class="muted">${faDate(x.date)} · ${esc(x.category||"عمومی")}${x.note?" · "+esc(x.note):""}</div></div><div class="manage-actions"><strong class="${x.type==="expense"?"negative":"positive"}">${x.type==="expense"?"−":"+"}${money(x.amount)}</strong><button class="icon-btn" onclick="editEntry('${x.type}',${x.id})">ویرایش</button><button class="icon-btn delete" onclick="deleteEntry('${x.type}',${x.id})">حذف</button></div></div>`).join(""): `<div class="empty">هنوز تراکنشی ثبت نشده.</div>`;
}
function renderSavings(){
 const deposits=sum(db.savings.filter(x=>x.type==="deposit"),x=>+x.amount);
 const withdrawals=sum(db.savings.filter(x=>x.type==="withdrawal"),x=>+x.amount);
 const balance=deposits-withdrawals;
 set("savingDeposited",money(deposits));set("savingSpent",money(withdrawals));set("savingBalance",money(balance));
 const goal=db.savingsGoal;
 const goalTarget=Number(goal?.target)||0;
 const goalPct=goalTarget?Math.min(100,Math.max(0,balance/goalTarget*100)):0;
 set("savingGoalName",goal?.name||"هدف پس‌انداز تنظیم نشده");
 set("savingGoalTarget",goalTarget?money(goalTarget):"—");
 set("savingGoalCurrent",money(Math.max(0,balance)));
 set("savingGoalRemaining",goalTarget?money(Math.max(0,goalTarget-balance)):"—");
 set("savingGoalPercent",fa(goalPct)+"٪");
 set("savingGoalDeadline",goal?.deadline?`ددلاین: ${faDate(goal.deadline)}`:"بدون ددلاین");
 const goalBar=document.getElementById("savingGoalBar");if(goalBar)goalBar.style.width=goalPct+"%";
 const goalStatus=document.getElementById("savingGoalStatus");if(goalStatus)goalStatus.textContent=goalTarget?(balance>=goalTarget?"هدف پس‌انداز تکمیل شد 🎉":"در مسیر رسیدن به هدف"):"یک هدف تعیین کن تا پیشرفتت را ببینی";
 const rows=[...db.savings].sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,12);
 const el=document.getElementById("savingsList");
 if(!el)return;
 el.innerHTML=rows.length?rows.map(x=>`<div class="transaction"><div><b>${x.type==="deposit"?"＋ واریز به پس‌انداز":"− برداشت از پس‌انداز"}</b><div class="muted">${faDate(x.date)}${x.note?" · "+esc(x.note):""}</div></div><div class="manage-actions"><strong class="${x.type==="deposit"?"positive":"negative"}">${x.type==="deposit"?"+":"−"}${money(x.amount)}</strong><button class="icon-btn" onclick="editEntry('saving',${x.id})">ویرایش</button><button class="icon-btn delete" onclick="deleteEntry('saving',${x.id})">حذف</button></div></div>`).join(""):`<div class="empty">هنوز برای پس‌انداز چیزی ثبت نکرده‌ای.</div>`;
}
function renderTime(){const today=sum(db.waste.filter(x=>x.date===todayISO()),x=>+x.hours),week=sum(db.waste.filter(x=>x.date>=daysAgo(6)),x=>+x.hours);set("wasteToday",fa(today));set("wasteWeek",fa(week));set("productiveTarget",db.productiveTarget||8);const map={};db.waste.forEach(x=>map[x.reason||"سایر"]=(map[x.reason||"سایر"]||0)+(+x.hours));document.getElementById("wasteReasons").innerHTML=Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="reason"><span>${esc(k)}</span><b>${fa(v)} ساعت</b></div>`).join("")||'<div class="empty">داده‌ای نیست.</div>';document.getElementById("wasteList").innerHTML=[...db.waste].sort((a,b)=>b.date.localeCompare(a.date)).map(x=>`<div class="manage-row"><div><b>${esc(x.reason||"سایر")}</b><div class="detail-box">${faDate(x.date)}${x.note?" · "+esc(x.note):""}</div></div><b>${fa(x.hours)} ساعت</b><span></span><div class="manage-actions"><button class="icon-btn" onclick="editEntry('waste',${x.id})">ویرایش</button><button class="icon-btn delete" onclick="deleteEntry('waste',${x.id})">حذف</button></div></div>`).join("")||'<div class="empty">هنوز زمانی ثبت نشده.</div>';renderWasteChart()}
function renderStudy(){const t=sum(db.study.filter(x=>x.date===todayISO()),x=>+x.hours),w=sum(db.study.filter(x=>x.date>=daysAgo(6)),x=>+x.hours);set("studyToday",fa(t));set("studyWeek",fa(w));set("studyTarget",db.studyTarget||3);set("streak",calcStreak());document.getElementById("studyList").innerHTML=[...db.study].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8).map(x=>`<div class="study-item"><div><b>${esc(x.subject)}</b><div class="muted">${faDate(x.date)}${x.note?" · "+esc(x.note):""}</div></div><strong>${fa(x.hours)} ساعت</strong></div>`).join("")||'<div class="empty">جلسه‌ای ثبت نشده.</div>';document.getElementById("studyManage").innerHTML=[...db.study].sort((a,b)=>b.date.localeCompare(a.date)).map(x=>`<div class="manage-row"><div><b>${esc(x.subject)}</b><div class="detail-box">${faDate(x.date)}${x.note?" · "+esc(x.note):""}</div></div><b>${fa(x.hours)} ساعت</b><span></span><div class="manage-actions"><button class="icon-btn" onclick="editEntry('study',${x.id})">ویرایش</button><button class="icon-btn delete" onclick="deleteEntry('study',${x.id})">حذف</button></div></div>`).join("")||'<div class="empty">هنوز جلسه‌ای ثبت نشده.</div>';renderStudyChart()}
function calcStreak(){let s=0,d=new Date();while(db.study.some(x=>x.date===dateKey(d))){s++;d.setDate(d.getDate()-1)}return s}
function renderGoals(){document.getElementById("goalsList").innerHTML=db.goals.map(g=>{let p=Math.min(100,(+g.current||0)/(+g.target||1)*100);return`<div class="goal"><div class="goal-top"><h3>${esc(g.name)}</h3><div class="manage-actions"><button class="icon-btn" onclick="editEntry('goal',${g.id})">ویرایش</button><button class="icon-btn delete" onclick="deleteGoal(${g.id})">حذف</button></div></div><div class="muted">ددلاین: ${g.deadline||"—"}</div><div class="progress"><i style="width:${p}%"></i></div><div class="goal-meta"><span>${fa(g.current)} / ${fa(g.target)} ${esc(g.unit||"")}</span><b>${fa(p)}٪</b></div><button class="secondary" style="margin-top:15px;width:100%" onclick="advanceGoal(${g.id})">＋ ثبت پیشرفت</button></div>`}).join("")||'<div class="panel muted">هنوز هدفی ثبت نکردی.</div>'}
function renderGoalMini(){document.getElementById("goalMini").innerHTML=db.goals.slice(0,4).map(g=>{let p=Math.min(100,(+g.current||0)/(+g.target||1)*100);return`<div style="margin:12px 0"><div class="goal-meta"><span>${esc(g.name)}</span><b>${fa(p)}٪</b></div><div class="progress"><i style="width:${p}%"></i></div></div>`}).join("")||'<div class="muted">هدف جدید بساز.</div>'}
function labels7(){return Array.from({length:7},(_,i)=>daysAgo(6-i))}
let charts={};
function chart(id,type,data,options={}){if(typeof Chart==="undefined")return;if(charts[id])charts[id].destroy();charts[id]=new Chart(document.getElementById(id),{type,data,options:{responsive:true,plugins:{legend:{labels:{color:"#8995a8",font:{family:"Vazirmatn"}}}},scales:type==="doughnut"?{}:{x:{ticks:{color:"#748198"},grid:{color:"#182230"}},y:{ticks:{color:"#748198"},grid:{color:"#182230"}}},...options}})}
function renderMoneyChart(){let labs=labels7();chart("moneyChart","line",{labels:labs,datasets:[{label:"هزینه",data:labs.map(d=>sum(db.expenses.filter(x=>x.date===d),x=>+x.amount)),tension:.35},{label:"درآمد",data:labs.map(d=>sum(db.incomes.filter(x=>x.date===d),x=>+x.amount)),tension:.35}]})}
function renderCategoryChart(){
 const m={}; db.expenses.filter(x=>x.date?.startsWith(monthKey())).forEach(x=>m[x.category||"سایر"]=(m[x.category||"سایر"]||0)+(+x.amount));
 const labels=["درآمد",...Object.keys(m)];
 const income=monthIncome(), expenseVals=Object.keys(m).map(k=>m[k]);
 chart("categoryChart","bar",{labels,datasets:[{label:"مبلغ",data:[income,...expenseVals]}]},{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{color:"#748198"},grid:{color:"#182230"}},x:{ticks:{color:"#748198"},grid:{display:false}}}})
}
function renderProductivity(){let labs=labels7();chart("productivityChart","bar",{labels:labs,datasets:[{label:"مطالعه",data:labs.map(d=>sum(db.study.filter(x=>x.date===d),x=>+x.hours))},{label:"زمان پرت",data:labs.map(d=>sum(db.waste.filter(x=>x.date===d),x=>+x.hours))}]})}
function renderWasteChart(){let labs=labels7();chart("wasteChart","line",{labels:labs,datasets:[{label:"ساعت پرت",data:labs.map(d=>sum(db.waste.filter(x=>x.date===d),x=>+x.hours)),tension:.35}]})}
function renderStudyChart(){let labs=labels7();chart("studyChart","bar",{labels:labs,datasets:[{label:"ساعت مطالعه",data:labs.map(d=>sum(db.study.filter(x=>x.date===d),x=>+x.hours))}]})}
function renderCustomPage(){
 const types=db.customTypes||[], entries=db.customEntries||[];
 document.getElementById("customTypes")&&(document.getElementById("customTypes").innerHTML=types.length?types.map(t=>`<div class="custom-type"><div class="custom-icon">${esc(t.icon||"✦")}</div><div class="custom-type-main"><h3>${esc(t.name)}</h3><span>واحد: ${esc(t.unit||"عدد")}</span></div><div class="manage-actions"><button class="primary small" onclick="openModal('customEntry',null,null,false,${Number(t.id)})">＋ ثبت</button><button class="icon-btn delete" onclick="deleteCustomType(${t.id})">حذف نوع</button></div></div>`).join(""):'<div class="empty">هنوز نوع ثبت سفارشی نساخته‌ای. هر چیزی مثل ورزش، خواب، آب، کتاب، کار یا عادت می‌توانی اضافه کنی.</div>');
 document.getElementById("customEntries")&&(document.getElementById("customEntries").innerHTML=entries.length?entries.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,100).map(e=>{let t=types.find(x=>Number(x.id)===Number(e.typeId));return`<div class="custom-entry"><div><b>${esc(t?.icon||"✦")} ${esc(e.title)}</b><div class="muted">${esc(t?.name||"ثبت سفارشی")} · ${faDate(e.date)} · ${fa(e.value)} ${esc(t?.unit||"")}</div>${e.details?`<div class="detail-box">${esc(e.details)}</div>`:""}</div><div class="manage-actions"><button class="icon-btn" onclick="editCustomEntry(${e.id})">ویرایش</button><button class="icon-btn delete" onclick="deleteCustomEntry(${e.id})">حذف</button></div></div>`}).join(""):'<div class="empty">هنوز ثبت سفارشی وجود ندارد.</div>');
}
function deleteCustomType(id){if(!confirm("این نوع ثبت و تمام ثبت‌هایش حذف شود؟"))return;db.customTypes=db.customTypes.filter(x=>x.id!==id);db.customEntries=db.customEntries.filter(x=>x.typeId!==id);save();toast("نوع ثبت حذف شد");}
function editCustomEntry(id){let e=db.customEntries.find(x=>x.id===id);if(e)openModal("customEntry","customEntries",id,false,e.typeId)}
function deleteCustomEntry(id){if(!confirm("این ثبت حذف شود؟"))return;db.customEntries=db.customEntries.filter(x=>x.id!==id);save();toast("ثبت حذف شد")}
function openCustomTypeModal(){openModal("customType")}
function field(n,l,t="text",ph="",required=true){return`<div class="field"><label>${l}${required?' *':''}</label><input name="${n}" type="${t}" inputmode="${t==='number'?'decimal':'text'}" placeholder="${ph}" ${required?'required':''}></div>`}
function openModal(type,editType=null,editId=null,firstRun=false,customTypeId=null){
 const modal=document.getElementById("modal"),form=document.getElementById("modalForm");
 let title="",body="",editing=null;
 if(editType){editing=(db[editType]||[]).find(x=>x.id===editId);if(editType!=="customEntries")type=editType;if(type==="customEntry"&&!customTypeId)customTypeId=editing?.typeId}
 if(type==="profile"){title=firstRun?"قبل از شروع، خودت را معرفی کن 👋":"پروفایل من";body=`<div class="profile-welcome">اطلاعاتت فقط داخل همین مرورگر ذخیره می‌شود.</div>`+field("name","اسم","text","مثلاً علی",true)+field("phone","شماره تلفن","tel","اختیاری",false)+field("age","سن","number","مثلاً 20",true)+`<div class="field"><label>آواتار اولیه</label><select name="avatar"><option value="🌱">🌱 جوانه</option><option value="🧑‍💻">🧑‍💻 سازنده</option><option value="🦸">🦸 قهرمان</option><option value="👑">👑 پادشاه</option></select></div>`}
 if(type==="expense"){title=editing?"ویرایش هزینه":"ثبت هزینه";body=field("title","عنوان","text","مثلاً غذا",true)+field("amount","مبلغ","number","مثلاً 200000",true)+`<div class="field"><label>دسته‌بندی</label><select name="category"><option>غذا</option><option>حمل‌ونقل</option><option>خرید</option><option>تفریح</option><option>قبض</option><option>آموزش</option><option>سایر</option></select></div>`+field("note","جزئیات / توضیحات","text","اختیاری",false)+field("date","تاریخ","date","",true)}
 if(type==="income"){title=editing?"ویرایش درآمد":"ثبت درآمد";body=field("title","عنوان","text","مثلاً حقوق",true)+field("amount","مبلغ","number","مثلاً 30000000",true)+field("note","جزئیات / توضیحات","text","اختیاری",false)+field("date","تاریخ","date","",true)}
 if(type==="budget"){title=`بودجه ${jalaliMonthName(isoToJalali(todayISO())[1])}؛ قابل تنظیم`;body=field("amount","بودجه این ماه","number","مثلاً 30000000",true)+`<div class="budget-tip">بودجه هر ماه جداگانه ذخیره می‌شود؛ ماه بعد می‌توانی عدد دیگری تعیین کنی.</div>`}
 if(type==="waste"){title=editing?"ویرایش زمان پرت":"ثبت زمان پرت";body=field("hours","مدت (ساعت)","number","مثلاً 1.5",true)+field("reason","دلیل / عنوان","text","مثلاً شبکه‌های اجتماعی",true)+field("note","جزئیات","text","اختیاری",false)+field("date","تاریخ","date","",true)}
 if(type==="study"){title=editing?"ویرایش جلسه مطالعه":"ثبت مطالعه";body=field("subject","درس / موضوع","text","مثلاً ریاضی",true)+field("hours","مدت (ساعت)","number","مثلاً 2",true)+field("note","جزئیات / مباحث خوانده‌شده","text","اختیاری",false)+field("date","تاریخ","date","",true)}
 if(type==="goal"){title=editing?"ویرایش هدف":"هدف جدید";body=field("name","نام هدف","text","مثلاً مطالعه روزانه",true)+field("target","مقدار هدف","number","مثلاً 30",true)+field("unit","واحد","text","مثلاً ساعت / صفحه / روز",true)+field("deadline","ددلاین","date","",true)}
 if(type==="customType"){title="ساخت نوع ثبت جدید";body=`<div class="profile-welcome">هر مورد دلخواهت را اضافه کن؛ مثلاً ورزش، خواب، آب، کتاب، کار، عادت، درآمد جانبی یا هر چیز دیگر.</div>`+field("name","نام نوع ثبت","text","مثلاً ورزش",true)+field("icon","ایموجی","text","🏃 (اختیاری)",false)+field("unit","واحد","text","مثلاً ساعت / صفحه / عدد",false)}
 if(type==="customEntry"){let ct=(db.customTypes||[]).find(x=>Number(x.id)===Number(customTypeId))||((db.customEntries||[]).find(x=>x.id===editId)?(db.customTypes||[]).find(x=>Number(x.id)===Number(((db.customEntries||[]).find(x=>x.id===editId)||{}).typeId)):null);title=editing?`ویرایش ${esc(ct?.name||"ثبت")}`:`ثبت ${esc(ct?.name||"جدید")}`;body=field("title","عنوان","text","مثلاً تمرین امروز",true)+field("value",ct?.unit||"مقدار","number","مثلاً 1",true)+field("details","جزئیات / توضیحات","text","اختیاری",false)+field("date","تاریخ","date","",true)}
 if(type==="saving"){title=editing?"ویرایش پس‌انداز":"ثبت پس‌انداز";body=`<div class="field"><label>نوع عملیات</label><select name="savingType"><option value="deposit">واریز به پس‌انداز</option><option value="withdrawal">مصرف از پس‌انداز</option></select></div>`+field("amount","مبلغ","number","مثلاً 1000000",true)+field("note","توضیحات","text","اختیاری",false)+field("date","تاریخ","date","",true)}
 if(type==="savingGoal"){title="هدف پس‌انداز";const g=db.savingsGoal||{};body=field("name","نام هدف","text","مثلاً خرید لپ‌تاپ",true)+field("target","مبلغ هدف","number","مثلاً 50000000",true)+field("deadline","ددلاین","date","",false)}
 if(type==="quick"){title="ثبت سریع";body=`<div class="field"><label>نوع ثبت</label><select name="kind"><option value="expense">هزینه</option><option value="study">مطالعه</option><option value="waste">زمان پرت</option><option value="saving">پس‌انداز</option>${(db.customTypes||[]).map(t=>`<option value="custom:${t.id}">${esc(t.icon||"✦")} ${esc(t.name)}</option>`).join("")}</select></div>`+field("value","مقدار","number","مثلاً 500000",true)+field("title","عنوان / دلیل","text","اختیاری",false)+field("note","جزئیات","text","اختیاری",false)+`<button type="button" class="secondary form-submit" onclick="closeModal();openCustomTypeModal()">＋ ساخت نوع ثبت جدید</button>`}
 form.innerHTML=body+`<button type="submit" class="primary form-submit">ذخیره</button>`;form.setAttribute("novalidate","novalidate");document.getElementById("modalTitle").textContent=title;modal.dataset.required=(firstRun?"1":"0");modal.classList.add("open");
 if(editing){Object.entries(editing).forEach(([k,v])=>{let el=form.querySelector(`[name="${k}"]`);if(el)el.value=v});if(type==="expense"&&form.querySelector('[name="category"]'))form.querySelector('[name="category"]').value=editing.category||"سایر";if(type==="saving"&&form.querySelector('[name="savingType"]'))form.querySelector('[name="savingType"]').value=editing.type||"deposit"}
 else if(type==="budget")form.querySelector('[name="amount"]').value=currentBudget();
 else if(type==="savingGoal"&&db.savingsGoal){form.querySelector('[name="name"]').value=db.savingsGoal.name||"";form.querySelector('[name="target"]').value=db.savingsGoal.target||"";if(form.querySelector('[name="deadline"]'))form.querySelector('[name="deadline"]').value=db.savingsGoal.deadline||""}
 if(type==="profile"&&db.profile){form.querySelector('[name="name"]').value=db.profile.name||"";form.querySelector('[name="phone"]').value=db.profile.phone||"";form.querySelector('[name="age"]').value=db.profile.age||"";form.querySelector('[name="avatar"]').value=db.profile.avatar||"🌱"}
 if(form.querySelector('[name="date"]')&&!editing)form.querySelector('[name="date"]').value=todayISO();
 form.onsubmit=e=>{
  e.preventDefault();
  const o=Object.fromEntries(new FormData(form));
  const reqNames=[...form.querySelectorAll('[required]')].map(x=>x.name).filter(Boolean);
  const missing=reqNames.find(n=>String(o[n]??'').trim()==='');
  if(missing){const el=form.querySelector(`[name="${missing}"]`);if(el){el.focus();el.setCustomValidity('این فیلد الزامی است');el.reportValidity();setTimeout(()=>el.setCustomValidity(''),1200)}toast('لطفاً فیلدهای ستاره‌دار را کامل کن');return}
  form.querySelectorAll('[required]').forEach(el=>el.setCustomValidity(''));
  if(type==="profile"){if(!o.name.trim()||!o.age){toast("اسم و سن را وارد کن");return}db.profile={...(db.profile||{}),name:o.name.trim(),phone:(o.phone||"").trim(),age:+o.age,avatar:o.avatar||db.profile?.avatar||"🌱"};modal.dataset.required="0";closeModal();save();toast(firstRun?"پروفایل اولیه ثبت شد ✓":"پروفایل به‌روزرسانی شد ✓");return}
  if(type==="savingGoal"){const target=Number(o.target);const name=(o.name||"").trim();if(!name||!Number.isFinite(target)||target<=0){toast("نام و مبلغ هدف را کامل وارد کن");return}db.savingsGoal={name,target,deadline:o.deadline||""};closeModal();save();toast("هدف پس‌انداز ذخیره شد ✓");return}
  if(type==="budget"){let amount=Number(o.amount);if(!Number.isFinite(amount)||amount<0){toast("مبلغ بودجه نامعتبر است");return}db.budgets[monthKey()]=amount;db.budget=amount}
  else if(type==="customType"){const name=(o.name||"").trim(),icon=(o.icon||"").trim(),unit=(o.unit||"").trim()||"عدد";if(!name){toast("نام نوع ثبت را وارد کن");return}if(name.length>60){toast("نام نوع ثبت خیلی طولانی است");return}const id=uid();db.customTypes.push({id,name,icon:icon||"✦",unit});save();closeModal();go("custom");toast("نوع ثبت جدید ساخته شد ✓");return}
  else if(type==="customEntry"){const ct=Number(customTypeId);if(!ct||!db.customTypes.some(x=>Number(x.id)===ct)){toast("نوع ثبت پیدا نشد؛ دوباره از بخش ثبت‌های من انتخاب کن");return}const title=(o.title||"").trim(),value=Number(o.value);if(!title||!Number.isFinite(value)){toast("عنوان و مقدار را کامل وارد کن");return}if(editing){editing.title=title;editing.value=value;editing.details=(o.details||"").trim()||editing.details||"";editing.date=o.date||editing.date||todayISO();editing.typeId=ct}else db.customEntries.push({id:uid(),typeId:ct,title,value,details:(o.details||"").trim(),date:o.date||todayISO()});closeModal();save();go("custom");toast(editing?"ثبت سفارشی ویرایش شد ✓":"ثبت سفارشی ذخیره شد ✓");return}
  else if(type==="saving"){const amount=Number(o.amount);if(!Number.isFinite(amount)||amount<=0){toast("مبلغ پس‌انداز باید بیشتر از صفر باشد");return}if(editing){editing.type=o.savingType;editing.amount=amount;editing.note=(o.note||"").trim()||editing.note||"";editing.date=o.date||editing.date||todayISO()}else db.savings.push({id:uid(),type:o.savingType,amount,note:(o.note||"").trim(),date:o.date||todayISO()})}
  else if(editing){
   // در ویرایش، فیلدهای خالی اختیاری اطلاعات قبلی را پاک نمی‌کنند.
   const numericKeys=new Set(["amount","hours","target"]);
   Object.entries(o).forEach(([k,v])=>{if(v!=="" || form.querySelector(`[name="${k}"]`)?.required){editing[k]=numericKeys.has(k)?Number(v):v}});
   if(type==="goal" && editing.current==null)editing.current=0;
  }
  else if(type==="expense")db.expenses.push({id:uid(),title:o.title,amount:+o.amount,category:o.category,note:o.note||"",date:o.date});
  else if(type==="income")db.incomes.push({id:uid(),title:o.title,amount:+o.amount,note:o.note||"",date:o.date});
  else if(type==="waste")db.waste.push({id:uid(),hours:+o.hours,reason:o.reason,note:o.note||"",date:o.date});
  else if(type==="study")db.study.push({id:uid(),subject:o.subject,hours:+o.hours,note:o.note||"",date:o.date});
  else if(type==="goal")db.goals.push({id:uid(),name:o.name,target:+o.target,current:0,unit:o.unit,deadline:o.deadline});
  else if(type==="quick"){if(o.kind==="expense")db.expenses.push({id:uid(),title:(o.title||"ثبت سریع"),amount:+o.value,category:"سریع",note:o.note||"",date:todayISO()});if(o.kind==="study")db.study.push({id:uid(),subject:(o.title||"مطالعه سریع"),hours:+o.value,note:o.note||"",date:todayISO()});if(o.kind==="waste")db.waste.push({id:uid(),reason:(o.title||"سایر"),hours:+o.value,note:o.note||"",date:todayISO()});if(o.kind==="saving")db.savings.push({id:uid(),type:"deposit",amount:+o.value,note:o.note||o.title||"",date:todayISO()});if(String(o.kind).startsWith("custom:")){let ct=+o.kind.split(":")[1];db.customEntries.push({id:uid(),typeId:ct,title:o.title||"ثبت سریع",value:+o.value,details:o.note||"",date:todayISO()})}}
  closeModal();save();toast(editing?"ویرایش شد ✓":"ثبت شد ✓")
 }
}
function editEntry(type,id){if(["expense","income","study","waste","goal","saving"].includes(type))openModal(type,type,id)}
function deleteEntry(type,id){if(!confirm("این مورد حذف شود؟"))return;if(type==="expense")db.expenses=db.expenses.filter(x=>x.id!==id);if(type==="income")db.incomes=db.incomes.filter(x=>x.id!==id);if(type==="study")db.study=db.study.filter(x=>x.id!==id);if(type==="waste")db.waste=db.waste.filter(x=>x.id!==id);if(type==="goal")db.goals=db.goals.filter(x=>x.id!==id);if(type==="saving")db.savings=db.savings.filter(x=>x.id!==id);save();toast("حذف شد")}
function closeModal(){let m=document.getElementById("modal");if(m.dataset.required==="1"&&!db.profile){toast("اول اطلاعات پروفایل را ثبت کن");return}m.classList.remove("open");m.dataset.required="0"}
function advanceGoal(id){let g=db.goals.find(x=>x.id===id),v=prompt("مقدار پیشرفت را وارد کن:",1);if(v!==null){g.current=(+g.current||0)+(+v||0);save();toast("پیشرفت ثبت شد ✓")}}
function deleteGoal(id){if(confirm("این هدف حذف شود؟")){db.goals=db.goals.filter(x=>x.id!==id);save()}}
let calJ=isoToJalali(todayISO());
function changeMonth(n){let jy=calJ[0],jm=calJ[1]+n;while(jm<1){jm+=12;jy--}while(jm>12){jm-=12;jy++}calJ=[jy,jm,1];renderCalendar()}
function renderCalendar(){const jy=calJ[0],jm=calJ[1],days=jalaliDaysInMonth(jy,jm);document.getElementById("calTitle").textContent=jalaliMonthTitle(jy,jm);const first=new Date(jalaliToISO(jy,jm,1)+"T12:00:00"),firstWeek=(first.getDay()+1)%7,names=["شنبه","یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه"];let html=names.map(x=>`<div class="day day-name">${x}</div>`).join("");for(let i=0;i<firstWeek;i++)html+=`<div class="day"></div>`;for(let d=1;d<=days;d++){const iso=jalaliToISO(jy,jm,d),ev=[],ex=sum(db.expenses.filter(x=>x.date===iso),x=>+x.amount),st=sum(db.study.filter(x=>x.date===iso),x=>+x.hours),wa=sum(db.waste.filter(x=>x.date===iso),x=>+x.hours);if(ex)ev.push("هزینه "+money(ex));if(st)ev.push("مطالعه "+fa(st)+"س");if(wa)ev.push("پرت "+fa(wa)+"س");html+=`<div class="day"><b>${fa(d)}</b>${ev.map(x=>`<div class="event">${x}</div>`).join("")}</div>`}document.getElementById("calendarGrid").innerHTML=html}
function exportData(){let blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="lifeos-backup.json";a.click();toast("فایل پشتیبان ساخته شد")}
function importData(e){let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{db=JSON.parse(r.result);if(!db.budgets)db.budgets={};
if(!Array.isArray(db.customTypes))db.customTypes=[];
if(!Array.isArray(db.customEntries))db.customEntries=[];
if(!Array.isArray(db.savings))db.savings=[];if(db.savingsGoal===undefined)db.savingsGoal=null;save();toast("اطلاعات بازیابی شد ✓")}catch{toast("فایل نامعتبر است")}};r.readAsText(f)}
function updateUltraStats(){
  const all=(db.expenses||[]).length+(db.incomes||[]).length+(db.study||[]).length+(db.waste||[]).length+(db.savings||[]).length+(db.goals||[]).length+(db.customEntries||[]).length;
  const today=todayISO();
  const st=sum((db.study||[]).filter(x=>x.date===today),x=>+x.hours), wt=sum((db.waste||[]).filter(x=>x.date===today),x=>+x.hours);
  const inc=sum((db.incomes||[]).filter(x=>x.date===today),x=>+x.amount), exp=sum((db.expenses||[]).filter(x=>x.date===today),x=>+x.amount);
  const studyTarget=+(db.studyTarget||3), pulse=Math.max(0,Math.min(100,Math.round((st/studyTarget)*65+(wt?Math.max(0,25-wt*5):25)+Math.min(10,inc>exp?10:0))));
  set('lifeValue',fa(all));set('energyValue',fa(pulse)+'٪');set('pulseText',fa(pulse)+'٪');
  const pb=document.getElementById('pulseBar');if(pb)pb.style.setProperty('--pulse',pulse+'%');
  set('energyText',pulse>=80?'امروز روی موجی 🔥':pulse>=50?'ریتم خوبه، ادامه بده ✦':'آروم شروع کن؛ یک قدم کافی است.');
  let streak=0; for(let i=0;i<30;i++){let d=new Date();d.setDate(d.getDate()-i);let iso=__iso(d);let hit=(db.study||[]).some(x=>x.date===iso)||(db.goals||[]).some(x=>x.date===iso)||(db.expenses||[]).some(x=>x.date===iso)||(db.customEntries||[]).some(x=>x.date===iso);if(hit)streak++;else if(i>0)break;}
  set('activityStreak',fa(streak)+' روز');
}
function set(id,v){let e=document.getElementById(id);if(e)e.textContent=v}
function toast(s){let t=document.getElementById("toast");t.textContent=s;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
setup();
updateUltraStats();

// Ultra UX: keyboard shortcuts + focus strip
(function ultraUX(){
  const messages=[
    "یک هزینه را ثبت کن تا تصویر مالی امروزت کامل شود.",
    "۳۰ دقیقه مطالعه هم یک برد واقعی است. 📚",
    "پس‌انداز کوچک، هدف بزرگ. امروز یک قدم بردار. 🎯",
    "زمان پرتت را ثبت کن؛ چیزی که اندازه‌گیری شود، بهتر مدیریت می‌شود. ⏱️"
  ];
  function refreshFocus(){
    const el=document.getElementById('focusMessage');
    if(!el)return;
    const st=sum(db.study.filter(x=>x.date===todayISO()),x=>+x.hours), wt=sum(db.waste.filter(x=>x.date===todayISO()),x=>+x.hours);
    el.textContent=st>=(db.studyTarget||3)?"هدف مطالعه امروزت کامل شد؛ عالی پیش رفتی 🔥":wt>4?"امروز زمان پرت بالاست؛ فقط ۲۰ دقیقه را پس بگیر. 💜":messages[new Date().getDate()%messages.length];
  }
  const oldRender=window.renderAll;
  if(typeof oldRender==='function'){
    window.renderAll=function(){oldRender();refreshFocus();updateUltraStats()};
  }
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openModal('quick');}
    if(e.key==='Escape')closeModal();
    if(e.altKey && /^[1-7]$/.test(e.key)){e.preventDefault();const pages=['dashboard','money','time','study','goals','custom','calendar'];go(pages[+e.key-1]);}
  });
  const fq=document.getElementById('focusQuick'); if(fq)fq.onclick=()=>openModal('quick');
  refreshFocus();
})();

(function cinematicMode(){
 const b=document.getElementById('vibeToggle'); if(!b)return;
 const on=localStorage.getItem('lifeos-cinematic')==='1'; document.body.classList.toggle('cinematic',on); b.classList.toggle('on',on);
 b.onclick=()=>{const next=!document.body.classList.contains('cinematic');document.body.classList.toggle('cinematic',next);b.classList.toggle('on',next);localStorage.setItem('lifeos-cinematic',next?'1':'0');toast(next?'حالت سینمایی روشن شد ✨':'حالت عادی فعال شد')};
})();


/* ===== LIFEOS ULTRA X2 / COMMAND CENTER ===== */
(function signatureUX(){
  const overlay=document.getElementById('commandOverlay'), input=document.getElementById('commandInput'), grid=document.getElementById('commandGrid');
  if(!overlay||!input||!grid)return;
  const actions=[
    ['داشبورد','نمایش نمای کلی زندگی','dashboard'],['مالی و بودجه','درآمد، هزینه و پس‌انداز','money'],['ثبت هزینه','یک هزینه جدید ثبت کن','expense'],['ثبت درآمد','یک درآمد جدید ثبت کن','income'],['ثبت پس‌انداز','واریز یا برداشت از پس‌انداز','saving'],['هدف جدید','یک هدف تازه بساز','goal'],['هدف پس‌انداز','هدف مالی پس‌انداز را تنظیم کن','savingGoal'],['مطالعه','جلسات مطالعه را مدیریت کن','study'],['زمان پرت','زمان تلف‌شده را ثبت کن','waste'],['ثبت‌های من','نوع ثبت سفارشی بساز یا ویرایش کن','custom'],['تقویم','تقویم عملکرد را ببین','calendar'],['پشتیبان‌گیری','خروجی JSON از اطلاعات بگیر','export']
  ];
  let selected=0, filtered=actions;
  function draw(){grid.innerHTML=filtered.map((a,i)=>`<button class="command-item ${i===selected?'selected':''}" data-action="${a[2]}"><b>${a[0]}</b><span>${a[1]}</span></button>`).join('')||'<div class="muted" style="grid-column:1/-1;padding:18px">چیزی پیدا نشد.</div>';grid.querySelectorAll('.command-item').forEach((b,i)=>b.onclick=()=>run(filtered[i][2]));}
  function open(){overlay.classList.add('open');input.value='';filtered=actions;selected=0;draw();setTimeout(()=>input.focus(),30)}
  function close(){overlay.classList.remove('open')}
  function run(a){close();if(a==='export'){exportData();return}if(['dashboard','money','time','study','goals','custom','calendar'].includes(a)){go(a);return}openModal(a);}
  input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();filtered=actions.filter(a=>(a[0]+' '+a[1]).toLowerCase().includes(q));selected=0;draw()});
  input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();selected=(selected+1)%Math.max(filtered.length,1);draw()}else if(e.key==='ArrowUp'){e.preventDefault();selected=(selected-1+Math.max(filtered.length,1))%Math.max(filtered.length,1);draw()}else if(e.key==='Enter'){e.preventDefault();if(filtered[selected])run(filtered[selected][2])}else if(e.key==='Escape')close()});
  document.getElementById('commandBtn')?.addEventListener('click',open);document.getElementById('closeCommand')?.addEventListener('click',close);overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open()}if(e.key==='Escape'&&overlay.classList.contains('open'))close()});
  draw();
})();

(function liveHUD(){
  const hero=document.querySelector('#dashboard .hero-ultra'); if(!hero)return;
  if(!document.getElementById('dashboardLive')){
    const live=document.createElement('div'); live.id='dashboardLive'; live.className='dashboard-live'; live.innerHTML='<div class="live-left"><i class="live-dot"></i><span>LifeOS Live</span><span class="lux-badge">ULTRA X2</span></div><div class="live-value" id="liveValue">در حال محاسبه…</div>'; hero.parentNode.insertBefore(live,hero);
  }
  function refresh(){
    const today=todayISO(), ex=sum(db.expenses.filter(x=>x.date===today),x=>+x.amount), inc=sum(db.incomes.filter(x=>x.date===today),x=>+x.amount), st=sum(db.study.filter(x=>x.date===today),x=>+x.hours), wa=sum(db.waste.filter(x=>x.date===today),x=>+x.hours); const el=document.getElementById('liveValue'); if(el)el.textContent=`امروز · ${fa(st)}س مطالعه · ${fa(wa)}س زمان پرت · ${money(inc-ex)}`;
  }
  const old=window.renderAll;if(typeof old==='function')window.renderAll=function(){old();refresh()};refresh();
})();


/* ===== ULTRA X3 / LUXURY LIVE LAYER ===== */
(function luxLiveLayer(){
  const money=n=>typeof window.money==='function'?window.money(n):String(n||0);
  function refresh(){
    const today=todayISO();
    const study=sum((db.study||[]).filter(x=>x.date===today),x=>+x.hours);
    const waste=sum((db.waste||[]).filter(x=>x.date===today),x=>+x.hours);
    const income=sum((db.incomes||[]).filter(x=>x.date===today),x=>+x.amount);
    const expense=sum((db.expenses||[]).filter(x=>x.date===today),x=>+x.amount);
    const saving=sum((db.savings||[]).filter(x=>x.type==='deposit'&&x.date===today),x=>+x.amount)-sum((db.savings||[]).filter(x=>x.type==='withdrawal'&&x.date===today),x=>+x.amount);
    const target=+(db.studyTarget||3);
    const score=Math.max(0,Math.min(100,Math.round((study/target)*60 + Math.max(0,25-waste*5) + (income>=expense?15:5))));
    const hs=document.getElementById('hudTodayScore'), hst=document.getElementById('hudStreak'), hsv=document.getElementById('hudSaving'), m=document.getElementById('dailyMission');
    if(hs)hs.textContent=fa(score);
    if(hsv)hsv.textContent=(saving>=0?'+':'')+fa(saving);
    const streakEl=document.getElementById('activityStreak'); if(hst)hst.textContent=streakEl?streakEl.textContent:'۰';
    if(m){
      const missions=study>=target?["ماموریت کامل شد — امشب سبک‌تر نفس بکش ✦","هدف مطالعه امروز فتح شد 🔥"]:waste>3?["۲۰ دقیقه از زمان پرتت را پس بگیر ⏱️","امروز فقط یک حواس‌پرتی کمتر ✦"]:saving>0?["پس‌انداز امروز ثبت شد — ادامه بده 💎","هر واریز، یک قدم به هدف نزدیک‌تر"]:["یک ثبت کوچک انجام بده و روزت را روشن کن ✨","امروز فقط یک قدم جلوتر"];
      m.textContent=missions[new Date().getDate()%missions.length];
    }
  }
  const old=window.renderAll;
  if(typeof old==='function' && !window.__luxWrapped){
    window.__luxWrapped=true;
    window.renderAll=function(){old();setTimeout(refresh,0)};
  }
  setInterval(refresh,5000); refresh();
  const hud=document.getElementById('luxHud');
  if(hud){
    document.addEventListener('mousemove',e=>{
      if(window.innerWidth<900)return;
      const r=hud.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      hud.style.transform=`perspective(900px) rotateY(${x*1.2}deg) rotateX(${y*-1.2}deg)`;
    });
    hud.addEventListener('mouseleave',()=>hud.style.transform='');
  }
})();

/* ===== LIFEOS ULTRA X4 / NEON LOUNGE ===== */
(function neonLounge(){
  if(document.getElementById('x4Topbar'))return;
  const main=document.querySelector('main'); if(!main)return;
  const bar=document.createElement('div');bar.id='x4Topbar';bar.className='x4-topbar';bar.innerHTML=`<div class="x4-live"><i class="x4-dot"></i><span>LIVE SYSTEM</span></div><div class="x4-sep"></div><div class="x4-ring" id="x4Ring"><div><b id="x4RingVal">۰٪</b><span>روز</span></div></div><div class="x4-ticker" id="x4Ticker">در حال اسکن وضعیت امروز…</div><div class="x4-tools"><button class="x4-tool" id="x4SpotBtn">⌕ فرمان</button><button class="x4-tool" id="x4ThemeBtn">◈ تم</button><button class="x4-tool" id="x4AmbientBtn">◉ Focus</button></div>`;
  main.prepend(bar);
  const prog=document.createElement('div');prog.className='x4-progress';document.body.appendChild(prog);
  const spot=document.createElement('div');spot.className='x4-spotlight';spot.id='x4Spot';spot.innerHTML=`<div class="x4-spotbox"><div class="x4-spothead"><div><b>NEON COMMAND</b><br><small>دسترسی سریع به حالت‌های LifeOS</small></div><button class="close" id="x4SpotClose">×</button></div><input class="x4-spotinput" id="x4SpotInput" placeholder="جستجو یا بنویس: تمرکز، تم، داشبورد…" autocomplete="off"><div class="x4-shortcuts" id="x4Shortcuts"></div></div>`;document.body.appendChild(spot);
  const actions=[['داشبورد','go','dashboard'],['مالی','go','money'],['پس‌انداز','modal','saving'],['هدف پس‌انداز','modal','savingGoal'],['مطالعه','modal','study'],['زمان پرت','modal','waste'],['هدف جدید','modal','goal'],['ثبت سریع','modal','quick'],['تقویم','go','calendar']];
  const sc=document.getElementById('x4Shortcuts');sc.innerHTML=actions.map((a,i)=>`<button data-i="${i}">${a[0]}<span>${a[1]==='go'?'باز کردن بخش':'ثبت / تنظیم'}</span></button>`).join('');
  function run(i){const a=actions[i];spot.classList.remove('open');if(a[1]==='go')go(a[2]);else openModal(a[2]);}
  sc.querySelectorAll('button').forEach(b=>b.onclick=()=>run(+b.dataset.i));
  const input=document.getElementById('x4SpotInput');
  function openSpot(){spot.classList.add('open');input.value='';setTimeout(()=>input.focus(),30)}
  document.getElementById('x4SpotBtn').onclick=openSpot;document.getElementById('x4SpotClose').onclick=()=>spot.classList.remove('open');spot.onclick=e=>{if(e.target===spot)spot.classList.remove('open')};
  input.oninput=()=>{const q=input.value.trim().toLowerCase();sc.querySelectorAll('button').forEach((b,i)=>b.style.display=(!q||actions[i][0].toLowerCase().includes(q))?'':'none')};
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='p'){e.preventDefault();openSpot()}if(e.key==='Escape')spot.classList.remove('open')});
  let theme=localStorage.getItem('lifeos-x4-theme')||'violet';
  function applyTheme(){document.body.dataset.theme=theme==='violet'?'':theme;document.getElementById('x4ThemeBtn').textContent=theme==='violet'?'◈ تم: Violet':theme==='emerald'?'◈ تم: Emerald':'◈ تم: Rose';localStorage.setItem('lifeos-x4-theme',theme)}
  document.getElementById('x4ThemeBtn').onclick=()=>{theme=theme==='violet'?'emerald':theme==='emerald'?'rose':'violet';applyTheme();toast('تم جدید فعال شد ✦')};applyTheme();
  let ambient=localStorage.getItem('lifeos-x4-ambient')==='1';
  function applyAmbient(){document.body.classList.toggle('ambient',ambient);document.getElementById('x4AmbientBtn').textContent=ambient?'◉ Focus: ON':'◉ Focus';localStorage.setItem('lifeos-x4-ambient',ambient?'1':'0')}
  document.getElementById('x4AmbientBtn').onclick=()=>{ambient=!ambient;applyAmbient();toast(ambient?'Focus Mode فعال شد ◉':'Focus Mode خاموش شد')};applyAmbient();
  function refresh(){
    const t=todayISO(), study=sum((db.study||[]).filter(x=>x.date===t),x=>+x.hours), waste=sum((db.waste||[]).filter(x=>x.date===t),x=>+x.hours), target=+(db.studyTarget||3);let p=Math.max(0,Math.min(100,Math.round(study/target*100)));const ring=document.getElementById('x4Ring');if(ring)ring.style.setProperty('--x4-deg',(p*3.6)+'deg');set('x4RingVal',fa(p)+'٪');
    const saving=sum((db.savings||[]).filter(x=>x.type==='deposit'&&x.date===t),x=>+x.amount)-sum((db.savings||[]).filter(x=>x.type==='withdrawal'&&x.date===t),x=>+x.amount);const inc=sum((db.incomes||[]).filter(x=>x.date===t),x=>+x.amount),exp=sum((db.expenses||[]).filter(x=>x.date===t),x=>+x.amount);
    const lines=study>=target?[`هدف مطالعه امروز کامل شد · ${fa(study)} ساعت ✦`,`ریتم عالی؛ امروز ${fa(study)} ساعت برای خودت وقت گذاشتی 🔥`]:saving>0?[`امروز ${fa(saving)} به پس‌اندازت اضافه شد 💎`,`هر واریز کوچک، فاصله با هدف را کمتر می‌کند 🎯`]:waste>3?[`امروز ${fa(waste)} ساعت زمان پرت ثبت شده · یک بخشش را پس بگیر ⏱️`]:inc-exp>0?[`امروز تراز مالی مثبت است · ${money(inc-exp)} ✨`]:[`امروز یک ثبت کوچک انجام بده؛ LifeOS بقیه مسیر را نشانت می‌دهد ✦`,`یک قدم. یک ثبت. یک روز بهتر.`];set('x4Ticker',lines[new Date().getDate()%lines.length]);
  }
  const old=window.renderAll;if(typeof old==='function'&&!window.__x4Wrapped){window.__x4Wrapped=true;window.renderAll=function(){old();setTimeout(refresh,0)}}refresh();setInterval(refresh,4000);
  window.addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;document.querySelector('.x4-progress').style.width=(h>0?(scrollY/h*100):0)+'%'});
})();

/* ===== LIFEOS ULTRA X5 / APEX EXPERIENCE ===== */
(function apexExperience(){
  if(document.getElementById('x5Dock')) return;
  const main=document.querySelector('main'); if(!main) return;
  const dock=document.createElement('div'); dock.id='x5Dock'; dock.className='x5-dock'; dock.innerHTML=`
    <div class="x5-brand"><span class="x5-orb">✦</span><div><b>APEX</b><small>LifeOS X5</small></div></div>
    <div class="x5-actions">
      <button id="x5Zen" class="x5-btn">◉ Zen</button>
      <button id="x5Widgets" class="x5-btn">▦ ویجت‌ها</button>
      <button id="x5Profile" class="x5-btn">♙ پروفایل</button>
      <button id="x5Quick" class="x5-btn x5-primary">＋ ثبت سریع</button>
    </div>`;
  main.prepend(dock);

  const panel=document.createElement('div'); panel.id='x5Panel'; panel.className='x5-panel'; panel.innerHTML=`
    <div class="x5-panel-inner">
      <div class="x5-panel-head"><div><span class="x5-kicker">APEX CONTROL</span><h3>کنترل داشبورد</h3><p>ظاهر LifeOS را برای حال و هوای امروزت تنظیم کن.</p></div><button class="close" id="x5Close">×</button></div>
      <div class="x5-widget-grid">
        <button data-widget="luxHud"><b>HUD</b><span>پالس و مأموریت روز</span><i></i></button>
        <button data-widget="focus-strip"><b>Focus</b><span>نوار تمرکز</span><i></i></button>
        <button data-widget="orbit-row"><b>Orbit</b><span>انرژی و زنجیره</span><i></i></button>
        <button data-widget="monthly-report"><b>Insight</b><span>گزارش هوشمند</span><i></i></button>
        <button data-widget="grid.two"><b>Charts</b><span>نمودارهای داشبورد</span><i></i></button>
      </div>
      <div class="x5-panel-foot"><span>تنظیمات در همین مرورگر ذخیره می‌شود.</span><button id="x5ResetWidgets" class="secondary small">بازنشانی ویجت‌ها</button></div>
    </div>`;
  document.body.appendChild(panel);

  const zenKey='lifeos-x5-zen', widgetKey='lifeos-x5-widgets';
  let zen=localStorage.getItem(zenKey)==='1';
  let hidden=JSON.parse(localStorage.getItem(widgetKey)||'{}');
  const applyZen=()=>{document.body.classList.toggle('x5-zen',zen);document.getElementById('x5Zen').textContent=zen?'◉ Zen: ON':'◉ Zen';localStorage.setItem(zenKey,zen?'1':'0')};
  const applyWidgets=()=>{Object.entries(hidden).forEach(([cls,val])=>{document.querySelectorAll('.'+cls.replace('.',' ')).forEach(e=>e.classList.toggle('x5-hidden',!!val))});
    document.querySelectorAll('[data-widget]').forEach(b=>b.classList.toggle('off',!!hidden[b.dataset.widget]));localStorage.setItem(widgetKey,JSON.stringify(hidden));};
  applyZen(); applyWidgets();
  document.getElementById('x5Zen').onclick=()=>{zen=!zen;applyZen();toast(zen?'Zen Mode فعال شد ◉':'Zen Mode خاموش شد')};
  document.getElementById('x5Widgets').onclick=()=>panel.classList.add('open');
  document.getElementById('x5Close').onclick=()=>panel.classList.remove('open');
  panel.onclick=e=>{if(e.target===panel)panel.classList.remove('open')};
  document.getElementById('x5Quick').onclick=()=>openModal('quick');
  document.getElementById('x5Profile').onclick=()=>openModal('profile',null,null,!db.profile);
  document.querySelectorAll('[data-widget]').forEach(b=>b.onclick=()=>{const k=b.dataset.widget;hidden[k]=!hidden[k];applyWidgets()});
  document.getElementById('x5ResetWidgets').onclick=()=>{hidden={};applyWidgets();toast('چیدمان ویجت‌ها بازنشانی شد ✓')};

  // Keyboard: Alt+A opens the APEX dock, Alt+Q opens quick add.
  document.addEventListener('keydown',e=>{
    if(e.altKey&&e.key.toLowerCase()==='a'){e.preventDefault();panel.classList.toggle('open')}
    if(e.altKey&&e.key.toLowerCase()==='q'){e.preventDefault();openModal('quick')}
  });

  function refreshApex(){
    const t=todayISO();
    const study=sum((db.study||[]).filter(x=>x.date===t),x=>+x.hours);
    const waste=sum((db.waste||[]).filter(x=>x.date===t),x=>+x.hours);
    const exp=sum((db.expenses||[]).filter(x=>x.date===t),x=>+x.amount);
    const inc=sum((db.incomes||[]).filter(x=>x.date===t),x=>+x.amount);
    const dep=sum((db.savings||[]).filter(x=>x.date===t&&x.type==='deposit'),x=>+x.amount);
    const goal=db.savingsGoal;
    const pct=goal&&+goal.target?Math.min(100,Math.round((sum((db.savings||[]).filter(x=>x.type==='deposit'),x=>+x.amount)-sum((db.savings||[]).filter(x=>x.type==='withdrawal'),x=>+x.amount))/(+goal.target)*100)):0;
    const score=Math.max(0,Math.min(100,Math.round(study/Math.max(1,+(db.studyTarget||3))*50 + Math.max(0,25-waste*5) + (inc>=exp?15:5) + Math.min(10,pct/10))));
    const title=document.querySelector('#x5Dock .x5-brand small'); if(title)title.textContent=`LifeOS X5 · ${fa(score)}٪ ریتم امروز`;
    dock.style.setProperty('--x5-score',score+'%');
    const orb=dock.querySelector('.x5-orb'); if(orb)orb.textContent=score>=80?'✦':score>=50?'◆':'·';
  }
  const old=window.renderAll;
  if(typeof old==='function'&&!window.__x5Wrapped){window.__x5Wrapped=true;window.renderAll=function(){old();setTimeout(refreshApex,0)}}
  refreshApex(); setInterval(refreshApex,5000);
})();

/* ===== LIFEOS ULTRA X6 / AURA COCKPIT ===== */
(function(){
 if(document.getElementById('x6Aura'))return; const main=document.querySelector('main');if(!main)return;
 const a=document.createElement('div');a.id='x6Aura';a.className='x6-aura';a.innerHTML='<div class="x6-left"><i></i><div><small>AURA COCKPIT</small><b id="x6Head">سیستم آماده است</b><span id="x6Sub">امروز را هوشمندتر مدیریت کن.</span></div></div><div class="x6-metrics"><div><small>تمرکز</small><b id="x6Focus">۰٪</b></div><div><small>تراز امروز</small><b id="x6Net">۰</b></div><div><small>پس‌انداز</small><b id="x6Save">۰</b></div></div><div class="x6-actions"><button id="x6Insight">✦ Insight</button><button id="x6Glow">◌ Glow</button></div>';main.prepend(a);
 const ov=document.createElement('div');ov.id='x6Overlay';ov.className='x6-overlay';ov.innerHTML='<div class="x6-modal"><div class="x6-modal-head"><div><small>AURA INSIGHT</small><h3>نبض امروز</h3></div><button class="close" id="x6Close">×</button></div><div class="x6-grid"><div><span>مطالعه</span><b id="xiStudy">۰</b><small>ساعت</small></div><div><span>زمان پرت</span><b id="xiWaste">۰</b><small>ساعت</small></div><div><span>درآمد</span><b id="xiIncome">۰</b><small>امروز</small></div><div><span>هزینه</span><b id="xiExpense">۰</b><small>امروز</small></div></div><p id="xiQuote">یک قدم کوچک بردار.</p><div><button class="secondary" id="xiQuick">＋ ثبت سریع</button><button class="primary" id="xiStudyBtn">＋ ثبت مطالعه</button></div></div></div>';document.body.appendChild(ov);
 let glow=localStorage.getItem('lifeos-x6-glow')!=='0';function apply(){document.body.classList.toggle('x6-glow',glow);document.getElementById('x6Glow').textContent=glow?'◌ Glow: ON':'◌ Glow';localStorage.setItem('lifeos-x6-glow',glow?'1':'0')}apply();
 document.getElementById('x6Glow').onclick=()=>{glow=!glow;apply()};document.getElementById('x6Insight').onclick=()=>ov.classList.add('open');document.getElementById('x6Close').onclick=()=>ov.classList.remove('open');ov.onclick=e=>{if(e.target===ov)ov.classList.remove('open')};document.getElementById('xiQuick').onclick=()=>{ov.classList.remove('open');openModal('quick')};document.getElementById('xiStudyBtn').onclick=()=>{ov.classList.remove('open');openModal('study')};
 function refresh(){const t=todayISO(),study=sum((db.study||[]).filter(x=>x.date===t),x=>+x.hours),waste=sum((db.waste||[]).filter(x=>x.date===t),x=>+x.hours),inc=sum((db.incomes||[]).filter(x=>x.date===t),x=>+x.amount),exp=sum((db.expenses||[]).filter(x=>x.date===t),x=>+x.amount),sav=sum((db.savings||[]).filter(x=>x.date===t&&x.type==='deposit'),x=>+x.amount)-sum((db.savings||[]).filter(x=>x.date===t&&x.type==='withdrawal'),x=>+x.amount),pct=Math.min(100,Math.round(study/(+(db.studyTarget||3)||3)*100));set('x6Focus',fa(pct)+'٪');set('x6Net',money(inc-exp));set('x6Save',money(sav));set('xiStudy',fa(study));set('xiWaste',fa(waste));set('xiIncome',money(inc));set('xiExpense',money(exp));set('x6Head',pct>=100?'هدف مطالعه کامل شد ✦':sav>0?'امروز به آینده‌ات اضافه کردی 💎':waste>3?'وقتت را پس بگیر ⏱️':inc-exp>0?'تراز امروز مثبت است ✨':'یک قدم کوچک، همین حالا.');set('x6Sub',sav>0?'واریز امروز در مسیر هدف پس‌انداز ثبت شد.':'LifeOS ریتم روزت را در یک نگاه نشان می‌دهد.');set('xiQuote',['کم اما پیوسته.','امروز لازم نیست کامل باشی؛ فقط واقعی باش.','هر ثبت، یک قدم به شناخت بهتر خودت است.'][new Date().getDate()%3])}
 const old=window.renderAll;if(typeof old==='function'&&!window.__x6){window.__x6=true;window.renderAll=function(){old();setTimeout(refresh,0)}}refresh();setInterval(refresh,5000);
})();

/* ===== LIFEOS ULTRA X7 / NEXUS PRIME ===== */
(function nexusPrime(){
  if(document.getElementById('x7Nexus')) return;
  const main=document.querySelector('main'); if(!main) return;
  const bar=document.createElement('div'); bar.id='x7Nexus'; bar.className='x7-nexus x7-pulse';
  bar.innerHTML=`<div class="x7-brand"><div class="x7-orb" id="x7Orb">✦</div><div><small>NEXUS PRIME</small><b id="x7Headline">سیستم آماده است</b></div></div><div class="x7-center"><div class="x7-metric"><span>ریتم امروز</span><b id="x7Score">۰٪</b><small>بر اساس مطالعه و زمان پرت</small></div><div class="x7-metric"><span>تراز مالی</span><b id="x7Net">۰</b><small>درآمد منهای هزینه</small></div><div class="x7-metric"><span>پس‌انداز خالص</span><b id="x7Saving">۰</b><small>امروز</small></div></div><div class="x7-actions"><button id="x7InsightBtn">✦ نبض روز</button><button id="x7ModeBtn">◌ Clean</button></div>`;
  main.prepend(bar);
  const overlay=document.createElement('div'); overlay.id='x7Insight'; overlay.className='x7-insight';
  overlay.innerHTML=`<div class="x7-card"><div class="x7-head"><div><small>NEXUS INSIGHT</small><h3>نبض امروز</h3></div><button class="x7-close" id="x7Close">×</button></div><div class="x7-insight-grid"><div><span>مطالعه</span><b id="x7iStudy">۰</b><small>ساعت</small></div><div><span>زمان پرت</span><b id="x7iWaste">۰</b><small>ساعت</small></div><div><span>درآمد</span><b id="x7iIncome">۰</b><small>امروز</small></div><div><span>هزینه</span><b id="x7iExpense">۰</b><small>امروز</small></div></div><div class="x7-timeline" id="x7Timeline"></div><div class="x7-tip" id="x7Tip">یک قدم کوچک کافی است.</div><div class="x7-bottom"><button id="x7Quick">＋ ثبت سریع</button><button class="main" id="x7Study">＋ ثبت مطالعه</button></div></div>`;
  document.body.appendChild(overlay);
  let clean=localStorage.getItem('lifeos-x7-clean')==='1';
  function applyClean(){document.body.classList.toggle('x7-mini-mode',clean);document.getElementById('x7ModeBtn').textContent=clean?'◌ Clean: ON':'◌ Clean';localStorage.setItem('lifeos-x7-clean',clean?'1':'0')}
  applyClean();
  document.getElementById('x7ModeBtn').onclick=()=>{clean=!clean;applyClean();toast(clean?'نمای تمیز فعال شد ◉':'نمای کامل فعال شد')};
  document.getElementById('x7InsightBtn').onclick=()=>overlay.classList.add('open');document.getElementById('x7Close').onclick=()=>overlay.classList.remove('open');overlay.onclick=e=>{if(e.target===overlay)overlay.classList.remove('open')};
  document.getElementById('x7Quick').onclick=()=>{overlay.classList.remove('open');openModal('quick')};document.getElementById('x7Study').onclick=()=>{overlay.classList.remove('open');openModal('study')};
  function refresh(){
    const t=todayISO();
    const study=sum((db.study||[]).filter(x=>x.date===t),x=>+x.hours), waste=sum((db.waste||[]).filter(x=>x.date===t),x=>+x.hours), inc=sum((db.incomes||[]).filter(x=>x.date===t),x=>+x.amount), exp=sum((db.expenses||[]).filter(x=>x.date===t),x=>+x.amount), dep=sum((db.savings||[]).filter(x=>x.date===t&&x.type==='deposit'),x=>+x.amount), wd=sum((db.savings||[]).filter(x=>x.date===t&&x.type==='withdrawal'),x=>+x.amount);
    const target=Math.max(1,+(db.studyTarget||3)); const focus=Math.max(0,Math.min(100,Math.round(study/target*70+Math.max(0,30-waste*6))));
    set('x7Score',fa(focus)+'٪');set('x7Net',money(inc-exp));set('x7Saving',money(dep-wd));
    set('x7Headline',focus>=85?'ریتمت امروز عالیه ✦':focus>=60?'روزت در مسیر خوبی است':waste>3?'وقتت را پس بگیر ⏱️':dep>0?'امروز برای آینده‌ات ذخیره کردی 💎':'یک حرکت کوچک شروع کن');
    const orb=document.getElementById('x7Orb');if(orb)orb.textContent=focus>=85?'✦':focus>=60?'◆':'·';
    set('x7iStudy',fa(study));set('x7iWaste',fa(waste));set('x7iIncome',money(inc));set('x7iExpense',money(exp));
    const tip=focus>=85?'هدف مطالعه امروز تقریباً/کاملاً کامل شده؛ لازم نیست بیشتر از ظرفیتت فشار بیاوری.':dep>0?'امروز یک قدم مالی برداشتی؛ پیوستگی مهم‌تر از مبلغ است.':waste>3?'یک بازه ۲۰ دقیقه‌ای بدون حواس‌پرتی برای خودت بساز.':'فقط یک کار مهم انتخاب کن و آن را ثبت کن.';set('x7Tip',tip);
    const tl=document.getElementById('x7Timeline');if(tl){const vals=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const iso=__iso(d);const s=sum((db.study||[]).filter(x=>x.date===iso),x=>+x.hours), e=sum((db.expenses||[]).filter(x=>x.date===iso),x=>+x.amount), v=Math.min(100,Math.max(8,s/target*65+(e>0?20:0)));vals.push(v)}tl.innerHTML=vals.map(v=>`<i style="height:${v}%"></i>`).join('')}
  }
  const old=window.renderAll;if(typeof old==='function'&&!window.__x7Wrapped){window.__x7Wrapped=true;window.renderAll=function(){old();setTimeout(refresh,0)}}
  refresh();setInterval(refresh,5000);
})();

/* ===== LIFEOS ULTRA X8 / BLACK LABEL ===== */
(function blackLabel(){
  if(document.getElementById('x8Black')) return;
  const main=document.querySelector('main'); if(!main) return;
  const bar=document.createElement('div'); bar.id='x8Black'; bar.className='x8-black';
  bar.innerHTML=`<div class="x8-brand"><div class="x8-logo">✦</div><div><small>BLACK LABEL / LIFEOS</small><b id="x8Headline">سیستم آماده است</b></div></div><div class="x8-metrics"><div class="x8-metric"><span>امتیاز امروز</span><b id="x8Score">۰٪</b><small>ریتم کلی</small></div><div class="x8-metric"><span>مطالعه</span><b id="x8Study">۰</b><small>ساعت امروز</small></div><div class="x8-metric"><span>تراز</span><b id="x8Net">۰</b><small>امروز</small></div><div class="x8-metric"><span>پس‌انداز</span><b id="x8Save">۰</b><small>خالص امروز</small></div></div><div class="x8-actions"><button id="x8Pulse">✦ Pulse</button><button id="x8Cinema">◉ Cinema</button></div>`;
  main.prepend(bar);
  const overlay=document.createElement('div');overlay.id='x8PulseOverlay';overlay.className='x8-overlay';overlay.innerHTML=`<div class="x8-modal"><div class="x8-modal-head"><div><small>BLACK LABEL / DAILY PULSE</small><h3>نبض واقعی امروز</h3></div><button class="x8-close" id="x8Close">×</button></div><div class="x8-ring-wrap"><div class="x8-ring" id="x8Ring"><div><b id="x8RingNum">۰٪</b><span>ریتم امروز</span></div></div><div><div class="x8-bars" id="x8Bars"></div><div class="x8-summary" id="x8Summary">در حال محاسبه...</div></div></div></div>`;document.body.appendChild(overlay);
  const cmd=document.createElement('div');cmd.id='x8Command';cmd.className='x8-command';cmd.innerHTML=`<div class="x8-command-box"><input id="x8Search" class="x8-search" placeholder="جست‌وجوی فرمان... مثل: هزینه، درآمد، مطالعه، پس‌انداز" autocomplete="off"><div id="x8Commands" class="x8-command-list"></div></div>`;document.body.appendChild(cmd);
  const commands=[
    ['داشبورد','باز کردن داشبورد',()=>go('dashboard')],['مالی و بودجه','باز کردن امور مالی',()=>go('money')],['زمان','مدیریت زمان پرت',()=>go('time')],['مطالعه','جلسه مطالعه جدید',()=>openModal('study')],['اهداف','باز کردن اهداف',()=>go('goals')],['ثبت هزینه','هزینه جدید',()=>openModal('expense')],['ثبت درآمد','درآمد جدید',()=>openModal('income')],['ثبت پس‌انداز','واریز/برداشت پس‌انداز',()=>openModal('saving')],['هدف پس‌انداز','تنظیم هدف پس‌انداز',()=>openModal('savingGoal')],['ثبت سریع','باز کردن ثبت سریع',()=>openModal('quick')]
  ];
  function go(page){const n=document.querySelector(`.nav[data-page="${page}"]`);if(n)n.click()}
  function renderCommands(q=''){const box=document.getElementById('x8Commands');const term=q.trim().toLowerCase();const list=commands.filter(c=>(c[0]+' '+c[1]).toLowerCase().includes(term));box.innerHTML=list.map((c,i)=>`<button data-cmd="${i}"><b>${c[0]}</b><span>${c[1]}</span></button>`).join('')||'<div style="padding:18px;opacity:.5">فرمانی پیدا نشد.</div>';box.querySelectorAll('[data-cmd]').forEach(b=>b.onclick=()=>{cmd.classList.remove('open');commands[+b.dataset.cmd][2]()})}
  renderCommands();
  const search=document.getElementById('x8Search');search.oninput=()=>renderCommands(search.value);
  document.getElementById('x8Pulse').onclick=()=>overlay.classList.add('open');document.getElementById('x8Close').onclick=()=>overlay.classList.remove('open');overlay.onclick=e=>{if(e.target===overlay)overlay.classList.remove('open')};
  let cinema=localStorage.getItem('lifeos-x8-cinema')==='1';function applyCinema(){document.body.classList.toggle('x8-cinema',cinema);document.getElementById('x8Cinema').textContent=cinema?'◉ Cinema: ON':'◉ Cinema';localStorage.setItem('lifeos-x8-cinema',cinema?'1':'0')}applyCinema();document.getElementById('x8Cinema').onclick=()=>{cinema=!cinema;applyCinema();toast(cinema?'حالت سینمایی فعال شد ✦':'حالت عادی فعال شد')};
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='j'){e.preventDefault();cmd.classList.add('open');search.focus();search.select()}if(e.key==='Escape'){cmd.classList.remove('open');overlay.classList.remove('open')}});
  function refresh(){
    const t=todayISO();const study=sum((db.study||[]).filter(x=>x.date===t),x=>+x.hours);const waste=sum((db.waste||[]).filter(x=>x.date===t),x=>+x.hours);const inc=sum((db.incomes||[]).filter(x=>x.date===t),x=>+x.amount);const exp=sum((db.expenses||[]).filter(x=>x.date===t),x=>+x.amount);const dep=sum((db.savings||[]).filter(x=>x.date===t&&x.type==='deposit'),x=>+x.amount);const wd=sum((db.savings||[]).filter(x=>x.date===t&&x.type==='withdrawal'),x=>+x.amount);const target=Math.max(1,+(db.studyTarget||3));const score=Math.max(0,Math.min(100,Math.round(study/target*70+Math.max(0,30-waste*6))));
    set('x8Score',fa(score)+'٪');set('x8Study',fa(study));set('x8Net',money(inc-exp));set('x8Save',money(dep-wd));set('x8Headline',score>=85?'روزت روی فرم است ✦':score>=60?'ریتمت خوب و قابل ادامه است':waste>3?'وقتت را پس بگیر ⏱️':dep>0?'امروز برای آینده‌ات ذخیره کردی 💎':'یک حرکت کوچک شروع کن');set('x8RingNum',fa(score)+'٪');const ring=document.getElementById('x8Ring');if(ring)ring.style.setProperty('--p',score+'%');
    const bars=document.getElementById('x8Bars');if(bars){const vals=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const iso=__iso(d);const s=sum((db.study||[]).filter(x=>x.date===iso),x=>+x.hours);const w=sum((db.waste||[]).filter(x=>x.date===iso),x=>+x.hours);vals.push(Math.max(8,Math.min(100,s/target*80+(w?10:0))))}bars.innerHTML=vals.map(v=>`<i style="height:${v}%"></i>`).join('')}
    set('x8Summary',`امروز <b>${fa(study)}</b> ساعت مطالعه، <b>${fa(waste)}</b> ساعت زمان پرت و <b>${money(dep-wd)}</b> پس‌انداز خالص ثبت شده. ${score>=85?'ریتمت قوی است؛ همین ثبات را حفظ کن.':waste>3?'یک بازه کوتاه بدون حواس‌پرتی برای ادامه روز بساز.':'یک کار مهم را انتخاب کن و انجامش بده.'}`)
  }
  const old=window.renderAll;if(typeof old==='function'&&!window.__x8Wrapped){window.__x8Wrapped=true;window.renderAll=function(){old();setTimeout(refresh,0)}}refresh();setInterval(refresh,5000);
})();

/* ===== LIFEOS X9 / APEX BLACK EDITION ===== */
(function x9Apex(){
  if(document.getElementById('x9Top')) return;
  const main=document.querySelector('main'); if(!main) return;
  const top=document.createElement('div'); top.id='x9Top'; top.className='x9-top';
  top.innerHTML=`<div class="x9-brand"><div class="x9-logo">✦</div><div><small>APEX BLACK / LIFEOS</small><b id="x9Headline">سیستم آماده است</b></div></div><div class="x9-metric"><span>امتیاز</span><b id="x9Score">۰٪</b><small>امروز</small></div><div class="x9-metric"><span>تمرکز</span><b id="x9Focus">۰٪</b><small>بر اساس مطالعه</small></div><div class="x9-metric"><span>تراز</span><b id="x9Net">۰</b><small>امروز</small></div><div class="x9-metric"><span>پس‌انداز</span><b id="x9Save">۰</b><small>خالص امروز</small></div><div class="x9-actions"><button id="x9Pulse">✦ Pulse</button><button id="x9Cmd">⌘</button><button id="x9Glow">◉ Glow</button></div>`;
  main.prepend(top);
  const cmd=document.createElement('div'); cmd.id='x9Command'; cmd.className='x9-command'; cmd.innerHTML=`<div class="x9-command-box"><input id="x9Search" class="x9-search" placeholder="فرمان را جست‌وجو کن...  مثل: هزینه، درآمد، مطالعه، هدف" autocomplete="off"><div id="x9Commands" class="x9-command-list"></div></div>`; document.body.appendChild(cmd);
  const insight=document.createElement('div'); insight.id='x9Insight'; insight.className='x9-insight'; insight.innerHTML=`<div class="x9-insight-head"><div><small>APEX DAILY PULSE</small><h3>نبض امروز</h3></div><button class="x9-close" id="x9Close">×</button></div><div class="x9-ringline"><div class="x9-ring" id="x9Ring"><div><b id="x9RingNum">۰٪</b><span>ریتم امروز</span></div></div><div><b id="x9PulseTitle">در حال تحلیل...</b><div class="muted" id="x9PulseMeta">—</div></div></div><div class="x9-tip" id="x9Tip">یک قدم کوچک شروع کن.</div><div class="x9-quick"><button data-x9="expense">＋ هزینه</button><button data-x9="study">＋ مطالعه</button><button data-x9="saving">＋ پس‌انداز</button></div>`; document.body.appendChild(insight);
  const toastBox=document.createElement('div'); toastBox.id='x9Toast'; toastBox.className='x9-toast'; document.body.appendChild(toastBox);
  const commands=[['داشبورد','نمای اصلی',()=>go('dashboard')],['مالی','درآمد، هزینه و پس‌انداز',()=>go('money')],['ثبت هزینه','افزودن هزینه',()=>openModal('expense')],['ثبت درآمد','افزودن درآمد',()=>openModal('income')],['ثبت پس‌انداز','واریز یا برداشت',()=>openModal('saving')],['هدف پس‌انداز','تنظیم هدف مالی',()=>openModal('savingGoal')],['مطالعه','جلسه جدید',()=>openModal('study')],['زمان پرت','ثبت زمان پرت',()=>openModal('waste')],['هدف جدید','ساخت هدف',()=>openModal('goal')],['ثبت سریع','ثبت سریع',()=>openModal('quick')]];
  function go(p){const n=document.querySelector(`.nav[data-page="${p}"]`);if(n)n.click()}
  function render(q=''){const box=document.getElementById('x9Commands');const term=q.trim().toLowerCase();const list=commands.filter(c=>(c[0]+' '+c[1]).toLowerCase().includes(term));box.innerHTML=list.map((c,i)=>`<button data-i="${i}"><b>${c[0]}</b><span>${c[1]}</span></button>`).join('')||'<div style="padding:18px;color:#71809a">چیزی پیدا نشد.</div>';box.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{cmd.classList.remove('open');commands[+b.dataset.i][2]()})}
  render(); const search=document.getElementById('x9Search'); search.oninput=()=>render(search.value);
  document.getElementById('x9Cmd').onclick=()=>{cmd.classList.add('open');search.focus();search.select()}; cmd.onclick=e=>{if(e.target===cmd)cmd.classList.remove('open')};
  document.getElementById('x9Pulse').onclick=()=>insight.classList.add('open'); document.getElementById('x9Close').onclick=()=>insight.classList.remove('open');
  insight.querySelectorAll('[data-x9]').forEach(b=>b.onclick=()=>{insight.classList.remove('open');openModal(b.dataset.x9)});
  let glow=localStorage.getItem('lifeos-x9-glow')!=='0'; function applyGlow(){document.body.classList.toggle('x9-glow',glow);document.getElementById('x9Glow').textContent=glow?'◉ Glow: ON':'◉ Glow';localStorage.setItem('lifeos-x9-glow',glow?'1':'0')} applyGlow(); document.getElementById('x9Glow').onclick=()=>{glow=!glow;applyGlow();showToast(glow?'Glow فعال شد ✦':'Glow خاموش شد')};
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='l'){e.preventDefault();cmd.classList.add('open');search.focus();search.select()}if(e.key==='Escape'){cmd.classList.remove('open');insight.classList.remove('open')}});
  function showToast(t){toastBox.textContent=t;toastBox.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toastBox.classList.remove('show'),1800)}
  function refresh(){
    const t=todayISO(); const study=sum((db.study||[]).filter(x=>x.date===t),x=>+x.hours); const waste=sum((db.waste||[]).filter(x=>x.date===t),x=>+x.hours); const inc=sum((db.incomes||[]).filter(x=>x.date===t),x=>+x.amount); const exp=sum((db.expenses||[]).filter(x=>x.date===t),x=>+x.amount); const dep=sum((db.savings||[]).filter(x=>x.date===t&&x.type==='deposit'),x=>+x.amount); const wd=sum((db.savings||[]).filter(x=>x.date===t&&x.type==='withdrawal'),x=>+x.amount); const target=Math.max(1,+(db.studyTarget||3)); const focus=Math.max(0,Math.min(100,Math.round(study/target*100))); const score=Math.max(0,Math.min(100,Math.round(focus*.7+Math.max(0,30-waste*6))));
    set('x9Score',fa(score)+'٪');set('x9Focus',fa(focus)+'٪');set('x9Net',money(inc-exp));set('x9Save',money(dep-wd));set('x9RingNum',fa(score)+'٪');set('x9PulseMeta',`${fa(study)} ساعت مطالعه · ${fa(waste)} ساعت زمان پرت · ${money(dep-wd)} پس‌انداز خالص`);set('x9PulseTitle',score>=85?'امروز در حالت APEX هستی ✦':score>=60?'ریتمت خوبه؛ ادامه بده':'یک حرکت کوچک کافی است');set('x9Headline',score>=85?'روز قدرتمند و منظم ✦':waste>3?'زمانت را پس بگیر ⏱️':dep>0?'برای آینده‌ات ذخیره کردی 💎':'سیستم آماده حرکت است');
    const ring=document.getElementById('x9Ring');if(ring)ring.style.setProperty('--p',score+'%');
    set('x9Tip',score>=85?'لازم نیست بیشتر فشار بیاوری؛ ثباتت را حفظ کن.':waste>3?'یک بازه ۲۰ دقیقه‌ای بدون حواس‌پرتی بساز.':dep>0?'مبلغ مهم نیست؛ پیوستگی پس‌انداز مهم است.':'یک کار مهم انتخاب کن و همین حالا شروعش کن.');
  }
  const old=window.renderAll;if(typeof old==='function'&&!window.__x9Wrapped){window.__x9Wrapped=true;window.renderAll=function(){old();setTimeout(refresh,0)}} refresh(); setInterval(refresh,5000);
})();


/* ===== LIFEOS ULTRA X10 / AURA PRIME ===== */
(function auraPrime(){
  if(document.getElementById('x10Aura')) return;
  const main=document.querySelector('main'); if(!main) return;

  const bar=document.createElement('div');
  bar.id='x10Aura'; bar.className='x10-aura';
  bar.innerHTML=`
    <div class="x10-brand"><span class="x10-orb">✦</span><div><small>AURA PRIME / LIFEOS</small><b id="x10Status">آماده برای یک روز قدرتمند</b></div></div>
    <div class="x10-live"><i></i><span>LIVE</span><b id="x10Clock">--:--</b></div>
    <div class="x10-metric"><span>ریتم</span><b id="x10Score">۰٪</b></div>
    <div class="x10-metric"><span>مطالعه</span><b id="x10Study">۰س</b></div>
    <div class="x10-metric"><span>پس‌انداز</span><b id="x10Save">۰</b></div>
    <div class="x10-actions"><button id="x10Focus">◉ Focus</button><button id="x10Palette">◈ ظاهر</button><button id="x10Pulse">✦ Pulse</button></div>`;
  main.prepend(bar);

  const panel=document.createElement('div');
  panel.id='x10FocusPanel'; panel.className='x10-overlay';
  panel.innerHTML=`<div class="x10-focusbox">
    <div class="x10-head"><div><small>AURA FOCUS</small><h3>اتاق تمرکز</h3><p>یک بازه کوتاه انتخاب کن و فقط روی همان کار بمان.</p></div><button class="x10-close" id="x10FocusClose">×</button></div>
    <div class="x10-timer" id="x10Timer"><span id="x10TimerMin">25</span><b>:</b><span id="x10TimerSec">00</span></div>
    <div class="x10-timer-state" id="x10TimerState">آماده شروع</div>
    <div class="x10-timer-actions"><button class="x10-mainbtn" id="x10TimerStart">شروع</button><button id="x10TimerPause">مکث</button><button id="x10TimerReset">بازنشانی</button></div>
    <div class="x10-presets"><button data-min="15">۱۵ دقیقه</button><button data-min="25">۲۵ دقیقه</button><button data-min="45">۴۵ دقیقه</button><button data-min="60">۶۰ دقیقه</button></div>
  </div></div>`;
  document.body.appendChild(panel);

  const palette=document.createElement('div'); palette.id='x10PalettePanel'; palette.className='x10-overlay';
  palette.innerHTML=`<div class="x10-palettebox"><div class="x10-head"><div><small>AURA THEMES</small><h3>ظاهر LifeOS</h3><p>یک فضای شخصی برای حال و هوای امروزت انتخاب کن.</p></div><button class="x10-close" id="x10PaletteClose">×</button></div><div class="x10-themegrid">
    <button data-theme="violet"><i></i><b>Violet</b><span>نئونی و عمیق</span></button>
    <button data-theme="emerald"><i></i><b>Emerald</b><span>تمیز و انرژی‌بخش</span></button>
    <button data-theme="rose"><i></i><b>Rose</b><span>گرم و لوکس</span></button>
    <button data-theme="ice"><i></i><b>Ice</b><span>سرد و مینیمال</span></button>
  </div><div class="x10-theme-foot">تنظیمات ظاهر در همین مرورگر ذخیره می‌شود.</div></div>`;
  document.body.appendChild(palette);

  const pulse=document.createElement('div'); pulse.id='x10PulsePanel'; pulse.className='x10-overlay';
  pulse.innerHTML=`<div class="x10-pulsebox"><div class="x10-head"><div><small>AURA DAILY PULSE</small><h3>داشبورد عملکرد امروز</h3></div><button class="x10-close" id="x10PulseClose">×</button></div>
    <div class="x10-pulse-grid"><div class="x10-bigscore"><div id="x10Ring"><span id="x10RingValue">۰٪</span></div><b id="x10PulseTitle">در حال تحلیل...</b><p id="x10PulseTip">—</p></div>
    <div class="x10-breakdown"><div><span>مطالعه</span><b id="x10PBStudy">۰</b><i id="x10PBStudyBar"></i></div><div><span>زمان کنترل‌شده</span><b id="x10PBTime">۰٪</b><i id="x10PBTimeBar"></i></div><div><span>انضباط مالی</span><b id="x10PBMoney">۰٪</b><i id="x10PBMoneyBar"></i></div><div><span>پس‌انداز</span><b id="x10PBSave">۰</b><i id="x10PBSaveBar"></i></div></div></div>
  </div></div>`;
  document.body.appendChild(pulse);

  function open(el){el.classList.add('open')}
  function close(el){el.classList.remove('open')}
  document.getElementById('x10Focus').onclick=()=>open(panel);
  document.getElementById('x10FocusClose').onclick=()=>close(panel);
  document.getElementById('x10Palette').onclick=()=>open(palette);
  document.getElementById('x10PaletteClose').onclick=()=>close(palette);
  document.getElementById('x10Pulse').onclick=()=>{refresh();open(pulse)};
  document.getElementById('x10PulseClose').onclick=()=>close(pulse);
  [panel,palette,pulse].forEach(x=>x.addEventListener('click',e=>{if(e.target===x)close(x)}));

  let theme=localStorage.getItem('lifeos-x10-theme')||'violet';
  function applyTheme(){document.body.dataset.aura=theme;localStorage.setItem('lifeos-x10-theme',theme);palette.querySelectorAll('[data-theme]').forEach(b=>b.classList.toggle('active',b.dataset.theme===theme))}
  palette.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{theme=b.dataset.theme;applyTheme();toast('تم '+b.querySelector('b').textContent+' فعال شد ✦')}); applyTheme();

  let remaining=+(localStorage.getItem('lifeos-x10-timer')||1500); let running=false, timerId=null;
  function paintTimer(){const m=Math.floor(remaining/60),s=remaining%60;set('x10TimerMin',String(m).padStart(2,'0'));set('x10TimerSec',String(s).padStart(2,'0'));set('x10TimerState',running?'در حال تمرکز…':'آماده شروع');localStorage.setItem('lifeos-x10-timer',remaining)}
  function stopTimer(){running=false;clearInterval(timerId);timerId=null;paintTimer()}
  document.getElementById('x10TimerStart').onclick=()=>{if(running)return;running=true;paintTimer();timerId=setInterval(()=>{remaining--;if(remaining<=0){remaining=0;stopTimer();toast('جلسه تمرکز تمام شد ✦');return}paintTimer()},1000)};
  document.getElementById('x10TimerPause').onclick=stopTimer;
  document.getElementById('x10TimerReset').onclick=()=>{stopTimer();remaining=1500;paintTimer()};
  panel.querySelectorAll('[data-min]').forEach(b=>b.onclick=()=>{stopTimer();remaining=+b.dataset.min*60;paintTimer()}); paintTimer();

  function refresh(){
    const t=todayISO();
    const study=sum((db.study||[]).filter(x=>x.date===t),x=>+x.hours);
    const waste=sum((db.waste||[]).filter(x=>x.date===t),x=>+x.hours);
    const inc=sum((db.incomes||[]).filter(x=>x.date===t),x=>+x.amount);
    const exp=sum((db.expenses||[]).filter(x=>x.date===t),x=>+x.amount);
    const dep=sum((db.savings||[]).filter(x=>x.date===t&&x.type==='deposit'),x=>+x.amount);
    const wd=sum((db.savings||[]).filter(x=>x.date===t&&x.type==='withdrawal'),x=>+x.amount);
    const target=Math.max(1,+(db.studyTarget||3));
    const focus=Math.max(0,Math.min(100,Math.round(study/target*100)));
    const time=Math.max(0,Math.min(100,Math.round((1-Math.min(waste,8)/8)*100)));
    const moneyScore=exp===0&&inc===0?50:Math.max(0,Math.min(100,Math.round(50+(inc-exp)/Math.max(1,inc||exp)*50)));
    const score=Math.round(focus*.45+time*.25+moneyScore*.20+(dep>0?10:0));
    set('x10Score',fa(score)+'٪');set('x10Study',fa(study)+'س');set('x10Save',money(dep-wd));
    set('x10Clock',new Date().toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'}));
    set('x10RingValue',fa(score)+'٪');set('x10PBStudy',fa(study)+' ساعت');set('x10PBTime',fa(time)+'٪');set('x10PBMoney',fa(moneyScore)+'٪');set('x10PBSave',money(dep-wd));
    const sb=document.getElementById('x10PBStudyBar'); if(sb)sb.style.setProperty('--w',Math.min(100,focus)+'%');
    const tb=document.getElementById('x10PBTimeBar'); if(tb)tb.style.setProperty('--w',time+'%');
    const mb=document.getElementById('x10PBMoneyBar'); if(mb)mb.style.setProperty('--w',moneyScore+'%');
    const vb=document.getElementById('x10PBSaveBar'); if(vb)vb.style.setProperty('--w',dep>0?Math.min(100,50+Math.min(50,dep/100000))+'%':'8%');
    const ring=document.getElementById('x10Ring'); if(ring)ring.style.setProperty('--p',score+'%');
    const title=score>=85?'AURA کامل فعال است ✦':score>=65?'ریتمت عالی و قابل ادامه است':'امروز فقط یک قدم مهم بردار';
    const tip=waste>3?'یک بازه ۲۰ دقیقه‌ای بدون حواس‌پرتی بساز.':dep>0?'پس‌انداز امروز ثبت شده؛ ثباتت را ادامه بده.':study>=target?'هدف مطالعه امروزت کامل شده؛ فشار اضافه لازم نیست.':'یک کار مهم انتخاب کن و وارد Focus شو.';
    set('x10Status',title);set('x10PulseTitle',title);set('x10PulseTip',tip);
  }
  refresh(); setInterval(refresh,1000);
  const old=window.renderAll; if(typeof old==='function'&&!window.__x10Wrapped){window.__x10Wrapped=true;window.renderAll=function(){old();setTimeout(refresh,0)}}
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='f'){e.preventDefault();open(panel)}if(e.key==='Escape'){close(panel);close(palette);close(pulse)}});
})();
