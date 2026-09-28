import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getUserByOpenId, upsertUser } from "../db";
import { getSupabaseUserFromToken, syncSupabaseProfile } from "../supabase";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  if (!user) {
    const authorization = opts.req.headers.authorization;
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
    const supabaseUser = await getSupabaseUserFromToken(token);
    if (supabaseUser) {
      const metadata = supabaseUser.user_metadata ?? {};
      await upsertUser({
        openId: supabaseUser.id,
        name: metadata.full_name ?? metadata.name ?? supabaseUser.email ?? null,
        email: supabaseUser.email ?? null,
        loginMethod: "supabase",
        mobile: metadata.mobile ?? null,
        city: metadata.city ?? null,
        country: metadata.country ?? null,
        profilePhoto: metadata.avatar_url ?? null,
      });
      await syncSupabaseProfile(supabaseUser, {
        name: metadata.full_name ?? metadata.name ?? supabaseUser.email ?? null,
        mobile: metadata.mobile ?? null,
        city: metadata.city ?? null,
        country: metadata.country ?? null,
        interests: metadata.interests ?? null,
      });
      user = (await getUserByOpenId(supabaseUser.id)) ?? null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
