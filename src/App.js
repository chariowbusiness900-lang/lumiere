// LUMIERE - logic, pro, no emoji
const $ = (id) => document.getElementById(id);
let tracks = [];
let current = -1;
let favs = new Set();
let viewMode = 'biblio';

function fmt(s){ if(!isFinite(s)) return '0:00'; s=Math.floor(s); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
function setTheme(t){
  document.documentElement.setAttribute('data-theme', t);
  const lbl = $('themeLabel'); if(lbl) lbl.textContent = t==='dark' ? 'Sombre' : 'Clair';
  try{ localStorage.setItem('lumiere-theme', t); }catch(e){}
}
function initTheme(){
  let t='light';
  try{ t = localStorage.getItem('lumiere-theme') || 'light'; }catch(e){}
  if(t==='system'){ t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  setTheme(t);
}
function playIcon(paused){
  const el = $('playIcon'); if(!el) return;
  el.innerHTML = paused ? '<path d="M7 4.5v15l13-7.5z"/>' : '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/>';
}
function render(){
  const grid = $('grid'); const empty = $('emptyState');
  if(!grid) return;
  const q = ($('search')?.value || '').toLowerCase();
  const minDur = parseFloat($('minDur')?.value || 60);
  const minSize = parseFloat($('minSize')?.value || 100);
  let list = tracks.filter(t => (t.name||'').toLowerCase().includes(q) || (t.artist||'').toLowerCase().includes(q));
  if(viewMode==='favoris') list = list.filter(t => favs.has(t.id));
  if(viewMode==='ignores') list = tracks.filter(t => t.ignored);
  const badge = $('countBadge'); if(badge) badge.textContent = String(tracks.length);
  grid.innerHTML = '';
  if(!list.length){ if(empty) empty.style.display='block'; return; }
  if(empty) empty.style.display='none';
  list.forEach((t)=>{
    const d=document.createElement('div'); d.className='card';
    d.innerHTML = '<div class="cover"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2.5"/><circle cx="17" cy="16" r="2.5"/></svg></div><b></b><small></small>';
    d.querySelector('b').textContent = t.name;
    d.querySelector('small').textContent = (t.artist||'Inconnu') + (t.duration ? ' — ' + fmt(t.duration) : '');
    d.onclick = ()=> play(tracks.indexOf(t));
    grid.appendChild(d);
  });
}
function play(i){
  if(i<0||i>=tracks.length) return;
  current=i; const t=tracks[i]; const audio=$('audio');
  audio.src=t.url; audio.play().catch(()=>{});
  $('nowTitle').textContent=t.name; $('nowArtist').textContent=t.artist||'';
  $('npTitle').textContent=t.name; $('npArtist').textContent=t.artist||'';
  playIcon(false);
}
function togglePlay(){
  const audio=$('audio'); if(!tracks.length) return;
  if(audio.paused){ audio.play(); playIcon(false); } else { audio.pause(); playIcon(true); }
}
document.addEventListener('DOMContentLoaded', ()=>{
  initTheme();
  const themeBtn=$('themeBtn'); if(themeBtn) themeBtn.onclick=()=>{ const cur=document.documentElement.getAttribute('data-theme'); setTheme(cur==='dark'?'light':'dark'); };
  document.querySelectorAll('aside nav button').forEach(b=>{
    b.onclick=()=>{ document.querySelectorAll('aside nav button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); viewMode=b.getAttribute('data-view')||'biblio'; render(); };
  });
  const filePicker=$('filePicker');
  const addFolder=$('addFolder'); if(addFolder) addFolder.onclick=()=> filePicker.click();
  if(filePicker) filePicker.onchange=(e)=>{
    const minDur=parseFloat($('minDur')?.value||60); const minSize=parseFloat($('minSize')?.value||100);
    [...e.target.files].forEach(f=>{
      const url=URL.createObjectURL(f);
      const item={ id: Date.now()+Math.random(), name: f.name.replace(/\.[^.]+$/,''), artist:'Local', url, sizeKo: f.size/1024, duration: 0, ignored:false };
      if(item.sizeKo < minSize) item.ignored=true;
      tracks.push(item);
      const a=new Audio(); a.src=url; a.onloadedmetadata=()=>{ item.duration=a.duration; if(item.duration < minDur) item.ignored=true; render(); };
    });
    render(); if(current===-1 && tracks.length) play(0);
  };
  const rescan=$('rescan'); if(rescan) rescan.onclick=()=> render();
  const search=$('search'); if(search) search.oninput=render;
  const minDurEl=$('minDur'); if(minDurEl) minDurEl.oninput=render;
  const minSizeEl=$('minSize'); if(minSizeEl) minSizeEl.oninput=render;
  const playBtn=$('play'); if(playBtn) playBtn.onclick=togglePlay;
  const prev=$('prev'); if(prev) prev.onclick=()=>{ if(current>0) play(current-1); };
  const next=$('next'); if(next) next.onclick=()=>{ if(current+1<tracks.length) play(current+1); };
  const favBtn=$('favBtn'); if(favBtn) favBtn.onclick=()=>{ if(current>=0){ const id=tracks[current].id; if(favs.has(id)) favs.delete(id); else favs.add(id); render(); } };
  const fs=$('fullscreen'); if(fs) fs.onclick=()=>{ $('nowPlaying').classList.remove('hidden'); };
  const closeNP=$('closeNP'); if(closeNP) closeNP.onclick=()=>{ $('nowPlaying').classList.add('hidden'); };
  const audio=$('audio');
  audio.ontimeupdate=()=>{ const seek=$('seek'); if(audio.duration) seek.value=(audio.currentTime/audio.duration)*100; const t=$('time'); if(t) t.textContent=fmt(audio.currentTime)+' / '+fmt(audio.duration); };
  const seek=$('seek'); if(seek) seek.oninput=()=>{ if(audio.duration) audio.currentTime=(seek.value/100)*audio.duration; };
  audio.onended=()=>{ if(current+1<tracks.length) play(current+1); else playIcon(true); };
  audio.onpause=()=> playIcon(true); audio.onplay=()=> playIcon(false);
  document.body.ondragover=(e)=> e.preventDefault();
  document.body.ondrop=(e)=>{ e.preventDefault(); if(filePicker){ filePicker.files=e.dataTransfer.files; filePicker.dispatchEvent(new Event('change')); } };
  render(); playIcon(true);
});
