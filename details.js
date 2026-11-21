document.addEventListener("DOMContentLoaded",async()=>{
 const root=document.getElementById("details-root"),id=new URLSearchParams(location.search).get("id");
 if(!jdnexia.ready){root.innerHTML='<div class="empty-state">Configurez Supabase pour afficher le catalogue.</div>';return}
 const {data:item,error}=await jdnexia.client.from("contents").select("*").eq("id",id).eq("published",true).single();
 if(error||!item){root.innerHTML='<div class="empty-state">Contenu introuvable.</div>';return}
 document.title=item.title+" — JDNEXIA";
 let episodes=[];
 if(item.type==="series"){const r=await jdnexia.client.from("episodes").select("*").eq("series_id",item.id).eq("published",true).order("season_number").order("episode_number");episodes=r.data||[]}
 root.innerHTML=`<section class="details-hero"><img class="details-poster" src="${item.poster_url||""}" onerror="this.style.display='none'"><div class="details-copy"><span class="eyebrow">${item.type==="series"?"SÉRIE":"FILM / VIDÉO"}</span><h1>${esc(item.title)}</h1><div class="meta">${esc(item.genre||"")}${item.release_year?" · "+item.release_year:""}</div><p>${esc(item.description||"Aucune description disponible.")}</p>${item.type==="film"?`<a class="btn btn-primary" href="watch.html?id=${item.id}">▶ Regarder maintenant</a>`:""}</div></section>${item.type==="series"?`<h2 class="season-heading">Épisodes</h2><div class="episode-list">${episodes.length?episodes.map(e=>`<a class="episode-row" href="watch.html?episode=${e.id}"><b>S${String(e.season_number).padStart(2,"0")} · E${String(e.episode_number).padStart(2,"0")} — ${esc(e.title)}</b><span>▶ Regarder</span></a>`).join(""):'<div class="empty-state">Aucun épisode publié pour le moment.</div>'}</div>`:""}`;
});
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
