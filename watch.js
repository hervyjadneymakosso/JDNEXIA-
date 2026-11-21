document.addEventListener("DOMContentLoaded",async()=>{
 const root=document.getElementById("watch-root"),p=new URLSearchParams(location.search),id=p.get("id"),episode=p.get("episode");
 if(!jdnexia.ready){root.innerHTML='<div class="empty-state">Le lecteur est momentanément indisponible.</div>';return}
 let item=null,ep=null,next=null,previous=null,series=null;
 if(episode){
  const r=await jdnexia.client.from("episodes").select("*").eq("id",episode).eq("published",true).single();
  ep=r.data;
  if(ep){
   const sr=await jdnexia.client.from("contents").select("id,title,description,poster_url,category").eq("id",ep.series_id).single();
   series=sr.data;item={id:ep.series_id,title:ep.title,description:ep.description||series?.description||"",youtube_url:ep.youtube_url,poster_url:series?.poster_url};
   const lr=await jdnexia.client.from("episodes").select("id,title,episode_number,season_number").eq("series_id",ep.series_id).eq("published",true).order("season_number").order("episode_number");
   const arr=lr.data||[],i=arr.findIndex(x=>x.id===ep.id);next=arr[i+1]||null;previous=arr[i-1]||null;
  }
 }else{
  const r=await jdnexia.client.from("contents").select("*").eq("id",id).eq("published",true).single();item=r.data;
 }
 if(!item||!item.youtube_url){root.innerHTML='<div class="empty-state">Cette vidéo est momentanément indisponible.</div>';return}
 const videoId=getYoutubeId(item.youtube_url);
 if(!videoId){root.innerHTML='<div class="empty-state">Lien vidéo invalide. Ajoutez un lien YouTube valide.</div>';return}
 const {data:{user}}=await jdnexia.client.auth.getUser();
 if(user){
  await jdnexia.client.from("watch_history").upsert({user_id:user.id,content_id:item.id,episode_id:ep?.id||null,watched_at:new Date().toISOString(),progress_seconds:0},{onConflict:"user_id,content_id"});
 }
 document.title=item.title+" — JDNEXIA";
 root.innerHTML=`
  <div class="watch-crumb"><a href="index.html">Accueil</a><span>›</span><a href="${episode&&series?"details.html?id="+series.id:(item.id?"details.html?id="+item.id:"#")}">${esc(series?.title||"Catalogue")}</a><span>›</span><span>Lecture</span></div>
  <section class="jx-player-card">
   <div class="jx-player-top"><div><span class="eyebrow">JDNEXIA ORIGINAL EXPERIENCE</span><h1>${esc(item.title)}</h1><p>${episode?"Saison "+ep.season_number+" · Épisode "+ep.episode_number:(item.category||"Film & vidéo")}</p></div><span class="jx-live-dot">LECTURE</span></div>
   <div class="jx-player-screen"><div class="jx-player-loader">JDNEXIA</div><iframe src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1&iv_load_policy=3" title="${esc(item.title)} — JDNEXIA" loading="eager" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>
   <div class="jx-player-under"><span>Diffusion via YouTube</span><a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener">Ouvrir sur YouTube ↗</a></div>
  </section>
  <section class="jx-watch-info"><div class="jx-watch-copy"><span class="eyebrow">À PROPOS</span><h2>${esc(item.title)}</h2><p>${esc(item.description||"Aucune description disponible.")}</p></div><div class="jx-watch-nav">${previous?'<a class="btn btn-ghost" href="watch.html?episode='+previous.id+'">← Précédent</a>':""}${next?'<a class="btn btn-primary" href="watch.html?episode='+next.id+'">Épisode suivant →</a>':""}<a class="btn btn-ghost" href="${series?"details.html?id="+series.id:"films.html"}">Retour aux détails</a></div></section>`;
});
function getYoutubeId(raw){try{const u=new URL(raw);const host=u.hostname.replace(/^www\./,"");let id=null;if(host==="youtu.be")id=u.pathname.split("/").filter(Boolean)[0];else if(host.endsWith("youtube.com"))id=u.searchParams.get("v")||u.pathname.split("/").filter(Boolean).pop();return id&&/^[A-Za-z0-9_-]{11}$/.test(id)?id:null}catch(e){return null}}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
