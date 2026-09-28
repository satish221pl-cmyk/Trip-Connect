import { useMemo, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Compass, Heart, MapPin, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AuthDialog } from "@/components/AuthDialog";

const images = {
  road: "/manus-storage/hero-road_ed36aefc.jpg",
  mountain: "/manus-storage/mountain-journey_e75f67f0.jpg",
  street: "/manus-storage/street-story_646ae46c.jpg",
  lake: "/manus-storage/lake-safety_0e24756f.jpg",
};

function Mark() {
  return <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#c97a5b] text-[#fff8ed]"><Compass size={18} strokeWidth={1.8} /></span><span className="text-[15px] font-semibold tracking-[.18em]">TRIPCONNECT</span></div>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.24em] text-[#7d8178]"><span className="h-px w-8 bg-[#c97a5b]" />{children}</div>;
}

export default function Home() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const destinations = trpc.explore.search.useQuery({ query: "" });
  const featured = useMemo(() => destinations.data ?? [], [destinations.data]);
  const openAuth = (mode: "signin" | "signup") => { setAuthMode(mode); setAuthOpen(true); };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f6f2ea] text-[#242b27]">
      <header className="absolute inset-x-0 top-0 z-20 px-5 py-5 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Mark />
          <nav className="hidden items-center gap-8 text-sm text-white/85 md:flex">
            <a className="nav-link" href="#why">Why TripConnect</a>
            <a className="nav-link" href="#how">How it works</a>
            <a className="nav-link" href="#safety">Travel safely</a>
            <Link className="nav-link" href="/explore">Explore</Link>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => openAuth("signin")} className="hidden rounded-full border border-white/35 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 sm:block">Sign in</button>
            <button onClick={() => isAuthenticated ? navigate("/home") : openAuth("signup")} className="btn-lift rounded-full bg-[#f6f2ea] px-4 py-2.5 text-xs font-bold text-[#242b27]">{isAuthenticated ? "Open workspace" : "Create account"} <ArrowUpRight className="ml-1 inline" size={14} /></button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[760px] overflow-hidden bg-[#304139] text-white lg:min-h-[820px]">
          <div className="absolute inset-0 bg-[#25382e]" />
          <div className="scene-a absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(90deg, rgba(21,33,27,.7), rgba(21,33,27,.08)), url(${images.road})` }} />
          <div className="scene-b absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(90deg, rgba(21,33,27,.72), rgba(21,33,27,.12)), url(${images.mountain})` }} />
          <div className="scene-c absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(90deg, rgba(21,33,27,.72), rgba(21,33,27,.12)), url(${images.street})` }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(215,178,128,.25),transparent_32%),linear-gradient(180deg,rgba(16,25,21,.18),rgba(16,25,21,.55))]" />
          <div className="hero-sheen pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute inset-0 grid-fade opacity-30" />
          <div className="relative mx-auto flex min-h-[760px] max-w-[1400px] flex-col justify-end px-5 pb-16 pt-36 sm:px-10 lg:min-h-[820px] lg:px-16 lg:pb-20">
            <div className="max-w-[720px]">
              <div className="reveal mb-7 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.3em] text-[#f3d2b5]"><span className="h-2 w-2 rounded-full bg-[#efae82]" />A better way to find your way</div>
              <h1 className="serif reveal reveal-delay-1 max-w-[720px] text-[clamp(4rem,10vw,8.8rem)] leading-[.84] text-[#fbf6ed]">Travel together.<br /><em className="font-normal text-[#efc6a4]">Travel further.</em></h1>
              <p className="reveal reveal-delay-2 mt-8 max-w-[490px] text-base leading-7 text-white/75 sm:text-lg">Discover unfamiliar places with people who know them, plan smarter trips, and travel with greater confidence.</p>
              <div className="reveal reveal-delay-3 mt-9 flex flex-wrap items-center gap-3">
                <button onClick={() => isAuthenticated ? navigate("/home") : openAuth("signup")} className="btn-lift rounded-full bg-[#f6f2ea] px-6 py-3.5 text-sm font-bold text-[#26362d]">Start exploring <ArrowRight className="ml-2 inline" size={17} /></button>
                <button onClick={() => navigate("/explore")} className="rounded-full border border-white/35 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/70 hover:bg-white/10">See the journeys</button>
              </div>
            </div>
            <div className="reveal reveal-delay-4 mt-14 flex items-end justify-between gap-4 border-t border-white/20 pt-5 text-xs text-white/60">
              <div className="flex items-center gap-2"><MapPin size={15} /> A softer, smarter travel companion</div>
              <div className="hidden items-center gap-5 sm:flex"><span>01 / 03</span><span className="h-px w-20 bg-white/35" /><span>slow cinematic mode</span></div>
              <ArrowDown className="animate-bounce" size={17} />
            </div>
          </div>
          <div className="float-slow absolute right-8 top-[38%] hidden rounded-2xl border border-white/20 bg-[#1f3128]/70 p-4 text-xs backdrop-blur-md lg:block"><div className="mb-2 flex items-center gap-2 text-[#f4d4b8]"><Sparkles size={14} /> This week</div><p className="max-w-[145px] leading-5 text-white/75">11 curious people are heading to Ladakh.</p></div>
        </section>

        <section className="tone-sky border-b border-[#242b27]/10 px-5 py-6 sm:px-10 lg:px-16">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-5 text-xs uppercase tracking-[.16em] text-[#7d8178]"><span>Travel with more context</span><div className="flex flex-wrap items-center gap-5 sm:gap-10"><span className="flex items-center gap-2"><UsersRound size={15} className="text-[#c97a5b]" /> 12k+ connections</span><span className="flex items-center gap-2"><ShieldCheck size={15} className="text-[#667665]" /> safety-first</span><span className="flex items-center gap-2"><Heart size={15} className="text-[#c97a5b]" /> human by design</span></div></div>
        </section>

        <section id="why" className="paper-texture px-5 py-24 sm:px-10 lg:px-16 lg:py-32">
          <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
            <div><SectionLabel>Why TripConnect</SectionLabel><h2 className="serif max-w-[520px] text-5xl leading-[.96] text-[#2b332d] sm:text-7xl">The best parts of travel are rarely on the itinerary.</h2></div>
            <div className="max-w-[600px] pb-2"><p className="text-lg leading-8 text-[#6e756f]">Travel becomes richer when you have the right context. A local coffee order. A friend for the mountain road. A second opinion when a plan feels too full.</p><p className="mt-5 text-sm leading-7 text-[#7d8178]">TripConnect brings together the human instinct to wander and the practical tools that make it feel possible.</p></div>
          </div>
          <div className="mx-auto mt-18 grid max-w-[1400px] gap-4 md:grid-cols-3">
            {[{ n: "01", title: "Find your people", text: "Meet travelers and local guides who already know the feeling of your destination.", icon: UsersRound }, { n: "02", title: "Plan with context", text: "Use local insight and AI to build a trip that has room for the unexpected.", icon: Sparkles }, { n: "03", title: "Go with confidence", text: "Keep plans, check-ins, trusted connections, and memories in one calm place.", icon: ShieldCheck }].map(({ n, title, text, icon: Icon }, index) => <div key={n} className="card-hover rounded-[28px] bg-white/65 p-7 sm:p-9"><div className="flex items-start justify-between"><span className="serif text-4xl text-[#c97a5b]">{n}</span><Icon size={22} strokeWidth={1.6} className="text-[#667665]" /></div><h3 className="mt-16 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-[#727a74]">{text}</p><span className="mt-6 inline-flex text-xs font-bold uppercase tracking-[.16em] text-[#667665]">Explore the idea <ArrowUpRight className="ml-2" size={14} /></span></div>)}
          </div>
        </section>

        <section id="how" className="tone-lavender px-5 py-24 sm:px-10 lg:px-16 lg:py-32">
          <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[.7fr_1.3fr]">
            <div><SectionLabel>How it works</SectionLabel><h2 className="serif max-w-[420px] text-5xl leading-[.94] sm:text-7xl">A little less logistics. A lot more living.</h2><p className="mt-7 max-w-[340px] text-sm leading-7 text-[#6e756f]">From the first spark of an idea to the last note in your journal, TripConnect keeps the important things close.</p></div>
            <div className="grid gap-0 divide-y divide-[#242b27]/12">{[{ num: "01", title: "Discover", body: "Find people who know the destination — and want to explore it with care." }, { num: "02", title: "Connect", body: "Build a travel group that feels like a good conversation, not a crowded feed." }, { num: "03", title: "Plan", body: "Blend local knowledge with an AI itinerary that leaves space to breathe." }, { num: "04", title: "Explore safely", body: "Keep trusted contacts, check-ins, bookings, and trip details together." }].map((step, i) => <div key={step.num} className="group flex gap-7 py-7 first:pt-0 last:pb-0 sm:gap-12"><span className="serif text-3xl text-[#c97a5b]">{step.num}</span><div className="max-w-[520px]"><h3 className="text-2xl font-semibold transition group-hover:text-[#c97a5b]">{step.title}</h3><p className="mt-2 text-sm leading-7 text-[#6e756f]">{step.body}</p></div><ArrowUpRight className="ml-auto mt-1 opacity-0 transition group-hover:opacity-100" size={20} /></div>)}</div>
          </div>
        </section>

        <section className="bg-[#f6f2ea] px-5 py-24 sm:px-10 lg:px-16 lg:py-32">
          <div className="mx-auto max-w-[1400px]"><div className="flex flex-wrap items-end justify-between gap-5"><div><SectionLabel>Places with a pulse</SectionLabel><h2 className="serif text-5xl leading-none sm:text-7xl">Where will you<br /><em className="font-normal text-[#c97a5b]">begin?</em></h2></div><Link href="/explore" className="group text-sm font-bold">Explore all destinations <ArrowRight className="ml-2 inline transition group-hover:translate-x-1" size={16} /></Link></div>
            <div className="mt-12 grid gap-5 md:grid-cols-2">{featured.slice(0, 4).map((place, index) => <Link key={place.slug} href={`/explore?destination=${place.slug}`} className={`image-zoom group relative overflow-hidden rounded-[28px] ${index === 0 || index === 3 ? "md:aspect-[1.28]" : "md:aspect-[.95]"} aspect-[1.18]`}><img src={place.image} alt={place.name} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#18241d]/80 via-transparent to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8"><div className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#f4d4b8]">{place.mood}</div><div className="flex items-end justify-between gap-5"><div><h3 className="serif text-3xl">{place.name}</h3><p className="mt-1 text-sm text-white/70">{place.region}</p></div><span className="grid h-10 w-10 place-items-center rounded-full border border-white/30 transition group-hover:bg-white group-hover:text-[#242b27]"><ArrowUpRight size={17} /></span></div></div></Link>)}</div>
          </div>
        </section>

        <section id="safety" className="overflow-hidden bg-[#2e4036] px-5 py-24 text-[#f7f3ea] sm:px-10 lg:px-16 lg:py-32">
          <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[1fr_1fr] lg:items-center"><div><SectionLabel>Safety, without the noise</SectionLabel><h2 className="serif max-w-[560px] text-5xl leading-[.96] sm:text-7xl">Explore with confidence.</h2><p className="mt-7 max-w-[500px] text-lg leading-8 text-white/65">A calm layer of practical support for the moments when you want another person to know where you are.</p><div className="mt-9 grid max-w-[470px] grid-cols-2 gap-4">{["Location sharing", "Check-ins", "Emergency contacts", "Trip information"].map(item => <div key={item} className="flex items-center gap-2 text-sm text-white/80"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#adbea9]/20 text-[#d8e5d1]">✓</span>{item}</div>)}</div></div><div className="relative min-h-[390px] overflow-hidden rounded-[32px] border border-white/12 bg-[#3c5144] p-7"><div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url(${images.lake})`, backgroundSize: "cover", backgroundPosition: "center" }} /><div className="relative h-full min-h-[330px] rounded-2xl border border-white/15 bg-[linear-gradient(rgba(216,229,209,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(216,229,209,.1)_1px,transparent_1px)] bg-[size:44px_44px]"><div className="absolute left-[17%] top-[65%] h-2.5 w-2.5 rounded-full bg-[#efae82] shadow-[0_0_0_9px_rgba(239,174,130,.18)]" /><div className="absolute left-[18%] top-[64%] h-[2px] w-[56%] origin-left rotate-[-25deg] bg-[#efc6a4]" /><div className="absolute right-[13%] top-[31%] h-2.5 w-2.5 rounded-full bg-[#d8e5d1] shadow-[0_0_0_9px_rgba(216,229,209,.18)]" /><div className="absolute bottom-5 left-5 rounded-xl border border-white/15 bg-[#26382e]/80 p-4 text-xs backdrop-blur"><div className="flex items-center gap-2 text-[#d8e5d1]"><span className="h-2 w-2 rounded-full bg-[#b6d298]" /> TripConnect safety mode</div><p className="mt-2 text-white/55">Share selectively. Check in intentionally.</p></div></div></div></div>
        </section>

        <section id="journal" className="bg-[#f6f2ea] px-5 py-24 sm:px-10 lg:px-16 lg:py-32"><div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[.86fr_1.14fr] lg:items-center"><div className="image-zoom relative aspect-[.9] overflow-hidden rounded-[32px]"><img src={images.street} alt="A lively local street" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#242b27]/70 to-transparent" /><div className="absolute bottom-7 left-7 text-white"><div className="text-[10px] font-bold uppercase tracking-[.18em] text-[#f4d4b8]">Field notes · 04</div><div className="serif mt-2 text-3xl">Small streets, big stories.</div></div></div><div><SectionLabel>From the journal</SectionLabel><h2 className="serif max-w-[650px] text-5xl leading-[.96] sm:text-7xl">Why India is<br /><em className="font-normal text-[#c97a5b]">hitting the road.</em></h2><p className="mt-8 max-w-[650px] text-lg leading-8 text-[#6e756f]">Across India, road trips by bike and car are becoming a popular way for people to take a break from work, studies, and personal-life pressure. Around 40–45% of young travellers say they take short trips mainly to relax, recharge, or escape their routine.</p><p className="mt-5 max-w-[650px] text-sm leading-7 text-[#7d8178]">The percentages here are illustrative, not official nationwide statistics — but the feeling is real: more people are looking for unfamiliar places, softer plans, and better local guidance.</p><button onClick={() => navigate("/journal")} className="group mt-8 text-sm font-bold">Explore the journey <ArrowRight className="ml-2 inline transition group-hover:translate-x-1" size={16} /></button></div></div></section>

        <section className="bg-[#d5aaa6] px-5 py-24 sm:px-10 lg:px-16 lg:py-32"><div className="mx-auto flex max-w-[1080px] flex-col items-center text-center"><SectionLabel>Your next chapter</SectionLabel><h2 className="serif max-w-[900px] text-5xl leading-[.95] text-[#2b332d] sm:text-8xl">Your next journey shouldn't begin with uncertainty.</h2><p className="mt-8 max-w-[500px] text-lg leading-8 text-[#4f5b51]">Find your people. Discover new places. Plan your journey with confidence.</p><div className="mt-9 flex flex-wrap justify-center gap-3"><button onClick={() => isAuthenticated ? navigate("/home") : openAuth("signup")} className="btn-lift rounded-full bg-[#2e4036] px-7 py-3.5 text-sm font-bold text-white">Start exploring <ArrowRight className="ml-2 inline" size={17} /></button>{!isAuthenticated && <button onClick={() => openAuth("signup")} className="rounded-full border border-[#2e4036]/35 px-7 py-3.5 text-sm font-bold text-[#2e4036] transition hover:bg-[#2e4036]/10">Create account</button>}</div></div></section>
      </main>
      <footer className="bg-[#f6f2ea] px-5 py-8 sm:px-10 lg:px-16"><div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-5 text-xs text-[#7d8178] sm:flex-row sm:items-center"><Mark /><div>© 2026 TripConnect · Made for more human journeys.</div><div className="flex gap-5"><Link href="/explore">Explore</Link><Link href="/safety">Safety</Link><Link href="/profile">Profile</Link></div></div></footer>
      <AuthDialog open={authOpen} mode={authMode} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
