(function(){
'use strict';
const KEY='lifeos_v1', CFG='lifeos_cloud_cfg_v1';
const $=s=>document.querySelector(s);
let cloud={url:'',key:'',email:'',token:'',refresh:''};
try{cloud={...cloud,...JSON.parse(localStorage.getItem(CFG)||'{}')}}catch{}
function toast(t){let n=$('.x37-toast');if(!n)return;n.textContent=t;n.classList.add('show');clearTimeout(n._t);n._t=setTimeout(()=>n.classList.remove('show'),2200)}
function state(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function open(){let p=$('.x37-sync');if(p)p.classList.add('open')}
function close(){let p=$('.x37-sync');if(p)p.classList.remove('open')}
function status(){let pill=$('#x37Status'); if(!pill)return; pill.textContent=cloud.token?'CLOUD READY':'LOCAL ONLY'; pill.style.color=cloud.token?'var(--x37-green)':'var(--x37-cyan)'}
function render(){if($('.x37-fab'))return;document.body.insertAdjacentHTML('beforeend',`<button class="x37-fab" id="x37Fab" aria-label="Sync Center">⌁</button><div class="x37-sync" id="x37Panel"><div class="x37-sync-head"><b>AURA SYNC CENTER</b><span class="x37-pill" id="x37Status">LOCAL ONLY</span></div><p>LifeOS را روی ویندوز و موبایل مثل یک اپ نصب کن. برای همگام‌سازی واقعی بین دستگاه‌ها، Supabase را یک‌بار وصل کن.</p><div class="x37-sync-actions"><button id="x37Install">＋ نصب اپ</button><button id="x37Export">⇩ پشتیبان</button><button id="x37Import">⇧ بازیابی</button><button id="x37Cloud">☁ تنظیم Cloud</button></div><div id="x37CloudBox" style="display:none;margin-top:10px"><input id="x37Url" placeholder="Supabase URL" value="${esc(cloud.url)}"><input id="x37Key" placeholder="Supabase anon key" value="${esc(cloud.key)}"><input id="x37Email" type="email" placeholder="ایمیل حساب" value="${esc(cloud.email)}"><input id="x37Pass" type="password" placeholder="رمز عبور (برای ورود/ثبت‌نام)"><div class="x37-sync-actions"><button id="x37Signup">ثبت‌نام</button><button id="x37Login">ورود و Sync</button></div><small>کلید باید anon/public باشد؛ هرگز service_role key را داخل این اپ قرار نده.</small></div><input id="x37File" type="file" accept="application/json" hidden></div><div class="x37-toast"></div>`);status();
$('#x37Fab').onclick=()=>{$('#x37Panel').classList.toggle('open')};
$('#x37Install').onclick=install;
$('#x37Export').onclick=exportData;
$('#x37Import').onclick=()=>$('#x37File').click();
$('#x37File').onchange=e=>importData(e.target.files[0]);
$('#x37Cloud').onclick=()=>{let b=$('#x37CloudBox');b.style.display=b.style.display==='none'?'block':'none'};
$('#x37Signup').onclick=()=>auth('signup'); $('#x37Login').onclick=()=>auth('login');
}
let deferred=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e});
async function install(){if(deferred){deferred.prompt();await deferred.userChoice;deferred=null;return}toast('در Chrome/Edge از منوی مرورگر «Install LifeOS» را بزن؛ در iPhone از Share → Add to Home Screen استفاده کن.')}
function exportData(){let blob=new Blob([JSON.stringify(state(),null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='lifeos-backup.json';a.click();URL.revokeObjectURL(a.href);toast('پشتیبان ساخته شد ✓')}
function importData(file){if(!file)return;let r=new FileReader();r.onload=()=>{try{let d=JSON.parse(r.result);if(!d||typeof d!=='object')throw 0;if(!confirm('اطلاعات فعلی با این پشتیبان جایگزین شود؟'))return;localStorage.setItem(KEY,JSON.stringify(d));location.reload()}catch{toast('فایل پشتیبان معتبر نیست')}};r.readAsText(file)}
function cfg(){cloud.url=($('#x37Url')?.value||cloud.url).replace(/\/$/,'');cloud.key=$('#x37Key')?.value||cloud.key;cloud.email=$('#x37Email')?.value||cloud.email;localStorage.setItem(CFG,JSON.stringify(cloud))}
async function auth(mode){cfg();let pass=$('#x37Pass')?.value;if(!cloud.url||!cloud.key||!cloud.email||!pass){toast('URL، anon key، ایمیل و رمز را کامل کن');return}let endpoint=cloud.url+'/auth/v1/'+(mode==='signup'?'signup':'token?grant_type=password');try{let res=await fetch(endpoint,{method:'POST',headers:{apikey:cloud.key,'Content-Type':'application/json'},body:JSON.stringify({email:cloud.email,password:pass})});let data=await res.json();if(!res.ok)throw new Error(data.msg||data.error_description||'خطا');cloud.token=data.access_token;cloud.refresh=data.refresh_token;localStorage.setItem(CFG,JSON.stringify(cloud));status();await push();toast(mode==='signup'?'حساب ساخته شد ✓':'وارد شدی؛ Sync انجام شد ✓')}catch(e){toast(e.message||'اتصال ناموفق بود')}}
async function push(){if(!cloud.url||!cloud.key||!cloud.token)return false;let user=JSON.parse(atob(cloud.token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));let uid=user.sub;let res=await fetch(cloud.url+'/rest/v1/lifeos_state?on_conflict=user_id',{method:'POST',headers:{apikey:cloud.key,Authorization:'Bearer '+cloud.token,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:uid,state:state(),updated_at:new Date().toISOString()})});return res.ok}
async function pull(){if(!cloud.url||!cloud.key||!cloud.token)return false;let user=JSON.parse(atob(cloud.token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));let res=await fetch(cloud.url+'/rest/v1/lifeos_state?select=state,updated_at&user_id=eq.'+encodeURIComponent(user.sub),{headers:{apikey:cloud.key,Authorization:'Bearer '+cloud.token}});if(!res.ok)return false;let rows=await res.json();if(rows[0]?.state){localStorage.setItem(KEY,JSON.stringify(rows[0].state));return true}return false}
let last='';setInterval(()=>{let s=localStorage.getItem(KEY)||'';if(s!==last){last=s;if(cloud.token)push().catch(()=>{})}},2500);
window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){try{if(typeof renderAll==='function')renderAll()}catch{}}});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
window.lifeosCloud={push,pull,open};
render();
})();
