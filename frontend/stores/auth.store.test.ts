import { useAuthStore } from "./auth.store";
import * as authApi from "../lib/api/auth.api";
import type { AuthResponse } from "../types/auth.types";

jest.mock("../lib/api/auth.api");
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;

const mockUser = {
  id: "1",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  role: "shipper" as const,
  isEmailVerified: true,
  isActive: true,
  walletAddress: null,
  verificationToken: null,
  verificationTokenExpiry: null,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
  jest.clearAllMocks();
});

describe("auth store", () => {
  describe("login", () => {
    it("should set user and isAuthenticated on success", async () => {
      mockedAuthApi.login.mockResolvedValue({
        user: mockUser,
        accessToken: "access",
        refreshToken: "refresh",
      });

      await useAuthStore
        .getState()
        .login({ email: "test@example.com", password: "pass" });

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("should set isLoading during login", async () => {
      let resolveLogin!: (value: AuthResponse) => void;
      mockedAuthApi.login.mockReturnValue(
        new Promise((resolve) => {
          resolveLogin = resolve;
        }),
      );

      const promise = useAuthStore
        .getState()
        .login({ email: "test@example.com", password: "pass" });
      expect(useAuthStore.getState().isLoading).toBe(true);

      resolveLogin({
        user: mockUser,
        accessToken: "access",
        refreshToken: "refresh",
      });
      await promise;
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("should reset isLoading and throw on failure", async () => {
      mockedAuthApi.login.mockRejectedValue(new Error("Invalid credentials"));

      await expect(
        useAuthStore
          .getState()
          .login({ email: "test@example.com", password: "wrong" }),
      ).rejects.toThrow("Invalid credentials");

      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe("register", () => {
    it("should set user and isAuthenticated on success", async () => {
      mockedAuthApi.register.mockResolvedValue({
        user: mockUser,
        accessToken: "access",
        refreshToken: "refresh",
      });

      await useAuthStore.getState().register({
        email: "test@example.com",
        password: "pass",
        firstName: "Test",
        lastName: "User",
      });

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it("should reset isLoading and throw on failure", async () => {
      mockedAuthApi.register.mockRejectedValue(new Error("Email taken"));

      await expect(
        useAuthStore.getState().register({
          email: "test@example.com",
          password: "pass",
          firstName: "Test",
          lastName: "User",
        }),
      ).rejects.toThrow("Email taken");

      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe("logout", () => {
    it("should clear user and isAuthenticated", async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      mockedAuthApi.logout.mockResolvedValue();

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("should clear state even if API call fails", async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      mockedAuthApi.logout.mockRejectedValue(new Error("Network error"));

      try {
        await useAuthStore.getState().logout();
      } catch {
        // logout re-throws the error, but state should still be cleared
      }

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe("setUser", () => {
    it("should set user and isAuthenticated=true when user provided", () => {
      useAuthStore.getState().setUser(mockUser);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it("should set user=null and isAuthenticated=false when null", () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      useAuthStore.getState().setUser(null);
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe("fetchCurrentUser", () => {
    it("should set user on success", async () => {
      mockedAuthApi.getCurrentUser.mockResolvedValue(mockUser);

      await useAuthStore.getState().fetchCurrentUser();

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("should clear state on failure", async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      mockedAuthApi.getCurrentUser.mockRejectedValue(new Error("Unauthorized"));

      await useAuthStore.getState().fetchCurrentUser();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
