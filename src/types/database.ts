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
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          theme: string;
          start_of_week: number;
          date_format: string;
          time_format: string;
          timezone: string;
          default_view: string;
          notifications_enabled: boolean;
          browser_homepage: string;
          search_engine: string;
          history_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: string;
          start_of_week?: number;
          date_format?: string;
          time_format?: string;
          timezone?: string;
          default_view?: string;
          notifications_enabled?: boolean;
          browser_homepage?: string;
          search_engine?: string;
          history_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: string;
          start_of_week?: number;
          date_format?: string;
          time_format?: string;
          timezone?: string;
          default_view?: string;
          notifications_enabled?: boolean;
          browser_homepage?: string;
          search_engine?: string;
          history_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          status: 'todo' | 'in_progress' | 'completed';
          priority: 'low' | 'normal' | 'high' | 'urgent';
          due_date: string | null;
          start_at: string | null;
          end_at: string | null;
          category: string;
          recurrence_rule: string | null;
          reminder_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          status?: 'todo' | 'in_progress' | 'completed';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          due_date?: string | null;
          start_at?: string | null;
          end_at?: string | null;
          category?: string;
          recurrence_rule?: string | null;
          reminder_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          status?: 'todo' | 'in_progress' | 'completed';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          due_date?: string | null;
          start_at?: string | null;
          end_at?: string | null;
          category?: string;
          recurrence_rule?: string | null;
          reminder_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          folder_id: string | null;
          title: string;
          content: Json;
          is_pinned: boolean;
          is_favorite: boolean;
          is_archived: boolean;
          version: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          folder_id?: string | null;
          title?: string;
          content?: Json;
          is_pinned?: boolean;
          is_favorite?: boolean;
          is_archived?: boolean;
          version?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          folder_id?: string | null;
          title?: string;
          content?: Json;
          is_pinned?: boolean;
          is_favorite?: boolean;
          is_archived?: boolean;
          version?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      note_folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          url: string;
          folder: string;
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          url: string;
          folder?: string;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          url?: string;
          folder?: string;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      browser_history: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          url: string;
          visited_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          url: string;
          visited_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          url?: string;
          visited_at?: string;
        };
        Relationships: [];
      };
      note_task_links: {
        Row: {
          note_id: string;
          task_id: string;
        };
        Insert: {
          note_id: string;
          task_id: string;
        };
        Update: {
          note_id?: string;
          task_id?: string;
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
