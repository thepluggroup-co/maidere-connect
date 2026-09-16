/**
 * Logo — src/components/maideres/Logo.tsx (nouveau fichier)
 *
 * Avant : src/routes/index.tsx importe directement le PNG
 * ("@/assets/ChatGPT_Image_24_août_2026__20_19_28-removebg-preview.png")
 * et l'affiche brut. Ce composant centralise l'usage du logo (comme côté
 * ERP) pour ne plus avoir l'import du PNG dispersé dans les routes, et
 * ajoute la même garde de taille minimale (32px) que côté ERP.
 *
 * Prérequis avant d'utiliser MaideresIcon ici : copier
 * apps/web/public/maideres-icon.svg (repo MAIDERES) vers public/ de ce
 * repo — actuellement absent côté vitrine, qui n'a que le PNG.
 */
import logoLockup from "@/assets/ChatGPT_Image_24_août_2026__20_19_28-removebg-preview.png";

function warnIfTooSmall(size: number) {
  if (import.meta.env.DEV && size < 32) {
    console.warn(`[Logo] taille ${size}px < 32px — sous la zone de protection minimale de la charte (écran).`);
  }
}

export function MaideresIcon({ size = 40, className }: { size?: number; className?: string }) {
  warnIfTooSmall(size);
  return (
    <img
      src="/maideres-icon.svg" // à copier depuis le repo MAIDERES — voir note en tête de fichier
      alt="MAIDERES"
      style={{ width: size, height: size }}
      className={className}
    />
  );
}

interface LogoProps {
  size?: number;
  className?: string;
  orientation?: "horizontal" | "vertical";
  tagline?: boolean;
}

const TAGLINE = "Tous les services près de chez vous";

export function MaideresLogo({ size = 32, className, orientation = "horizontal", tagline = false }: LogoProps) {
  warnIfTooSmall(size);
  return (
    <span
      className={`inline-flex ${orientation === "vertical" ? "flex-col items-center gap-1.5 text-center" : "items-center gap-2"} ${className ?? ""}`}
    >
      <MaideresIcon size={size} />
      <span className="leading-tight">
        <span className="text-sm font-bold tracking-[0.08em] text-foreground">
          <span className="text-[#254C8C]">MAI</span>
          <span className="text-[#A82D7E]">DERES</span>
        </span>
        {tagline && (
          <span className="block text-[9px] font-semibold uppercase tracking-wider text-[#254C8C]">{TAGLINE}</span>
        )}
      </span>
    </span>
  );
}

/**
 * Lockup officiel complet (PNG fourni par Johanne) — pour le header de la
 * landing et les contextes où la fidélité pixel exacte prime sur le
 * scaling net. C'est cette image qui est déjà utilisée dans index.tsx
 * aujourd'hui ; ce wrapper ajoute juste la garde de taille mini et centralise
 * l'usage pour éviter que le chemin du fichier soit dupliqué ailleurs.
 */
export function MaideresLogoLockupOfficial({ width = 200, className }: { width?: number; className?: string }) {
  warnIfTooSmall(width);
  return (
    <img
      src={logoLockup}
      alt="MAIDERES — Tous les services près de chez vous"
      style={{ width, height: "auto" }}
      className={className}
    />
  );
}
