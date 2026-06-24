export type BackendStatus =
  | "ready"
  | "partial"
  | "complete"
  | "estimation_only"
  | "unavailable"
  | "disabled"
  | "collected"
  | "estimation"
  | "literature-uncalibrated"
  | "literature-reference-a02"
  | "local-calibrated"
  | "local-estimate"
  | "mixed"
  | "system-design"
  | "system-design-uncalibrated"
  | "missing";

export type ProfitDataPurity = "local-calibrated" | "mixed" | "literature-uncalibrated";

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
}

export interface RiceVarietyOption {
  code: string;
  label: string;
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
  k_max_are: number;
  f_yield: number;
  note: string;
  k_max_range_are: Record<string, number>;
  limited_test_max_are: number | null;
  k_max_status: BackendStatus | string;
  f_yield_status: BackendStatus | string;
}

export interface DssOptionsResponse {
  rice_varieties: RiceVarietyOption[];
  planting_systems: PlantingSystemOption[];
}

export interface LookupParameterMeta {
  value: number | string | null;
  unit: string;
  source: string;
  status: BackendStatus;
  note: string;
  min: number | null;
  max: number | null;
  limited_test_max?: number | null;
}

export interface ScenarioYield {
  kg_per_ha: number;
  kg_per_are: number;
  ton_per_ha: number;
  estimated_total_kg: number;
}

export interface ActualScenario {
  duck_count: number;
  land_area_are: number;
  land_area_ha: number;
  land_area_ha_note?: number | null;
  density_are: number;
  density_ha: number;
  density_lit_ha?: number | null;
  duration_days: number;
  release_date: string;
  pull_date: string;
  surviving_ducks: number;
  dung_total_per_duck_kg: number;
  dung_status: BackendStatus | string;
  effective_duration_days: number;
  x_base_kg_per_ha: number;
  x_base_kg_are?: number | null;
  penalty_rate: number;
  x_penalized_kg_per_ha: number;
  x_penalized_kg_are?: number | null;
  predicted_yield: ScenarioYield;
  risk_status: string;
  rey: number | null;
  rey_status: string;
  rey_notes: string;
}

export interface RecommendedScenario {
  recommended_duck_count: number;
  recommended_density_are: number;
  recommended_density_ha: number;
  recommended_density_lit_ha?: number | null;
  recommended_duration_days: number;
  recommended_release_date: string;
  recommended_pull_date: string;
  surviving_ducks: number;
  dung_total_per_duck_kg: number;
  dung_status: BackendStatus | string;
  effective_duration_days: number;
  x_base_kg_per_ha: number;
  x_base_kg_are?: number | null;
  penalty_rate: number;
  x_penalized_kg_per_ha: number;
  x_penalized_kg_are?: number | null;
  predicted_yield: ScenarioYield;
  risk_status: string;
  reasoning_summary: string;
  rey: number | null;
  rey_status: string;
  rey_notes: string;
}

export interface OptimalityAssessment {
  is_optimal: boolean;
  score_safety: boolean;
  density_gap_ratio: number | null;
  density_gap_within_threshold: boolean | null;
  delta_yield_pct: number | null;
  delta_yield_within_threshold: boolean | null;
  delta_profit_ratio: number | null;
  delta_profit_within_threshold: boolean | null;
  profit_component_included: boolean;
  optimality_basis: string;
  catatan_kalibrasi: string;
  thresholds: Record<string, number>;
  threshold_status: BackendStatus | string;
  sumber_data: BackendStatus | string;
  profit_data_purity: ProfitDataPurity;
}

export interface ComparisonBlock {
  duck_count_difference: number;
  density_difference_are: number;
  yield_difference_kg_per_ha: number;
  yield_difference_total_kg: number;
  risk_change: string;
  profit_difference_rp: number | null;
}

export interface RiskBlock {
  actual_status: string;
  recommended_status: string;
  density_risk: string;
  phase_risk: string;
  feed_warning: string;
  survival_data_warning: string;
  thresholds: Record<string, number>;
  notes: string[];
}

export interface EconomicsInfrastructure {
  status: string;
  net_cost_per_cycle_rp: number;
  shelter_cost_per_cycle_rp: number;
  maintenance_cost_rp: number;
  total_infrastructure_cost_rp: number;
  note: string;
}

export interface EconomicsScenario {
  status: BackendStatus | string;
  status_data?: BackendStatus | string | null;
  perspective: string;
  rice_revenue_rp: number | null;
  conventional_rice_revenue_rp: number | null;
  delta_rice_value_rp: number | null;
  duck_revenue_rp: number;
  duck_purchase_cost_rp: number;
  feed_cost_rp: number | null;
  feed_cost_status: BackendStatus | string;
  duck_net_value_rp: number | null;
  infrastructure: EconomicsInfrastructure;
  penalty_yield_rp: number | null;
  penalty_feed_rp: number | null;
  net_profit_rp: number | null;
  net_profit_rp_per_are: number | null;
  missing_parameters: string[];
  sumber_data: string;
  data_readiness?: BackendStatus | string | null;
  formula_available?: boolean;
  numeric_ready?: boolean | null;
  q_feed_source?: string | null;
  q_feed_status?: BackendStatus | string | null;
  q_feed_assumption_note?: string | null;
  v_duck_xiong_reference?: number | null;
  v_duck_xiong_model_value?: number | null;
  v_duck_xiong_status?: BackendStatus | string;
  additional_cost: number;
}

