import type {
  AudienceSnapshot,
  DailyRow,
  MediaRow,
  ProfileSnapshot,
} from "@/types/instagram";

const WINDSOR_BASE_URL =
  process.env.WINDSOR_API_BASE_URL ?? "https://connectors.windsor.ai";
const CONNECTOR = "instagram";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}

interface WindsorParams {
  fields: string[];
  date_from?: string;
  date_to?: string;
}

async function windsorRequest(
  params: WindsorParams,
  attempt = 1
): Promise<Record<string, unknown>[]> {
  const apiKey = requireEnv("WINDSOR_API_KEY");
  const accountId = requireEnv("INSTAGRAM_ACCOUNT_ID");

  const url = new URL(`${WINDSOR_BASE_URL}/${CONNECTOR}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("fields", params.fields.join(","));
  // Filtre sur le compte Instagram suivi — voir Windsor.ai "filters" (liste de
  // conditions [champ, opérateur, valeur]), à confirmer/ajuster si le compte
  // Windsor n'expose qu'un seul compte connecté (le filtre est alors sans effet).
  url.searchParams.set("filters", JSON.stringify([["account_id", "eq", accountId]]));
  if (params.date_from) url.searchParams.set("date_from", params.date_from);
  if (params.date_to) url.searchParams.set("date_to", params.date_to);
  url.searchParams.set("_render_json", "1");

  const maxAttempts = 3;
  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Windsor.ai a répondu ${res.status} : ${await res.text()}`);
    }
    const body = (await res.json()) as { data?: Record<string, unknown>[] };
    return body.data ?? [];
  } catch (error) {
    if (attempt >= maxAttempts) {
      console.error(
        `[windsor] échec définitif après ${maxAttempts} tentatives (fields=${params.fields.join(",")})`,
        error
      );
      throw error;
    }
    const delayMs = 1000 * 2 ** (attempt - 1);
    console.warn(
      `[windsor] tentative ${attempt}/${maxAttempts} échouée, nouvelle tentative dans ${delayMs}ms`,
      error
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return windsorRequest(params, attempt + 1);
  }
}

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toStringOrNull(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

export async function fetchProfileSnapshot(): Promise<ProfileSnapshot> {
  const rows = await windsorRequest({
    fields: ["followers_count", "follows_count", "media_count"],
  });
  const row = rows[0] ?? {};
  return {
    followers_count: toNumber(row.followers_count),
    follows_count: toNumber(row.follows_count),
    media_count: toNumber(row.media_count),
  };
}

export async function fetchDailySeries(dateFrom: string, dateTo: string): Promise<DailyRow[]> {
  const rows = await windsorRequest({
    fields: [
      "date",
      "reach_1d",
      "accounts_engaged",
      "likes",
      "comments",
      "shares",
      "saves",
      "total_interactions",
      "views",
      "follower_count_1d",
      "follows_and_unfollows",
    ],
    date_from: dateFrom,
    date_to: dateTo,
  });

  return rows.map((row) => ({
    date: String(row.date),
    reach_1d: toNumber(row.reach_1d),
    accounts_engaged: toNumber(row.accounts_engaged),
    likes: toNumber(row.likes),
    comments: toNumber(row.comments),
    shares: toNumber(row.shares),
    saves: toNumber(row.saves), // peut être négatif, géré tel quel
    total_interactions: toNumber(row.total_interactions),
    views: toNumber(row.views),
    follower_count_1d: toNumber(row.follower_count_1d),
    follows_and_unfollows: toNumber(row.follows_and_unfollows),
  }));
}

export async function fetchMediaForPeriod(dateFrom: string, dateTo: string): Promise<MediaRow[]> {
  const rows = await windsorRequest({
    fields: [
      "media_id",
      "media_caption",
      "media_type",
      "timestamp",
      "media_reach",
      "media_engagement",
      "media_views",
      "media_saved",
      "media_shares",
      "media_permalink",
    ],
    date_from: dateFrom,
    date_to: dateTo,
  });

  return rows.map((row) => ({
    media_id: String(row.media_id),
    media_caption: toStringOrNull(row.media_caption),
    media_type: String(row.media_type ?? ""),
    timestamp: String(row.timestamp),
    media_reach: toNumber(row.media_reach),
    media_engagement: toNumber(row.media_engagement),
    media_views: toNumber(row.media_views),
    media_saved: toNumber(row.media_saved),
    media_shares: toNumber(row.media_shares),
    media_permalink: String(row.media_permalink ?? ""),
  }));
}

export async function fetchAudienceSnapshot(): Promise<AudienceSnapshot> {
  const [genderRows, ageRows] = await Promise.all([
    windsorRequest({ fields: ["audience_gender_name", "audience_gender_size"] }),
    windsorRequest({ fields: ["audience_age_name", "audience_age_size"] }),
  ]);

  return {
    gender: genderRows.map((row) => ({
      name: String(row.audience_gender_name ?? ""),
      size: toNumber(row.audience_gender_size),
    })),
    age: ageRows.map((row) => ({
      name: String(row.audience_age_name ?? ""),
      size: toNumber(row.audience_age_size),
    })),
  };
}
