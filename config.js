/* CONFIGURATION SUPABASE
   1) Créez un projet sur https://supabase.com
   2) Copiez l'URL du projet et la clé anon/public dans les deux champs ci-dessous.
   3) Ne mettez JAMAIS la clé service_role dans ce fichier.
*/
window.JDNEXIA_CONFIG = {
  SUPABASE_URL: "https://VOTRE-PROJET.supabase.co",
  SUPABASE_ANON_KEY: "VOTRE_CLE_ANON_PUBLIQUE"
};
window.jdnexia = {
  client: null,
  ready: false,
  init() {
    const c = window.JDNEXIA_CONFIG || {};
    if (window.supabase && c.SUPABASE_URL && c.SUPABASE_ANON_KEY &&
        !c.SUPABASE_URL.includes("VOTRE-PROJET") && !c.SUPABASE_ANON_KEY.includes("VOTRE_CLE")) {
      this.client = window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY);
      this.ready = true;
    }
    return this.ready;
  }
};
window.jdnexia.init();
