import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VILLES, quartiersParVille, type Ville } from "@/lib/maidere";

type Props = { role: "client" | "prestataire" };

const METIERS = [
  "Plomberie",
  "Bricolage & rénovation",
  "Restauration",
  "Hébergement",
  "Shopping",
  "Transport",
  "Immobilier",
  "Couture",
];

export function AuthCard({ role }: Props) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"connexion" | "inscription">("connexion");
  const [chargement, setChargement] = useState(false);

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ville, setVille] = useState<Ville>("Douala");
  const [quartier, setQuartier] = useState("");
  const [metier, setMetier] = useState(METIERS[0]!);

  const destination = role === "prestataire" ? "/pro" : "/espace";
  const estPro = role === "prestataire";

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    try {
      if (mode === "connexion") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
        if (error) throw error;
        toast.success("Bienvenue sur MAIDERES");
        void navigate({ to: destination });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: motDePasse,
          options: {
            emailRedirectTo: `${window.location.origin}${destination}`,
            data: {
              nom_complet: nom,
              telephone,
              ville,
              quartier,
              role,
              ...(estPro ? { metier } : {}),
            },
          },
        });
        if (error) throw error;
        toast.success("Compte créé. Vous pouvez vous connecter.");
        void navigate({ to: destination });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
          ← Retour à l'accueil
        </Link>

        <div className="mt-6 rounded-3xl border border-border bg-card p-8 shadow-sm">
          <p className="font-display text-xs font-semibold uppercase tracking-widest text-secondary">
            Espace {estPro ? "prestataire" : "client"}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-foreground">
            {mode === "connexion" ? "Connexion" : "Créer un compte"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {estPro
              ? "Publiez vos offres, votre galerie et suivez vos avis."
              : "Trouvez des prestataires vérifiés à Douala, Yaoundé et Abidjan."}
          </p>

          <form onSubmit={soumettre} className="mt-6 space-y-4">
            {mode === "inscription" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="nom">Nom complet</Label>
                  <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tel">Téléphone</Label>
                  <Input
                    id="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+237 6 xx xx xx xx"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ville">Ville</Label>
                    <select
                      id="ville"
                      value={ville}
                      onChange={(e) => {
                        setVille(e.target.value as Ville);
                        setQuartier("");
                      }}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {VILLES.map((v) => (
                        <option key={v.nom} value={v.nom}>
                          {v.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="quartier">Quartier</Label>
                    <select
                      id="quartier"
                      value={quartier}
                      onChange={(e) => setQuartier(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">—</option>
                      {quartiersParVille(ville).map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {estPro && (
                  <div className="space-y-1.5">
                    <Label htmlFor="metier">Métier principal</Label>
                    <select
                      id="metier"
                      value={metier}
                      onChange={(e) => setMetier(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {METIERS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mdp">Mot de passe</Label>
              <Input
                id="mdp"
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <Button type="submit" disabled={chargement} className="w-full">
              {chargement ? "Patientez…" : mode === "connexion" ? "Se connecter" : "Créer mon compte"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "connexion" ? "inscription" : "connexion")}
            className="mt-4 w-full text-sm text-muted-foreground hover:text-primary"
          >
            {mode === "connexion"
              ? "Pas encore de compte ? Créer un compte"
              : "Déjà inscrit ? Se connecter"}
          </button>

          <div className="mt-6 border-t border-border pt-4 text-center text-sm text-muted-foreground">
            {estPro ? (
              <Link to="/auth/client" className="hover:text-primary">
                Vous cherchez un service ? Espace client
              </Link>
            ) : (
              <Link to="/auth/prestataire" className="hover:text-primary">
                Vous êtes prestataire ? Espace prestataire
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
