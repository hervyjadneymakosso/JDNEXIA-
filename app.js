document.addEventListener("DOMContentLoaded",async()=>{
 const intro=document.getElementById("intro"),shell=document.getElementById("app-shell");
 setTimeout(()=>{intro?.classList.add("is-hidden");shell?.classList.remove("is-hidden")},2600);
 document.getElementById("year").textContent=new Date().getFullYear();
 document.getElementById("search-toggle").onclick=()=>document.getElementById("search-panel").classList.toggle("hidden");
 document.getElementById("search-go").onclick=()=>{const q=document.getElementById("global-search").value.trim();if(q)location.href="films.html?q="+encodeURIComponent(q)};
 let items=[];
 if(window.jdnexia.ready){const {data}=await jdnexia.client.from("contents").select("*").eq("published",true).order("sort_order",{ascending:true}).order("created_at",{ascending:false});items=data||[]}
 const card=x=>'<a class="poster-card" href="details.html?id='+encodeURIComponent(x.id)+'"><div class="poster-image">'+(x.poster_url?'<img src="'+esc(x.poster_url)+'" alt="">':'<div class="poster-placeholder">JDNEXIA</div>')+'<span class="poster-type">'+esc(x.category||(x.type==="series"?"Série":"Film"))+'</span></div><h3>'+esc(x.title)+'</h3><p>'+esc(x.genre||"Découverte")+' · '+(x.release_year||"Nouveau")+'</p></a>';
 document.getElementById("latest-grid").innerHTML=items.length?items.slice(0,5).map(card).join(""):'<div class="empty-state">Le catalogue sera bientôt disponible. Revenez découvrir nos premières vidéos.</div>';
 document.getElementById("series-grid").innerHTML=items.filter(x=>x.type==="series").slice(0,5).map(card).join("")||'<div class="empty-state">Les premières séries arrivent bientôt.</div>';
});
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
