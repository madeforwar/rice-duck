# CHART DECROWDING PLAN

## A. Collision Audit Log

Files containing bugs:
1. src/components/charts/DensityCurveChart.tsx
   - Line 154: <Line name="Biological Yield Modifier (Tegel)" ... /> (Too long)
   - Line 169: alue: "Tegel Safe Carrying Capacity Limit ({kSafeTegel} ducks/are)" (Too long)
   - Line 178: <ReferenceLine x={kSafeJarwo} label={{ value: "Legowo 2:1 Safe Carrying Capacity Limit..." }} /> (Too long)
   - Line 193: <ReferenceLine x={kMaxLim} label={{ value: "Destructive Trampling Saturation Threshold..." }} /> (Too long)
   - <XAxis> lacking proper short label for "Stocking Density (ducks/are)".

2. src/components/charts/AgeVulnerabilityChart.tsx
   - Line 87: <XAxis label={{ value: "Duckling Chronological Age (Days Post-Hatch)", ... }} /> (Too long)
   - Line 104: <Legend /> containing "Ontogenic Risk Penalty" & "Effective Flock Survival Rate" (Too long, needs external HTML).
   - Lines 172/187/203: <ReferenceLine> annotations likely have long text.

3. src/components/charts/TwoTierCashBreakdownChart.tsx
   - Line 21-24: gross_grain_revenue: "Gross Grain Revenue", duckling_investment_cost: "Duckling Investment Cost", etc. (Too long for standard stacked bar, causing smushing).
   - Line 118, 174: <Legend /> inside canvas (Must remove).
   - Entire Waterfall/BarChart logic: Currently rendering standard vertical bars (stacked or side-by-side). Causes floating blocks or overlap. Must change to layout="vertical".

## B. External HTML Legend Blueprint

Structure to place below <ResponsiveContainer> in all chart components:

`	sx
<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 p-4 bg-slate-50 rounded-lg text-xs text-slate-700">
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 bg-emerald-600 rounded-sm"></div>
    <span><strong>Tegel Limit (3/are):</strong> Tegel Safe Carrying Capacity Limit</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
    <span><strong>Jarwo Limit (4/are):</strong> Legowo 2:1 Safe Carrying Capacity Limit</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
    <span><strong>Max Limit (8/are):</strong> Destructive Trampling Saturation Threshold</span>
  </div>
</div>
`
*(Colors adjust per chart data)*

## C. Vertical Bar Chart Architecture

For TwoTierCashBreakdownChart.tsx:
- Change <BarChart> properties: Add layout="vertical".
- Swap Axis:
  - <XAxis type="number" /> (Values in Rp).
  - <YAxis dataKey="name" type="category" width={180} /> (Categories like "Gross Revenue", "Duckling Cost").
- Data structure:
  `json
  [
    { name: "Revenue", value: 5000000, fill: "#16a34a" },
    { name: "Cost", value: 1500000, fill: "#ef4444" },
    { name: "Net Profit", value: 3500000, fill: "#4f46e5" }
  ]
  `
- Remove stacked hack. Use standard comparison horizontal bars.
- Remove <Legend /> from SVG. Move detailed metric explanations to External HTML Legend Blueprint.

## D. Execution Step-by-Step

1.  **Refactor DensityCurveChart.tsx:**
    *   Change <Line name="..."> to short names ("Yield (Tegel)", "Yield (Jarwo)").
    *   Change <ReferenceLine label="..."> to short names ("Tegel Limit (3/are)", "Jarwo Limit (4/are)", "Max Limit (8/are)").
    *   Change <XAxis> label to "Density (ducks/are)".
    *   Remove <Legend> from inside <ResponsiveContainer>.
    *   Add External HTML Legend grid below <ResponsiveContainer>.

2.  **Refactor AgeVulnerabilityChart.tsx:**
    *   Change <XAxis label="..."> to "Age (Days)".
    *   Change <Area> / <Line> names to "Age Risk" and "Survival Rate".
    *   Remove <Legend> from inside <ResponsiveContainer>.
    *   Add External HTML Legend grid below <ResponsiveContainer>.

3.  **Refactor TwoTierCashBreakdownChart.tsx:**
    *   Set <BarChart layout="vertical">.
    *   Configure <XAxis type="number">.
    *   Configure <YAxis type="category" dataKey="name" width={200}>.
    *   Restructure data payload to simple array of objects mapped by 
ame and alue.
    *   Remove <Legend> from inside <ResponsiveContainer>.
    *   Add External HTML Legend grid below <ResponsiveContainer> explaining "Gross Revenue", "Duckling Investment Cost", etc.
