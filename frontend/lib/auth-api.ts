export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class AuthApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = "An error occurred";
    let errorCode: string | undefined;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      errorCode = errorData.code;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    throw new AuthApiError(errorMessage, response.status, errorCode);
  }

  return response.json();
}

async function makeAuthenticatedRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("auth_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  return handleApiResponse<T>(response);
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    return handleApiResponse<AuthResponse>(response);
  },

  async register(userData: RegisterRequest): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    return handleApiResponse<{ message: string }>(response);
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    return handleApiResponse<RefreshTokenResponse>(response);
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return handleApiResponse<{ message: string }>(response);
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return handleApiResponse<{ message: string }>(response);
  },

  async logout(): Promise<{ message: string }> {
    return makeAuthenticatedRequest<{ message: string }>("/auth/logout", {
      method: "POST",
    });
  },

  async getProfile(): Promise<{ id: string; email: string; name?: string }> {
    return makeAuthenticatedRequest<{
      id: string;
      email: string;
      name?: string;
    }>("/auth/profile");
  },

  async verifyToken(): Promise<{
    valid: boolean;
    user?: { id: string; email: string; name?: string };
  }> {
    try {
      const user = await this.getProfile();
      return { valid: true, user };
    } catch {
      return { valid: false };
    }
  },
};

export { AuthApiError };

export function isAuthApiError(error: unknown): error is AuthApiError {
  return error instanceof AuthApiError;
}

export function getAuthErrorMessage(error: unknown): string {
  if (isAuthApiError(error)) {
    switch (error.status) {
      case 401:
        return "Invalid email or password";
      case 403:
        return "Access denied";
      case 409:
        return "Email already exists";
      case 422:
        return "Invalid input data";
      case 429:
        return "Too many requests. Please try again later";
      case 500:
        return "Server error. Please try again later";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}
