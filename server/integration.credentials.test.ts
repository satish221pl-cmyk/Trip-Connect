import { describe, expect, it } from "vitest";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GEMINI_API_KEY",
  "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
] as const;

function withTimeout(ms = 12_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(timeout) };
}

describe("configured external integrations", () => {
  it("has all required non-OAuth values configured", () => {
    for (const key of required) {
      expect(process.env[key], `${key} must be configured`).toBeTruthy();
    }
  });

  it("accepts the Supabase anon key at the auth settings endpoint", async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(url).toBeTruthy();
    expect(anon).toBeTruthy();
    const { controller, clear } = withTimeout();
    try {
      const response = await fetch(`${url!.replace(/\/$/, "")}/auth/v1/settings`, {
        headers: { apikey: anon!, Authorization: `Bearer ${anon!}` },
        signal: controller.signal,
      });
      expect(response.ok, `Supabase returned ${response.status}`).toBe(true);
    } finally {
      clear();
    }
  });

  it("accepts the Gemini key at the models endpoint", async () => {
    const key = process.env.GEMINI_API_KEY;
    expect(key).toBeTruthy();
    const { controller, clear } = withTimeout();
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key!)}`, { signal: controller.signal });
      expect(response.ok, `Gemini returned ${response.status}`).toBe(true);
    } finally {
      clear();
    }
  });

  it("accepts the Maps browser key at the Maps JavaScript endpoint", async () => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    expect(key).toBeTruthy();
    const { controller, clear } = withTimeout();
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key!)}&v=weekly`, { signal: controller.signal });
      expect(response.ok, `Google Maps returned ${response.status}`).toBe(true);
    } finally {
      clear();
    }
  });
});
