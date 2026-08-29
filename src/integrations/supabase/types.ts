export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      avis: {
        Row: {
          client_id: string
          commentaire: string | null
          created_at: string
          id: string
          note: number
          prestataire_id: string
          reponse: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          commentaire?: string | null
          created_at?: string
          id?: string
          note: number
          prestataire_id: string
          reponse?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          commentaire?: string | null
          created_at?: string
          id?: string
          note?: number
          prestataire_id?: string
          reponse?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avis_prestataire_id_fkey"
            columns: ["prestataire_id"]
            isOneToOne: false
            referencedRelation: "prestataires"
            referencedColumns: ["id"]
          },
        ]
      }
      offres: {
        Row: {
          categorie: string
          created_at: string
          delai_heures: number
          description: string | null
          id: string
          image_url: string | null
          prestataire_id: string
          prestations: string[]
          prix: number
          publie: boolean
          titre: string
          unite_prix: string
          updated_at: string
          user_id: string
        }
        Insert: {
          categorie: string
          created_at?: string
          delai_heures?: number
          description?: string | null
          id?: string
          image_url?: string | null
          prestataire_id: string
          prestations?: string[]
          prix?: number
          publie?: boolean
          titre: string
          unite_prix?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          categorie?: string
          created_at?: string
          delai_heures?: number
          description?: string | null
          id?: string
          image_url?: string | null
          prestataire_id?: string
          prestations?: string[]
          prix?: number
          publie?: boolean
          titre?: string
          unite_prix?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offres_prestataire_id_fkey"
            columns: ["prestataire_id"]
            isOneToOne: false
            referencedRelation: "prestataires"
            referencedColumns: ["id"]
          },
        ]
      }
      prestataires: {
        Row: {
          bio: string | null
          categorie: string | null
          created_at: string
          disponible: boolean
          id: string
          metier: string
          nom_affichage: string
          photo_url: string | null
          publie: boolean
          quartier: string | null
          telephone: string | null
          updated_at: string
          user_id: string
          verifie: boolean
          ville: string
          zones_couverture: string[]
        }
        Insert: {
          bio?: string | null
          categorie?: string | null
          created_at?: string
          disponible?: boolean
          id?: string
          metier: string
          nom_affichage: string
          photo_url?: string | null
          publie?: boolean
          quartier?: string | null
          telephone?: string | null
          updated_at?: string
          user_id: string
          verifie?: boolean
          ville?: string
          zones_couverture?: string[]
        }
        Update: {
          bio?: string | null
          categorie?: string | null
          created_at?: string
          disponible?: boolean
          id?: string
          metier?: string
          nom_affichage?: string
          photo_url?: string | null
          publie?: boolean
          quartier?: string | null
          telephone?: string | null
          updated_at?: string
          user_id?: string
          verifie?: boolean
          ville?: string
          zones_couverture?: string[]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          nom_complet: string
          quartier: string | null
          telephone: string | null
          updated_at: string
          ville: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          nom_complet?: string
          quartier?: string | null
          telephone?: string | null
          updated_at?: string
          ville?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          nom_complet?: string
          quartier?: string | null
          telephone?: string | null
          updated_at?: string
          ville?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          active: boolean
          created_at: string
          debut: string
          description: string | null
          fin: string | null
          id: string
          offre_id: string | null
          prestataire_id: string
          remise_pct: number
          titre: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          debut?: string
          description?: string | null
          fin?: string | null
          id?: string
          offre_id?: string | null
          prestataire_id: string
          remise_pct?: number
          titre: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          debut?: string
          description?: string | null
          fin?: string | null
          id?: string
          offre_id?: string | null
          prestataire_id?: string
          remise_pct?: number
          titre?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_offre_id_fkey"
            columns: ["offre_id"]
            isOneToOne: false
            referencedRelation: "offres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_prestataire_id_fkey"
            columns: ["prestataire_id"]
            isOneToOne: false
            referencedRelation: "prestataires"
            referencedColumns: ["id"]
          },
        ]
      }
      realisations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          prestataire_id: string
          titre: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          prestataire_id: string
          titre?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          prestataire_id?: string
          titre?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "realisations_prestataire_id_fkey"
            columns: ["prestataire_id"]
            isOneToOne: false
            referencedRelation: "prestataires"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "client" | "prestataire" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["client", "prestataire", "admin"],
    },
  },
} as const
