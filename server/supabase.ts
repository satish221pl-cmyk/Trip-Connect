import { createClient, type SupabaseClient, type User as SupabaseUser } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) return null;
  if (!adminClient) {
    adminClient = createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminClient;
}

export async function getSupabaseUserFromToken(token?: string): Promise<SupabaseUser | null> {
  if (!token || !ENV.supabaseUrl || !ENV.supabaseAnonKey) return null;
  try {
    const client = createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await client.auth.getUser(token);
    if (error) {
      console.warn("[Supabase Auth] Token validation failed:", error.message);
      return null;
    }
    return data.user;
  } catch (error) {
    console.warn("[Supabase Auth] Unable to validate token:", error);
    return null;
  }
}

export async function syncSupabaseProfile(user: SupabaseUser, profile: {
  name?: string | null;
  mobile?: string | null;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
  interests?: string | null;
  onboardingCompleted?: boolean;
}) {
  await syncSupabaseProfileById(user.id, {
    email: user.email ?? null,
    full_name: profile.name ?? user.user_metadata?.full_name ?? null,
    mobile: profile.mobile ?? user.user_metadata?.mobile ?? null,
    city: profile.city ?? user.user_metadata?.city ?? null,
    country: profile.country ?? user.user_metadata?.country ?? null,
    bio: profile.bio ?? null,
    interests: profile.interests ?? null,
    onboarding_completed: profile.onboardingCompleted ?? false,
  });
}

export async function syncSupabaseProfileById(id: string, profile: {
  email?: string | null;
  full_name?: string | null;
  mobile?: string | null;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
  interests?: string | null;
  onboarding_completed?: boolean;
}) {
  const client = getSupabaseAdmin();
  if (!client) return;
  const { error } = await client.from("profiles").upsert({
    id,
    ...profile,
    updated_at: new Date().toISOString(),
  }, { onConflict: "id" });
  if (error && !error.message.includes("relation \"profiles\" does not exist")) {
    console.warn("[Supabase Profile] Sync failed:", error.message);
  }
}
