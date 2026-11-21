document.addEventListener("DOMContentLoaded",()=>{
 const form=document.getElementById("admin-login-form"),msg=document.getElementById("admin-message");
 if(!jdnexia.ready){msg.textContent="Configurez Supabase avant de vous connecter.";return}
 form.onsubmit=async e=>{e.preventDefault();msg.textContent="Vérification…";const {data,error}=await jdnexia.client.auth.signInWithPassword({email:email.value,password:password.value});if(error){msg.textContent=error.message;return}const {data:role}=await jdnexia.client.from("admins").select("user_id").eq("user_id",data.user.id).maybeSingle();if(!role){await jdnexia.client.auth.signOut();msg.textContent="Accès refusé : ce compte n'est pas administrateur.";return}location.href="index.html"};
});
