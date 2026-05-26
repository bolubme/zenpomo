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
          id: string;
          username: string;
          avatar_url: string | null;
          theme_preference: string;
          soundscape_preference: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          theme_preference?: string;
          soundscape_preference?: string;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
          theme_preference?: string;
          soundscape_preference?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          phase: string;
          duration_seconds: number;
          started_at: string;
          completed_at: string;
          room_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          phase?: string;
          duration_seconds: number;
          started_at: string;
          completed_at: string;
          room_id?: string | null;
        };
        Update: {
          completed_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          name: string;
          code: string;
          host_user_id: string;
          theme: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          host_user_id: string;
          theme?: string;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          theme?: string;
          is_active?: boolean;
        };
      };
      room_members: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          status: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          status?: string;
        };
        Update: {
          status?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
