import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Json } from "@/types/supabase";
import type {
  DailySnapshotComputed,
  InstagramReport,
  PeriodMetrics,
  PeriodType,
} from "@/types/instagram";
import { generateInterpretation } from "./claude";
import { addDaysISO, daysBetweenISO, todayISO } from "./dates";
import {
  computeDueMilestones,
  nextMilestone,
  periodStartFor,
} from "./milestones";
import {
  computeCommentRate,
  computeDailySnapshot,
  computeEngagementRate,
  detectViralPeaks,
  rankPostsBySaveRate,
  summarizeNetFollower,
} from "./metrics";
import {
  fetchAudienceSnapshot,
  fetchDailySeries,
  fetchMediaForPeriod,
  fetchProfileSnapshot,
} from "./windsor";

const HISTORY_LOOKBACK_DAYS = 30;

async function ensureSettings() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from("instagram_settings").select("*").eq("id", 1).maybeSingle();
  if (data) return data;

  const referenceDate = process.env.INSTAGRAM_REFERENCE_DATE ?? todayISO();
  const { data: created, error } = await supabase
    .from("instagram_settings")
    .insert({ id: 1, reference_date: referenceDate, last_milestone_day: 0 })
    .select("*")
    .single();
  if (error) throw error;
  return created;
}

async function readSnapshotsRange(from: string, to: string): Promise<DailySnapshotComputed[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("instagram_daily_snapshots")
    .select("*")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    date: row.date,
    reach: row.reach,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    saves: row.saves,
    total_interactions: row.total_interactions,
    new_followers: row.new_followers,
    follows_and_unfollows: row.follows_and_unfollows,
    estimated_unfollows: row.estimated_unfollows,
    net_follower_change: row.net_follower_change,
  }));
}

async function upsertSnapshots(snapshots: DailySnapshotComputed[]) {
  if (snapshots.length === 0) return;
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("instagram_daily_snapshots").upsert(snapshots, { onConflict: "date" });
  if (error) throw error;
}

async function buildPeriodMetrics(periodType: PeriodType, periodStart: string, periodEnd: string): Promise<PeriodMetrics> {
  const [profile, dailyRows, media, audience] = await Promise.all([
    fetchProfileSnapshot(),
    fetchDailySeries(periodStart, periodEnd),
    fetchMediaForPeriod(periodStart, periodEnd),
    fetchAudienceSnapshot(),
  ]);

  const periodSnapshots = dailyRows.map(computeDailySnapshot);
  await upsertSnapshots(periodSnapshots);

  const historyFrom = addDaysISO(periodStart, -HISTORY_LOOKBACK_DAYS);
  const historyTo = addDaysISO(periodStart, -1);
  const history = await readSnapshotsRange(historyFrom, historyTo);

  const netFollower = summarizeNetFollower(periodSnapshots);
  const engagementRate = computeEngagementRate(periodSnapshots);
  const commentRate = computeCommentRate(periodSnapshots);
  const viralPeaks = detectViralPeaks(periodSnapshots, history);
  const topPosts = rankPostsBySaveRate(media);
  const averageSaveRate =
    topPosts.length > 0 ? topPosts.reduce((sum, p) => sum + p.save_rate, 0) / topPosts.length : 0;

  const periodLength = daysBetweenISO(periodStart, periodEnd) + 1;
  const prevEnd = addDaysISO(periodStart, -1);
  const prevStart = addDaysISO(prevEnd, -(periodLength - 1));
  const previousSnapshots = await readSnapshotsRange(prevStart, prevEnd);
  const previousAvailable = previousSnapshots.length === periodLength;

  return {
    period_type: periodType,
    period_start: periodStart,
    period_end: periodEnd,
    profile,
    audience,
    daily_snapshots: periodSnapshots,
    net_follower: netFollower,
    engagement_rate: engagementRate,
    comment_rate: commentRate,
    average_save_rate: averageSaveRate,
    viral_peaks: viralPeaks,
    top_posts_by_save_rate: topPosts,
    previous_period: {
      period_start: prevStart,
      period_end: prevEnd,
      net_follower: previousAvailable
        ? summarizeNetFollower(previousSnapshots)
        : { total_new_followers: 0, total_estimated_unfollows: 0, net_balance: 0, days_net_positive: 0, days_net_negative: 0 },
      engagement_rate: previousAvailable ? computeEngagementRate(previousSnapshots) : 0,
      comment_rate: previousAvailable ? computeCommentRate(previousSnapshots) : 0,
      available: previousAvailable,
    },
  };
}

