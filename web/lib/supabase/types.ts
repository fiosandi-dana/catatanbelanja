/**
 * Minimal hand-written Database types for Phase 0 read paths.
 *
 * Regenerate the full set with:
 *   supabase gen types typescript --project-id <project-ref> --schema public > lib/supabase/types.ts
 * once you've linked the Supabase project. Until then, this covers what the UI
 * currently reads (skus, cities, price_snapshots).
 */
export type Database = {
  public: {
    Tables: {
      skus: {
        Row: {
          sku_id: string;
          name_id: string;
          unit: string;
          category: string;
          active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["skus"]["Row"]> & {
          sku_id: string;
          name_id: string;
          unit: string;
          category: string;
        };
        Update: Partial<Database["public"]["Tables"]["skus"]["Row"]>;
      };
      cities: {
        Row: {
          city_id: string;
          name_id: string;
          pihps_code: string;
          active: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["cities"]["Row"]> & {
          city_id: string;
          name_id: string;
          pihps_code: string;
        };
        Update: Partial<Database["public"]["Tables"]["cities"]["Row"]>;
      };
      price_snapshots: {
        Row: {
          sku_id: string;
          city_id: string;
          snapshot_date: string; // ISO date YYYY-MM-DD
          price_idr: number;
          source: string;
          scraped_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["price_snapshots"]["Row"],
          "scraped_at"
        > & { scraped_at?: string };
        Update: Partial<Database["public"]["Tables"]["price_snapshots"]["Row"]>;
      };
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
};
