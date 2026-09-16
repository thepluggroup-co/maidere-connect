/**
 * DynamicHubHeader — src/components/maideres/DynamicHubHeader.tsx
 * "Bienvenue à Douala. Besoin d'une carte SIM ?" (brief).
 *
 * La résolution géoloc → Ville n'est PAS dans ce composant : il reçoit
 * `ville` déjà résolue (par ex. via navigator.geolocation + reverse-geocode,
 * ou fallback sur le quartier choisi à l'inscription) et se contente de
 * l'affichage. Couvre les 3 villes réelles de VILLES (src/lib/maidere.ts) :
 * Douala, Yaoundé, Abidjan.
 *
 * Les suggestions ci-dessous sont des EXEMPLES à valider/remplacer par
 * l'équipe marketing — je ne les invente pas comme vérité produit figée.
 */
import type { Ville } from "@/lib/maidere";

const SUGGESTIONS_EXEMPLE: Record<Ville, string[]> = {
  Douala: ["Besoin d'une carte SIM ?", "Un plombier près de Bonapriso ?", "Installer votre nouveau logement ?"],
  Yaoundé: ["Un électricien à Bastos ?", "Trouver un déménageur ?", "Une femme de ménage régulière ?"],
  Abidjan: ["Un mécanicien à Cocody ?", "Besoin d'un traiteur pour un événement ?", "Trouver un artisan de confiance ?"],
};

export interface DynamicHubHeaderProps {
  ville: Ville | null;
  prenom?: string;
  onSuggestionClick?: (texte: string) => void;
  className?: string;
}

export function DynamicHubHeader({ ville, prenom, onSuggestionClick, className }: DynamicHubHeaderProps) {
  const suggestions = ville ? SUGGESTIONS_EXEMPLE[ville] : [];
  const salutation = prenom ? `Bienvenue, ${prenom}` : "Bienvenue";

  return (
    <header className={`rounded-2xl bg-primary px-5 py-6 text-primary-foreground ${className ?? ""}`}>
      <p className="text-lg font-bold">
        {salutation}
        {ville ? ` à ${ville}` : ""}.
      </p>
      {!ville && (
        <p className="mt-1 text-sm opacity-90">
          Active ta position pour des suggestions près de chez toi.
        </p>
      )}
      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggestionClick?.(s)}
              className="rounded-full bg-primary-foreground/15 px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-colors hover:bg-primary-foreground/25 cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
