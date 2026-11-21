document.addEventListener("DOMContentLoaded",()=>{
 const form=document.getElementById("auth-form");
 const msg=document.getElementById("auth-message");
 const signup=document.getElementById("signup-button");
 const emailInput=document.getElementById("email");
 const passwordInput=document.getElementById("password");

 if(!jdnexia.ready){
   msg.textContent="Service momentanément indisponible. Réessayez plus tard.";
   form.querySelector("button").disabled=true;
   signup.disabled=true;
   return;
 }

 const setBusy=(busy,label)=>{
   form.querySelector("button").disabled=busy;
   signup.disabled=busy;
   form.querySelector("button").textContent=label;
 };
 const enterSite=()=>{
   msg.textContent="Accès autorisé. Ouverture de JDNEXIA…";
   location.replace("index.html");
 };

 form.addEventListener("submit",async e=>{
   e.preventDefault();
   setBusy(true,"Connexion…");
   msg.textContent="";
   const {data,error}=await jdnexia.client.auth.signInWithPassword({
     email:emailInput.value.trim(),
     password:passwordInput.value
   });
   if(error){
     msg.textContent=/email not confirmed/i.test(error.message)
       ?"Compte non activé. Désactivez la confirmation e-mail dans les paramètres Supabase, puis recréez le compte."
       :"Identifiants incorrects ou connexion impossible. Vérifiez vos informations.";
     setBusy(false,"Se connecter");
     return;
   }
   if(data.session) enterSite();
 });

 signup.addEventListener("click",async()=>{
   const email=emailInput.value.trim();
   const password=passwordInput.value;
   if(!email||!password){msg.textContent="Veuillez remplir l'adresse e-mail et le mot de passe.";return}
   if(password.length<6){msg.textContent="Le mot de passe doit contenir au moins 6 caractères.";return}
   setBusy(true,"Création…");
   msg.textContent="";
   const {data,error}=await jdnexia.client.auth.signUp({email,password});
   if(error){
     msg.textContent=/already registered|already exists/i.test(error.message)
       ?"Cette adresse possède déjà un compte. Connectez-vous."
       :"Impossible de créer le compte. Vérifiez les informations et réessayez.";
     setBusy(false,"Se connecter");
     return;
   }
   if(data.session){
     enterSite();
   }else{
     msg.textContent="La confirmation e-mail est encore activée. Désactivez-la dans Supabase pour accéder directement au site.";
     setBusy(false,"Se connecter");
   }
 });
});
