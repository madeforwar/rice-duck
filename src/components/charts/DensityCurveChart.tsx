import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  Label,
} from "recharts";
import type { DensityPoint, ReferenceBenchmarks } from "../../types/api";

interface DensityCurveChartProps {
  data?: DensityPoint[];
  currentDensity?: number;
  benchmarks?: ReferenceBenchmarks;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-md p-3 shadow-md text-xs font-sans">
      <p className="font-semibold text-slate-800 border-b border-slate-100 pb-1.5 mb-2">
        Stocking Density: <span className="text-emerald-700 font-mono">{label} ducks/are</span>
      </p>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-semibold font-mono text-slate-900">
              {(Number(entry.value) * 100).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DensityCurveChart: React.FC<DensityCurveChartProps> = ({
  data,
  currentDensity,
  benchmarks,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--text-muted)",
          background: "var(--surface-muted)",
          borderRadius: "var(--radius-sm)",
          border: "1px dashed var(--surface-border)",
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>
          Density Curve Data Unavailable
        </div>
        <div style={{ fontSize: 12, marginTop: 4 }}>
          Run the DSS simulation to render high-fidelity density curve data.
        </div>
      </div>
    );
  }

  const kSafeTegel = benchmarks?.k_safe_tegel ?? 3.0;
  const kSafeJarwo = benchmarks?.k_safe_jarwo ?? 4.0;
  const kMaxSaturation = benchmarks?.k_max_saturation ?? 8.0;

  // Adapt backend data structure cleanly (supports yield_factor_jarwo or jarwo_yield_factor)
  const chartData = data.map((d) => ({
    ...d,
    jarwo_yield: d.yield_factor_jarwo ?? d.jarwo_yield_factor ?? 0,
    tegel_yield: d.yield_factor_tegel ?? d.tegel_yield_factor ?? 0,
  }));

  const maxDensity = Math.max(...chartData.map((d) => d.density), 12);

  return (
    <div className="w-full">
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 25, right: 35, left: 20, bottom: 35 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="density"
              type="number"
              domain={[0, maxDensity]}
              stroke="#64748b"
              tickLine={false}
              tickMargin={10}
              interval="preserveStartEnd"
              tick={{ fontSize: 12, fill: "#475569" }}
            >
              <Label
                value="Density (ducks/are)"
                position="insideBottom"
                offset={-20}
                fill="#475569"
                fontSize={12}
                style={{ fontWeight: 600 }}
              />
            </XAxis>
            <YAxis
              stroke="#64748b"
              tickLine={false}
              tickMargin={10}
              tick={{ fontSize: 12, fill: "#475569" }}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              domain={[0, "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* ReferenceArea for saturation / trampling risk zone (> 8 head/are) */}
            <ReferenceArea
              x1={kMaxSaturation}
              x2={maxDensity}
              fill="#fecaca"
              fillOpacity={0.3}
            />

            <Line
              type="monotone"
              dataKey="jarwo_yield"
              name="Yield (Jarwo)"
              stroke="#16a34a"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: "#16a34a" }}
            />
            <Line
              type="monotone"
              dataKey="tegel_yield"
              name="Yield (Tegel)"
              stroke="#d97706"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 5, fill: "#d97706" }}
            />

            {/* Reference Lines without inner text labels to avoid collisions */}
            <ReferenceLine
              x={kSafeTegel}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <ReferenceLine
              x={kSafeJarwo}
              stroke="#16a34a"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <ReferenceLine
              x={kMaxSaturation}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />

            {currentDensity !== undefined && (
              <ReferenceLine
                x={currentDensity}
                stroke="#2563eb"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* External HTML Legend */}
      <div className="mt-4 p-4 bg-slate-50/50 border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600 flex-shrink-0"></span>
          <span><strong>Yield (Jarwo):</strong> Jajar Legowo 2:1 biological yield modifier curve.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border-2 border-amber-600 bg-amber-100 flex-shrink-0"></span>
          <span><strong>Yield (Tegel):</strong> Standard Tegel layout biological yield modifier curve.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-slate-400 border border-slate-500 flex-shrink-0"></span>
          <span><strong>Tegel Limit ({kSafeTegel}/are):</strong> Safe carrying capacity for Tegel.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-emerald-500 flex-shrink-0"></span>
          <span><strong>Jarwo Limit ({kSafeJarwo}/are):</strong> Safe carrying capacity for Jarwo.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-red-500 flex-shrink-0"></span>
          <span><strong>Max Limit ({kMaxSaturation}/are):</strong> Saturation trampling threshold.</span>
        </div>
        {currentDensity !== undefined && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-600 flex-shrink-0"></span>
            <span><strong>Current Input ({currentDensity.toFixed(1)}/are):</strong> Active simulation density.</span>
          </div>
        )}
      </div>
    </div>
  );
};

