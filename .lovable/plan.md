# MAIDERES — Architecture des deux espaces (Client / Prestataire)

## Principe

La page d'accueil actuelle reste la vitrine publique. Après l'accueil, deux univers
distincts, un seul socle d'authentification (email + mot de passe) mais **un rôle
choisi à l'inscription** (`client` ou `prestataire`) qui décide de la navigation, des
pages accessibles et des droits en base.

```text
Accueil (public)
  ├─ /prestataires            recherche publique (lecture seule)
  ├─ /prestataires/$id        profil, offres, galerie, promos, avis
  ├─ /auth/client             connexion + inscription client
  └─ /auth/prestataire        connexion + inscription prestataire
        │
        ├─ Espace client  /espace/…            (rôle client)
        └─ Espace pro     /pro/…               (rôle prestataire)
```

## Espace Client (`/espace/*`)

| Page | Contenu |
| --- | --- |
| `/espace` | Tableau de bord : demandes en cours, prestataires favoris, promos du moment |
| `/espace/recherche` | Recherche filtrée : ville (Douala, Yaoundé, Abidjan), quartier, catégorie, note, disponibilité |
| `/espace/prestataires/$id` | Fiche détaillée : prestations + tarifs, galerie de réalisations, promotions, avis |
| `/espace/promotions` | Toutes les promos actives, filtrables par ville et catégorie |
| `/espace/avis` | Mes avis publiés + rédaction d'un nouvel avis (note 1-5 + commentaire) |
| `/espace/profil` | Coordonnées, ville/quartier par défaut, déconnexion |

## Espace Prestataire (`/pro/*`)

| Page | Contenu |
| --- | --- |
| `/pro` | Tableau de bord : vues du profil, note moyenne, nombre d'avis, offres actives |
| `/pro/offres` | Liste + création/édition/suppression d'offres (titre, catégorie, description, prix FCFA, unité) |
| `/pro/offres/$id` | Détail d'une offre : prestations incluses, délai, zone couverte, promotion optionnelle |
| `/pro/galerie` | Upload et gestion des photos de réalisations |
| `/pro/avis` | Avis reçus, réponse publique possible |
| `/pro/profil` | Métier, ville, quartier, zones couvertes, disponibilité, bio, déconnexion |

## Interaction entre les deux univers

- Une offre publiée côté pro devient immédiatement visible dans la recherche client et sur la fiche publique.
- Un avis client met à jour la note moyenne du prestataire, utilisée par le scoring de matching déjà présent dans `src/lib/maidere.ts`.
- Les promotions créées côté pro alimentent `/espace/promotions` et les badges de la recherche.
- La logique existante (urgence/SLA, distance par quartier, commission 15 %) est réutilisée telle quelle pour le classement des résultats.

## Détails techniques

- **Lovable Cloud** activé pour la base de données, l'authentification et le stockage des photos.
- Tables : `profiles` (nom, ville, quartier, téléphone), `user_roles` (rôle séparé, jamais sur le profil), `prestataires`, `offres`, `promotions`, `realisations` (galerie), `avis`.
- RLS : lecture publique restreinte aux prestataires/offres/promos/avis publiés ; écriture réservée au propriétaire (`auth.uid()`).
- Routage : sous-arbre protégé `_authenticated` ; les deux espaces vérifient le rôle et redirigent vers l'autre espace si besoin.
- Design : palette existante (indigo #254C8C, magenta #A82D7E, doré), Poppins + Inter, une seule action dorée par écran.
- Chaque page publique reçoit ses propres métadonnées `head()`.

## Livraison en 3 étapes

1. Cloud + schéma + RLS + authentification par rôle et pages `/auth/*`.
2. Espace prestataire (profil, offres, galerie, promotions, avis reçus).
3. Espace client (recherche, fiches, promotions, avis) + liens depuis l'accueil.
