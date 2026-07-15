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
  Legend,
} from "recharts";
import type { DensityDataPoint } from "../../types/api";

interface DensityCurveChartProps {
  data?: DensityDataPoint[];
  currentDensity?: number;
}

export const DensityCurveChart: React.FC<DensityCurveChartProps> = ({ data, currentDensity }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
        Data kurva kepadatan tidak tersedia
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2ebe3" />
          <XAxis
            dataKey="d"
            type="number"
            domain={[0, "dataMax"]}
            unit=" ekor/are"
            stroke="var(--text-secondary)"
            fontSize={12}
          />
          <YAxis
            stroke="var(--text-secondary)"
            fontSize={12}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            domain={["auto", "auto"]}
          />
          <Tooltip
            formatter={(value: unknown) => [
              `${(Number(value) * 100).toFixed(2)}%`,
              "F_density_bio",
            ]}
            labelFormatter={(label: unknown) => `Kepadatan (d): ${label} ekor/are`}
            contentStyle={{
              backgroundColor: "var(--surface-card)",
              borderColor: "var(--surface-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
          <Line
            type="monotone"
            dataKey="f_density"
            name="F_density_bio (Faktor Biologis)"
            stroke="var(--green-600)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 6, fill: "var(--green-500)" }}
          />
          <ReferenceLine
            x={3}
            stroke="var(--accent-amber)"
            strokeDasharray="4 4"
            label={{
              value: "Tegel (3.0)",
              position: "top",
              fill: "var(--accent-amber)",
              fontSize: 11,
            }}
          />
          <ReferenceLine
            x={4}
            stroke="var(--green-500)"
            strokeDasharray="4 4"
            label={{
              value: "Jarwo (4.0)",
              position: "top",
              fill: "var(--green-500)",
              fontSize: 11,
            }}
          />
          <ReferenceLine
            x={8}
            stroke="var(--accent-red)"
            strokeDasharray="4 4"
            label={{
              value: "Saturasi (8.0)",
              position: "top",
              fill: "var(--accent-red)",
              fontSize: 11,
            }}
          />
          {currentDensity !== undefined && (
            <ReferenceLine
              x={currentDensity}
              stroke="#2563eb"
              strokeWidth={2}
              label={{
                value: `Input Saat Ini (${currentDensity})`,
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

