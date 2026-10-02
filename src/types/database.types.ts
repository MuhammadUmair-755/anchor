export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Future tables will be defined here (e.g., users, anchors, logs, etc.)
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          email: string | null;
          name: string | null;
          avatar_url: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string | null;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
