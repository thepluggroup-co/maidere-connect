import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "client" | "prestataire" | "admin";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let actif = true;

    const chargerRole = async (uid: string) => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .limit(1)
        .maybeSingle();
      if (actif) setRole((data?.role as Role) ?? "client");
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!actif) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        void chargerRole(s.user.id);
      } else {
        setRole(null);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!actif) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) void chargerRole(data.session.user.id);
      setLoading(false);
    });

    return () => {
      actif = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user, role, loading };
}
