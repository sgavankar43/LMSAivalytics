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
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'learner' | 'instructor' | 'admin';
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          role?: 'learner' | 'instructor' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'learner' | 'instructor' | 'admin';
          avatar_url?: string | null;
        };
      };
      courses: {
        Row: {
          id: string;
          code: string;
          title: string;
          description: string;
          category: string;
          instructor_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          description: string;
          category: string;
          instructor_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          title?: string;
          description?: string;
          category?: string;
          instructor_id?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          type: 'RECORDING' | 'LIVE';
          status: 'Closed' | 'In Progress' | 'Upcoming';
          scheduled_at: string;
          duration_minutes: number;
          recording_url: string | null;
          meeting_url: string | null;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          type: 'RECORDING' | 'LIVE';
          status?: 'Closed' | 'In Progress' | 'Upcoming';
          scheduled_at: string;
          duration_minutes?: number;
          recording_url?: string | null;
          meeting_url?: string | null;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          type?: 'RECORDING' | 'LIVE';
          status?: 'Closed' | 'In Progress' | 'Upcoming';
          scheduled_at?: string;
          duration_minutes?: number;
          recording_url?: string | null;
          meeting_url?: string | null;
        };
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          course_id: string | null;
          ticket_code: string;
          subject: string;
          description: string;
          status: 'Open' | 'In Progress' | 'Resolved';
          priority: 'Low' | 'Medium' | 'High';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id?: string | null;
          ticket_code: string;
          subject: string;
          description: string;
          status?: 'Open' | 'In Progress' | 'Resolved';
          priority?: 'Low' | 'Medium' | 'High';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string | null;
          ticket_code?: string;
          subject?: string;
          description?: string;
          status?: 'Open' | 'In Progress' | 'Resolved';
          priority?: 'Low' | 'Medium' | 'High';
        };
      };
    };
  };
}