async function saveReport(metrics: PeriodMetrics): Promise<InstagramReport> {
  const supabase = createServerSupabaseClient();

  let interpretationText: string | null = null;
  try {
    interpretationText = await generateInterpretation(metrics);
  } catch (error) {
    console.error("[instagram] génération de l'interprétation Claude indisponible, rapport sauvegardé sans texte", error);
    const message = error instanceof Error ? error.message : String(error);
    interpretationText = `Erreur lors de la génération de l'interprétation (API Anthropic) : ${message}`;
  }

  const { data, error } = await supabase
    .from("instagram_reports")
    .insert({
      period_type: metrics.period_type,
      period_start: metrics.period_start,
      period_end: metrics.period_end,
      raw_metrics_json: metrics as unknown as Json,
      interpretation_text: interpretationText,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as InstagramReport;
}

/** Déclenchement calendaire : traite toutes les échéances dues, dans l'ordre, en s'arrêtant à la première erreur. */
export async function runDueAnalyses(): Promise<InstagramReport[]> {
  const settings = await ensureSettings();
  const due = computeDueMilestones(settings.reference_date, todayISO(), settings.last_milestone_day);
  const reports: InstagramReport[] = [];

  let lastMilestoneDay = settings.last_milestone_day;
  for (const milestone of due) {
    const periodStart = periodStartFor(settings.reference_date, lastMilestoneDay);
    try {
      const metrics = await buildPeriodMetrics(milestone.label, periodStart, milestone.date);
      const report = await saveReport(metrics);
      reports.push(report);
      lastMilestoneDay = milestone.day;
      const supabase = createServerSupabaseClient();
      await supabase.from("instagram_settings").update({ last_milestone_day: lastMilestoneDay }).eq("id", 1);
    } catch (error) {
      console.error(`[instagram] échéance J+${milestone.day} (${milestone.label}) non traitée, nouvelle tentative au prochain cycle`, error);
      break;
    }
  }

  return reports;
}

/** Déclenchement manuel ("Analyser maintenant") : période depuis la dernière échéance analysée jusqu'à aujourd'hui. */
export async function runManualAnalysis(): Promise<InstagramReport> {
  const settings = await ensureSettings();
  const periodStart = periodStartFor(settings.reference_date, settings.last_milestone_day);
  const periodEnd = todayISO();
  if (periodEnd <= periodStart) {
    throw new Error("Aucune nouvelle donnée depuis la dernière analyse.");
  }
  const metrics = await buildPeriodMetrics("manuel", periodStart, periodEnd);
  return saveReport(metrics);
}

export interface DashboardStatus {
  lastReport: InstagramReport | null;
  nextDueDate: string;
  nextDueLabel: PeriodType;
  reportHistory: InstagramReport[];
}

export async function getDashboardStatus(): Promise<DashboardStatus> {
  const settings = await ensureSettings();
  const supabase = createServerSupabaseClient();

  const { data: history } = await supabase
    .from("instagram_reports")
    .select("*")
    .order("generated_at", { ascending: false })
    .limit(20);

  const reportHistory = (history ?? []) as unknown as InstagramReport[];
  const lastReport = reportHistory[0] ?? null;

  const next = nextMilestone(settings.reference_date, settings.last_milestone_day);

  return {
    lastReport,
    nextDueDate: next.date,
    nextDueLabel: next.label,
    reportHistory,
  };
}
