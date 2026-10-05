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
      profiles: {
        Row: {
          id: string; // Clerk User ID
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'checking' | 'cash' | 'savings' | 'credit';
          institution: string | null;
          account_number_masked: string | null;
          balance: number;
          currency: 'INR' | 'USD' | 'EUR' | 'GBP';
          status: 'active' | 'reconciled' | 'archived';
          trend_label: string | null;
          credit_limit: number | null;
          payment_due_date: string | null;
          last_reconciled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: 'checking' | 'cash' | 'savings' | 'credit';
          institution?: string | null;
          account_number_masked?: string | null;
          balance?: number;
          currency?: 'INR' | 'USD' | 'EUR' | 'GBP';
          status?: 'active' | 'reconciled' | 'archived';
          trend_label?: string | null;
          credit_limit?: number | null;
          payment_due_date?: string | null;
          last_reconciled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: 'checking' | 'cash' | 'savings' | 'credit';
          institution?: string | null;
          account_number_masked?: string | null;
          balance?: number;
          currency?: 'INR' | 'USD' | 'EUR' | 'GBP';
          status?: 'active' | 'reconciled' | 'archived';
          trend_label?: string | null;
          credit_limit?: number | null;
          payment_due_date?: string | null;
          last_reconciled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      transactions: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          destination_account_id: string | null;
          amount: number;
          currency: 'INR' | 'USD' | 'EUR' | 'GBP';
          flow_type: 'inflow' | 'outflow' | 'transfer';
          category:
            | 'food_dining'
            | 'housing_utilities'
            | 'transport_transit'
            | 'shopping_gear'
            | 'health_wellness'
            | 'knowledge_subs'
            | 'consulting_inflow'
            | 'salary_payroll'
            | 'other';
          payee_or_payer: string;
          note: string | null;
          date: string;
          time: string | null;
          payment_method: 'cash' | 'upi' | 'card' | 'direct_deposit' | 'wire';
          status: 'cleared' | 'pending' | 'reconciled';
          is_recurring: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          destination_account_id?: string | null;
          amount: number;
          currency?: 'INR' | 'USD' | 'EUR' | 'GBP';
          flow_type: 'inflow' | 'outflow' | 'transfer';
          category:
            | 'food_dining'
            | 'housing_utilities'
            | 'transport_transit'
            | 'shopping_gear'
            | 'health_wellness'
            | 'knowledge_subs'
            | 'consulting_inflow'
            | 'salary_payroll'
            | 'other';
          payee_or_payer: string;
          note?: string | null;
          date?: string;
          time?: string | null;
          payment_method?: 'cash' | 'upi' | 'card' | 'direct_deposit' | 'wire';
          status?: 'cleared' | 'pending' | 'reconciled';
          is_recurring?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string;
          destination_account_id?: string | null;
          amount?: number;
          currency?: 'INR' | 'USD' | 'EUR' | 'GBP';
          flow_type?: 'inflow' | 'outflow' | 'transfer';
          category?:
            | 'food_dining'
            | 'housing_utilities'
            | 'transport_transit'
            | 'shopping_gear'
            | 'health_wellness'
            | 'knowledge_subs'
            | 'consulting_inflow'
            | 'salary_payroll'
            | 'other';
          payee_or_payer?: string;
          note?: string | null;
          date?: string;
          time?: string | null;
          payment_method?: 'cash' | 'upi' | 'card' | 'direct_deposit' | 'wire';
          status?: 'cleared' | 'pending' | 'reconciled';
          is_recurring?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_destination_account_id_fkey";
            columns: ["destination_account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          }
        ];
      };

      budget_envelopes: {
        Row: {
          id: string;
          user_id: string;
          category:
            | 'food_dining'
            | 'housing_utilities'
            | 'transport_transit'
            | 'shopping_gear'
            | 'health_wellness'
            | 'knowledge_subs'
            | 'consulting_inflow'
            | 'salary_payroll'
            | 'other';
          label: string;
          allocated_amount: number;
          currency: 'INR' | 'USD' | 'EUR' | 'GBP';
          cycle: string;
          icon: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category:
            | 'food_dining'
            | 'housing_utilities'
            | 'transport_transit'
            | 'shopping_gear'
            | 'health_wellness'
            | 'knowledge_subs'
            | 'consulting_inflow'
            | 'salary_payroll'
            | 'other';
          label: string;
          allocated_amount?: number;
          currency?: 'INR' | 'USD' | 'EUR' | 'GBP';
          cycle: string;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?:
            | 'food_dining'
            | 'housing_utilities'
            | 'transport_transit'
            | 'shopping_gear'
            | 'health_wellness'
            | 'knowledge_subs'
            | 'consulting_inflow'
            | 'salary_payroll'
            | 'other';
          label?: string;
          allocated_amount?: number;
          currency?: 'INR' | 'USD' | 'EUR' | 'GBP';
          cycle?: string;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budget_envelopes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      recurring_obligations: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          currency: 'INR' | 'USD' | 'EUR' | 'GBP';
          billing_cycle: 'monthly' | 'quarterly' | 'annual';
          renewal_notice: string | null;
          status: 'upcoming' | 'cleared' | 'alert';
          category: string;
          icon: string | null;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          amount: number;
          currency?: 'INR' | 'USD' | 'EUR' | 'GBP';
          billing_cycle: 'monthly' | 'quarterly' | 'annual';
          renewal_notice?: string | null;
          status?: 'upcoming' | 'cleared' | 'alert';
          category: string;
          icon?: string | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          amount?: number;
          currency?: 'INR' | 'USD' | 'EUR' | 'GBP';
          billing_cycle?: 'monthly' | 'quarterly' | 'annual';
          renewal_notice?: string | null;
          status?: 'upcoming' | 'cleared' | 'alert';
          category?: string;
          icon?: string | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recurring_obligations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          tag: string | null;
          description: string | null;
          progress_percentage: number;
          next_milestone: string | null;
          target_date: string | null;
          accent_color: string | null;
          status: 'active' | 'completed' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          tag?: string | null;
          description?: string | null;
          progress_percentage?: number;
          next_milestone?: string | null;
          target_date?: string | null;
          accent_color?: string | null;
          status?: 'active' | 'completed' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          tag?: string | null;
          description?: string | null;
          progress_percentage?: number;
          next_milestone?: string | null;
          target_date?: string | null;
          accent_color?: string | null;
          status?: 'active' | 'completed' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      tasks: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          title: string;
          priority: 'low' | 'medium' | 'high';
          category: 'work' | 'personal' | 'finance' | 'learning';
          tab_category: 'today' | 'upcoming' | 'overdue' | 'completed' | 'backlog';
          status_badge: string | null;
          due_date: string | null;
          due_time: string | null;
          due_info: string | null;
          estimated_minutes: number | null;
          is_focus_block: boolean;
          is_completed: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          title: string;
          priority?: 'low' | 'medium' | 'high';
          category?: 'work' | 'personal' | 'finance' | 'learning';
          tab_category?: 'today' | 'upcoming' | 'overdue' | 'completed' | 'backlog';
          status_badge?: string | null;
          due_date?: string | null;
          due_time?: string | null;
          due_info?: string | null;
          estimated_minutes?: number | null;
          is_focus_block?: boolean;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          title?: string;
          priority?: 'low' | 'medium' | 'high';
          category?: 'work' | 'personal' | 'finance' | 'learning';
          tab_category?: 'today' | 'upcoming' | 'overdue' | 'completed' | 'backlog';
          status_badge?: string | null;
          due_date?: string | null;
          due_time?: string | null;
          due_info?: string | null;
          estimated_minutes?: number | null;
          is_focus_block?: boolean;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };

      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          date_key: string;
          entry_number: number | null;
          title: string;
          snippet: string | null;
          word_count: number;
          reading_time_minutes: number;
          mood_tag: 'Grounded' | 'Strategic' | 'Review' | 'Systems' | 'Weekly Audit';
          inquiry_question: string | null;
          inquiry_answered: boolean;
          inquiry_answer: string | null;
          tone_assessment: string | null;
          content_paragraphs: Json;
          quote: string | null;
          quote_attribution: string | null;
          observations: Json;
          micro_observations: Json;
          linked_project_id: string | null;
          logged_time_info: string | null;
          tags: string[];
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date_key: string;
          entry_number?: number | null;
          title: string;
          snippet?: string | null;
          word_count?: number;
          reading_time_minutes?: number;
          mood_tag?: 'Grounded' | 'Strategic' | 'Review' | 'Systems' | 'Weekly Audit';
          inquiry_question?: string | null;
          inquiry_answered?: boolean;
          inquiry_answer?: string | null;
          tone_assessment?: string | null;
          content_paragraphs?: Json;
          quote?: string | null;
          quote_attribution?: string | null;
          observations?: Json;
          micro_observations?: Json;
          linked_project_id?: string | null;
          logged_time_info?: string | null;
          tags?: string[];
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date_key?: string;
          entry_number?: number | null;
          title?: string;
          snippet?: string | null;
          word_count?: number;
          reading_time_minutes?: number;
          mood_tag?: 'Grounded' | 'Strategic' | 'Review' | 'Systems' | 'Weekly Audit';
          inquiry_question?: string | null;
          inquiry_answered?: boolean;
          inquiry_answer?: string | null;
          tone_assessment?: string | null;
          content_paragraphs?: Json;
          quote?: string | null;
          quote_attribution?: string | null;
          observations?: Json;
          micro_observations?: Json;
          linked_project_id?: string | null;
          logged_time_info?: string | null;
          tags?: string[];
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "journal_entries_linked_project_id_fkey";
            columns: ["linked_project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };

      pinned_maxims: {
        Row: {
          id: string;
          user_id: string;
          quote: string;
          attribution: string;
          source_codex: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quote: string;
          attribution: string;
          source_codex?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quote?: string;
          attribution?: string;
          source_codex?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pinned_maxims_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      calendar_events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          date: string;
          time: string | null;
          type: 'event' | 'task' | 'financial' | 'journal';
          amount: number | null;
          note: string | null;
          is_reconciled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          date: string;
          time?: string | null;
          type: 'event' | 'task' | 'financial' | 'journal';
          amount?: number | null;
          note?: string | null;
          is_reconciled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          date?: string;
          time?: string | null;
          type?: 'event' | 'task' | 'financial' | 'journal';
          amount?: number | null;
          note?: string | null;
          is_reconciled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "calendar_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      sovereign_goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          subtitle: string | null;
          target_horizon: string | null;
          progress_percentage: number;
          achieved_metric: string | null;
          gap_metric: string | null;
          meter_color: string | null;
          target_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          subtitle?: string | null;
          target_horizon?: string | null;
          progress_percentage?: number;
          achieved_metric?: string | null;
          gap_metric?: string | null;
          meter_color?: string | null;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          subtitle?: string | null;
          target_horizon?: string | null;
          progress_percentage?: number;
          achieved_metric?: string | null;
          gap_metric?: string | null;
          meter_color?: string | null;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sovereign_goals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      requesting_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
