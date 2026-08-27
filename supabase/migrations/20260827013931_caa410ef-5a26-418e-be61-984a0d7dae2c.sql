-- ENUMS
CREATE TYPE public.app_role AS ENUM ('client', 'prestataire', 'admin');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom_complet TEXT NOT NULL DEFAULT '',
  telephone TEXT,
  ville TEXT,
  quartier TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profils lisibles publiquement" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "gerer son profil" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lire ses roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- signup trigger: creates profile + role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE r public.app_role;
BEGIN
  INSERT INTO public.profiles (id, nom_complet, telephone, ville, quartier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom_complet', NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'telephone',
    NEW.raw_user_meta_data->>'ville',
    NEW.raw_user_meta_data->>'quartier'
  )
  ON CONFLICT (id) DO NOTHING;

  r := CASE WHEN NEW.raw_user_meta_data->>'role' = 'prestataire' THEN 'prestataire'::public.app_role
            ELSE 'client'::public.app_role END;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, r)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF r = 'prestataire' THEN
    INSERT INTO public.prestataires (user_id, nom_affichage, metier, ville, quartier)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'nom_complet', 'Prestataire'),
      COALESCE(NEW.raw_user_meta_data->>'metier', 'Services'),
      COALESCE(NEW.raw_user_meta_data->>'ville', 'Douala'),
      NEW.raw_user_meta_data->>'quartier'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

-- PRESTATAIRES
CREATE TABLE public.prestataires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nom_affichage TEXT NOT NULL,
  metier TEXT NOT NULL,
  categorie TEXT,
  bio TEXT,
  ville TEXT NOT NULL DEFAULT 'Douala',
  quartier TEXT,
  zones_couverture TEXT[] NOT NULL DEFAULT '{}',
  telephone TEXT,
  photo_url TEXT,
  disponible BOOLEAN NOT NULL DEFAULT true,
  verifie BOOLEAN NOT NULL DEFAULT false,
  publie BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prestataires TO authenticated;
GRANT SELECT ON public.prestataires TO anon;
GRANT ALL ON public.prestataires TO service_role;
ALTER TABLE public.prestataires ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prestataires publies visibles" ON public.prestataires FOR SELECT USING (publie = true);
CREATE POLICY "gerer sa fiche prestataire" ON public.prestataires FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER prestataires_updated_at BEFORE UPDATE ON public.prestataires FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- OFFRES
CREATE TABLE public.offres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestataire_id UUID NOT NULL REFERENCES public.prestataires(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  categorie TEXT NOT NULL,
  description TEXT,
  prestations TEXT[] NOT NULL DEFAULT '{}',
  prix INTEGER NOT NULL DEFAULT 0,
  unite_prix TEXT NOT NULL DEFAULT 'forfait',
  delai_heures INTEGER NOT NULL DEFAULT 24,
  image_url TEXT,
  publie BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offres TO authenticated;
GRANT SELECT ON public.offres TO anon;
GRANT ALL ON public.offres TO service_role;
ALTER TABLE public.offres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "offres publiees visibles" ON public.offres FOR SELECT USING (publie = true);
CREATE POLICY "gerer ses offres" ON public.offres FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER offres_updated_at BEFORE UPDATE ON public.offres FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PROMOTIONS
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestataire_id UUID NOT NULL REFERENCES public.prestataires(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offre_id UUID REFERENCES public.offres(id) ON DELETE SET NULL,
  titre TEXT NOT NULL,
  description TEXT,
  remise_pct INTEGER NOT NULL DEFAULT 10,
  debut DATE NOT NULL DEFAULT CURRENT_DATE,
  fin DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotions TO authenticated;
GRANT SELECT ON public.promotions TO anon;
GRANT ALL ON public.promotions TO service_role;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promotions actives visibles" ON public.promotions FOR SELECT USING (active = true);
CREATE POLICY "gerer ses promotions" ON public.promotions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- REALISATIONS (galerie)
CREATE TABLE public.realisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestataire_id UUID NOT NULL REFERENCES public.prestataires(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titre TEXT NOT NULL DEFAULT '',
  description TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.realisations TO authenticated;
GRANT SELECT ON public.realisations TO anon;
GRANT ALL ON public.realisations TO service_role;
ALTER TABLE public.realisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "realisations visibles" ON public.realisations FOR SELECT USING (true);
CREATE POLICY "gerer ses realisations" ON public.realisations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER realisations_updated_at BEFORE UPDATE ON public.realisations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AVIS
CREATE TABLE public.avis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestataire_id UUID NOT NULL REFERENCES public.prestataires(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note INTEGER NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT,
  reponse TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (prestataire_id, client_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avis TO authenticated;
GRANT SELECT ON public.avis TO anon;
GRANT ALL ON public.avis TO service_role;
ALTER TABLE public.avis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "avis visibles" ON public.avis FOR SELECT USING (true);
CREATE POLICY "client cree son avis" ON public.avis FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY "client modifie son avis" ON public.avis FOR UPDATE TO authenticated USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
CREATE POLICY "client supprime son avis" ON public.avis FOR DELETE TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "prestataire repond a ses avis" ON public.avis FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.prestataires p WHERE p.id = avis.prestataire_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.prestataires p WHERE p.id = avis.prestataire_id AND p.user_id = auth.uid()));
CREATE TRIGGER avis_updated_at BEFORE UPDATE ON public.avis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_offres_prestataire ON public.offres(prestataire_id);
CREATE INDEX idx_promotions_prestataire ON public.promotions(prestataire_id);
CREATE INDEX idx_realisations_prestataire ON public.realisations(prestataire_id);
CREATE INDEX idx_avis_prestataire ON public.avis(prestataire_id);
CREATE INDEX idx_prestataires_ville ON public.prestataires(ville);