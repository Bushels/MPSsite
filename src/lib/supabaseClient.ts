/**
 * Supabase client for browser-side calls (availability checks).
 * Uses the publishable (anon) key — safe to ship in the bundle.
 *
 * Server-side calls (booking inserts) use the service-role key
 * via the Vercel serverless function and are NOT exposed here.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export interface SupabaseQueryResult<T> {
  data: T | null;
  error: string | null;
}

/**
 * Lightweight Supabase REST client — no SDK dependency.
 * Uses PostgREST directly via fetch.  Keeps the bundle small.
 */
const supabaseRest = async <T>(
  table: string,
  params: Record<string, string> = {},
  options: RequestInit = {},
): Promise<SupabaseQueryResult<T>> => {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      return { data: null, error: `${response.status}: ${errorBody}` };
    }

    const data = (await response.json()) as T;
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
};

export { supabaseRest, SUPABASE_URL, SUPABASE_ANON_KEY };
