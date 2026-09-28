import { useState } from "react";
import { ArrowRight, Check, Loader2, X } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";

export function AuthDialog({ open, mode: initialMode = "signin", onClose }: { open: boolean; mode?: "signin" | "signup"; onClose: () => void }) {
  const [, navigate] = useLocation();
  const profileUpdate = trpc.profile.update.useMutation();
  const createAccount = trpc.auth.createAccount.useMutation();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", mobile: "", city: "", country: "", role: "traveler", interests: "" });
  if (!open) return null;

  const update = (key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) { toast.error("Supabase Auth is not configured in this environment."); return; }
    if (mode === "signup" && form.password.length < 8) { toast.error("Use a password with at least 8 characters."); return; }
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
        if (error) throw error;
        toast.success("Welcome back to TripConnect");
        onClose();
        navigate("/home");
      } else {
        await createAccount.mutateAsync({ name: form.name.trim(), email: form.email.trim(), password: form.password, mobile: form.mobile.trim(), city: form.city.trim(), country: form.country.trim(), role: form.role as "traveler" | "guide" | "both", interests: form.interests.trim() });
        const { error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
        if (error) {
          toast.success("Account created. Sign in with your new password.");
          setMode("signin");
          return;
        }
        await profileUpdate.mutateAsync({ name: form.name.trim(), city: form.city.trim(), country: form.country.trim(), interests: form.interests.trim() });
        toast.success("Your TripConnect account is ready");
        onClose();
        navigate("/home");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication could not be completed";
      if (/already registered|already exists|email address has already|user with this email/i.test(message)) {
        toast.info("This email already has an account. Sign in instead.");
        setMode("signin");
        return;
      }
      const friendly = /invalid login credentials/i.test(message) ? "Email or password is incorrect. Check both fields and try again." : /email not confirmed/i.test(message) ? "Please confirm your email address first, then sign in again." : message;
      toast.error(friendly);
    } finally { setLoading(false); }
  };

  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#18241d]/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="TripConnect account"><div className="relative max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-[30px] bg-[#f7f2e9] p-6 shadow-2xl sm:p-8"><button onClick={onClose} className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-[#e9e4d9] text-[#697269] transition hover:bg-[#ddd4c5]" aria-label="Close"><X size={17} /></button><div className="max-w-[420px]"><div className="text-[10px] font-bold uppercase tracking-[.22em] text-[#c97a5b]">TripConnect account</div><h2 className="serif mt-4 text-5xl leading-[.95] text-[#2e4036]">{mode === "signin" ? "Welcome back." : "Begin somewhere new."}</h2><p className="mt-4 text-sm leading-6 text-[#747d75]">{mode === "signin" ? "Your plans, people, and places are waiting." : "Create a calm place for the journeys you want to remember."}</p></div><form onSubmit={submit} className="mt-7 space-y-3">{mode === "signup" && <><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-[#687269]">Full name<input required value={form.name} onChange={e => update("name", e.target.value)} className="mt-1.5 w-full rounded-xl bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c97a5b]/20" /></label><label className="text-xs font-bold text-[#687269]">Mobile<input value={form.mobile} onChange={e => update("mobile", e.target.value)} className="mt-1.5 w-full rounded-xl bg-white px-4 py-3 text-sm outline-none" /></label></div><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-[#687269]">City<input value={form.city} onChange={e => update("city", e.target.value)} className="mt-1.5 w-full rounded-xl bg-white px-4 py-3 text-sm outline-none" /></label><label className="text-xs font-bold text-[#687269]">Country<input value={form.country} onChange={e => update("country", e.target.value)} className="mt-1.5 w-full rounded-xl bg-white px-4 py-3 text-sm outline-none" /></label></div></>}<label className="block text-xs font-bold text-[#687269]">Email<input required type="email" value={form.email} onChange={e => update("email", e.target.value)} className="mt-1.5 w-full rounded-xl bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c97a5b]/20" /></label><label className="block text-xs font-bold text-[#687269]">Password<input required type="password" minLength={8} value={form.password} onChange={e => update("password", e.target.value)} className="mt-1.5 w-full rounded-xl bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c97a5b]/20" /></label>{mode === "signup" && <><label className="block text-xs font-bold text-[#687269]">I am joining as<select value={form.role} onChange={e => update("role", e.target.value)} className="mt-1.5 w-full rounded-xl bg-white px-4 py-3 text-sm outline-none"><option value="traveler">Traveler</option><option value="guide">Local guide</option><option value="both">Both</option></select></label><label className="block text-xs font-bold text-[#687269]">Interests <span className="font-normal text-[#9aa098]">optional</span><input value={form.interests} onChange={e => update("interests", e.target.value)} placeholder="food · road trips · photography" className="mt-1.5 w-full rounded-xl bg-white px-4 py-3 text-sm outline-none" /></label></>}<button disabled={loading || createAccount.isPending} className="btn-lift mt-3 flex w-full items-center justify-center rounded-full bg-[#2e4036] px-5 py-3.5 text-sm font-bold text-white disabled:opacity-50">{loading || createAccount.isPending ? <Loader2 className="animate-spin" size={17} /> : <>{mode === "signin" ? "Sign in securely" : "Create my account"}<ArrowRight className="ml-2" size={16} /></>}</button></form><div className="mt-6 text-center text-xs text-[#7d847c]">{mode === "signin" ? "New to TripConnect?" : "Already have an account?"}<button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="ml-1 font-bold text-[#c97a5b]">{mode === "signin" ? "Create one" : "Sign in"}</button></div><div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#8d958c]"><Check size={13} className="text-[#6b8469]" /> Email and password are secured by Supabase Auth.</div></div></div>;
}
