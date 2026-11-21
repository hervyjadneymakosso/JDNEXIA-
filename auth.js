document.addEventListener("DOMContentLoaded",()=>{
 const form=document.getElementById("auth-form"),msg=document.getElementById("auth-message"),signup=document.getElementById("signup-button");
 if(!jdnexia.ready){msg.textContent="Configurez Supabase avant d'activer les comptes.";form.querySelector("button").disabled=true;signup.disabled=true;return}
 form.onsubmit=async e=>{e.preventDefault();msg.textContent="Connexion…";let {error}=await jdnexia.client.auth.signInWithPassword({email:email.value,password:password.value});msg.textContent=error?error.message:"Connexion réussie."};
 signup.onclick=async()=>{msg.textContent="Création du compte…";let {error}=await jdnexia.client.auth.signUp({email:email.value,password:password.value});msg.textContent=error?error.message:"Compte créé. Vérifiez votre email si la confirmation est activée."};
});
