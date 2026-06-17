/**
 * Minimal hand-written Database types for Phase 0 read/write paths.
 *
 * Regenerate the full set later with:
 *   supabase gen types typescript --project-id <project-ref> --schema public > lib/supabase/types.ts
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
          snapshot_date: string;
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
      catatans: {
        Row: {
          catatan_id: string;
          user_id: string;
          city_id: string;
          state: "active" | "archived" | "cancelled";
          created_at: string;
          archived_at: string | null;
        };
        Insert: {
          catatan_id?: string;
          user_id: string;
          city_id: string;
          state?: "active" | "archived" | "cancelled";
          created_at?: string;
          archived_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["catatans"]["Row"]>;
      };
      catatan_items: {
        Row: {
          item_id: string;
          catatan_id: string;
          sku_id: string;
          qty: number;
          price_at_add_idr: number;
          added_at: string;
        };
        Insert: {
          item_id?: string;
          catatan_id: string;
          sku_id: string;
          qty: number;
          price_at_add_idr: number;
          added_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["catatan_items"]["Row"]>;
      };
      riwayat_entries: {
        Row: {
          riwayat_id: string;
          user_id: string;
          archived_catatan_id: string | null;
          city_id: string;
          pasar_label: string | null;
          confirmed_at: string;
        };
        Insert: {
          riwayat_id?: string;
          user_id: string;
          archived_catatan_id?: string | null;
          city_id: string;
          pasar_label?: string | null;
          confirmed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["riwayat_entries"]["Row"]>;
      };
      riwayat_items: {
        Row: {
          riwayat_item_id: string;
          riwayat_id: string;
          sku_id: string;
          qty: number;
          price_pihps_idr: number;
          price_actual_idr: number | null;
        };
        Insert: {
          riwayat_item_id?: string;
          riwayat_id: string;
          sku_id: string;
          qty: number;
          price_pihps_idr: number;
          price_actual_idr?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["riwayat_items"]["Row"]>;
      };
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
};
