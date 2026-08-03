// Logique métier — section 2 du brief Lady Socialdown.
//
// Windsor.ai ne distingue pas nativement follows/unfollows : `follows_and_unfollows`
// est un total combiné. `estimated_unfollows` / `net_follower_change` sont donc des
// ESTIMATIONS reconstruites, pas des données exactes de l'API Instagram — l'UI doit
// le rappeler explicitement.
//
// Certains jours peuvent avoir des `saves` négatifs dans les données brutes Windsor
// (désinscriptions de saves antérieurs). Ces fonctions les laissent tels quels dans
// les sommes plutôt que de les clamper à 0, pour ne pas fausser les totaux.

import type {
  DailyRow,
  DailySnapshotComputed,
  MediaRow,
  NetFollowerSummary,
  SavePostRanking,
  ViralPeakWindow,
} from "@/types/instagram";

export function computeDailySnapshot(row: DailyRow): DailySnapshotComputed {
  const estimated_unfollows = row.follows_and_unfollows - row.follower_count_1d;
  const net_follower_change = row.follower_count_1d - estimated_unfollows;

  return {
    date: row.date,
    reach: row.reach_1d,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    saves: row.saves,
    total_interactions: row.total_interactions,
    new_followers: row.follower_count_1d,
    follows_and_unfollows: row.follows_and_unfollows,
    estimated_unfollows,
    net_follower_change,
  };
}

export function summarizeNetFollower(snapshots: DailySnapshotComputed[]): NetFollowerSummary {
  let total_new_followers = 0;
  let total_estimated_unfollows = 0;
  let net_balance = 0;
  let days_net_positive = 0;
  let days_net_negative = 0;

  for (const day of snapshots) {
    total_new_followers += day.new_followers;
    total_estimated_unfollows += day.estimated_unfollows;
    net_balance += day.net_follower_change;
    if (day.net_follower_change > 0) days_net_positive += 1;
    else if (day.net_follower_change < 0) days_net_negative += 1;
  }

  return { total_new_followers, total_estimated_unfollows, net_balance, days_net_positive, days_net_negative };
}

export function computeEngagementRate(snapshots: DailySnapshotComputed[]): number {
  const totalInteractions = snapshots.reduce((sum, day) => sum + day.total_interactions, 0);
  const totalReach = snapshots.reduce((sum, day) => sum + day.reach, 0);
  return totalReach > 0 ? totalInteractions / totalReach : 0;
}

export function computeCommentRate(snapshots: DailySnapshotComputed[]): number {
  const totalComments = snapshots.reduce((sum, day) => sum + day.comments, 0);
  const totalInteractions = snapshots.reduce((sum, day) => sum + day.total_interactions, 0);
  return totalInteractions > 0 ? totalComments / totalInteractions : 0;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Détecte les fenêtres de pic viral au sein de `periodSnapshots`.
 * `history` doit couvrir au moins les 7 jours précédant le premier jour de la période
 * (et idéalement les 5 jours suivant la fin, pour mesurer la rétention post-pic) —
 * elle sert uniquement de contexte pour la médiane glissante et le suivi du solde net.
 */
export function detectViralPeaks(
  periodSnapshots: DailySnapshotComputed[],
  history: DailySnapshotComputed[]
): ViralPeakWindow[] {
  const byDate = new Map(history.map((day) => [day.date, day]));
  for (const day of periodSnapshots) byDate.set(day.date, day);
  const allDatesSorted = [...byDate.keys()].sort();
  const indexOf = new Map(allDatesSorted.map((date, i) => [date, i]));

  const periodReachTotal = periodSnapshots.reduce((sum, day) => sum + day.reach, 0);

  const isPeak = new Map<string, number>(); // date -> multiple vs médiane
  for (const day of periodSnapshots) {
    const idx = indexOf.get(day.date)!;
    const prev7 = allDatesSorted
      .slice(Math.max(0, idx - 7), idx)
      .map((d) => byDate.get(d)!.reach);
    const med = median(prev7);
    if (med > 0 && day.reach > med * 5) {
      isPeak.set(day.date, day.reach / med);
    }
  }

  const windows: ViralPeakWindow[] = [];
  let current: { start: string; end: string; maxMultiple: number } | null = null;

  for (const day of periodSnapshots) {
    const multiple = isPeak.get(day.date);
    if (multiple) {
      if (current) {
        current.end = day.date;
        current.maxMultiple = Math.max(current.maxMultiple, multiple);
      } else {
        current = { start: day.date, end: day.date, maxMultiple: multiple };
      }
    } else if (current) {
      windows.push(finalizeWindow(current));
      current = null;
    }
  }
  if (current) windows.push(finalizeWindow(current));

  function finalizeWindow(w: { start: string; end: string; maxMultiple: number }): ViralPeakWindow {
    const windowReach = periodSnapshots
      .filter((d) => d.date >= w.start && d.date <= w.end)
      .reduce((sum, day) => sum + day.reach, 0);

    const endIdx = indexOf.get(w.end)!;
    const next5Dates = allDatesSorted.slice(endIdx + 1, endIdx + 6);
    const netFollowerChange5dAfter = next5Dates.reduce(
      (sum, d) => sum + (byDate.get(d)?.net_follower_change ?? 0),
      0
    );

    return {
      start_date: w.start,
      end_date: w.end,
      peak_reach_multiple: w.maxMultiple,
      pct_of_period_reach: periodReachTotal > 0 ? (windowReach / periodReachTotal) * 100 : 0,
      net_follower_change_5d_after: netFollowerChange5dAfter,
    };
  }

  return windows;
}

export function rankPostsBySaveRate(media: MediaRow[]): SavePostRanking[] {
  return media
    .map((post) => ({
      media_id: post.media_id,
      media_caption: post.media_caption,
      media_type: post.media_type,
      timestamp: post.timestamp,
      media_permalink: post.media_permalink,
      media_reach: post.media_reach,
      media_saved: post.media_saved,
      save_rate: post.media_reach > 0 ? post.media_saved / post.media_reach : 0,
    }))
    .sort((a, b) => b.save_rate - a.save_rate);
}
