import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";

import logo from "@/assets/maideres-logo.asset.json";

/**
 * Enveloppe commune des pages informatives (À propos, FAQ, Contact, CGU).
 */
export function PageShell({
  titre,
  accroche,
  children,
}: {
  titre: string;
  accroche: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen font-sans">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src={logo.url}
              alt="Logo MAIDERES"
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-xl bg-card object-contain p-0.5"
            />
            <span className="min-w-0">
              <span className="block truncate text-lg font-extrabold tracking-tight text-primary">
                MAIDERES
              </span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Tous les services près de chez vous
              </span>
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Accueil
          </Link>
        </div>
      </header>

      <main>
        <section
          className="relative overflow-hidden"
          style={{ background: "var(--gradient-deep)" }}
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary/25 blur-3xl" />
          <div className="mx-auto max-w-4xl px-5 py-14 lg:py-20">
            <h1 className="font-display text-3xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
              {titre}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
              {accroche}
            </p>
          </div>
        </section>
        <div className="mx-auto max-w-4xl px-5 py-12 lg:py-16">{children}</div>
      </main>

      <footer className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <img
                src={logo.url}
                alt="Logo MAIDERES"
                width={40}
                height={40}
                loading="lazy"
                className="h-10 w-10 rounded-xl bg-card object-contain p-0.5"
              />
              <span className="text-lg font-extrabold">MAIDERES</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-primary-foreground/70">
              Maison de référence et de services. Prestataires vérifiés à Douala, Yaoundé et
              Abidjan. Paiements en FCFA (XAF / XOF).
            </p>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary-foreground/90">
              La plateforme
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/70">
              <li>
                <Link to="/a-propos" className="hover:text-primary-foreground">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary-foreground">
                  Questions fréquentes
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-foreground">
                  Nous contacter
                </Link>
              </li>
              <li>
                <Link to="/cgu" className="hover:text-primary-foreground">
                  Conditions d'utilisation
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary-foreground/90">
              Contact
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" /> +237 6 00 00 00 00
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" /> contact@maideres.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" /> Douala · Yaoundé · Abidjan
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/15 px-5 py-5 text-center text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} MAIDERES — Tous les services près de chez vous.
        </div>
      </footer>
    </div>
  );
}
