import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { resoudreIdentitePourUtilisateur, type Identite } from "@/lib/maideres-core-client";

/**
 * "client"/"prestataire" sont des identités dérivées (existence d'une fiche
 * clients/prestataires liée au profil), pas une valeur de rôle — cf.
 * docs/integration/03-AUTH-MAPPING.md. "staff" couvre les comptes MAIDERES
 * (admin/opérateur/superviseur) qui n'ont ni l'un ni l'autre ; connect n'a
 * pas d'écran dédié pour eux (ils utilisent la Console 360, apps/web).
 */
export type Espace = "client" | "prestataire" | "staff" | null;

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [identite, setIdentite] = useState<Identite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let actif = true;

    const resoudre = async (u: User) => {
      try {
        const id = await resoudreIdentitePourUtilisateur(u);
        if (actif) setIdentite(id);
      } catch {
        if (actif) setIdentite(null);
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!actif) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) void resoudre(s.user);
      else setIdentite(null);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!actif) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) void resoudre(data.session.user);
      setLoading(false);
    });

    return () => {
      actif = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const espace: Espace = !identite
    ? null
    : identite.isStaff
      ? "staff"
      : identite.prestataireId
        ? "prestataire"
        : identite.clientId
          ? "client"
          : null;

  return { session, user, identite, espace, loading };
}
