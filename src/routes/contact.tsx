import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/maideres/PageShell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — MAIDERES" },
      {
        name: "description",
        content:
          "Contactez l'équipe MAIDERES à Douala, Yaoundé ou Abidjan : question, partenariat, candidature prestataire ou litige.",
      },
      { property: "og:title", content: "Contact — MAIDERES" },
      {
        property: "og:description",
        content:
          "Une question sur MAIDERES ? Écrivez-nous, notre équipe répond rapidement.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [envoye, setEnvoye] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.currentTarget.reset();
    setEnvoye(true);
    toast.success("Message envoyé. Notre équipe vous répondra rapidement.");
  };

  return (
    <PageShell
      titre="Contactez-nous"
      accroche="Une question, un partenariat, un litige ? Écrivez-nous, notre équipe répond en français."
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-bold text-primary">Coordonnées</h2>
            <ul className="mt-4 space-y-3 text-sm text-foreground">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-secondary" /> +237 6 00 00 00 00
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-secondary" /> contact@maideres.com
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-secondary" /> Douala · Yaoundé · Abidjan
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-bold text-primary">Horaires</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Lundi – samedi, 8 h – 19 h (GMT+1). Les urgences signalées via la plateforme sont
              traitées en priorité.
            </p>
          </div>
        </aside>

        <form onSubmit={onSubmit} className="rounded-3xl border border-border bg-card p-6 lg:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-primary">
              Nom complet
              <input
                required
                name="nom"
                type="text"
                placeholder="Votre nom"
                className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm font-normal text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="block text-sm font-semibold text-primary">
              E-mail ou téléphone
              <input
                required
                name="contact"
                type="text"
                placeholder="Pour vous répondre"
                className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm font-normal text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          </div>
          <label className="mt-4 block text-sm font-semibold text-primary">
            Sujet
            <select
              name="sujet"
              className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm font-normal text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option>Question générale</option>
              <option>Devenir prestataire</option>
              <option>Partenariat / entreprise</option>
              <option>Litige sur une intervention</option>
              <option>Autre</option>
            </select>
          </label>
          <label className="mt-4 block text-sm font-semibold text-primary">
            Message
            <textarea
              required
              name="message"
              rows={6}
              placeholder="Décrivez votre demande…"
              className="mt-2 w-full resize-y rounded-2xl border border-input bg-background px-4 py-3 text-sm font-normal text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button
            type="submit"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground transition-transform hover:-translate-y-0.5"
          >
            Envoyer <Send className="h-4 w-4" />
          </button>
          {envoye && (
            <p className="mt-4 rounded-2xl bg-etat-succes px-4 py-3 text-sm font-medium text-etat-succes-fg">
              Merci ! Votre message a bien été pris en compte.
            </p>
          )}
        </form>
      </div>
    </PageShell>
  );
}
