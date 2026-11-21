document.addEventListener("DOMContentLoaded",()=>{
 const form=document.getElementById("auth-form");
 const msg=document.getElementById("auth-message");
 const signup=document.getElementById("signup-button");
 const emailInput=document.getElementById("email");
 const passwordInput=document.getElementById("password");
 const redirectUrl="https://jdnexia.netlify.app/login.html";

 if(!jdnexia.ready){
   msg.textContent="La connexion Supabase n'est pas configurée.";
   form.querySelector("button").disabled=true;
   signup.disabled=true;
   return;
 }

 function showResend(){
   let btn=document.getElementById("resend-confirmation");
   if(!btn){
     btn=document.createElement("button");
     btn.type="button";
     btn.id="resend-confirmation";
     btn.className="text-button";
     btn.textContent="Renvoyer l'e-mail de confirmation";
     msg.insertAdjacentElement("afterend",btn);
     btn.addEventListener("click",async()=>{
       const email=emailInput.value.trim();
       if(!email){msg.textContent="Saisis d'abord ton adresse e-mail.";return}
       btn.disabled=true;
       msg.textContent="Envoi du nouveau lien…";
       const {error}=await jdnexia.client.auth.resend({
         type:"signup",
         email,
         options:{emailRedirectTo:redirectUrl}
       });
       msg.textContent=error?"Impossible de renvoyer le lien : "+error.message:"Un nouveau lien vient d'être envoyé. Ouvre le dernier e-mail reçu.";
       btn.disabled=false;
     });
   }
 }

 form.onsubmit=async e=>{
   e.preventDefault();
   msg.textContent="Connexion…";
   const {data,error}=await jdnexia.client.auth.signInWithPassword({
     email:emailInput.value.trim(),
     password:passwordInput.value
   });
   if(error){
     msg.textContent=error.message;
     if(/email not confirmed/i.test(error.message)) showResend();
     return;
   }
   msg.textContent="Connexion réussie.";
   if(data.session) location.href="index.html";
 };

 signup.onclick=async()=>{
   const email=emailInput.value.trim();
   const password=passwordInput.value;
   if(!email||!password){msg.textContent="Saisis ton adresse e-mail et ton mot de passe.";return}
   msg.textContent="Création du compte…";
   const {data,error}=await jdnexia.client.auth.signUp({
     email,
     password,
     options:{emailRedirectTo:redirectUrl}
   });
   if(error){
     msg.textContent=error.message;
     if(/already registered|already exists/i.test(error.message)) showResend();
     return;
   }
   msg.textContent=data.session
     ?"Compte créé et connecté."
     :"Compte créé. Ouvre le dernier e-mail de confirmation envoyé par JDNEXIA.";
   if(!data.session) showResend();
 };
});
