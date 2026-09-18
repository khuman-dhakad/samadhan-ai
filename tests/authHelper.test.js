import { describe, it, expect } from "vitest";
import {
  checkUserIsAdmin,
  formatAuthErrorMessage,
} from "../src/services/firebase/authService";

describe("Firebase Auth & Admin RBAC Custom Claims Evaluation", () => {
  it("returns true when user has admin: true custom claim", async () => {
    const mockAdminUser = {
      uid: "admin_123",
      email: "officer@municipal.gov",
      getIdTokenResult: async () => ({
        claims: {
          admin: true,
        },
      }),
    };

    const isAdmin = await checkUserIsAdmin(mockAdminUser);
    expect(isAdmin).toBe(true);
  });

  it("returns false when user does not have admin claim", async () => {
    const mockCitizenUser = {
      uid: "citizen_456",
      email: "citizen@example.com",
      getIdTokenResult: async () => ({
        claims: {},
      }),
    };

    const isAdmin = await checkUserIsAdmin(mockCitizenUser);
    expect(isAdmin).toBe(false);
  });

  it("returns false for null or undefined user", async () => {
    expect(await checkUserIsAdmin(null)).toBe(false);
    expect(await checkUserIsAdmin(undefined)).toBe(false);
  });

  it("handles token retrieval error safely without crashing", async () => {
    const brokenUser = {
      getIdTokenResult: async () => {
        throw new Error("Token refresh error");
      },
    };

    const isAdmin = await checkUserIsAdmin(brokenUser);
    expect(isAdmin).toBe(false);
  });
});

describe("Firebase Auth User Error Message Formatting", () => {
  it("translates popup-blocked code to helpful guidance", () => {
    const error = { code: "auth/popup-blocked" };
    const msg = formatAuthErrorMessage(error);
    expect(msg).toContain("blocked by your browser");
  });

  it("translates unauthorized-domain code to authorized domain instructions", () => {
    const error = { code: "auth/unauthorized-domain" };
    const msg = formatAuthErrorMessage(error);
    expect(msg).toContain("Authorized Domains in the Firebase Console");
  });

  it("translates popup-closed-by-user gracefully", () => {
    const error = { code: "auth/popup-closed-by-user" };
    const msg = formatAuthErrorMessage(error);
    expect(msg).toContain("cancelled");
  });

  it("handles generic error objects safely", () => {
    const customError = { message: "Internal server error" };
    expect(formatAuthErrorMessage(customError)).toBe("Internal server error");
    expect(formatAuthErrorMessage(null)).toContain("Authentication failed");
  });
});
