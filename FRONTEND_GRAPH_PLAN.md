# TASK: HEAVY SCAN & FRONTEND VISUALIZATION ARCHITECTURAL PLAN
**Target Quality:** High-Impact Scopus Q1 Visual Evidence & UI/UX Theme Preservation
**Role:** Lead Frontend Architect & UI/UX Systems Engineer

## A. API Integration & Type Mapping

Update `src/types/api.ts` to include series data points payload.

```typescript
// Add Data Point Interfaces
export interface DensityDataPoint {
  d: number; // Density (ducks/are)
  f_density: number; // Value of F_density_bio
}

export interface AgeDataPoint {
  u: number; // Age (days)
  r_age: number; // Vulnerability Risk (%)
}

// Update DssSimulationResponse to include charts data
export interface DssSimulationResponse extends DssCoreOutput, DssSandboxOutput {
  charts?: {
    density_series: DensityDataPoint[];
    age_series: AgeDataPoint[];
  };
}
```

## B. Component Architecture & Layout Placement

New components to build in `src/components/charts/`:
1. `DensityCurveChart.tsx`: Use `recharts` `<LineChart>`. Plot `f_density` vs `d`. Add `<ReferenceLine>` for Tegel (3), Jarwo (4), and max saturation (8). Colors: primary curve (`--green-600`), reference lines (`--text-muted`, `--accent-amber`).
2. `AgeVulnerabilityChart.tsx`: Use `recharts` `<LineChart>`. Plot `r_age` vs `u`. Colors: primary curve (`--accent-red`), safe zone indicators based on age thresholds.
3. `TwoTierCashBreakdownChart.tsx`: Use `recharts` `<BarChart>`. Stack or group Core Validated (`Profit_net_cash`, `Total_Revenue`, `Cost_total_cash`) vs Sandbox Isolated (`Cost_feed_isolated`, `Cost_weeding_isolated`, etc.). Colors: Core (`--green-500`), Sandbox (`--text-muted` or `--surface-border`).

Layout placement: 
- Insert a new section below the main result cards in `src/pages/SimulasiPage.tsx`.
- Create a Tabbed container (e.g., "Visualisasi Ilmiah") to house the 3 charts. Prevents overwhelming the UI while providing scientific evidence.

## C. Step-by-Step Execution Plan

1. **Install Recharts:** `npm install recharts` (Completed in scan phase).
2. **Type Updates:** Update `src/types/api.ts` with `DensityDataPoint`, `AgeDataPoint`, and chart field in `DssSimulationResponse`.
3. **Component Creation (Density):** Create `src/components/charts/DensityCurveChart.tsx`. Map JSON payload. Strictly NO math formulas inside. Use Tailwind variables for colors.
4. **Component Creation (Age):** Create `src/components/charts/AgeVulnerabilityChart.tsx`. Map JSON payload. Strictly NO math formulas inside.
5. **Component Creation (Cash Tier):** Create `src/components/charts/TwoTierCashBreakdownChart.tsx`. Map combined Core/Sandbox JSON payload.
6. **Page Integration:** Import charts into `src/pages/SimulasiPage.tsx`. Add conditionally rendering section (if `charts` data exists in response). Use existing tab UI patterns or create a simple toggle for "View Scientific Charts".
