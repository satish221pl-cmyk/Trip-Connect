import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("auth.createAccount", () => {
  it("rejects an invalid email before contacting Supabase", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.auth.createAccount({
      name: "Test Traveler",
      email: "not-an-email",
      password: "tripconnect123",
      role: "traveler",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects passwords shorter than eight characters", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.auth.createAccount({
      name: "Test Traveler",
      email: "traveler@example.com",
      password: "short",
      role: "traveler",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
