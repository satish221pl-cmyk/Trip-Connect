import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { generateGeminiJson, generateGeminiText } from "./gemini";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "@shared/const";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getSupabaseAdmin } from "./supabase";
import {
  createBooking,
  createConnection,
  createExpense,
  createJournal,
  createTrip,
  getSafety,
  listBookings,
  listConnections,
  listExpenses,
  listGuides,
  listJournals,
  listMessages,
  listTrips,
  listTravelers,
  sendMessage,
  updateConnection,
  updateProfile,
  updateSafety,
} from "./db";

const destinationCatalog = [
  { slug: "leh-ladakh", name: "Leh & Ladakh", region: "India · Himalayan highlands", blurb: "High passes, blue-hour monasteries, and long roads that reward a slower pace.", image: "/manus-storage/hero-road_ed36aefc.jpg", mood: "For the road curious" },
  { slug: "jaipur", name: "Jaipur", region: "India · Rajasthan", blurb: "Rose-coloured courtyards, old bazaars, and a city best read through its small details.", image: "/manus-storage/street-story_646ae46c.jpg", mood: "For the culture seeker" },
  { slug: "himachal", name: "Himachal Pradesh", region: "India · North India", blurb: "Pine forests, quiet villages, and the kind of mountain air that resets a week.", image: "/manus-storage/mountain-journey_e75f67f0.jpg", mood: "For the exhale" },
  { slug: "kerala", name: "Kerala", region: "India · South India", blurb: "Backwater mornings, spice-lined kitchens, and coastlines that ask you to linger.", image: "/manus-storage/lake-safety_0e24756f.jpg", mood: "For gentle explorers" },
];

const planSchema = z.object({
  destination: z.string().min(2).max(120),
  startDate: z.string().min(4).max(32),
  endDate: z.string().min(4).max(32),
  budget: z.number().int().min(0).max(1000000),
  travelers: z.number().int().min(1).max(20),
  interests: z.string().max(240),
  style: z.string().max(80),
  food: z.string().max(160),
});

