/**
 * Tunnel Concierge — src/routes/_authenticated/espace/demandes/nouvelle.tsx
 *
 * Étape 5 (brief) : "Tunnel Concierge (wizard 3 étapes : besoin →
 * validation → passeport)". Reconstruit en 3 écrans autour de la MÊME
 * mutation réelle qui existait déjà ici (POST /api/demandes) — pas un
 * flux parallèle inventé. Ce qui change : la présentation en étapes
 * guidées + la terminologie Concierge du brief, pas la logique métier.
 *
 * Étape 3 ("passeport") : à la création, aucun prestataire n'est encore
 * matché (ça se fait après, côté Console 360 / Dispatch) — donc ce n'est
 * PAS le passeport "à présenter au prestataire" du brief, qui n'a de
 * sens qu'une fois le matching fait. C'est une référence de suivi
 * (DigitalPassport sans prestataireNom, cf. son propre commit) avec le
 * micro-copy humanisé "Un conseiller MAIDERES s'en occupe". Le vrai
 * passeport "à présenter" serait à ajouter sur la page de suivi
 * (espace.demandes.$id.tsx) une fois la demande matchée — pas fait ici,
 * hors scope de ce tunnel de création.
 *
 * Sélection directe d'une offre (?offre_id=&prestataire_id=, venu du
 * bouton "Demander cette offre" sur une fiche prestataire) : pré-remplit
 * l'étape 1 et transmet offre_id à la création — POST /api/demandes
 * (MAIDERES-erp) l'enregistre comme préférence ; la demande entre d'abord
 * dans l'ERP (statut 'nouvelle') et le staff MAIDERES dispatche. Pas d'API dédiée pour une offre isolée,
 * donc on réutilise le paquet public de la fiche (déjà accessible sans
 * auth) pour la retrouver.
 */
import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { authorizedFetch } from "@/lib/maideres-core-client";
import { listerCategories, chargerFichePrestataire, type Demande } from "@/lib/maideres-api";
import { xof } from "@/lib/maidere";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PrimaryButton } from "@/components/maideres/PrimaryButton";
import { SecondaryButton } from "@/components/maideres/SecondaryButton";
import { ConciergeLoader } from "@/components/maideres/ConciergeLoader";
import { DigitalPassport } from "@/components/maideres/DigitalPassport";

export const Route = createFileRoute("/_authenticated/espace/demandes/nouvelle")({
  validateSearch: z.object({
    offre_id: z.string().uuid().optional(),
    prestataire_id: z.string().uuid().optional(),
  }),
  component: NouvelleDemande,
});

const NIVEAUX = [
  { value: "immediate", label: "Immédiat (sous 2h)" },
  { value: "urgent", label: "Urgent (sous 24h)" },
  { value: "planifie", label: "Planifié" },
] as const;

const ETAPES = ["Besoin", "Validation", "Confirmation"] as const;

