/**
 * SecondaryButton — src/components/maideres/SecondaryButton.tsx
 * Ici --primary EST déjà indigo, donc contrairement à l'ERP il n'y a pas
 * besoin de forcer une couleur différente du token. On évite juste
 * variant="outline" du Button de base, dont le hover bascule sur --accent
 * (doré) — ce qui ferait clignoter du doré sur un bouton secondaire et
 * casserait "un seul élément doré par écran".
 */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const SecondaryButton = React.forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md h-9 px-4 py-2 text-sm font-medium",
          "border border-primary text-primary bg-transparent",
          "hover:bg-primary/10 transition-colors cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
SecondaryButton.displayName = "SecondaryButton";
