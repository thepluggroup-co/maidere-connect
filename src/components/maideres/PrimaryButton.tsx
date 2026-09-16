/**
 * PrimaryButton — src/components/maideres/PrimaryButton.tsx
 *
 * ⚠️ Contrairement à l'ERP, --primary de la vitrine reste INDIGO (décision
 * validée à l'étape 2). Ce composant n'est donc PAS un alias de
 * <Button variant="default"> — il force explicitement le doré (--accent)
 * pour être LE seul chemin de code qui produit un CTA doré. Toute action
 * principale de la vitrine doit passer par ce composant, jamais par
 * <Button> nu, sous peine de sortir indigo par défaut et de violer la
 * règle d'or #2 sans que personne ne le remarque en review.
 *
 * Couleur de texte : --accent-foreground est déjà un brun foncé côté
 * vitrine (styles.css), pas du blanc — conforme à "jamais de blanc pur
 * sur doré".
 */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

let mountedCount = 0;

export interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    React.useEffect(() => {
      mountedCount += 1;
      if (mountedCount > 1 && import.meta.env.DEV) {
        console.warn(
          `[PrimaryButton] ${mountedCount} CTA dorés montés simultanément — règle d'or #2 : un seul par écran.`,
        );
      }
      return () => {
        mountedCount -= 1;
      };
    }, []);

    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md h-9 px-4 py-2 text-sm font-medium",
          "bg-accent text-accent-foreground shadow hover:bg-accent/90 transition-colors cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
PrimaryButton.displayName = "PrimaryButton";
