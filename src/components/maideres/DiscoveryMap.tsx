/**
 * DiscoveryMap — src/components/maideres/DiscoveryMap.tsx
 * "Discovery Map avec POI partenaires" (brief).
 *
 * ⚠️ Contrainte réelle vérifiée avant d'écrire une ligne de code : l'API
 * publique (apps/api/src/routes/public.ts, PRESTATAIRE_PUBLIC_FIELDS)
 * N'EXPOSE PAS geoloc_lat/geoloc_lng — la colonne existe dans la table
 * `prestataires` (packages/db/src/schema.pg.ts) mais n'est pas publique,
 * probablement volontairement (ne pas exposer l'adresse exacte d'un
 * prestataire à n'importe quel visiteur anonyme). Impossible de placer un
 * pin précis par prestataire sans soit inventer des coordonnées (faux),
 * soit changer ce que l'API expose (décision produit/vie privée qui
 * n'est pas la mienne à prendre).
 *
 * Donc : regroupement par QUARTIER, pas par prestataire individuel — en
 * utilisant QUARTIERS, des coordonnées déjà réelles et déjà committées
 * dans lib/maidere.ts (des centres de quartier, information publique de
 * toute façon, pas une donnée privée d'un prestataire). Le marqueur
 * affiche un nombre, pas un nom individuel sur la carte elle-même — les
 * noms n'apparaissent que dans le popup au clic, comme la liste l'aurait
 * déjà montré.
 *
 * Nouvelle dépendance : leaflet + react-leaflet (tuiles OpenStreetMap,
 * gratuit, aucune clé API à configurer — contrairement à Mapbox/Google
 * Maps qui demanderaient une clé et potentiellement une facturation,
 * décision que je n'ai pas prise à ta place).
 */
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "@tanstack/react-router";
import { QUARTIERS, coordsQuartier, type Ville } from "@/lib/maidere";
import type { Prestataire } from "@/lib/maideres-api";

export interface DiscoveryMapProps {
  prestataires: Prestataire[];
  ville: Ville | "";
  className?: string;
}

function centreVille(ville: Ville): { lat: number; lng: number } {
  const quartiers = Object.values(QUARTIERS).filter((q) => q.ville === ville);
  const lat = quartiers.reduce((s, q) => s + q.lat, 0) / quartiers.length;
  const lng = quartiers.reduce((s, q) => s + q.lng, 0) / quartiers.length;
  return { lat, lng };
}

function icone(count: number) {
  const taille = count > 1 ? 34 : 28;
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:${taille}px;height:${taille}px;border-radius:9999px;background:#254C8C;border:2px solid #F2A93B;color:#fff;font-weight:700;font-size:12px;box-shadow:0 1px 4px rgba(0,0,0,.35);">${count}</div>`,
    iconSize: [taille, taille],
    iconAnchor: [taille / 2, taille / 2],
  });
}

export function DiscoveryMap({ prestataires, ville, className }: DiscoveryMapProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const groupes = useMemo(() => {
    const map = new Map<string, { coords: { lat: number; lng: number }; items: Prestataire[] }>();
    for (const p of prestataires) {
      if (!p.quartier) continue;
      const coords = coordsQuartier(p.quartier);
      if (!coords) continue;
      if (!map.has(p.quartier)) map.set(p.quartier, { coords, items: [] });
      map.get(p.quartier)!.items.push(p);
    }
    return [...map.entries()];
  }, [prestataires]);

  if (!mounted) {
    return (
      <div
        className={`h-[420px] animate-shimmer rounded-2xl bg-muted ${className ?? ""}`}
        aria-hidden="true"
      />
    );
  }

  const centre = ville ? centreVille(ville) : centreVille("Douala");

  return (
    <div className={`overflow-hidden rounded-2xl border border-border ${className ?? ""}`}>
      <MapContainer
        center={[centre.lat, centre.lng]}
        zoom={12}
        style={{ height: 420, width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {groupes.map(([quartier, { coords, items }]) => (
          <Marker key={quartier} position={[coords.lat, coords.lng]} icon={icone(items.length)}>
            <Popup>
              <p className="font-semibold text-foreground">{quartier}</p>
              <p className="text-xs text-muted-foreground">
                {items.length} prestataire{items.length > 1 ? "s" : ""} vérifié
                {items.length > 1 ? "s" : ""}
              </p>
              <ul className="mt-1 space-y-0.5">
                {items.slice(0, 5).map((p) => (
                  <li key={p.id}>
                    <Link
                      to="/prestataires/$id"
                      params={{ id: p.id }}
                      className="text-primary hover:underline"
                    >
                      {p.nom} — {p.metier_libelle}
                    </Link>
                  </li>
                ))}
              </ul>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
