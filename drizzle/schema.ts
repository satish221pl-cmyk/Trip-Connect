import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  mobile: varchar("mobile", { length: 32 }),
  city: varchar("city", { length: 120 }),
  country: varchar("country", { length: 120 }),
  profilePhoto: text("profilePhoto"),
  bio: text("bio"),
  interests: text("interests"),
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const trips = mysqlTable("trips", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  destination: varchar("destination", { length: 160 }).notNull(),
  startDate: varchar("startDate", { length: 32 }).notNull(),
  endDate: varchar("endDate", { length: 32 }).notNull(),
  budget: int("budget").default(0).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["upcoming", "active", "completed"]).default("upcoming").notNull(),
  itinerary: json("itinerary"),
  plannedRoute: text("plannedRoute"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const connections = mysqlTable("connections", {
  id: int("id").autoincrement().primaryKey(),
  requesterId: int("requesterId").notNull(),
  receiverId: int("receiverId").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 160 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const conversationMembers = mysqlTable("conversationMembers", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  userId: int("userId").notNull(),
});

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  message: text("message").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const guides = mysqlTable("guides", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  location: varchar("location", { length: 160 }).notNull(),
  languages: text("languages").notNull(),
  experience: int("experience").default(1).notNull(),
  rating: int("rating").default(48).notNull(),
  price: int("price").default(80).notNull(),
  verified: boolean("verified").default(true).notNull(),
  imageUrl: text("imageUrl"),
});

export const guideBookings = mysqlTable("guideBookings", {
  id: int("id").autoincrement().primaryKey(),
  travelerId: int("travelerId").notNull(),
  guideId: int("guideId").notNull(),
  destination: varchar("destination", { length: 160 }).notNull(),
  date: varchar("date", { length: 32 }).notNull(),
  price: int("price").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "confirmed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const safetyChecks = mysqlTable("safetyChecks", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  userId: int("userId").notNull(),
  currentLocation: varchar("currentLocation", { length: 255 }),
  lastCheckin: timestamp("lastCheckin"),
  status: mysqlEnum("status", ["ready", "active", "needs_checkin"]).default("ready").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const travelJournals = mysqlTable("travelJournals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tripId: int("tripId"),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  photos: json("photos"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  paidBy: int("paidBy").notNull(),
  amount: int("amount").notNull(),
  description: varchar("description", { length: 200 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 80 }).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Trip = typeof trips.$inferSelect;
export type Connection = typeof connections.$inferSelect;
export type Guide = typeof guides.$inferSelect;
export type GuideBooking = typeof guideBookings.$inferSelect;
export type Journal = typeof travelJournals.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
