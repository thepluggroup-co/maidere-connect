/**
 * Logo — src/components/maideres/Logo.tsx
 *
 * ⚠️ Deuxième correction sur ce fichier. Ma première version référençait
 * "/maideres-icon.svg" (à copier depuis le repo MAIDERES, jamais fait) et
 * "MaideresLogoLockupOfficial" pointait vers le PNG ChatGPT, qui n'est
 * plus l'asset actif depuis qu'un fix logo a été mergé sur cette branche
 * (commit 5ead14d, côté équipe) — remplacé entre-temps par
 * src/assets/logo-icon-real.png suite à un merge ultérieur (0ee132f).
 * C'est CE fichier qui est réellement affiché sur le site aujourd'hui.
 * Vérifié visuellement : c'est bien le symbole officiel (épingle + anneau
 * + M blanc + accent doré), pas une reconstruction approximative.
 *
 * Nettoyage fait dans le même commit : suppression de 3 fichiers résidus
 * qui n'ont plus aucune référence dans le code (vérifié par grep) :
 *  - public/ChatGPT_Image_24_août_2026__20_19_28-removebg-preview.png
 *  - src/assets/maideres-logo.asset.json (pointeur Lovable cassé)
 *  - src/assets/maidere-logo.asset.json (même chose, nom avec une typo)
 */
import logoIcon from "@/assets/logo-icon-real.png";

function warnIfTooSmall(size: number) {
  if (import.meta.env.DEV && size < 32) {
    console.warn(`[Logo] taille ${size}px < 32px — sous la zone de protection minimale de la charte (écran).`);
  }
}

export function MaideresIcon({ size = 40, className }: { size?: number; className?: string }) {
  warnIfTooSmall(size);
  return (
    <img
      src={logoIcon}
      alt="MAIDERES"
      style={{ width: size, height: "auto" }}
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
