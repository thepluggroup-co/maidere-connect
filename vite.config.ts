import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Config Vite autonome — remplace @lovable.dev/vite-tanstack-config (retiré,
// cf. commit "chore: retirer Lovable du projet"). Reprend uniquement ce que
// ce projet utilise réellement de ce préset : TanStack Start + Nitro/Vercel,
// React, Tailwind, résolution de chemins. Laissé de côté volontairement —
// tout ce qui ne concernait que le bac à sable Lovable et n'a plus de sens
// une fois hébergé ailleurs : le proxy d'assets vers *.lovable.app, le
// "HMR gate" de coordination avec leur éditeur, les loggers d'erreurs de
// build spécifiques à leur pipeline, et la publication d'un "document set"
// pour leur pré-rendu (ce projet n'active pas `pages`/prerender — SSR pur,
// cf. `server.entry` ci-dessous — donc rien de tout ça n'était utilisé ici).
export default defineConfig(({ mode }) => {
  // Vite injecte déjà VITE_* dans import.meta.env par défaut ; on les
  // redéfinit aussi en dur ici pour qu'ils survivent au bundling du build
  // serveur Nitro/Vercel (edge runtime), comme le faisait le préset Lovable.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine = Object.fromEntries(
    Object.entries(env).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
  );

  return {
    define: envDefine,
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      ignoreOutdatedRequests: true,
    },
    server: { host: "::", port: 8080 },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        server: { entry: "server" },
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
      }),
      nitro({ preset: "vercel" }),
      viteReact(),
    ],
  };
});
