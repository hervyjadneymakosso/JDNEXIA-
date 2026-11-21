# JDNEXIA — Plateforme de streaming

JDNEXIA est une base de plateforme de streaming responsive : accueil animé, catalogue films/séries, pages de détails, lecteur YouTube, comptes utilisateurs et administration protégée par Supabase.

## Contenu
- `index.html` : accueil et animation d'introduction.
- `films.html`, `series.html` : catalogues filtrables.
- `details.html` : fiche d'un film ou d'une série.
- `watch.html` : lecteur vidéo et navigation entre épisodes.
- `login.html` : création de compte / connexion.
- `admin-login.html` et `admin-dashboard.html` : connexion et tableau de bord de gestion.
- `supabase-schema.sql` : tables, relations et politiques de sécurité.

## Mise en service obligatoire
Le site a besoin d'un projet Supabase pour enregistrer et afficher les contenus.

1. Créez un projet sur https://supabase.com
2. Dans Supabase > SQL Editor, exécutez tout le fichier `supabase-schema.sql`.
3. Dans Project Settings > API, copiez Project URL et la clé `anon` / publishable.
4. Remplacez les deux valeurs dans `config.js`.
5. Dans Supabase > Authentication > Users, créez le compte qui sera administrateur.
6. Dans SQL Editor, exécutez en remplaçant l'adresse :
   ```sql
   insert into public.admins(user_id)
   select id from auth.users where email = 'votre-email@exemple.com';
   ```
7. Déployez le dossier `JDNEXIA` sur Netlify (ou GitHub Pages).

## Administration
Ouvrez `/admin-login.html` et connectez-vous avec le compte ajouté dans la table `admins`. Un utilisateur ordinaire ne peut pas accéder au tableau de bord.

## Ajouter un contenu
Dans le tableau de bord, renseignez titre, catégorie, description, affiche et statut de publication.
- Film : renseignez le lien YouTube dans le champ vidéo.
- Série : choisissez le type Série, indiquez saison et épisode, renseignez le lien YouTube et le titre de l'épisode.
- Pour ajouter un nouvel épisode à une série existante, ajoutez une entrée dans la table `episodes` depuis Supabase Table Editor pour l'instant, en utilisant le `series_id` de la série. L'interface de gestion des saisons/épisodes avancée pourra être ajoutée ensuite.

## Vidéos et droits
Utilisez uniquement vos propres vidéos, les vidéos sous licence compatible ou celles pour lesquelles vous avez une autorisation écrite. L'intégration YouTube conserve les conditions, logos, publicités et restrictions de YouTube. Ne téléversez pas de contenu protégé sans autorisation.

## Abonnements
La version initiale est gratuite. La structure est prévue pour évoluer vers des offres Premium, mais aucun paiement ni abonnement n'est activé dans cette version.

## Sécurité
- Ne publiez jamais une clé Supabase `service_role` dans le site.
- La clé `anon` est prévue pour le navigateur et doit rester protégée par les politiques RLS SQL.
- Protégez l'accès administrateur en ajoutant seulement votre compte dans `public.admins`.
- Activez la confirmation d'adresse email et les règles anti-abus dans Supabase Auth.


## Version sans dossiers
Tous les fichiers de cette archive sont placés directement à la racine, sans sous-dossiers. Les noms des fichiers CSS, JavaScript et SQL sont préfixés/renommés pour éviter les collisions.
