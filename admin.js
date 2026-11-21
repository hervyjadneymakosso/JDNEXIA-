document.addEventListener("DOMContentLoaded",async()=>{
 if(!jdnexia.ready){alert("Le service de données est indisponible.");return}
 const {data:{user}}=await jdnexia.client.auth.getUser();if(!user){location.href="admin-login.html";return}
 const {data:admin}=await jdnexia.client.from("admins").select("user_id").eq("user_id",user.id).maybeSingle();if(!admin){await jdnexia.client.auth.signOut();location.href="login.html";return}
 const $=id=>document.getElementById(id),form=$("content-form");
 $("logout").onclick=async()=>{await jdnexia.client.auth.signOut();location.href="login.html"};
 $("type").onchange=()=>{$("series-fields").classList.toggle("hidden",$("type").value!=="series");$("video-fields").classList.toggle("hidden",$("type").value==="series")};
 function reset(){form.reset();$("edit-id").value="";if($("first_episode_url"))$("first_episode_url").value="";refreshPreview("youtube_url","youtube-preview");refreshPreview("first_episode_url","first-episode-preview");$("editor-title").textContent="Ajouter un contenu";$("save-content").textContent="Enregistrer le contenu";$("sort_order").value=100;$("published").checked=true;$("type").dispatchEvent(new Event("change"))}
 $("reset-form").onclick=reset;

 function youtubeId(value){
  try{
   const u=new URL(value.trim());let id="";
   if(u.hostname==="youtu.be"||u.hostname==="www.youtu.be")id=u.pathname.split("/").filter(Boolean)[0]||"";
   else if(["youtube.com","www.youtube.com","m.youtube.com","music.youtube.com","youtube-nocookie.com","www.youtube-nocookie.com"].includes(u.hostname)){
    if(u.pathname==="/watch")id=u.searchParams.get("v")||"";
    else if(u.pathname.startsWith("/embed/")||u.pathname.startsWith("/shorts/")||u.pathname.startsWith("/live/"))id=u.pathname.split("/")[2]||"";
   }
   return /^[A-Za-z0-9_-]{11}$/.test(id)?id:null;
  }catch(e){return null}
 }
 function refreshPreview(inputId,previewId){
  const input=$(inputId),box=$(previewId);if(!input||!box)return;
  const id=youtubeId(input.value);box.classList.toggle("hidden",!id);
  box.innerHTML=id?'<div class="youtube-preview-label">APERÇU YOUTUBE</div><iframe src="https://www.youtube-nocookie.com/embed/'+id+'?rel=0&playsinline=1" title="Aperçu YouTube" loading="lazy" allow="accelerometer; autoplay; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe>':'';
 }
 [["youtube_url","youtube-preview"],["first_episode_url","first-episode-preview"],["new-episode-url","episode-youtube-preview"]].forEach(([a,b])=>{if($(a))$(a).addEventListener("input",()=>refreshPreview(a,b))});

 async function load(){
  const {data,error}=await jdnexia.client.from("contents").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:false});
  if(error){$("admin-feedback").textContent="Mise à jour nécessaire : exécutez catalog-upgrade.sql dans Supabase.";return}
  const rows=data||[],series=rows.filter(x=>x.type==="series");
  $("episode-series").innerHTML='<option value="">Choisir une série</option>'+series.map(x=>'<option value="'+x.id+'">'+esc(x.title)+'</option>').join("");
  $("stat-total").textContent=rows.length;$("stat-films").textContent=rows.filter(x=>x.type==="film").length;$("stat-series").textContent=series.length;
  $("admin-content-list").innerHTML=rows.length?rows.map(x=>'<div class="admin-item catalog-admin-item"><img src="'+esc(x.poster_url||"")+'" onerror="this.style.opacity=0"><div class="admin-item-info"><b>'+esc(x.title)+'</b><small>'+esc(x.category||"Cinéma")+' · '+esc(x.genre||"")+' · '+(x.type==="series"?"Série":"Film")+' · '+(x.published?"En ligne":"Brouillon")+'</small><label class="order-control">Position <input type="number" min="1" value="'+Number(x.sort_order||1000)+'" data-order="'+x.id+'"></label></div><button data-edit="'+x.id+'">Modifier</button><button class="danger" data-delete="'+x.id+'">Retirer</button></div>').join(""):'<div class="empty-state">Aucun contenu. Ajoutez votre première publication.</div>';
  document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>edit(rows.find(x=>x.id===b.dataset.edit)));
  document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>remove(b.dataset.delete));
  document.querySelectorAll("[data-order]").forEach(input=>input.onchange=()=>saveOrder(input.dataset.order,input.value));
 }
 function edit(x){
  $("edit-id").value=x.id;$("type").value=x.type;$("category").value=x.category||"Cinéma";$("genre").value=x.genre||"";$("title").value=x.title;$("description").value=x.description||"";$("poster_url").value=x.poster_url||"";$("release_year").value=x.release_year||"";$("sort_order").value=x.sort_order||1000;$("published").checked=!!x.published;$("youtube_url").value=x.youtube_url||"";refreshPreview("youtube_url","youtube-preview");$("type").dispatchEvent(new Event("change"));$("editor-title").textContent="Modifier le contenu";$("save-content").textContent="Enregistrer les modifications";window.scrollTo({top:0,behavior:"smooth"});
 }
 async function saveOrder(id,value){
  const n=Number(value);if(!Number.isInteger(n)||n<1){$("admin-feedback").textContent="La position doit être un nombre entier supérieur à zéro.";return}
  const {error}=await jdnexia.client.from("contents").update({sort_order:n}).eq("id",id);
  $("admin-feedback").textContent=error?error.message:"Ordre du catalogue mis à jour.";if(!error)await load();
 }
 async function remove(id){if(!confirm("Retirer ce contenu du catalogue ? Ses épisodes associés seront également supprimés."))return;const {error}=await jdnexia.client.from("contents").delete().eq("id",id);$("admin-feedback").textContent=error?error.message:"Contenu retiré.";if(!error)await load()}
 form.onsubmit=async e=>{
  e.preventDefault();$("admin-feedback").textContent="Enregistrement…";
  const type=$("type").value,videoUrl=type==="film"?$("youtube_url").value.trim():$("first_episode_url").value.trim();
  if(!youtubeId(videoUrl)){$("admin-feedback").textContent="Ajoutez un lien YouTube valide avant l’enregistrement.";return}
  const payload={type,category:$("category").value,genre:$("genre").value.trim(),title:$("title").value.trim(),description:$("description").value.trim(),poster_url:$("poster_url").value.trim()||null,release_year:$("release_year").value?Number($("release_year").value):null,sort_order:Number($("sort_order").value),published:$("published").checked,youtube_url:type==="film"?videoUrl:null};
  if(!Number.isInteger(payload.sort_order)||payload.sort_order<1){$("admin-feedback").textContent="La position doit être un entier supérieur à zéro.";return}
  const editId=$("edit-id").value,result=editId?await jdnexia.client.from("contents").update(payload).eq("id",editId).select().single():await jdnexia.client.from("contents").insert(payload).select().single();
  if(result.error){$("admin-feedback").textContent=result.error.message;return}
  const item=result.data,video=videoUrl;
  if(type==="series"&&!editId&&video){
   const {error}=await jdnexia.client.from("episodes").insert({series_id:item.id,season_number:Number($("season_number").value||1),episode_number:Number($("episode_number").value||1),title:$("episode_title").value.trim()||item.title,description:item.description,youtube_url:video,published:item.published});
   if(error){$("admin-feedback").textContent="Série créée. Échec de l'ajout du premier épisode : "+error.message;return}
  }
  $("admin-feedback").textContent="Contenu enregistré et classé à la position "+payload.sort_order+".";
  reset();await load();
 };
 $("episode-form").onsubmit=async e=>{
  e.preventDefault();$("episode-feedback").textContent="Ajout en cours…";
  const payload={series_id:$("episode-series").value,season_number:Number($("new-season").value),episode_number:Number($("new-episode").value),title:$("new-episode-title").value.trim(),description:$("new-episode-description").value.trim(),youtube_url:$("new-episode-url").value.trim(),published:$("new-episode-published").checked};
  if(!youtubeId(payload.youtube_url)){$("episode-feedback").textContent="Le lien YouTube est invalide. Vérifiez l’adresse.";return}
  const {error}=await jdnexia.client.from("episodes").insert(payload);
  $("episode-feedback").textContent=error?error.message:"Épisode ajouté à la série.";
  if(!error){$("episode-form").reset();$("new-season").value=1;$("new-episode").value=1;$("new-episode-published").checked=true}
 };
 $("type").dispatchEvent(new Event("change"));await load();
});
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
