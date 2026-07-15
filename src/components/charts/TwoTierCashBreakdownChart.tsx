import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { DssSimulationResponse } from "../../types/api";

interface TwoTierCashBreakdownChartProps {
  simulationResult: DssSimulationResponse;
}

export const TwoTierCashBreakdownChart: React.FC<TwoTierCashBreakdownChartProps> = ({
  simulationResult,
}) => {
  const formatRp = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  const data = [
    {
      category: "Tier 1: Core Validated (Kas Nyata)",
      "Pendapatan Total": simulationResult.Total_Revenue,
      "Biaya Beli Bebek (Kas)": simulationResult.Cost_duck_buy,
      "Profit Net Kas": simulationResult.Profit_net_cash,
    },
    {
      category: "Tier 2: Sandbox Isolated (Estimasi)",
      "Biaya Pakan (Shadow)": simulationResult.Cost_feed_isolated || 0,
      "Biaya Penyiangan (Shadow)": simulationResult.Cost_weeding_isolated || 0,
      "Biaya Pestisida (Shadow)": simulationResult.Cost_pesticide_isolated || 0,
      "Biaya Jaring (Shadow)": simulationResult.Cost_infra_net_isolated || 0,
    },
  ];

  return (
    <div style={{ width: "100%", height: 340 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2ebe3" />
          <XAxis
            dataKey="category"
            stroke="var(--text-secondary)"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke="var(--text-secondary)"
            fontSize={11}
            tickFormatter={(v) => `Rp ${(v / 1000).toFixed(0)}rb`}
          />
          <Tooltip
            formatter={(value: unknown) => [formatRp(Number(value)), ""]}
            contentStyle={{
              backgroundColor: "var(--surface-card)",
              borderColor: "var(--surface-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
          <Bar dataKey="Pendapatan Total" fill="var(--green-600)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Biaya Beli Bebek (Kas)" fill="var(--accent-amber)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Profit Net Kas" fill="var(--green-400)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Biaya Pakan (Shadow)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Biaya Penyiangan (Shadow)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Biaya Pestisida (Shadow)" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Biaya Jaring (Shadow)" fill="#f1f5f9" stroke="#cbd5e1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

