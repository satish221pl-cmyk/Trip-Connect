import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";

 type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const utils = trpc.useUtils();
  const meQuery = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const [supabaseUser, setSupabaseUser] = useState<Awaited<ReturnType<NonNullable<typeof supabase>["auth"]["getUser"]>>["data"]["user"]>(null);
  const [supabaseReady, setSupabaseReady] = useState(!supabase);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setSupabaseUser(data.user);
      setSupabaseReady(true);
      void utils.auth.me.invalidate();
    }).catch(() => setSupabaseReady(true));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      setSupabaseReady(true);
      void utils.auth.me.invalidate();
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [utils]);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => utils.auth.me.setData(undefined, null),
  });

  const logout = useCallback(async () => {
    try {
      if (supabase) await supabase.auth.signOut();
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (!(error instanceof TRPCClientError) || error.data?.code !== "UNAUTHORIZED") throw error;
    } finally {
      try { sessionStorage.removeItem("manus-cookie"); } catch {}
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
      if (typeof window !== "undefined") window.location.href = "/";
    }
  }, [logoutMutation, utils]);

  const user = useMemo(() => {
    if (meQuery.data) return meQuery.data;
    if (!supabaseUser) return null;
    const metadata = supabaseUser.user_metadata ?? {};
    return {
      id: 0,
      openId: supabaseUser.id,
      name: metadata.full_name ?? metadata.name ?? supabaseUser.email ?? "Traveler",
      email: supabaseUser.email ?? null,
      loginMethod: "supabase",
      role: "user" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
  }, [meQuery.data, supabaseUser]);

  useEffect(() => {
    if (!redirectOnUnauthenticated || meQuery.isLoading || !supabaseReady || logoutMutation.isPending) return;
    if (user || typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;
    if (redirectPath) window.location.href = redirectPath;
    else startLogin();
  }, [redirectOnUnauthenticated, redirectPath, logoutMutation.isPending, meQuery.isLoading, supabaseReady, user]);

  return {
    user,
    loading: meQuery.isLoading || !supabaseReady || logoutMutation.isPending,
    error: meQuery.error ?? logoutMutation.error ?? null,
    isAuthenticated: Boolean(user),
    refresh: () => meQuery.refetch(),
    logout,
  };
}
