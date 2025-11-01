/* script.js — EvoLife main app */

const click = id => document.getElementById(id).play().catch(()=>{});
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* particle background simple canvas */
(function createParticles(){
  const scene = document.getElementById('scene');
  const canvas = document.createElement('canvas');
  scene.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let w, h, particles=[];
  function resize(){ w = canvas.width = innerWidth; h = canvas.height = innerHeight;}
  window.addEventListener('resize', resize); resize();

  class P{ constructor(){ this.reset(); }
    reset(){ this.x = Math.random()*w; this.y = Math.random()*h; this.r = Math.random()*1.6+0.6; this.vx = (Math.random()-0.5)*0.2; this.vy = (Math.random()-0.5)*0.2; this.alpha = 0.08+Math.random()*0.12; }
    draw(){ ctx.beginPath(); ctx.fillStyle = `rgba(13,255,230,${this.alpha})`; ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill(); }
    step(){ this.x += this.vx; this.y += this.vy; if(this.x<0||this.x>w||this.y<0||this.y>h) this.reset(); }
  }
  for(let i=0;i<120;i++) particles.push(new P());
  (function anim(){ ctx.clearRect(0,0,w,h); particles.forEach(p=>{p.step();p.draw()}); requestAnimationFrame(anim); })();
})();

/* theme */
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('evo_theme');
if(savedTheme === 'light') document.body.classList.add('light');
themeToggle.addEventListener('click', ()=> {
  document.body.classList.toggle('light');
  localStorage.setItem('evo_theme', document.body.classList.contains('light') ? 'light':'dark');
  click('click');
});

/* audio setup */
try{ document.getElementById('click').volume = 0.7; document.getElementById('success').volume = 0.7; }catch(e){}

/* features list */
const features = [
  { id:'notesModule', title:'Notes', icon:'assets/icons/note.png', desc:'Quick notes, saved offline' },
  { id:'plannerModule', title:'Planner', icon:'assets/icons/planner.png', desc:'Daily tasks & reminders' },
  { id:'moodModule', title:'Mood', icon:'assets/icons/mood.png', desc:'Track and reflect' },
  { id:'toolsModule', title:'Tools', icon:'assets/icons/tools.png', desc:'Calculator, Converter' },
  { id:'vaultModule', title:'Vault', icon:'assets/icons/vault.png', desc:'Secure private notes' },
];

/* render feature cards */
const grid = document.getElementById('featureGrid');
features.forEach(f=>{
  const el = document.createElement('div');
  el.className='feature-card';
  el.innerHTML = `<img src="${f.icon}" alt="${f.title}"><div><strong>${f.title}</strong><div class="muted">${f.desc}</div></div>`;
  el.onclick = ()=> { click('click'); showModule(f.id); el.animate([{transform:'translateY(0px)'},{transform:'translateY(-6px)'}],{duration:300,fill:'forwards'}); };
  grid.appendChild(el);
});

