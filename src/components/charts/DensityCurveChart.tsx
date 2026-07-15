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
  Legend,
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
    <div style={{ width: "100%", height: 380 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 35, right: 45, left: 25, bottom: 45 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="density"
            type="number"
            domain={[0, maxDensity]}
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            tickMargin={12}
          >
            <Label
              value="Stocking Density (ducks/are)"
              position="insideBottom"
              offset={-25}
              fill="#475569"
              fontSize={13}
              style={{ fontWeight: 500 }}
            />
          </XAxis>
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            tickMargin={12}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            domain={[0, "auto"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={40}
            wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
            iconType="circle"
          />

          {/* ReferenceArea for saturation / trampling risk zone (> 8 head/are) */}
          <ReferenceArea
            x1={kMaxSaturation}
            x2={maxDensity}
            fill="#fecaca"
            fillOpacity={0.3}
            label={{
              value: "Destructive Trampling Threshold",
              position: "insideTopRight",
              fill: "#991b1b",
              fontSize: 10,
              fontWeight: 600,
            }}
          />

          <Line
            type="monotone"
            dataKey="jarwo_yield"
            name="Biological Yield Modifier (Legowo 2:1)"
            stroke="#16a34a"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 6, fill: "#16a34a" }}
          />
          <Line
            type="monotone"
            dataKey="tegel_yield"
            name="Biological Yield Modifier (Tegel)"
            stroke="#d97706"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 5, fill: "#d97706" }}
          />

          {/* Reference Lines with slate-500 (#64748b) for academic benchmarks */}
          <ReferenceLine
            x={kSafeTegel}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: `Tegel Safe Carrying Capacity Limit (${kSafeTegel} ducks/are)`,
              position: "top",
              fill: "#64748b",
              fontSize: 10,
              fontWeight: "600",
              dy: -12,
              dx: 5,
            }}
          />
          <ReferenceLine
            x={kSafeJarwo}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: `Legowo 2:1 Safe Carrying Capacity Limit (${kSafeJarwo} ducks/are)`,
              position: "top",
              fill: "#64748b",
              fontSize: 10,
              fontWeight: "600",
              dy: -12,
              dx: 5,
            }}
          />
          <ReferenceLine
            x={kMaxSaturation}
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: `Maximum Trampling Saturation Threshold (${kMaxSaturation} ducks/are)`,
              position: "top",
              fill: "#dc2626",
              fontSize: 10,
              fontWeight: "600",
              dy: -12,
              dx: 5,
            }}
          />

          {currentDensity !== undefined && (
            <ReferenceLine
              x={currentDensity}
              stroke="#2563eb"
              strokeWidth={2}
              label={{
                value: `Current Input (${currentDensity.toFixed(2)} ducks/are)`,
                position: "insideTopLeft",
                fill: "#2563eb",
                fontSize: 11,
                fontWeight: "bold",
                dy: 15,
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

