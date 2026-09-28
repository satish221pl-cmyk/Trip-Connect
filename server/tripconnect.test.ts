import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(user: TrpcContext["user"] = null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("TripConnect public discovery", () => {
  it("searches the destination catalog by user input", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.explore.search({ query: "ladakh" });
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Leh & Ladakh");
  });

  it("returns the full discovery set for an empty search", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.explore.search({ query: "" });
    expect(result.length).toBeGreaterThanOrEqual(4);
  });
});

describe("TripConnect protected actions", () => {
  it("does not allow anonymous connection requests", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.connections.create({ receiverId: 22 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
