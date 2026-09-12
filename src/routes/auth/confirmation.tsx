import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { fetchMonIdentite } from "@/lib/maideres-core-client";

const ERP_URL = (import.meta.env["VITE_MAIDERES_ERP_URL"] as string | undefined) ?? "https://maideres-erp.vercel.app";

export const Route = createFileRoute("/auth/confirmation")({
  ssr: false,
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function completeConfirmation() {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (active) setError(exchangeError.message);
          return;
        }
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session?.user) {
        if (active) setError(sessionError?.message ?? "La confirmation n'a pas créé de session.");
        return;
      }

      const role = data.session.user.app_metadata?.["role"];
      const identity = await fetchMonIdentite();
      if (identity.isStaff || role === "admin" || role === "superviseur" || role === "operateur") {
        window.location.replace(`${ERP_URL}/login`);
        return;
      }

      if (identity.prestataireId || role === "prestataire") {
        window.location.replace("/pro");
        return;
      }

      window.location.replace("/espace");
    }

    void completeConfirmation().catch((confirmationError: unknown) => {
      if (active) {
        setError(confirmationError instanceof Error ? confirmationError.message : "Confirmation impossible.");
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <p className="max-w-md text-center text-sm text-muted-foreground">
        {error ?? "Confirmation de votre adresse e-mail en cours..."}
      </p>
    </main>
  );
}
