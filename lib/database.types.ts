// Trek Captain — Database Types
// Structured to match `supabase gen types typescript` output.
// Regenerate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts

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
      captains: {
        Row: {
          id: string;
          slug: string;
          brand_name: string;
          full_name: string;
          tagline: string | null;
          bio: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          accent_color: string | null;
          whatsapp: string | null;
          instagram: string | null;
          email: string | null;
          city: string | null;
          is_public: boolean | null;
          has_shared: boolean | null;
          notice: string | null;
          notice_updated_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          slug: string;
          brand_name: string;
          full_name: string;
          tagline?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          accent_color?: string | null;
          whatsapp?: string | null;
          instagram?: string | null;
          email?: string | null;
          city?: string | null;
          is_public?: boolean | null;
          has_shared?: boolean | null;
          notice?: string | null;
          notice_updated_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          brand_name?: string;
          full_name?: string;
          tagline?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          accent_color?: string | null;
          whatsapp?: string | null;
          instagram?: string | null;
          email?: string | null;
          city?: string | null;
          is_public?: boolean | null;
          has_shared?: boolean | null;
          notice?: string | null;
          notice_updated_at?: string | null;
          created_at?: string | null;
        };
      };
      treks: {
        Row: {
          id: string;
          captain_id: string;
          slug: string;
          title: string;
          location: string;
          region: string | null;
          start_date: string;
          end_date: string;
          difficulty: string;
          price_per_person: number;
          max_capacity: number;
          cover_color: string | null;
          meeting_point: string | null;
          status: string;
          description: string | null;
          itinerary: Json;
          packing_list: Json;
          inclusions: Json;
          exclusions: Json;
          cover_url: string | null;
          gallery: Json;
          highlights: string | null;
          notes: string | null;
          is_published: boolean | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          nearest_hospital: string | null;
          network_availability: string | null;
          safety_notes: string | null;
          fitness_requirement: string | null;
          whatsapp_group_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          captain_id: string;
          slug: string;
          title: string;
          location: string;
          region?: string | null;
          start_date: string;
          end_date: string;
          difficulty: string;
          price_per_person: number;
          max_capacity: number;
          cover_color?: string | null;
          meeting_point?: string | null;
          status?: string;
          description?: string | null;
          itinerary?: Json;
          packing_list?: Json;
          inclusions?: Json;
          exclusions?: Json;
          cover_url?: string | null;
          gallery?: Json;
          highlights?: string | null;
          notes?: string | null;
          is_published?: boolean | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          nearest_hospital?: string | null;
          network_availability?: string | null;
          safety_notes?: string | null;
          fitness_requirement?: string | null;
          whatsapp_group_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          captain_id?: string;
          slug?: string;
          title?: string;
          location?: string;
          region?: string | null;
          start_date?: string;
          end_date?: string;
          difficulty?: string;
          price_per_person?: number;
          max_capacity?: number;
          cover_color?: string | null;
          meeting_point?: string | null;
          status?: string;
          description?: string | null;
          itinerary?: Json;
          packing_list?: Json;
          inclusions?: Json;
          exclusions?: Json;
          cover_url?: string | null;
          gallery?: Json;
          highlights?: string | null;
          notes?: string | null;
          is_published?: boolean | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          nearest_hospital?: string | null;
          network_availability?: string | null;
          safety_notes?: string | null;
          fitness_requirement?: string | null;
          whatsapp_group_url?: string | null;
          created_at?: string | null;
        };
      };
      participants: {
        Row: {
          id: string;
          trek_id: string;
          captain_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          age: number | null;
          gender: string | null;
          blood_group: string | null;
          emergency_contact: string | null;
          emergency_contact_phone: string | null;
          status: string | null;
          checked_in: boolean | null;
          medical_notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          trek_id: string;
          captain_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          age?: number | null;
          gender?: string | null;
          blood_group?: string | null;
          emergency_contact?: string | null;
          emergency_contact_phone?: string | null;
          status?: string | null;
          checked_in?: boolean | null;
          medical_notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          trek_id?: string;
          captain_id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          age?: number | null;
          gender?: string | null;
          blood_group?: string | null;
          emergency_contact?: string | null;
          emergency_contact_phone?: string | null;
          status?: string | null;
          checked_in?: boolean | null;
          medical_notes?: string | null;
          created_at?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          participant_id: string;
          trek_id: string;
          captain_id: string;
          amount: number;
          mode: string | null;
          note: string | null;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          participant_id: string;
          trek_id: string;
          captain_id: string;
          amount: number;
          mode?: string | null;
          note?: string | null;
          paid_at?: string | null;
        };
        Update: {
          id?: string;
          participant_id?: string;
          trek_id?: string;
          captain_id?: string;
          amount?: number;
          mode?: string | null;
          note?: string | null;
          paid_at?: string | null;
        };
      };
      expenses: {
        Row: {
          id: string;
          trek_id: string;
          captain_id: string;
          title: string;
          amount: number;
          category: string | null;
          paid_by: string | null;
          date: string | null;
        };
        Insert: {
          id?: string;
          trek_id: string;
          captain_id: string;
          title: string;
          amount: number;
          category?: string | null;
          paid_by?: string | null;
          date?: string | null;
        };
        Update: {
          id?: string;
          trek_id?: string;
          captain_id?: string;
          title?: string;
          amount?: number;
          category?: string | null;
          paid_by?: string | null;
          date?: string | null;
        };
      };
      announcements: {
        Row: {
          id: string;
          trek_id: string;
          captain_id: string;
          message: string;
          priority: string | null;
          is_public: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          trek_id: string;
          captain_id: string;
          message: string;
          priority?: string | null;
          is_public?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          trek_id?: string;
          captain_id?: string;
          message?: string;
          priority?: string | null;
          is_public?: boolean | null;
          created_at?: string | null;
        };
      };
    };
    Views: {
      trek_public_stats: {
        Row: {
          trek_id: string;
          booked_count: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
