// ✅ FIXED: types.ts — Fully valid, zero-error version

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      shopify_customers: {
        Row: {
          created_at: string | null;
          email: string | null;
          first_name: string | null;
          id: string;
          is_deleted: boolean | null;
          last_name: string | null;
          shopify_customer_id: string;
          store_id: string;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          last_name?: string | null;
          shopify_customer_id: string;
          store_id: string;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          last_name?: string | null;
          shopify_customer_id?: string;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopify_customers_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      shopify_fulfillments: {
        Row: {
          created_at: string | null;
          fulfillment_id: string;
          id: string;
          order_id: string;
          status: string | null;
          store_id: string;
          tracking_company: string | null;
          tracking_number: string | null;
        };
        Insert: {
          created_at?: string | null;
          fulfillment_id: string;
          id?: string;
          order_id: string;
          status?: string | null;
          store_id: string;
          tracking_company?: string | null;
          tracking_number?: string | null;
        };
        Update: {
          created_at?: string | null;
          fulfillment_id?: string;
          id?: string;
          order_id?: string;
          status?: string | null;
          store_id?: string;
          tracking_company?: string | null;
          tracking_number?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shopify_fulfillments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "shopify_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopify_fulfillments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "vw_fulfillment_delays";
            referencedColumns: ["order_id"];
          },
          {
            foreignKeyName: "shopify_fulfillments_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      shopify_inventory_levels: {
        Row: {
          available_quantity: number | null;
          id: string;
          inventory_item_id: string | null;
          location_id: string | null;
          store_id: string;
          updated_at: string | null;
          variant_id: string;
        };
        Insert: {
          available_quantity?: number | null;
          id?: string;
          inventory_item_id?: string | null;
          location_id?: string | null;
          store_id: string;
          updated_at?: string | null;
          variant_id: string;
        };
        Update: {
          available_quantity?: number | null;
          id?: string;
          inventory_item_id?: string | null;
          location_id?: string | null;
          store_id?: string;
          updated_at?: string | null;
          variant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopify_inventory_levels_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopify_inventory_levels_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "shopify_product_variants";
            referencedColumns: ["id"];
          }
        ];
      };
      shopify_order_geography: {
        Row: {
          city: string | null;
          country: string | null;
          id: string;
          order_id: string;
          state: string | null;
        };
        Insert: {
          city?: string | null;
          country?: string | null;
          id?: string;
          order_id: string;
          state?: string | null;
        };
        Update: {
          city?: string | null;
          country?: string | null;
          id?: string;
          order_id?: string;
          state?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shopify_order_geography_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "shopify_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopify_order_geography_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "vw_fulfillment_delays";
            referencedColumns: ["order_id"];
          }
        ];
      };
      shopify_order_line_items: {
        Row: {
          created_at: string | null;
          discount: number | null;
          id: string;
          order_id: string;
          price: number | null;
          product_id: string | null;
          quantity: number | null;
          store_id: string;
          title: string | null;
          variant_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          discount?: number | null;
          id?: string;
          order_id: string;
          price?: number | null;
          product_id?: string | null;
          quantity?: number | null;
          store_id: string;
          title?: string | null;
          variant_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          discount?: number | null;
          id?: string;
          order_id?: string;
          price?: number | null;
          product_id?: string | null;
          quantity?: number | null;
          store_id?: string;
          title?: string | null;
          variant_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shopify_order_line_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "shopify_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopify_order_line_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "vw_fulfillment_delays";
            referencedColumns: ["order_id"];
          },
          {
            foreignKeyName: "shopify_order_line_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "shopify_products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopify_order_line_items_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      shopify_orders: {
        Row: {
          created_at: string | null;
          currency: string | null;
          customer_id: string | null;
          financial_status: string | null;
          fulfillment_status: string | null;
          id: string;
          is_deleted: boolean | null;
          processed_at: string | null;
          shopify_order_id: string;
          store_id: string;
          subtotal_price: number | null;
          total_discount: number | null;
          total_price: number | null;
        };
        Insert: {
          created_at?: string | null;
          currency?: string | null;
          customer_id?: string | null;
          financial_status?: string | null;
          fulfillment_status?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          processed_at?: string | null;
          shopify_order_id: string;
          store_id: string;
          subtotal_price?: number | null;
          total_discount?: number | null;
          total_price?: number | null;
        };
        Update: {
          created_at?: string | null;
          currency?: string | null;
          customer_id?: string | null;
          financial_status?: string | null;
          fulfillment_status?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          processed_at?: string | null;
          shopify_order_id?: string;
          store_id?: string;
          subtotal_price?: number | null;
          total_discount?: number | null;
          total_price?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "shop_orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "shopify_customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shop_orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "vw_customer_churn_candidates";
            referencedColumns: ["customer_id"];
          },
          {
            foreignKeyName: "shop_orders_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      shopify_product_variants: {
        Row: {
          created_at: string | null;
          id: string;
          inventory_quantity: number | null;
          price: number | null;
          product_id: string;
          shopify_variant_id: string;
          sku: string | null;
          store_id: string;
          title: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          inventory_quantity?: number | null;
          price?: number | null;
          product_id: string;
          shopify_variant_id: string;
          sku?: string | null;
          store_id: string;
          title?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          inventory_quantity?: number | null;
          price?: number | null;
          product_id?: string;
          shopify_variant_id?: string;
          sku?: string | null;
          store_id?: string;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shopify_product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "shopify_products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopify_product_variants_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      shopify_products: {
        Row: {
          created_at: string | null;
          id: string;
          is_deleted: boolean | null;
          shopify_product_id: string;
          store_id: string;
          title: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          shopify_product_id: string;
          store_id: string;
          title?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          shopify_product_id?: string;
          store_id?: string;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shopify_products_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      shopify_stores: {
        Row: {
          access_token: string | null;
          created_at: string | null;
          domain: string;
          id: string;
        };
        Insert: {
          access_token?: string | null;
          created_at?: string | null;
          domain: string;
          id?: string;
        };
        Update: {
          access_token?: string | null;
          created_at?: string | null;
          domain?: string;
          id?: string;
        };
        Relationships: [];
      };
      stores: {
        Row: {
          access_token: string;
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          plan: string | null;
          shop_domain: string;
          sync_finished_at: string | null;
          sync_started_at: string | null;
          sync_status: string | null;
          updated_at: string | null;
          disconnected_at: string | null;     // ✅ NEW
        };
        Insert: {
          access_token: string;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          plan?: string | null;
          shop_domain: string;
          sync_finished_at?: string | null;
          sync_started_at?: string | null;
          sync_status?: string | null;
          updated_at?: string | null;
          disconnected_at?: string | null;    // ✅ NEW
        };
        Update: {
          access_token?: string;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          plan?: string | null;
          shop_domain?: string;
          sync_finished_at?: string | null;
          sync_started_at?: string | null;
          sync_status?: string | null;
          updated_at?: string | null;
          disconnected_at?: string | null;    // ✅ NEW
        };
        Relationships: [];
      };
      user_consent_logs: {
        Row: {
          agreed_to_data_usage: boolean;
          agreed_to_terms: boolean;
          consented_at: string | null;
          id: string;
          store_id: string;
        };
        Insert: {
          agreed_to_data_usage: boolean;
          agreed_to_terms: boolean;
          consented_at?: string | null;
          id?: string;
          store_id: string;
        };
        Update: {
          agreed_to_data_usage?: boolean;
          agreed_to_terms?: boolean;
          consented_at?: string | null;
          id?: string;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_consent_logs_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      webhook_logs: {
        Row: {
          id: string;
          raw_payload: Json | null;
          received_at: string | null;
          shopify_order_id: string | null;
          store_domain: string | null;
          type: string | null;
        };
        Insert: {
          id?: string;
          raw_payload?: Json | null;
          received_at?: string | null;
          shopify_order_id?: string | null;
          store_domain?: string | null;
          type?: string | null;
        };
        Update: {
          id?: string;
          raw_payload?: Json | null;
          received_at?: string | null;
          shopify_order_id?: string | null;
          store_domain?: string | null;
          type?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      view_customer_repeat_ratio: {
        Row: {
          category: string | null;
          customer_count: number | null;
          store_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shop_orders_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      view_customer_segments: {
        Row: {
          customer_id: string | null;
          order_count: number | null;
          recency_days: number | null;
          segment: string | null;
          store_id: string | null;
          total_spent: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "shop_orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "shopify_customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shop_orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "vw_customer_churn_candidates";
            referencedColumns: ["customer_id"];
          },
          {
            foreignKeyName: "shop_orders_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      view_dashboard_summary: {
        Row: {
          avg_order_value: number | null;
          date_range: string | null;
          new_customers: number | null;
          store_id: string | null;
          total_orders: number | null;
          total_revenue: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "shop_orders_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      view_ltv_distribution: {
        Row: {
          customer_count: number | null;
          ltv_bucket: string | null;
          store_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shop_orders_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      view_sales_over_time: {
        Row: {
          daily_orders: number | null;
          daily_revenue: number | null;
          day: string | null;
          store_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shop_orders_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      view_top_products: {
        Row: {
          percentage_of_total: number | null;
          product_title: string | null;
          store_id: string | null;
          total_revenue: number | null;
          units_sold: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "shopify_order_line_items_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      vw_customer_acquisition: {
        Row: {
          new_customers: number | null;
          period: string | null;
          store_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shop_orders_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      vw_customer_acquisition_raw: {
        Row: {
          customer_id: string | null;
          period: string | null;
          store_id: string | null;
          total_orders: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "shop_orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "shopify_customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shop_orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "vw_customer_churn_candidates";
            referencedColumns: ["customer_id"];
          },
          {
            foreignKeyName: "shop_orders_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      vw_customer_churn_candidates: {
        Row: {
          customer_id: string | null;
          days_inactive: number | null;
          last_order_at: string | null;
          store_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shopify_customers_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      vw_fulfillment_delays: {
        Row: {
          created_at: string | null;
          delay_days: number | null;
          order_id: string | null;
          processed_at: string | null;
          store_id: string | null;
          total_price: number | null;
        };
        Insert: {
          created_at?: string | null;
          delay_days?: never;
          order_id?: string | null;
          processed_at?: string | null;
          store_id?: string | null;
          total_price?: number | null;
        };
        Update: {
          created_at?: string | null;
          delay_days?: never;
          order_id?: string | null;
          processed_at?: string | null;
          store_id?: string | null;
          total_price?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "shop_orders_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      vw_order_status_distribution: {
        Row: {
          order_count: number | null;
          status: string | null;
          store_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shop_orders_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      vw_sales_by_geo: {
        Row: {
          average_order_value: number | null;
          city: string | null;
          country: string | null;
          last_order_at: string | null;
          state: string | null;
          store_id: string | null;
          total_orders: number | null;
          total_revenue: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "shop_orders_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      vw_top_selling_products: {
        Row: {
          average_price: number | null;
          product_id: string | null;
          product_title: string | null;
          store_id: string | null;
          total_quantity_sold: number | null;
          total_revenue: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "shopify_order_line_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "shopify_products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopify_order_line_items_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      vw_analytics_sales_overview: {
        Row: {
          store_id: string | null;
          day: string | null;
          total: number | null;
          net: number | null;
          refunds: number | null;
          tax: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "shop_orders_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      vw_ltv_distribution_percentiles: {
        Row: {
          store_id: string | null;
          customer_id: string | null;
          total_spent: number | null;
          percentile_rank: number | null; // 0–100
        };
        Relationships: [
          {
            foreignKeyName: "shop_orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "shopify_customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shop_orders_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
      vw_variant_sales_summary: {
        Row: {
          sku: string | null;
          store_id: string | null;
          total_revenue: number | null;
          units_sold: number | null;
          variant_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shopify_order_line_items_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "shopify_stores";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Enums: Record<string, never>; // ✅ Fixed empty object type lint error
    CompositeTypes: Record<string, never>; // ✅ Fixed empty object type lint error
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {} as Record<string, never>,
  },
} as const;