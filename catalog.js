document.addEventListener("DOMContentLoaded",async()=>{
 const kind=location.pathname.includes("series")?"series":"film",grid=document.getElementById("catalog-grid"),search=document.getElementById("catalog-search"),genre=document.getElementById("genre-filter");
 let rows=[];
 if(jdnexia.ready){const r=await jdnexia.client.from("contents").select("*").eq("published",true).eq("type",kind).order("sort_order",{ascending:true}).order("created_at",{ascending:false});rows=r.data||[]}
 const genres=[...new Set(rows.map(x=>x.genre).filter(Boolean))];
 genres.forEach(g=>genre.insertAdjacentHTML("beforeend",'<option value="'+esc(g)+'">'+esc(g)+'</option>'));
 const render=()=>{
  const q=search.value.toLowerCase(),g=genre.value;
  const filtered=rows.filter(x=>(x.title.toLowerCase().includes(q)||String(x.description||"").toLowerCase().includes(q)||String(x.category||"").toLowerCase().includes(q))&&(!g||x.genre===g));
  grid.innerHTML=filtered.length?filtered.map(x=>'<a class="poster-card" href="details.html?id='+encodeURIComponent(x.id)+'"><div class="poster-image">'+(x.poster_url?'<img src="'+esc(x.poster_url)+'" alt="">':'<div class="poster-placeholder">JDNEXIA</div>')+'<span class="poster-type">'+esc(x.category|| (kind==="series"?"Série":"Cinéma"))+'</span></div><h3>'+esc(x.title)+'</h3><p>'+esc(x.genre||"")+(x.release_year?" · "+x.release_year:"")+'</p></a>').join(""):'<div class="empty-state">Aucun contenu trouvé.</div>';
 };
 search.addEventListener("input",render);genre.addEventListener("change",render);
 const q=new URLSearchParams(location.search).get("q");if(q)search.value=q;render();
});
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
