import { LBApiError } from "../utils/errors.js";
import type {
  ApiResponse,
  ApiSuccessResponse,
  JwtState,
  TokenResponse,
  RefreshResponse,
} from "./types.js";

/** Decode a JWT payload without verifying signature (we only need `exp`). */
function decodeJwtExp(token: string): number {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");
  // Base64url -> Base64 -> Buffer -> JSON
  const payload = Buffer.from(parts[1], "base64url").toString("utf-8");
  const parsed = JSON.parse(payload) as { exp?: number };
  if (typeof parsed.exp !== "number") {
    throw new Error("JWT missing exp claim");
  }
  return parsed.exp; // Unix seconds
}

export class LBClient {
  private jwt: JwtState | null = null;
  private authInProgress: Promise<void> | null = null;

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
  ) {}

  /**
   * Ensure we have a valid access token.
   * - No tokens -> authenticate with API key
   * - Expiring in <30s -> proactively refresh
   * - Refresh fails -> re-authenticate from scratch
   */
  private async ensureAuth(): Promise<void> {
    // Prevent concurrent auth calls
    if (this.authInProgress) {
      await this.authInProgress;
      return;
    }

    const nowSec = Math.floor(Date.now() / 1000);

    if (!this.jwt) {
      this.authInProgress = this.authenticate();
      try {
        await this.authInProgress;
      } finally {
        this.authInProgress = null;
      }
      return;
    }

    // Proactive refresh: 30 seconds before expiry
    if (this.jwt.expires_at - nowSec < 30) {
      this.authInProgress = this.refresh().catch(() => {
        // Refresh failed and cleared jwt -- re-authenticate from scratch
        return this.authenticate();
      });
      try {
        await this.authInProgress;
      } finally {
        this.authInProgress = null;
      }
    }
  }

  /** Exchange API key for JWT tokens. */
  private async authenticate(): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/v1/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: this.apiKey }),
    });

    let json: ApiResponse<TokenResponse>;
    try {
      json = (await res.json()) as ApiResponse<TokenResponse>;
    } catch {
      throw new LBApiError(
        res.status,
        "PARSE_ERROR",
        `Auth server returned non-JSON response (HTTP ${res.status})`,
      );
    }

    if (json.status === "error") {
      throw new LBApiError(
        res.status,
        json.error.code,
        json.error.message,
      );
    }

    const { access_token, refresh_token } = json.data;
    this.jwt = {
      access_token,
      refresh_token,
      expires_at: decodeJwtExp(access_token),
    };
  }

  /**
   * Refresh the access token.
   * On failure, throws so ensureAuth() stays the single re-auth entry point.
   */
  private async refresh(): Promise<void> {
    if (!this.jwt) {
      throw new Error("Cannot refresh without existing tokens");
    }

    const refreshToken = this.jwt.refresh_token;

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      let json: ApiResponse<RefreshResponse>;
      try {
        json = (await res.json()) as ApiResponse<RefreshResponse>;
      } catch {
        throw new LBApiError(
          res.status,
          "PARSE_ERROR",
          `Refresh server returned non-JSON response (HTTP ${res.status})`,
        );
      }

      if (json.status === "error") {
        // Refresh failed -- throw so catch block clears jwt and re-throws
        throw new Error(`Refresh failed: ${json.error.message}`);
      }

      const { access_token } = json.data;
      this.jwt = {
        ...this.jwt,
        access_token,
        expires_at: decodeJwtExp(access_token),
      };
    } catch (e) {
      // Clear tokens so next ensureAuth() triggers full re-auth
      this.jwt = null;
      throw e;
    }
  }

  /**
   * Make an authenticated API request.
   * Retries once on 401 (token expired mid-request).
   */
  async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>,
    query?: Record<string, string>,
  ): Promise<ApiSuccessResponse<T>> {
    await this.ensureAuth();
    const response = await this.doRequest<T>(method, path, body, query);

    // Single retry on 401
    if (response.status === "error" && response._statusCode === 401) {
      this.jwt = null;
      await this.ensureAuth();
      const retry = await this.doRequest<T>(method, path, body, query);
      if (retry.status === "error") {
        throw new LBApiError(
          retry._statusCode ?? 500,
          retry.error.code,
          retry.error.message,
        );
      }
      return retry as ApiSuccessResponse<T>;
    }

    if (response.status === "error") {
      throw new LBApiError(
        response._statusCode ?? 500,
        response.error.code,
        response.error.message,
      );
    }

    return response as ApiSuccessResponse<T>;
  }

  private async doRequest<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>,
    query?: Record<string, string>,
  ): Promise<ApiResponse<T> & { _statusCode?: number }> {
    let url = `${this.baseUrl}${path}`;
    if (query) {
      const params = new URLSearchParams(
        Object.entries(query).filter(([, v]) => v !== undefined && v !== ""),
      );
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.jwt!.access_token}`,
    };

    const options: RequestInit = { method, headers };
    if (body && method !== "GET") {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);

    // Note: non-JSON responses (e.g., gateway 502/401) throw here and bypass
    // the 401-retry path in request(). This is acceptable -- gateway-level 401s
    // are not recoverable via token refresh anyway.
    let json: ApiResponse<T>;
    try {
      json = (await res.json()) as ApiResponse<T>;
    } catch {
      throw new LBApiError(
        res.status,
        "PARSE_ERROR",
        `Server returned non-JSON response (HTTP ${res.status})`,
      );
    }

    // Attach status code for retry logic
    return { ...json, _statusCode: res.status };
  }
}