export interface EconomicsBlock {
  status: BackendStatus | string;
  actual: EconomicsScenario;
  recommended: EconomicsScenario;
  delta_profit_rp: number | null;
  assumptions: string[];
}

export interface SoilNutrientsBlock {
  status: BackendStatus | string;
  n_kg_per_ha: number | null;
  p2o5_kg_per_ha: number | null;
  k2o_kg_per_ha: number | null;
  n_kg_per_are: number | null;
  p2o5_kg_per_are: number | null;
  k2o_kg_per_are: number | null;
  n_total_kg: number | null;
  p2o5_total_kg: number | null;
  k2o_total_kg: number | null;
  missing_parameters: string[];
}

export interface EcologyScenario {
  status: BackendStatus | string;
  fertilizer_saving_rp: number;
  fertilizer_saving_raw_rp: number;
  fertilizer_saving_status: BackendStatus | string;
  pesticide_herbicide_saving_rp: number | null;
  pesticide_herbicide_saving_status: BackendStatus | string;
  weed_reduction_rate: number;
  weeding_saving_rp: number;
  weeding_saving_status: BackendStatus | string;
  partial_ecological_value_rp: number;
  total_ecological_value_rp: number | null;
  included_components: string[];
  missing_parameters: string[];
  soil_nutrients: SoilNutrientsBlock;
}

export interface EcologyBlock {
  status: BackendStatus | string;
  actual: EcologyScenario;
  recommended: EcologyScenario;
  assumptions: string[];
}

export interface EnvironmentScenario {
  status: BackendStatus | string;
  calibration_note: string;
  co2e_kg_per_ha_season?: number | null;
  ghgi_kg_co2e_per_kg_yield?: number | null;
  ch4_reduction_percent?: number | null;
  y_ch4_do_model?: number | null;
  missing_parameters: string[];
  sumber_data: string;
  status_data?: BackendStatus | string | null;
  catatan_kalibrasi?: string | null;
  data_readiness?: BackendStatus | string | null;
  formula_available?: boolean;
  numeric_ready?: boolean | null;
  co2e_are?: number | null;
  f_ch4_are?: number | null;
  f_n2o_are?: number | null;
  ghgi?: number | null;
  ch4_reduction_pct?: number | null;
  co2e_ha_note?: number | null;
  f_ch4_ha_note?: number | null;
  f_n2o_ha_note?: number | null;
}

export interface EnvironmentBlock {
  status: BackendStatus | string;
  actual: EnvironmentScenario;
  recommended: EnvironmentScenario;
  assumptions: string[];
}

export interface ValidationBlock {
  input_valid: boolean;
  constraint_violations: string[];
  warnings: string[];
  missing_parameters: string[];
}

export interface DataReadinessBlock {
  agronomy_ready: BackendStatus | string;
  yield_ready: BackendStatus | string;
  economics_ready: BackendStatus | string;
  ecology_ready: BackendStatus | string;
  environment_ready: BackendStatus | string;
  overall_status: BackendStatus | string;
}

export interface DssSimulationResponse {
  history_id: string | null;
  input: DssSimulationRequest;
  lookup: {
    rice_variety: {
      code: string;
      label: string;
      hst_masuk: number;
      hst_heading: number;
      harvest_age_days?: number;
      status: BackendStatus | string;
    };
    planting_system: {
      code: string;
      label: string;
      k_max_are: number;
      f_yield: number;
      k_max_status: BackendStatus | string;
      f_yield_status: BackendStatus | string;
    };
    parameters: Record<string, LookupParameterMeta>;
    [key: string]: unknown;
  };
  actual_scenario: ActualScenario;
  optimality_assessment: OptimalityAssessment;
  recommended_scenario: RecommendedScenario | null;
  comparison: ComparisonBlock | null;
  risk: RiskBlock;
  trace: Record<string, unknown>;
  notes: string[];
  economics: EconomicsBlock;
  ecology: EcologyBlock;
  environment: EnvironmentBlock;
  validation: ValidationBlock;
  data_readiness: DataReadinessBlock;
}

export interface HistoryListItem {
  id: string;
  created_at: string;
  summary: {
    rice_variety: string;
    planting_system: string;
    duck_count: number;
    land_area_are: number;
    actual_density_are: number;
    recommended_duck_count: number;
    risk_status: string;
    estimated_total_yield_kg: number;
  };
}

export interface HistoryListResponse {
  data: HistoryListItem[];
}
