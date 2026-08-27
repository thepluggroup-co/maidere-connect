import { supabase } from "@/integrations/supabase/client";

export type Prestataire = {
  id: string;
  user_id: string;
  nom_affichage: string;
  metier: string;
  categorie: string | null;
  bio: string | null;
  ville: string;
  quartier: string | null;
  zones_couverture: string[];
  telephone: string | null;
  photo_url: string | null;
  disponible: boolean;
  verifie: boolean;
  publie: boolean;
};

export type Offre = {
  id: string;
  prestataire_id: string;
  user_id: string;
  titre: string;
  categorie: string;
  description: string | null;
  prestations: string[];
  prix: number;
  unite_prix: string;
  delai_heures: number;
  publie: boolean;
};

export type Promotion = {
  id: string;
  prestataire_id: string;
  user_id: string;
  titre: string;
  description: string | null;
  remise_pct: number;
  debut: string;
  fin: string | null;
  active: boolean;
};

export type Realisation = {
  id: string;
  prestataire_id: string;
  user_id: string;
  titre: string;
  description: string | null;
  image_url: string;
};

export type Avis = {
  id: string;
  prestataire_id: string;
  client_id: string;
  note: number;
  commentaire: string | null;
  reponse: string | null;
  created_at: string;
};

export const CATEGORIES = [
  "Plomberie",
  "Bricolage & rénovation",
  "Restauration",
  "Hébergement",
  "Shopping",
  "Transport",
  "Immobilier",
  "Couture",
];

export async function listerPrestataires(filtres: {
  ville?: string;
  quartier?: string;
  categorie?: string;
  recherche?: string;
}) {
  let q = supabase.from("prestataires").select("*").eq("publie", true);
  if (filtres.ville) q = q.eq("ville", filtres.ville);
  if (filtres.quartier) q = q.eq("quartier", filtres.quartier);
  if (filtres.categorie) q = q.eq("metier", filtres.categorie);
  if (filtres.recherche) q = q.ilike("nom_affichage", `%${filtres.recherche}%`);
  const { data, error } = await q.order("verifie", { ascending: false }).limit(60);
  if (error) throw error;
  return (data ?? []) as unknown as Prestataire[];
}

export async function chargerFichePrestataire(id: string) {
  const [p, offres, promos, realisations, avis] = await Promise.all([
    supabase.from("prestataires").select("*").eq("id", id).maybeSingle(),
    supabase.from("offres").select("*").eq("prestataire_id", id).eq("publie", true),
    supabase.from("promotions").select("*").eq("prestataire_id", id).eq("active", true),
    supabase.from("realisations").select("*").eq("prestataire_id", id),
    supabase.from("avis").select("*").eq("prestataire_id", id).order("created_at", { ascending: false }),
  ]);
  return {
    prestataire: (p.data ?? null) as unknown as Prestataire | null,
    offres: (offres.data ?? []) as unknown as Offre[],
    promotions: (promos.data ?? []) as unknown as Promotion[],
    realisations: (realisations.data ?? []) as unknown as Realisation[],
    avis: (avis.data ?? []) as unknown as Avis[],
  };
}

export async function maFichePrestataire(userId: string) {
  const { data, error } = await supabase
    .from("prestataires")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as Prestataire | null;
}

export function moyenne(avis: { note: number }[]) {
  if (avis.length === 0) return 0;
  return avis.reduce((s, a) => s + a.note, 0) / avis.length;
}

export async function urlSignee(chemin: string | null | undefined) {
  if (!chemin) return null;
  if (chemin.startsWith("http")) return chemin;
  const { data } = await supabase.storage.from("maideres").createSignedUrl(chemin, 3600);
  return data?.signedUrl ?? null;
}