function NouvelleDemande() {
  const navigate = useNavigate();
  const { offre_id: offreId, prestataire_id: prestataireId } = Route.useSearch();
  const [etape, setEtape] = useState(0);
  const [categorieId, setCategorieId] = useState("");
  const [description, setDescription] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [niveauUrgence, setNiveauUrgence] = useState<(typeof NIVEAUX)[number]["value"]>("urgent");
  const [dateSouhaitee, setDateSouhaitee] = useState("");
  const [demandeCreee, setDemandeCreee] = useState<Demande | null>(null);
  const [descriptionPreremplie, setDescriptionPreremplie] = useState(false);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: listerCategories });
  const categorieLabel = categories?.find((c) => c.id === categorieId)?.libelle ?? categorieId;
  const niveauLabel = NIVEAUX.find((n) => n.value === niveauUrgence)?.label ?? niveauUrgence;

  // Venu de "Demander cette offre" sur une fiche prestataire : pas d'API
  // dédiée pour une offre isolée, donc on réutilise le même paquet public
  // que la fiche (déjà accessible sans auth) et on retrouve l'offre dedans.
  const { data: fiche } = useQuery({
    queryKey: ["fiche-prestataire", prestataireId],
    queryFn: () => chargerFichePrestataire(prestataireId!),
    enabled: Boolean(prestataireId && offreId),
  });
  const offre = fiche?.offres.find((o) => o.id === offreId);

  // Pré-remplissage une seule fois quand l'offre et la liste des catégories
  // sont disponibles — sans bloquer la saisie si le client modifie ensuite.
  if (offre && categories && !categorieId && !descriptionPreremplie) {
    const categorieCorrespondante = categories.find(
      (c) => c.libelle.toLowerCase() === offre.categorie.toLowerCase(),
    );
    if (categorieCorrespondante) setCategorieId(categorieCorrespondante.id);
    setDescription(`${offre.titre}${offre.description ? ` — ${offre.description}` : ""}`);
    setDescriptionPreremplie(true);
  }

  const creer = useMutation({
    mutationFn: async () => {
      if (!categorieId) throw new Error("Choisissez une catégorie de service");
      const res = await authorizedFetch("/api/demandes", {
        method: "POST",
        body: JSON.stringify({
          categorie_id: categorieId,
          description,
          localisation: localisation || null,
          niveau_urgence: niveauUrgence,
          ...(offre ? { offre_id: offre.id } : {}),
          ...(niveauUrgence === "planifie" && dateSouhaitee
            ? { date_souhaitee: new Date(dateSouhaitee).toISOString() }
            : {}),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || `Création échouée (${res.status})`);
      }
      return ((await res.json()) as { data: Demande }).data;
    },
    onSuccess: (demande) => {
      setDemandeCreee(demande);
      setEtape(2);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const etapeBesoinValide = categorieId !== "" && description.trim() !== "";

  return (
    <div className="max-w-xl">
      <Link to="/espace/demandes" className="text-sm text-muted-foreground hover:text-primary">
        ← Mes demandes
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Nouvelle demande</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {offre
          ? "Votre demande est d'abord transmise à MAIDERES : un conseiller la valide puis la propose au prestataire de l'offre choisie."
          : "Décrivez votre besoin — un conseiller MAIDERES vous met en relation avec un prestataire vérifié."}
      </p>

      {offreId && !offre && (
        <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
          Chargement de l&apos;offre sélectionnée…
        </p>
      )}
      {offre && (
        <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-semibold text-foreground">{offre.titre}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {offre.categorie} · {xof(offre.prix)} / {offre.unite_prix}
          </p>
        </div>
      )}

      {/* Repères d'étapes */}
      <ol className="mt-6 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        {ETAPES.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                i <= etape ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {i < etape ? <CheckCircle2 className="size-3.5" /> : i + 1}
            </span>
            <span className={i === etape ? "text-foreground" : ""}>{label}</span>
            {i < ETAPES.length - 1 && (
              <span className="mx-1 h-px w-4 bg-border" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>

      {/* Étape 1 — Besoin */}
      {etape === 0 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (etapeBesoinValide) setEtape(1);
          }}
          className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5"
        >
          <div className="space-y-1.5">
            <Label htmlFor="cat">Catégorie de service</Label>
            <select
              id="cat"
              value={categorieId}
              onChange={(e) => setCategorieId(e.target.value)}
              required
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Choisir…</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.libelle}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc">Décrivez votre besoin</Label>
            <Textarea
              id="desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Ex : fuite d'eau sous l'évier de la cuisine, besoin d'une intervention rapide"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="loc">Localisation (quartier, repère)</Label>
            <Input
              id="loc"
              value={localisation}
              onChange={(e) => setLocalisation(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="urgence">Urgence</Label>
            <select
              id="urgence"
              value={niveauUrgence}
              onChange={(e) => setNiveauUrgence(e.target.value as typeof niveauUrgence)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {NIVEAUX.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>

          {niveauUrgence === "planifie" && (
            <div className="space-y-1.5">
              <Label htmlFor="date">Date souhaitée</Label>
              <Input
                id="date"
                type="datetime-local"
                value={dateSouhaitee}
                onChange={(e) => setDateSouhaitee(e.target.value)}
                required
              />
            </div>
          )}

          <PrimaryButton type="submit" className="w-full" disabled={!etapeBesoinValide}>
            Continuer
          </PrimaryButton>
        </form>
      )}

      {/* Étape 2 — Validation */}
      {etape === 1 && (
        <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Catégorie</dt>
              <dd className="font-semibold text-foreground">{categorieLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-muted-foreground">Besoin</dt>
              <dd className="text-right text-foreground">{description}</dd>
            </div>
            {localisation && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Localisation</dt>
                <dd className="text-foreground">{localisation}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Urgence</dt>
              <dd className="font-semibold text-foreground">{niveauLabel}</dd>
            </div>
            {niveauUrgence === "planifie" && dateSouhaitee && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Date souhaitée</dt>
                <dd className="text-foreground">
                  {new Date(dateSouhaitee).toLocaleString("fr-FR")}
                </dd>
              </div>
            )}
            {offre && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Offre souhaitée</dt>
                <dd className="text-right font-semibold text-foreground">{offre.titre}</dd>
              </div>
            )}
          </dl>

          {creer.isPending ? (
            <ConciergeLoader phrase="Envoi de votre demande…" sousTexte="Un instant." />
          ) : (
            <div className="flex gap-3">
              <SecondaryButton type="button" className="flex-1" onClick={() => setEtape(0)}>
                Modifier
              </SecondaryButton>
              <PrimaryButton type="button" className="flex-1" onClick={() => creer.mutate()}>
                Confirmer ma demande
              </PrimaryButton>
            </div>
          )}
        </div>
      )}

      {/* Étape 3 — Confirmation */}
      {etape === 2 && demandeCreee && (
        <div className="mt-6 space-y-5">
          <ConciergeLoader
            phrase={
              offre
                ? "MAIDERES examine votre demande et la transmet au prestataire choisi"
                : "Un conseiller MAIDERES s'en occupe"
            }
            {...(niveauUrgence !== "planifie" ? { urgence: niveauUrgence } : {})}
          />
          <DigitalPassport
            qrValue={`${window.location.origin}/espace/demandes/${demandeCreee.id}`}
            code={demandeCreee.id.slice(0, 8).toUpperCase()}
          />
          <PrimaryButton
            className="w-full"
            onClick={() =>
              void navigate({ to: "/espace/demandes/$id", params: { id: demandeCreee.id } })
            }
          >
            Suivre ma demande
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
