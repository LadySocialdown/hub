// Types pour la plateforme d'analyse Instagram automatisée (Lady Socialdown).

export type PeriodType = "7j" | "15j" | "21j" | "30j" | "manuel";

export interface ProfileSnapshot {
  followers_count: number;
  follows_count: number;
  media_count: number;
}

export interface DailyRow {
  date: string; // YYYY-MM-DD
  reach_1d: number;
  accounts_engaged: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number; // peut être négatif (désinscriptions de saves antérieurs)
  total_interactions: number;
  views: number;
  follower_count_1d: number;
  follows_and_unfollows: number;
}

export interface MediaRow {
  media_id: string;
  media_caption: string | null;
  media_type: string;
  timestamp: string;
  media_reach: number;
  media_engagement: number;
  media_views: number;
  media_saved: number;
  media_shares: number;
  media_permalink: string;
}

export interface AudienceBreakdown {
  name: string;
  size: number;
}

export interface AudienceSnapshot {
  gender: AudienceBreakdown[];
  age: AudienceBreakdown[];
}

// Ligne dérivée, une par jour de la période — persistée dans instagram_daily_snapshots.
export interface DailySnapshotComputed {
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
}

export interface ViralPeakWindow {
  start_date: string;
  end_date: string;
  peak_reach_multiple: number; // reach_1d du jour de pic / médiane des 7 jours précédents
  pct_of_period_reach: number; // % du reach total de la période concentré dans cette fenêtre
  net_follower_change_5d_after: number; // solde net dans les 5 jours suivant la fin du pic
}

export interface SavePostRanking {
  media_id: string;
  media_caption: string | null;
  media_type: string;
  timestamp: string;
  media_permalink: string;
  media_reach: number;
  media_saved: number;
  save_rate: number; // media_saved / media_reach
}

export interface NetFollowerSummary {
  total_new_followers: number;
  total_estimated_unfollows: number;
  net_balance: number;
  days_net_positive: number;
  days_net_negative: number;
}

export interface PeriodMetrics {
  period_type: PeriodType;
  period_start: string;
  period_end: string;
  profile: ProfileSnapshot;
  audience: AudienceSnapshot;
  daily_snapshots: DailySnapshotComputed[];
  net_follower: NetFollowerSummary;
  engagement_rate: number; // total_interactions / reach cumulé
  comment_rate: number; // comments_total / total_interactions
  average_save_rate: number;
  viral_peaks: ViralPeakWindow[];
  top_posts_by_save_rate: SavePostRanking[];
  previous_period: {
    period_start: string;
    period_end: string;
    net_follower: NetFollowerSummary;
    engagement_rate: number;
    comment_rate: number;
    available: boolean; // false si l'historique ne couvre pas encore une période équivalente
  };
}

export interface InstagramReport {
  id: string;
  period_type: PeriodType;
  period_start: string;
  period_end: string;
  generated_at: string;
  raw_metrics_json: PeriodMetrics;
  interpretation_text: string | null;
  created_at: string;
}