function procedureError(error: unknown, message: string, code = "REQUEST_FAILED"): never {
  console.error(`[TripConnect] ${code}`, error);
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `${message} (${code})` });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    createAccount: publicProcedure.input(z.object({
      name: z.string().trim().min(1).max(120),
      email: z.string().trim().email(),
      password: z.string().min(8).max(72),
      mobile: z.string().trim().max(40).optional(),
      city: z.string().trim().max(100).optional(),
      country: z.string().trim().max(100).optional(),
      role: z.enum(["traveler", "guide", "both"]),
      interests: z.string().trim().max(240).optional(),
    })).mutation(async ({ input }) => {
      const admin = getSupabaseAdmin();
      if (!admin) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Account creation is not configured yet." });
      const { data, error } = await admin.auth.admin.createUser({
        email: input.email.toLowerCase(),
        password: input.password,
        email_confirm: true,
        user_metadata: {
          full_name: input.name,
          mobile: input.mobile ?? "",
          city: input.city ?? "",
          country: input.country ?? "",
          role: input.role,
          interests: input.interests ?? "",
        },
      });
      if (error) {
        if (/already registered|already exists|email address has already|user with this email|duplicate/i.test(error.message)) {
          throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists. Sign in instead." });
        }
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
      return { success: true, userId: data.user?.id ?? null } as const;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  explore: router({
    search: publicProcedure.input(z.object({ query: z.string().max(80).optional() })).query(({ input }) => {
      const query = (input.query ?? "").trim().toLowerCase();
      return query ? destinationCatalog.filter(item => `${item.name} ${item.region} ${item.blurb}`.toLowerCase().includes(query)) : destinationCatalog;
    }),
  }),

  travelers: router({
    list: publicProcedure.query(async () => {
      try { return await listTravelers(0); } catch (error) { return procedureError(error, "Unable to load travelers", "TRAVELERS_LOAD_FAILED"); }
    }),
  }),

  connections: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      try { return await listConnections(ctx.user.id); } catch (error) { return procedureError(error, "Unable to load connections", "CONNECTIONS_LOAD_FAILED"); }
    }),
    create: protectedProcedure.input(z.object({ receiverId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      try { return await createConnection(ctx.user.id, input.receiverId); } catch (error) { return procedureError(error, "Unable to create travel connection", "CONNECTION_CREATE_FAILED"); }
    }),
    respond: protectedProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["accepted", "rejected"]) })).mutation(async ({ ctx, input }) => {
      try { return await updateConnection(input.id, ctx.user.id, input.status); } catch (error) { return procedureError(error, "Unable to update connection request", "CONNECTION_UPDATE_FAILED"); }
    }),
  }),

  guides: router({
    list: publicProcedure.query(async () => {
      try { return await listGuides(); } catch (error) { return procedureError(error, "Unable to load guides", "GUIDES_LOAD_FAILED"); }
    }),
  }),

  bookings: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      try { return await listBookings(ctx.user.id); } catch (error) { return procedureError(error, "Unable to load guide bookings", "BOOKINGS_LOAD_FAILED"); }
    }),
    create: protectedProcedure.input(z.object({ guideId: z.number().int().positive(), destination: z.string().min(2).max(160), date: z.string().min(4).max(32), price: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      try { return await createBooking({ travelerId: ctx.user.id, ...input }); } catch (error) { return procedureError(error, "Unable to create guide booking", "BOOKING_CREATE_FAILED"); }
    }),
  }),

  trips: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      try { return await listTrips(ctx.user.id); } catch (error) { return procedureError(error, "Unable to load trips", "TRIPS_LOAD_FAILED"); }
    }),
    create: protectedProcedure.input(z.object({ destination: z.string().min(2).max(160), startDate: z.string().min(4).max(32), endDate: z.string().min(4).max(32), budget: z.number().int().min(0).max(1000000), description: z.string().max(1000).optional(), itinerary: z.unknown().optional() })).mutation(async ({ ctx, input }) => {
      try { return await createTrip({ userId: ctx.user.id, ...input }); } catch (error) { return procedureError(error, "Unable to save trip", "TRIP_CREATE_FAILED"); }
    }),
  }),

  messages: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      try { return await listMessages(ctx.user.id); } catch (error) { return procedureError(error, "Unable to load messages", "MESSAGES_LOAD_FAILED"); }
    }),
    send: protectedProcedure.input(z.object({ message: z.string().min(1).max(2000) })).mutation(async ({ ctx, input }) => {
      try { return await sendMessage(ctx.user.id, input.message.trim()); } catch (error) { return procedureError(error, "Unable to send message", "MESSAGE_SEND_FAILED"); }
    }),
  }),

  journal: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      try { return await listJournals(ctx.user.id); } catch (error) { return procedureError(error, "Unable to load journal entries", "JOURNAL_LOAD_FAILED"); }
    }),
    create: protectedProcedure.input(z.object({ title: z.string().min(2).max(200), content: z.string().min(2).max(10000), tripId: z.number().int().positive().optional() })).mutation(async ({ ctx, input }) => {
      try { return await createJournal({ userId: ctx.user.id, ...input }); } catch (error) { return procedureError(error, "Unable to save journal entry", "JOURNAL_CREATE_FAILED"); }
    }),
  }),

  expenses: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      try { return await listExpenses(ctx.user.id); } catch (error) { return procedureError(error, "Unable to load expenses", "EXPENSES_LOAD_FAILED"); }
    }),
    create: protectedProcedure.input(z.object({ tripId: z.number().int().positive(), amount: z.number().int().positive(), description: z.string().min(2).max(200) })).mutation(async ({ ctx, input }) => {
      try { return await createExpense({ ...input, paidBy: ctx.user.id }); } catch (error) { return procedureError(error, "Unable to save expense", "EXPENSE_CREATE_FAILED"); }
    }),
  }),

  safety: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      try { return await getSafety(ctx.user.id); } catch (error) { return procedureError(error, "Unable to load safety status", "SAFETY_LOAD_FAILED"); }
    }),
    update: protectedProcedure.input(z.object({ tripId: z.number().int().positive(), status: z.enum(["ready", "active", "needs_checkin"]), currentLocation: z.string().max(255).optional() })).mutation(async ({ ctx, input }) => {
      try { return await updateSafety({ userId: ctx.user.id, ...input }); } catch (error) { return procedureError(error, "Unable to update safety status", "SAFETY_UPDATE_FAILED"); }
    }),
  }),

  profile: router({
    update: protectedProcedure.input(z.object({ name: z.string().max(160).optional(), bio: z.string().max(1000).optional(), city: z.string().max(120).optional(), country: z.string().max(120).optional(), interests: z.string().max(500).optional(), onboardingCompleted: z.boolean().optional() })).mutation(async ({ ctx, input }) => {
      try { return await updateProfile(ctx.user.id, input, ctx.user.openId); } catch (error) { return procedureError(error, "Unable to update profile", "PROFILE_UPDATE_FAILED"); }
    }),
  }),

  ai: router({
    planTrip: publicProcedure.input(planSchema).mutation(async ({ ctx, input }) => {
      try {
        const plan = await generateGeminiJson<{ summary: string; days: Array<{ day: string; title: string; plan: string; places: string[]; food: string; transport: string; cost: string; schedule: string[] }>; safety: string[]; localTips: string[] }>(`You are TripConnect's calm, practical travel planner. Return JSON only with exactly summary (string), days (array of objects with day, title, plan, places, food, transport, cost, schedule), safety (array of strings), and localTips (array of strings). Keep it grounded, specific, and human. Trip request: ${JSON.stringify(input)}`);
        return { ...plan, generatedBy: "Gemini travel planner", userId: ctx.user?.id ?? null };
      } catch (error) {
        return procedureError(error, "The AI planner could not create a plan right now", "AI_PLAN_FAILED");
      }
    }),
    guide: protectedProcedure.input(z.object({ destination: z.string().min(2).max(160), question: z.string().min(2).max(1000), tripContext: z.string().max(1200).optional() })).mutation(async ({ input }) => {
      try {
        const answer = await generateGeminiText(`You are TripConnect's local AI travel guide. Answer clearly and warmly in under 250 words. Do not invent live availability, opening hours, or safety guarantees. Destination: ${input.destination}. Trip context: ${input.tripContext ?? "none"}. Traveler question: ${input.question}`);
        return { answer, destination: input.destination, generatedBy: "Gemini travel guide" };
      } catch (error) {
        return procedureError(error, "The AI guide could not answer right now", "AI_GUIDE_FAILED");
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
