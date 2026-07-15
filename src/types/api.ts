export type BackendStatus =
  | "ready"
  | "partial"
  | "complete"
  | "estimation_only"
  | "estimation-only"
  | "unavailable"
  | "disabled"
  | "collected"
  | "estimation"
  | "literature-uncalibrated"
  | "literature-reference-a02"
  | "local-calibrated"
  | "local-estimate"
  | "local-input"
  | "mixed"
  | "system-design"
  | "system-design-uncalibrated"
  | "missing"
  | "missing_params"
  | "missing-actual-price"
  | "required-user-input"
  | "data-collection-fallback"
  | "limitation";

export interface BackendErrorIssue {
  field: string;
  message: string;
  type: string;
}

export interface BackendErrorPayload {
  code: "validation_error" | "unauthorized" | "not_found" | "conflict" | "invalid_reference";
  message: string;
  field: string | null;
  issues: BackendErrorIssue[] | null;
}

export interface BackendErrorResponse {
  error: BackendErrorPayload;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface DssSimulationRequest {
  duck_count: number;
  land_area_are: number;
  planting_date: string;
  rice_variety: string;
  planting_system: string;
  duck_age_days: number;
  duck_buy_price_rp_per_duck?: number | null;
}

export type DssSimulationInputState = Omit<
  DssSimulationRequest,
  "duck_count" | "land_area_are" | "duck_age_days"
> & {
  duck_count: number | null;
  land_area_are: number | null;
  duck_age_days: number | null;
};

export interface RiceVarietyOption {
  code: string;
  label: string;
  hst_panen: number;
  hst_masuk: number;
  hst_heading: number;
  harvest_age_days: number;
  risk_note: string;
  hst_masuk_range: Record<string, number>;
  hst_heading_range: Record<string, number>;
  status: BackendStatus | string;
}

export interface PlantingSystemOption {
  code: string;
  label: string;
  k_safe_are: number;
  F_sys: number;
  note: string;
  k_max_are: number;
  f_yield: number;
  k_max_range_are: Record<string, number>;
  limited_test_max_are: number | null;
  k_max_status: BackendStatus | string;
  f_yield_status: BackendStatus | string;
}

export interface DssOptionsResponse {
  rice_varieties: RiceVarietyOption[];
  planting_systems: PlantingSystemOption[];
}

/**
 * SoT v2 — Two-Tier Output Architecture
 * Tier 1: Core Validated Output (Active Circuit) — Cash Liquidity Only
 * Tier 2: Empirically Uncorrelated Isolated Output (Sandbox Circuit) — Indicative Only
 */

// Tier 1: Core Validated Output Group
export interface DssCoreOutput {
  density_status: string;
  age_status: string;
  D_masuk_bebek: string;
  D_tarik_bebek: string;
  D_panen_gabah: string;
  N_survive: number;
  Yield_are_predict: number;
  Yield_total_predict: number;
  Revenue_gabah: number;
  Revenue_duck: number;
  Total_Revenue: number;
  Cost_duck_buy: number;
  Cost_total_cash: number; // = Cost_duck_buy (pure cash cost)
  Profit_net_cash: number; // HERO METRIC = Total_Revenue - Cost_total_cash
  F_sys: number;
}

// Tier 2: Empirically Uncorrelated Isolated Output Group (Sandbox)
export interface DssSandboxOutput {
  Cost_feed_isolated: number;
  Cost_weeding_isolated: number;
  Cost_pesticide_isolated: number;
  Cost_infra_isolated: number;
  Cost_fertilizer_isolated: number;
  Cost_infra_net_isolated: number;
  Cost_infra_cage_isolated: number;
  Cost_fert_urea_isolated: number;
  Cost_fert_phonska_isolated: number;
  Cost_fert_kcl_isolated: number;
}

// Combined Response — matches backend DSSSimulationResponse exactly
export interface DssSimulationResponse extends DssCoreOutput, DssSandboxOutput {}

export interface HistoryListItem {
  id: string;
  schema_version: number;
  created_at: string;
  summary: {
    rice_variety: string;
    planting_system: string;
    duck_count: number;
    land_area_are: number;
    actual_density_are: number;
    d_panen_gabah: string;
    estimated_total_yield_kg: number;
  };
}

export interface HistoryListResponse {
  data: HistoryListItem[];
}