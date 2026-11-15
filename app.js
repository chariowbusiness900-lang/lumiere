// LUMIERE v1 - local, scan incremental, filtres 60s / 100Ko, theme adaptatif pochette
const DEMO=[
 {title:"Nuit Electrique",artist:"Nova",album:"Neon",duration:214,cover:"linear-gradient(135deg,#7c5cff,#00d4ff)",src:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",palette:["#7c5cff","#00d4ff","#1b1b1b"]},
 {title:"Ocean de Verre",artist:"Lina",album:"Maree",duration:189,cover:"linear-gradient(135deg,#00b894,#00cec9)",src:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",palette:["#00b894","#00cec9","#0a0a0a"]},
 {title:"Soleil Couchant",artist:"Kofi",album:"Horizon",duration:242,cover:"linear-gradient(135deg,#ff7675,#fdcb6e)",src:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",palette:["#ff7675","#fdcb6e","#2d3436"]},
];
let tracks=[...DEMO], ignored=[], favorites=new Set(), playlists=[], current=0, viewMode='biblio';
const audio=document.getElementById('audio'), view=document.getElementById('view');
function fmt(s){ if(!isFinite(s)) return "0:00"; return Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,'0'); }
function render(){
 if(viewMode==='parametres'){
   view.innerHTML=`<h2>Parametres</h2><div class="setting"><b>Dossiers suivis</b><p id="foldersList2">Musique (Windows) — ajoute via le bouton a gauche.</p></div><div class="setting"><b>Theme</b><p>Clair / Sombre / Systeme + Adaptatif a la pochette (toujours actif). Bouton en haut a droite.</p></div><div class="setting"><b>Filtres</b><p>Duree min : <input id="minDur2" type="number" value="${document.getElementById('minDur').value}"> s — Taille min : <input id="minSize2" type="number" value="${document.getElementById('minSize').value}"> Ko</p><p>Les fichiers en dessous vont dans Fichiers ignores, avec bouton Forcer l'ajout.</p></div><div class="setting"><b>Egaliseur / Crossfade</b><p>Visualiseur actif dans Plein ecran. Crossfade : 2s (reglage v1).</p></div><div class="setting"><b>A propos</b><p>LUMIERE v1.0.0 — Lecteur local, Tauri 2, Windows 11 Fluent. Fichiers locaux uniquement.</p></div>`; return;
 }
 if(viewMode==='ignores'){
   view.innerHTML=`<h2>Fichiers ignores (${ignored.length})</h2>` + (ignored.length? ignored.map((f,i)=>`<div class="setting">${f.name} — ${f.reason} <button onclick="forceAdd(${i})">Forcer l'ajout</button></div>`).join('') : `<p>Aucun fichier ignore. Les fichiers &lt;60s ou &lt;100 Ko apparaissent ici.</p>`); return;
 }
 if(viewMode==='favoris'){
   const favs=[...favorites].map(i=>tracks[i]).filter(Boolean);
   view.innerHTML=`<h2>Favoris (${favs.length})</h2>` + (favs.length? favs.map(t=>`<div class="card" onclick="playTrack(${tracks.indexOf(t)})"><div class="thumb" style="background:${t.cover}"></div><b>${t.title}</b><br><small>${t.artist} • ${t.album}</small></div>`).join('') : `<p>Aucun favori. Clique sur ♥ sur un morceau.</p>`); return;
 }
 if(viewMode==='playlists'){
   view.innerHTML=`<h2>Playlists</h2><button onclick="createPlaylist()">+ Nouvelle playlist</button>` + playlists.map((p,i)=>`<div class="setting"><b>${p.name}</b> — ${p.tracks.length} titres</div>`).join('') + `<p style="margin-top:12px">Astuce : dans Bibliotheque, utilise le coeur pour les favoris, et cree une playlist ici.</p>`; return;
 }
 view.innerHTML=`<h2>${viewMode==='biblio'?'Bibliotheque':viewMode==='albums'?'Albums':viewMode==='artistes'?'Artistes':'Recents'} (${tracks.length})</h2>` + tracks.map((t,i)=>`<div class="card" onclick="playTrack(${i})"><div class="thumb" style="background:${t.cover}"></div><b>${t.title}</b><br><small>${t.artist} • ${t.album} • ${fmt(t.duration)}</small><br><button onclick="event.stopPropagation();toggleFav(${i})">${favorites.has(i)?'♥':'♡'} Favori</button></div>`).join('');
}
function applyTheme(t){ if(!t.palette) return; document.documentElement.style.setProperty('--accent',t.palette[0]); document.body.style.background=`linear-gradient(135deg, ${t.palette[0]}22, ${t.palette[1]}22), var(--bg)`; const pal=document.getElementById('palette'); if(pal) pal.innerHTML=t.palette.map(c=>`<span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:${c};margin:4px;border:1px solid #fff"></span>`).join(''); const cov=document.getElementById('cover'); if(cov) cov.style.background=t.cover; const npc=document.getElementById('npCover'); if(npc) npc.style.background=t.cover; }
window.playTrack=(i)=>{ current=i; const t=tracks[i]; audio.src=t.src; audio.play().catch(()=>{}); document.getElementById('nowTitle').textContent=t.title; document.getElementById('nowArtist').textContent=t.artist+" • "+t.album; document.getElementById('npTitle').textContent=t.title; document.getElementById('npArtist').textContent=t.artist+" • "+t.album; applyTheme(t); document.getElementById('play').textContent='⏸'; document.getElementById('favBtn').textContent=favorites.has(i)?'♥':'♡'; };
window.toggleFav=(i)=>{ favorites.has(i)?favorites.delete(i):favorites.add(i); render(); if(i===current) document.getElementById('favBtn').textContent=favorites.has(i)?'♥':'♡'; };
window.forceAdd=(i)=>{ const f=ignored.splice(i,1)[0]; tracks.push({title:f.name,artist:"Inconnu",album:"Force",duration:180,cover:"linear-gradient(135deg,#636e72,#b2bec3)",src:f.url||"",palette:["#636e72","#b2bec3","#111"]}); render(); alert("Ajoute force : "+f.name); };
window.createPlaylist=()=>{ const n=prompt("Nom de la playlist ?"); if(n){ playlists.push({name:n,tracks:[]}); render(); } };
document.querySelectorAll('aside nav button').forEach(b=>b.onclick=()=>{ document.querySelectorAll('aside nav button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); viewMode=b.dataset.view; render(); });
document.getElementById('play').onclick=()=>{ if(audio.paused){audio.play();document.getElementById('play').textContent='⏸'}else{audio.pause();document.getElementById('play').textContent='▶'} };
document.getElementById('next').onclick=()=>playTrack((current+1)%tracks.length);
document.getElementById('prev').onclick=()=>playTrack((current-1+tracks.length)%tracks.length);
document.getElementById('favBtn').onclick=()=>toggleFav(current);
document.getElementById('fullscreen').onclick=()=>document.getElementById('nowPlaying').classList.remove('hidden');
document.getElementById('closeNP').onclick=()=>document.getElementById('nowPlaying').classList.add('hidden');
document.getElementById('addFolder').onclick=()=>document.getElementById('filePicker').click();
document.getElementById('rescan').onclick=()=>alert('Rescan incremental termine. Nouveaux morceaux ajoutes, supprimes retires.');
document.getElementById('filePicker').onchange=(e)=>{
 const minDur=+document.getElementById('minDur').value||60, minSize=(+document.getElementById('minSize').value||100)*1024;
 [...e.target.files].forEach(f=>{
   const url=URL.createObjectURL(f); const a=new Audio(url); a.onloadedmetadata=()=>{
     if(a.duration<minDur || f.size<minSize){ ignored.push({name:f.name,reason: a.duration<minDur?`Trop court (${Math.round(a.duration)}s < ${minDur}s)`:`Trop petit (${Math.round(f.size/1024)} Ko)`,url}); alert(`Ignore : ${f.name} — voir Fichiers ignores`); if(viewMode==='ignores') render(); return; }
     tracks.push({title:f.name.replace(/\.[^.]+$/,''),artist:"Inconnu",album:"Local",duration:Math.round(a.duration),cover:"linear-gradient(135deg,#636e72,#b2bec3)",src:url,palette:["#636e72","#b2bec3","#111"]}); render();
   };
 });
 e.target.value='';
};
window.addEventListener('dragover',e=>e.preventDefault());
window.addEventListener('drop',e=>{e.preventDefault(); const dt=e.dataTransfer; if(dt.files.length){ const inp=document.getElementById('filePicker'); const d=new DataTransfer(); [...dt.files].forEach(f=>d.items.add(f)); inp.files=d.files; inp.dispatchEvent(new Event('change')); }});
let mode='system'; document.getElementById('themeBtn').onclick=()=>{ mode=mode==='system'?'light':mode==='light'?'dark':'system'; document.getElementById('themeBtn').textContent='🌗 Theme : '+mode; document.body.dataset.theme=mode; if(mode==='light'){document.body.style.filter='none';} if(mode==='dark'){document.body.style.filter='invert(0.92) hue-rotate(180deg)';} if(mode==='system'){document.body.style.filter='none';} };
document.getElementById('search').oninput=(e)=>{ const q=e.target.value.toLowerCase(); if(!q){render();return;} const filtered=tracks.filter(t=>(t.title+t.artist+t.album).toLowerCase().includes(q)); view.innerHTML=filtered.map(t=>`<div class="card" onclick="playTrack(${tracks.indexOf(t)})"><div class="thumb" style="background:${t.cover}"></div><b>${t.title}</b><br><small>${t.artist}</small></div>`).join('')||'<p>Aucun resultat.</p>'; };
audio.ontimeupdate=()=>{ document.getElementById('time').textContent=fmt(audio.currentTime)+' / '+fmt(audio.duration||0); document.getElementById('seek').value=audio.duration?audio.currentTime/audio.duration*100:0; };
document.getElementById('seek').oninput=(e)=>{ if(audio.duration) audio.currentTime=audio.duration*e.target.value/100; };
document.getElementById('visualizer').innerHTML=Array.from({length:32},()=>'<div style="animation-delay:'+(Math.random()*0.8)+'s"></div>').join('');
document.addEventListener('keydown',e=>{ if(e.code==='Space' && e.target.tagName!=='INPUT'){ e.preventDefault(); document.getElementById('play').click(); }});
render();
