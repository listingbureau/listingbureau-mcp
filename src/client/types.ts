/** API response envelope for success responses. */
export interface ApiSuccessResponse<T> {
  status: "success";
  data: T;
  meta?: PaginationMeta;
}

/** API response envelope for error responses. */
export interface ApiErrorResponse {
  status: "error";
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

/** POST /auth/token response -- includes both tokens + optional cid. */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  cid?: string;
}

/** POST /auth/refresh response -- access_token only, NO refresh_token. */
export interface RefreshResponse {
  access_token: string;
}

/** Stored JWT state within LBClient. */
export interface JwtState {
  access_token: string;
  refresh_token: string;
  /** Unix seconds when the access token expires. */
  expires_at: number;
}

// -- Account ------------------------------------------------------------------

export interface Account {
  email: string;
  first_name: string;
  last_name: string;
  account_type: string;
  company?: string;
}

export interface Subscription {
  account_type: string;
  plan_label: string;
  use_wallet: boolean;
  subscription_fee: number;
}

export interface ServiceRates {
  atc: number;
  pgv: number;
  sfb_service_fee: number;
  sfb_tax_rate: number;
  sfb_passthrough_rate: number;
  sfb_formula: string;
  [key: string]: unknown;
}

export interface BalanceWarning {
  warning: string;
  daily_cost_estimate: number;
  balance?: number;
  days_remaining?: number;
}

// -- Wallet -------------------------------------------------------------------

export interface WalletBalance {
  balance_usd: number;
  held_usd: number;
}

export interface Transaction {
  id: string;
  amount: number;
  balance_after: number;
  type: string;
  description: string;
  reference_id: string;
  created_at: string;
}

export interface TopupResponse {
  checkout_url: string;
}

// -- Projects -----------------------------------------------------------------

export interface Project {
  ui_id: string;
  cid: string;
  marketplace: string;
  region: string;
  asin: string | null;
  itemid: string | null;
  keyword: string;
  active: boolean;
  archived: boolean;
  dt_utc: string;
  product_id: string;
  services: {
    atc: number;
    sfb: number;
    pgv: number;
  };
  scheduling: ScheduleEntry[];
  data: {
    serps: Record<string, unknown>;
  };
  unavailable: boolean;
}

export interface ProjectListItem {
  ui_id: string;
  marketplace: string;
  region: string;
  asin: string | null;
  itemid: string | null;
  keyword: string;
  active: boolean;
  archived: boolean;
  product_id: string;
  services: {
    atc: number;
    sfb: number;
    pgv: number;
  };
}

// -- Schedule -----------------------------------------------------------------

export interface ScheduleEntry {
  id: string;         // e.g. "04032026" or "ongoing"
  date: string;       // e.g. "04/03/2026" or "ongoing"
  atc: number;
  purchase: number;   // backend renames sfb -> purchase
  pageview: number;   // backend renames pgv -> pageview
}

export interface ScheduleResponse {
  ui_id: string;
  services: {
    atc: number;
    sfb: number;
    pgv: number;
  };
  scheduling: ScheduleEntry[];
  balance_warning?: BalanceWarning;
}

// -- Project Stats ------------------------------------------------------------

export interface ProjectStatsResponse {
  days: number;
  total: number;
  stats: ProjectStatsDay[];
}

export interface ProjectStatsDay {
  date: string;                    // YYYYMMDD
  dt: string | null;               // ISO datetime with timezone
  services: {
    sfb: ServiceDayStats;
    atc: ServiceDayStats;
    pgv: ServiceDayStats;
  };
  serp: Record<string, unknown> | null;
  ara: Record<string, unknown> | null;
  br: Record<string, unknown> | null;
  sqr: Record<string, unknown> | null;
  ranks: unknown[] | null;
}

export interface ServiceDayStats {
  assignments: number | null;
  executed: number;
}

// -- Orders -------------------------------------------------------------------

export interface Order {
  order_id: string;
  cid: string;
  status: string;
  dt_utc: string;
  items: unknown[];
  campaign: string;
  region: string;
  asin: string | null;
  keyword: string;
  ui_id: string;
  issue_reported: boolean;
}

// -- Generic message response (archive, etc.) ---------------------------------

export interface MessageResponse {
  message: string;
  [key: string]: unknown;
}
