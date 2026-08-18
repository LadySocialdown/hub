export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SubscriptionPlan = "starter" | "essentielle" | "vip";
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing";
export type SessionType = "coaching" | "mentorat";
export type BookingStatus = "pending" | "confirmed" | "canceled" | "completed";
export type ToolType = "template" | "guide" | "video";
export type ResourceType = "article" | "pdf" | "video" | "ebook" | "outil";
export type CpfProgram = "25h" | "35h";
export type InstallmentCount = 3 | 4;
export type InstallmentStatus = "active" | "completed" | "failed" | "canceled";
export type PreinscriptionStatut = "en_attente" | "contactee" | "convertie";
export type PrecommandeStatut = "paye";
export type GrantedBy = "stripe" | "admin";
export type FormationInvitationStatus = "pending" | "accepted";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: "user" | "admin";
          subscription_status: SubscriptionStatus | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          role?: "user" | "admin";
          subscription_status?: SubscriptionStatus | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          role?: "user" | "admin";
          subscription_status?: SubscriptionStatus | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: SubscriptionPlan;
          stripe_sub_id: string;
          status: SubscriptionStatus;
          period_end: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan: SubscriptionPlan;
          stripe_sub_id: string;
          status: SubscriptionStatus;
          period_end: string;
          created_at?: string;
        };
        Update: {
          plan?: SubscriptionPlan;
          stripe_sub_id?: string;
          status?: SubscriptionStatus;
          period_end?: string;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          total_modules: number;
          is_flagship: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          total_modules?: number;
          is_flagship?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          description?: string | null;
          total_modules?: number;
          is_flagship?: boolean;
        };
        Relationships: [];
      };
      modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          unlock_week: number;
          youtube_video_id: string | null;
          resources: Json;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          unlock_week: number;
          youtube_video_id?: string | null;
          resources?: Json;
          position?: number;
          created_at?: string;
        };
        Update: {
          title?: string;
          unlock_week?: number;
          youtube_video_id?: string | null;
          resources?: Json;
          position?: number;
        };
        Relationships: [];
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          completed: boolean;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_id: string;
          completed?: boolean;
          completed_at?: string | null;
        };
        Update: {
          completed?: boolean;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      tools: {
        Row: {
          id: string;
          title: string;
          type: ToolType;
          url: string;
          is_premium: boolean;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          type: ToolType;
          url: string;
          is_premium?: boolean;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          title?: string;
          type?: ToolType;
          url?: string;
          is_premium?: boolean;
          tags?: string[];
        };
        Relationships: [];
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          item_type: string;
          item_id: string;
          stripe_payment_id: string;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_type: string;
          item_id: string;
          stripe_payment_id: string;
          amount: number;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          session_type: SessionType;
          cal_event_id: string | null;
          stripe_payment_id: string | null;
          status: BookingStatus;
          scheduled_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_type: SessionType;
          cal_event_id?: string | null;
          stripe_payment_id?: string | null;
          status?: BookingStatus;
          scheduled_at?: string | null;
          created_at?: string;
        };
        Update: {
          cal_event_id?: string | null;
          stripe_payment_id?: string | null;
          status?: BookingStatus;
          scheduled_at?: string | null;
        };
        Relationships: [];
      };
      resources: {
        Row: {
          id: string;
          title: string;
          type: ResourceType;
          is_free: boolean;
          price: number | null;
          content_url: string | null;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          type: ResourceType;
          is_free?: boolean;
          price?: number | null;
          content_url?: string | null;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          title?: string;
          type?: ResourceType;
          is_free?: boolean;
          price?: number | null;
          content_url?: string | null;
          tags?: string[];
        };
        Relationships: [];
      };
      resource_purchases: {
        Row: {
          id: string;
          resource_id: string;
          nom: string;
          email: string;
          montant: number;
          stripe_session_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          resource_id: string;
          nom: string;
          email: string;
          montant: number;
          stripe_session_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      cpf_students: {
        Row: {
          id: string;
          user_id: string | null;
          program: CpfProgram;
          nom: string;
          prenom: string;
          email: string;
          telephone: string;
          adresse: string;
          mcf_dossier_id: string | null;
          statut_dossier: string;
          documents: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          program: CpfProgram;
          nom: string;
          prenom: string;
          email: string;
          telephone: string;
          adresse: string;
          mcf_dossier_id?: string | null;
          statut_dossier?: string;
          documents?: Json;
          created_at?: string;
        };
        Update: {
          program?: CpfProgram;
          nom?: string;
          prenom?: string;
          email?: string;
          telephone?: string;
          adresse?: string;
          mcf_dossier_id?: string | null;
          statut_dossier?: string;
          documents?: Json;
        };
        Relationships: [];
      };
      installment_plans: {
        Row: {
          id: string;
          user_id: string;
          total_amount: number;
          installments: InstallmentCount;
          paid_count: number;
          next_payment_date: string | null;
          stripe_setup_intent_id: string | null;
          status: InstallmentStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_amount: number;
          installments: InstallmentCount;
          paid_count?: number;
          next_payment_date?: string | null;
          stripe_setup_intent_id?: string | null;
          status?: InstallmentStatus;
          created_at?: string;
        };
        Update: {
          paid_count?: number;
          next_payment_date?: string | null;
          stripe_setup_intent_id?: string | null;
          status?: InstallmentStatus;
        };
        Relationships: [];
      };
      preinscriptions_academie: {
        Row: {
          id: string;
          prenom: string;
          email: string;
          date: string;
          statut: PreinscriptionStatut;
        };
        Insert: {
          id?: string;
          prenom: string;
          email: string;
          date?: string;
          statut?: PreinscriptionStatut;
        };
        Update: {
          statut?: PreinscriptionStatut;
        };
        Relationships: [];
      };
      precommandes_academie: {
        Row: {
          id: string;
          prenom: string;
          email: string;
          montant: number;
          stripe_session_id: string;
          paid_at: string;
          statut: PrecommandeStatut;
        };
        Insert: {
          id?: string;
          prenom: string;
          email: string;
          montant: number;
          stripe_session_id: string;
          paid_at?: string;
          statut?: PrecommandeStatut;
        };
        Update: {
          statut?: PrecommandeStatut;
        };
        Relationships: [];
      };
      instagram_settings: {
        Row: {
          id: number;
          reference_date: string;
          last_milestone_day: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          reference_date: string;
          last_milestone_day?: number;
          created_at?: string;
        };
        Update: {
          reference_date?: string;
          last_milestone_day?: number;
        };
        Relationships: [];
      };
      instagram_daily_snapshots: {
        Row: {
          date: string;
          reach: number;
          views: number;
          likes: number;
          comments: number;
          shares: number;
          saves: number;
          total_interactions: number;
          new_followers: number;
          follows_and_unfollows: number;
          estimated_unfollows: number;
          net_follower_change: number;
          created_at: string;
        };
        Insert: {
          date: string;
          reach?: number;
          views?: number;
          likes?: number;
          comments?: number;
          shares?: number;
          saves?: number;
          total_interactions?: number;
          new_followers?: number;
          follows_and_unfollows?: number;
          estimated_unfollows?: number;
          net_follower_change?: number;
          created_at?: string;
        };
        Update: {
          reach?: number;
          views?: number;
          likes?: number;
          comments?: number;
          shares?: number;
          saves?: number;
          total_interactions?: number;
          new_followers?: number;
          follows_and_unfollows?: number;
          estimated_unfollows?: number;
          net_follower_change?: number;
        };
        Relationships: [];
      };
      instagram_reports: {
        Row: {
          id: string;
          period_type: string;
          period_start: string;
          period_end: string;
          generated_at: string;
          raw_metrics_json: Json;
          interpretation_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          period_type: string;
          period_start: string;
          period_end: string;
          generated_at?: string;
          raw_metrics_json: Json;
          interpretation_text?: string | null;
          created_at?: string;
        };
        Update: {
          interpretation_text?: string | null;
        };
        Relationships: [];
      };
      course_enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          granted_by: GrantedBy;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          granted_by: GrantedBy;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      formation_invitations: {
        Row: {
          id: string;
          email: string;
          course_id: string;
          clerk_invitation_id: string | null;
          granted_by: GrantedBy;
          status: FormationInvitationStatus;
          created_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          course_id: string;
          clerk_invitation_id?: string | null;
          granted_by: GrantedBy;
          status?: FormationInvitationStatus;
          created_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          clerk_invitation_id?: string | null;
          status?: FormationInvitationStatus;
          accepted_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
