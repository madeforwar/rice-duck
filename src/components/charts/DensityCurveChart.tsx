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
} from "recharts";
import type { DensityPoint, ReferenceBenchmarks } from "../../types/api";

interface DensityCurveChartProps {
  data?: DensityPoint[];
  currentDensity?: number;
  benchmarks?: ReferenceBenchmarks;
}

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
    <div style={{ width: "100%", height: 340 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2ebe3" />
          <XAxis
            dataKey="density"
            type="number"
            domain={[0, maxDensity]}
            unit=" head/are"
            stroke="var(--text-secondary)"
            fontSize={12}
          />
          <YAxis
            stroke="var(--text-secondary)"
            fontSize={12}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            domain={[0, "auto"]}
          />
          <Tooltip
            formatter={(value: unknown, name: unknown) => [
              `${(Number(value) * 100).toFixed(2)}%`,
              String(name ?? ""),
            ]}
            labelFormatter={(label: unknown) => `Duck Density: ${label} head/are`}
            contentStyle={{
              backgroundColor: "var(--surface-card)",
              borderColor: "var(--surface-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />

          {/* ReferenceArea for saturation / trampling risk zone (> 8 head/are) */}
          <ReferenceArea
            x1={kMaxSaturation}
            x2={maxDensity}
            fill="#fecaca"
            fillOpacity={0.4}
            label={{
              value: "Trampling Danger Zone (> 8 head/are)",
              position: "insideTopRight",
              fill: "#991b1b",
              fontSize: 11,
              fontWeight: 600,
            }}
          />

          <Line
            type="monotone"
            dataKey="jarwo_yield"
            name="Jarwo Yield Factor"
            stroke="var(--green-600)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 6, fill: "var(--green-500)" }}
          />
          <Line
            type="monotone"
            dataKey="tegel_yield"
            name="Tegel Yield Factor"
            stroke="var(--accent-amber)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 5, fill: "var(--accent-amber)" }}
          />

          {/* Reference Lines with slate-500 (#64748b) for academic benchmarks */}
          <ReferenceLine
            x={kSafeTegel}
            stroke="#64748b"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: `Tegel Limit (${kSafeTegel})`,
              position: "top",
              fill: "#64748b",
              fontSize: 11,
              fontWeight: 500,
            }}
          />
          <ReferenceLine
            x={kSafeJarwo}
            stroke="#64748b"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: `Jarwo Safe Limit (${kSafeJarwo})`,
              position: "top",
              fill: "#64748b",
              fontSize: 11,
              fontWeight: 500,
            }}
          />
          <ReferenceLine
            x={kMaxSaturation}
            stroke="#64748b"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: `Saturation (${kMaxSaturation})`,
              position: "top",
              fill: "#64748b",
              fontSize: 11,
              fontWeight: 500,
            }}
          />

          {currentDensity !== undefined && (
            <ReferenceLine
              x={currentDensity}
              stroke="#2563eb"
              strokeWidth={2}
              label={{
                value: `Current Input (${currentDensity.toFixed(2)})`,
                position: "insideTopLeft",
                fill: "#2563eb",
                fontSize: 11,
                fontWeight: "bold",
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

