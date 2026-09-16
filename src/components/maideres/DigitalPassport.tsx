/**
 * DigitalPassport — src/components/maideres/DigitalPassport.tsx
 * QR code stylisé (brief) présenté chez le prestataire physique.
 *
 * ⚠️ Nouvelle dépendance requise, pas encore dans package.json : `qrcode`
 * (MIT, 1.5.4, ajoutée dans ce commit — voir package.json). Sans lib de
 * génération réelle de QR, "stylisé" ne serait qu'un faux visuel non
 * scannable, ce qui serait inutilisable en vrai chez un prestataire.
 * errorCorrectionLevel="H" est nécessaire ici : le logo posé au centre
 * masque une partie du code, seul le niveau de correction le plus élevé
 * garantit qu'il reste lisible.
 *
 * `prestataireNom`/`ville` optionnels (ajusté en construisant le tunnel
 * Concierge) : à la création d'une demande, aucun prestataire n'est
 * encore matché (ça se fait après, côté Console 360) — imposer ces
 * champs aurait forcé soit un mensonge (inventer un nom), soit un abus
 * de `as`. Sans prestataire, la légende devient générique ('référence de
 * suivi') plutôt que 'à présenter à'.
 */
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { MaideresIcon } from "./Logo";

export interface DigitalPassportProps {
  /** Contenu encodé dans le QR — ex. URL de vérification côté prestataire. */
  qrValue: string;
  code: string;
  prestataireNom?: string;
  ville?: string;
  className?: string;
}

export function DigitalPassport({
  qrValue,
  code,
  prestataireNom,
  ville,
  className,
}: DigitalPassportProps) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    QRCode.toString(qrValue, {
      type: "svg",
      errorCorrectionLevel: "H",
      margin: 1,
      color: { dark: "#254C8C", light: "#FFFFFF00" },
    }).then((s) => {
      if (!annule) setSvg(s);
    });
    return () => {
      annule = true;
    };
  }, [qrValue]);

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center shadow-sm ${className ?? ""}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        Passeport numérique
      </p>

      <div className="relative flex h-44 w-44 items-center justify-center">
        {svg ? (
          <div
            className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="h-full w-full animate-shimmer rounded-lg bg-muted" aria-hidden="true" />
        )}
        <span className="absolute inline-flex h-9 w-9 items-center justify-center rounded-full bg-card ring-2 ring-card">
          <MaideresIcon size={22} />
        </span>
      </div>

      <p className="font-mono text-sm font-bold tracking-widest text-foreground">{code}</p>
      <p className="text-xs text-muted-foreground">
        {prestataireNom ? (
          <>
            À présenter à {prestataireNom}
            {ville ? ` · ${ville}` : ""}
          </>
        ) : (
          "Référence de suivi de votre demande"
        )}
      </p>
    </div>
  );
}
