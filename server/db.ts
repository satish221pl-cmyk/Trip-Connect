import { and, desc, eq, inArray, ne, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Connection,
  Expense,
  Guide,
  GuideBooking,
  InsertUser,
  Journal,
  Trip,
  connections,
  conversationMembers,
  conversations,
  expenses,
  guideBookings,
  guides,
  messages,
  notifications,
  safetyChecks,
  travelJournals,
  trips,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { syncSupabaseProfileById } from "./supabase";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod", "mobile", "city", "country", "profilePhoto", "bio", "interests"] as const;
    for (const field of textFields) {
      if (user[field] !== undefined) {
        values[field] = user[field] ?? null;
        updateSet[field] = user[field] ?? null;
      }
    }
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (user.onboardingCompleted !== undefined) {
      values.onboardingCompleted = user.onboardingCompleted;
      updateSet.onboardingCompleted = user.onboardingCompleted;
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

const fallbackTravelers = [
  { id: 201, name: "Mira Shah", city: "Jaipur", country: "India", bio: "Slow mornings, local food, and finding the road less photographed.", interests: "food · photography · heritage", profilePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80", trips: 18, rating: 4.9, verified: true },
  { id: 202, name: "Arjun Mehta", city: "Mumbai", country: "India", bio: "Weekend road-tripper building a kinder, more curious travel circle.", interests: "road trips · surf · design", profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80", trips: 11, rating: 4.8, verified: true },
  { id: 203, name: "Lea Morin", city: "Lisbon", country: "Portugal", bio: "Remote worker collecting train rides, bookstores, and generous conversations.", interests: "trains · cafes · journaling", profilePhoto: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=80", trips: 24, rating: 5, verified: true },
];

const fallbackGuides = [
  { id: 301, name: "Tashi Norbu", location: "Leh, Ladakh", languages: "English · Hindi · Tibetan", experience: 9, rating: 4.9, price: 78, verified: true, imageUrl: "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=300&q=80" },
  { id: 302, name: "Ananya Rao", location: "Jaipur, Rajasthan", languages: "English · Hindi · French", experience: 7, rating: 4.8, price: 62, verified: true, imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80" },
  { id: 303, name: "Dev Menon", location: "Kochi, Kerala", languages: "English · Malayalam · Tamil", experience: 12, rating: 5, price: 85, verified: true, imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80" },
];

export async function listTravelers(userId: number) {
  const db = await getDb();
  if (!db) return fallbackTravelers;
  const rows = await db.select().from(users).where(ne(users.id, userId)).limit(12);
  if (rows.length <= 1) return fallbackTravelers;
  return rows.map((row, index) => ({
    ...row,
    trips: 6 + index * 3,
    rating: 4.7 + (index % 3) / 10,
    verified: Boolean(row.email),
  }));
}

export async function listGuides() {
  const db = await getDb();
  if (!db) return fallbackGuides;
  const rows = await db.select().from(guides).limit(12);
  return rows.length ? rows : fallbackGuides;
}

export async function listTrips(userId: number): Promise<Trip[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trips).where(eq(trips.userId, userId)).orderBy(desc(trips.createdAt));
}

export async function createTrip(input: {
  userId: number;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description?: string;
  itinerary?: unknown;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(trips).values({
    userId: input.userId,
    destination: input.destination,
    startDate: input.startDate,
    endDate: input.endDate,
    budget: input.budget,
    description: input.description ?? null,
    itinerary: input.itinerary ?? null,
  });
  return { id: Number(result[0].insertId), ...input, status: "upcoming" as const };
}

export async function listConnections(userId: number): Promise<Connection[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(connections).where(or(eq(connections.requesterId, userId), eq(connections.receiverId, userId))).orderBy(desc(connections.createdAt));
}

export async function createConnection(requesterId: number, receiverId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const existing = await db.select().from(connections).where(or(and(eq(connections.requesterId, requesterId), eq(connections.receiverId, receiverId)), and(eq(connections.requesterId, receiverId), eq(connections.receiverId, requesterId)))).limit(1);
  if (existing[0]) return existing[0];
  const result = await db.insert(connections).values({ requesterId, receiverId, status: "pending" });
  await db.insert(notifications).values({ userId: receiverId, type: "connection", title: "New travel connection", message: "Someone would like to travel together." });
  return { id: Number(result[0].insertId), requesterId, receiverId, status: "pending" as const };
}

export async function updateConnection(id: number, userId: number, status: "accepted" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const existing = await db.select().from(connections).where(and(eq(connections.id, id), eq(connections.receiverId, userId))).limit(1);
  if (!existing[0]) throw new Error("Connection request not found");
  await db.update(connections).set({ status }).where(eq(connections.id, id));
  return { ...existing[0], status };
}

export async function listMessages(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: messages.id, message: messages.message, senderId: messages.senderId, createdAt: messages.createdAt }).from(messages).where(eq(messages.senderId, userId)).orderBy(desc(messages.createdAt)).limit(30);
}

export async function sendMessage(userId: number, message: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const conversation = await db.select().from(conversations).limit(1);
  let conversationId = conversation[0]?.id;
  if (!conversationId) {
    const created = await db.insert(conversations).values({ title: "TripConnect circle" });
    conversationId = Number(created[0].insertId);
    await db.insert(conversationMembers).values({ conversationId, userId });
  }
  const created = await db.insert(messages).values({ conversationId, senderId: userId, message });
  return { id: Number(created[0].insertId), conversationId, senderId: userId, message, createdAt: new Date() };
}

export async function listBookings(userId: number): Promise<GuideBooking[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(guideBookings).where(eq(guideBookings.travelerId, userId)).orderBy(desc(guideBookings.createdAt));
}

export async function createBooking(input: { travelerId: number; guideId: number; destination: string; date: string; price: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(guideBookings).values({ ...input, status: "pending" });
  return { id: Number(result[0].insertId), ...input, status: "pending" as const };
}

export async function listJournals(userId: number): Promise<Journal[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(travelJournals).where(eq(travelJournals.userId, userId)).orderBy(desc(travelJournals.createdAt));
}

export async function createJournal(input: { userId: number; title: string; content: string; tripId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(travelJournals).values({ ...input, tripId: input.tripId ?? null });
  return { id: Number(result[0].insertId), ...input, createdAt: new Date() };
}

export async function listExpenses(userId: number): Promise<Expense[]> {
  const db = await getDb();
  if (!db) return [];
  const userTrips = await db.select({ id: trips.id }).from(trips).where(eq(trips.userId, userId));
  if (!userTrips.length) return [];
  return db.select().from(expenses).where(inArray(expenses.tripId, userTrips.map(trip => trip.id))).orderBy(desc(expenses.createdAt));
}

export async function createExpense(input: { tripId: number; paidBy: number; amount: number; description: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(expenses).values(input);
  return { id: Number(result[0].insertId), ...input, createdAt: new Date() };
}

export async function getSafety(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(safetyChecks).where(eq(safetyChecks.userId, userId)).orderBy(desc(safetyChecks.createdAt)).limit(1);
  return rows[0];
}

export async function updateSafety(input: { userId: number; tripId: number; status: "ready" | "active" | "needs_checkin"; currentLocation?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const existing = await getSafety(input.userId);
  if (existing) {
    await db.update(safetyChecks).set({ status: input.status, currentLocation: input.currentLocation ?? existing.currentLocation, lastCheckin: new Date() }).where(eq(safetyChecks.id, existing.id));
    return { ...existing, ...input, lastCheckin: new Date() };
  }
  const result = await db.insert(safetyChecks).values({ ...input, lastCheckin: new Date() });
  return { id: Number(result[0].insertId), ...input, lastCheckin: new Date() };
}

export async function updateProfile(userId: number, input: { name?: string; bio?: string; city?: string; country?: string; interests?: string; onboardingCompleted?: boolean }, openId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(users).set(input).where(eq(users.id, userId));
  const row = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (openId && /^[0-9a-f-]{36}$/i.test(openId)) {
    await syncSupabaseProfileById(openId, {
      email: row[0]?.email ?? null,
      full_name: input.name ?? row[0]?.name ?? null,
      bio: input.bio ?? row[0]?.bio ?? null,
      city: input.city ?? row[0]?.city ?? null,
      country: input.country ?? row[0]?.country ?? null,
      interests: input.interests ?? row[0]?.interests ?? null,
      onboarding_completed: input.onboardingCompleted ?? row[0]?.onboardingCompleted ?? false,
    });
  }
  return row[0];
}