/* show module */
function showModule(id){
  document.querySelectorAll('.module').forEach(m=>m.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  window.scrollTo({top: document.getElementById(id).offsetTop - 60, behavior:'smooth'});
}

/* hero quote load */
fetch('data/quotes.json').then(r=>r.json()).then(list=>{
  const q = list[Math.floor(Math.random()*list.length)];
  document.getElementById('heroQuote').textContent = q;
}).catch(()=>{ document.getElementById('heroQuote').textContent = 'Keep going — small steps matter.'; });

/* NOTES */
function saveNote(){
  const v = document.getElementById('noteInput').value.trim(); if(!v) return alert('Type a note');
  const notes = JSON.parse(localStorage.getItem('evo_notes')||'[]'); notes.unshift({text:v,time:Date.now()}); localStorage.setItem('evo_notes',JSON.stringify(notes));
  document.getElementById('noteInput').value=''; displayNotes(); click('success');
}
function displayNotes(){
  const list = JSON.parse(localStorage.getItem('evo_notes')||'[]'); const ul = document.getElementById('noteList'); ul.innerHTML='';
  list.forEach((n,i)=> { const li = document.createElement('li'); li.innerHTML = `<div><strong>${new Date(n.time).toLocaleString()}</strong><div>${escapeHtml(n.text)}</div></div><div><button onclick="deleteNote(${i})" class="ghost">Del</button></div>`; ul.appendChild(li); });
}
function deleteNote(i){ const arr = JSON.parse(localStorage.getItem('evo_notes')||'[]'); arr.splice(i,1); localStorage.setItem('evo_notes',JSON.stringify(arr)); displayNotes(); }
function clearNotes(){ if(confirm('Clear all notes?')){ localStorage.removeItem('evo_notes'); displayNotes(); } }
displayNotes();

/* PLANNER */
function addTask(){ const v = document.getElementById('taskInput').value.trim(); if(!v) return alert('Enter task'); const tasks = JSON.parse(localStorage.getItem('evo_tasks')||'[]'); tasks.push({text:v,done:false}); localStorage.setItem('evo_tasks',JSON.stringify(tasks)); document.getElementById('taskInput').value=''; displayTasks(); click('success');}
function displayTasks(){ const arr = JSON.parse(localStorage.getItem('evo_tasks')||'[]'); const ul = document.getElementById('taskList'); ul.innerHTML=''; arr.forEach((t,i)=>{ const li=document.createElement('li'); li.innerHTML = `<div><input type="checkbox" ${t.done?'checked':''} onchange="toggleTask(${i})"> ${escapeHtml(t.text)}</div><div><button onclick="deleteTask(${i})" class="ghost">Del</button></div>`; ul.appendChild(li); }); }
function toggleTask(i){ const arr = JSON.parse(localStorage.getItem('evo_tasks')||'[]'); arr[i].done = !arr[i].done; localStorage.setItem('evo_tasks',JSON.stringify(arr)); displayTasks(); }
function deleteTask(i){ const arr = JSON.parse(localStorage.getItem('evo_tasks')||'[]'); arr.splice(i,1); localStorage.setItem('evo_tasks',JSON.stringify(arr)); displayTasks(); }
displayTasks();

/* MOOD */
fetch('data/moods.json').then(r=>r.json()).then(list=>{
  const box = document.getElementById('moodButtons'); box.innerHTML='';
  list.forEach(m=>{
    const b = document.createElement('button'); b.textContent = m; b.onclick = ()=> saveMood(m); box.appendChild(b);
  });
  const last = localStorage.getItem('evo_lastMood'); if(last) document.getElementById('lastMood').textContent = 'Last mood: '+last;
}).catch(()=>{});
function saveMood(m){
  localStorage.setItem('evo_lastMood', m);
  alert('Mood saved: '+m);
  click('success');
}

/* TOOLS - calculator simple implementation */
function openCalculator(){ document.getElementById('calc').classList.toggle('hidden'); click('click'); }
(function buildCalc(){
  const grid = document.querySelector('.calc-grid'); if(!grid) return;
  const keys = ['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'];
  keys.forEach(k=>{
    const btn = document.createElement('button'); btn.textContent = k; btn.onclick = ()=> pressCalc(k); grid.appendChild(btn);
  });
})();
function pressCalc(k){
  const d = document.getElementById('calcDisplay');
  if(!d) return;
  if(k==='C'){ d.value=''; return; }
  if(k==='='){ try{ d.value = eval(d.value||'0'); }catch(e){ alert('Invalid'); } return; }
  d.value = (d.value || '') + k;
}
function toggleConverter(){ document.getElementById('converter').classList.toggle('hidden'); click('click'); }
function convertUnit(){
  const v = parseFloat(document.getElementById('convVal').value||0); const from = document.getElementById('convFrom').value; const to = document.getElementById('convTo').value;
  if(isNaN(v)){ alert('Enter number'); return; }
  let meters = v; if(from==='km') meters = v*1000; if(from==='cm') meters = v/100;
  let out = meters; if(to==='km') out = meters/1000; if(to==='cm') out = meters*100;
  document.getElementById('convOut').textContent = `${v} ${from} = ${out} ${to}`; click('success');
}
function notifyFlashlight(){ alert('Flashlight: Not available in HTML app. Use quick settings for torch.'); }

/* VAULT - simple base64 obfuscation */
if(!localStorage.getItem('evo_vault_pin')) localStorage.setItem('evo_vault_pin','1234');
function unlockVault(){
  const p = document.getElementById('vaultPin').value;
  if(p === localStorage.getItem('evo_vault_pin')){ document.getElementById('vaultArea').classList.remove('hidden'); document.getElementById('vaultTextarea').value = decodeVault(); click('success'); }
  else alert('Wrong PIN');
}
function setNewPin(){ const np = prompt('Enter new PIN (4-8 digits)'); if(np && np.length>=4) { localStorage.setItem('evo_vault_pin', np); alert('PIN updated'); } }
function saveVault(){ const text = document.getElementById('vaultTextarea').value || ''; localStorage.setItem('evo_vault_note', btoa(unescape(encodeURIComponent(text)))); alert('Saved'); click('success'); }
function clearVault(){ if(confirm('Clear vault note?')){ localStorage.removeItem('evo_vault_note'); document.getElementById('vaultTextarea').value=''; } }
function decodeVault(){ try{ return decodeURIComponent(escape(atob(localStorage.getItem('evo_vault_note')||''))) }catch(e){ return ''; }}

/* AI chat interactions using local EvoAI in ai.js */

const chatBox = document.getElementById('chatBox');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');
const clearChatBtn = document.getElementById('clearChat');

function addChat(who, text){
  const d = document.createElement('div');
  d.className = 'chat-msg ' + (who==='Evo' ? 'ai' : 'you');
  d.textContent = text;
  chatBox.appendChild(d);
  chatBox.scrollTop = chatBox.scrollHeight;
}

/* send handler */
sendBtn.addEventListener('click', ()=> {
  const t = chatInput.value.trim(); if(!t) return; addChat('You',t); chatInput.value=''; click('click');
  respondTo(t);
});
chatInput.addEventListener('keydown', e=>{ if(e.key === 'Enter') sendBtn.click(); });

/* clear chat */
clearChatBtn.addEventListener('click', ()=>{ chatBox.innerHTML=''; });

/* speech recognition (if available) */
let recognition = null;
if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR(); recognition.lang = 'en-US'; recognition.interimResults = false;
  recognition.onresult = e => { const t = e.results[0][0].transcript; addChat('You', t); respondTo(t); };
  recognition.onerror = () => alert('Speech recognition not available');
}
micBtn.addEventListener('click', ()=> {
  if(!recognition) { alert('Speech not supported in this WebView/browser'); return; }
  try{ recognition.start(); }catch(e){ console.warn(e); }
});

/* respondTo uses EvoAI.evoReply (in ai.js) */
function respondTo(text){
  try{
    const r = EvoAI.evoReply(text);
    if(r && r.reply){
      setTimeout(()=>{ addChat('Evo', r.reply); click('success'); }, 350);
      if(r.action) handleAIAction(r.action);
    }
  }catch(e){
    addChat('Evo', "I had trouble thinking — try again.");
  }
}

/* handle actions from AI */
function handleAIAction(action){
  if(action.startsWith('mood:')){
    const mood = action.split(':')[1]; localStorage.setItem('evo_lastMood', mood); document.getElementById('lastMood').textContent = 'Last mood: '+mood;
  }
  if(action === 'suggest_breathe'){
    alert('Try this: Inhale 4s — Hold 4s — Exhale 6s — Repeat 4 times.');
  }
  if(action === 'quote'){
    fetch('data/quotes.json').then(r=>r.json()).then(list=>{ addChat('Evo', list[Math.floor(Math.random()*list.length)]); });
  }
}

/* small helpers */
function escapeHtml(s){ return (s+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(() => console.log('Service Worker registered!'))
    .catch((err) => console.log('Service Worker failed:', err));
}