import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: false,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: 'realpnl-auth-token'
  },
  global: {
    headers: {
      'X-Client-Info': 'realpnl-trader-insights'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          api_key: string | null;
          api_secret: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          api_key?: string | null;
          api_secret?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          api_key?: string | null;
          api_secret?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bybit_pnl: {
        Row: {
          id: string;
          api_id: string;
          symbol: string;
          side: 'Buy' | 'Sell';
          closed_pnl: number;
          avg_entry_price: number;
          created_time: string;
          updated_time: string;
        };
        Insert: {
          id?: string;
          api_id: string;
          symbol: string;
          side: 'Buy' | 'Sell';
          closed_pnl: number;
          avg_entry_price: number;
          created_time?: string;
          updated_time?: string;
        };
        Update: {
          id?: string;
          api_id?: string;
          symbol?: string;
          side?: 'Buy' | 'Sell';
          closed_pnl?: number;
          avg_entry_price?: number;
          created_time?: string;
          updated_time?: string;
        };
      };
    };
  };
} 