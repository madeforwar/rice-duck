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
  Cell,
} from "recharts";
import type { DssSimulationResponse, WaterfallNode } from "../../types/api";

interface TwoTierCashBreakdownChartProps {
  simulationResult: DssSimulationResponse;
  waterfallData?: WaterfallNode[];
}

export const TwoTierCashBreakdownChart: React.FC<TwoTierCashBreakdownChartProps> = ({
  simulationResult,
  waterfallData,
}) => {
  const formatRp = (val: number) => `Rp ${val.toLocaleString("en-US")}`;

  // If backend provided waterfallData, render Waterfall Chart.
  if (waterfallData && waterfallData.length > 0) {
    let runningTotal = 0;
    const chartData = waterfallData.map((item) => {
      const nodeName = item.name ?? item.label ?? "";
      const nodeAmount = item.amount ?? item.value ?? 0;
      const nodeType = item.type ?? item.node_type ?? "cost";

      let base = 0;
      let barVal = nodeAmount;

      if (nodeType === "revenue") {
        base = runningTotal;
        runningTotal += nodeAmount;
      } else if (nodeType === "cost") {
        runningTotal -= nodeAmount;
        base = runningTotal;
      } else if (nodeType === "total" || nodeType === "profit") {
        base = 0;
        barVal = nodeAmount;
      }

      return {
        name: nodeName,
        amount: nodeAmount,
        type: nodeType,
        base: Math.max(0, base),
        barVal,
      };
    });

    return (
      <div style={{ width: "100%", height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2ebe3" />
            <XAxis
              dataKey="name"
              stroke="var(--text-secondary)"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="var(--text-secondary)"
              fontSize={11}
              tickFormatter={(v) => `Rp ${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: unknown, _name: unknown, entry: unknown) => {
                const payloadItem = (entry as { payload?: { amount?: number } })?.payload;
                const rawVal = payloadItem?.amount ?? Number(value);
                return [formatRp(rawVal), "Amount"];
              }}
              contentStyle={{
                backgroundColor: "var(--surface-card)",
                borderColor: "var(--surface-border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
            {/* Floating waterfall transparent base */}
            <Bar dataKey="base" stackId="waterfall" fill="transparent" legendType="none" />
            <Bar dataKey="barVal" name="Financial Waterfall Flow" stackId="waterfall" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => {
                let color = "var(--green-600)";
                if (entry.type === "cost") color = "var(--accent-amber)";
                if (entry.type === "total" || entry.type === "profit") color = "var(--green-400)";
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Pure Cash Liquidity fallback chart (Sandbox costs purged completely)
  const data = [
    {
      category: "Validated Pure Cash Circuit",
      "Total Revenue": simulationResult.Total_Revenue,
      "Duck Purchase Cost": simulationResult.Cost_duck_buy,
      "Pure Absorbed Net Cash": simulationResult.Profit_net_cash,
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
            tickFormatter={(v) => `Rp ${(v / 1000).toFixed(0)}k`}
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
          <Bar dataKey="Total Revenue" fill="var(--green-600)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Duck Purchase Cost" fill="var(--accent-amber)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Pure Absorbed Net Cash" fill="var(--green-400)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

