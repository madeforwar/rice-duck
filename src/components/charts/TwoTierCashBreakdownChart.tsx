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

const WATERFALL_NAME_MAP: Record<string, string> = {
  gross_grain_revenue: "Gross Grain Revenue",
  gross_duck_revenue: "Gross Duck Revenue",
  duckling_investment_cost: "Duckling Investment Cost",
  duck_buy_cost: "Duckling Investment Cost",
  pure_absorbed_net_cash: "Pure Absorbed Net Cash",
  net_cash_flow: "Pure Absorbed Net Cash",
  net_profit: "Pure Absorbed Net Cash",
};

const sanitizeWaterfallName = (rawName: string): string => {
  if (!rawName) return "";
  const normalized = rawName.toLowerCase().replace(/[\s-]+/g, "_");
  if (WATERFALL_NAME_MAP[normalized]) {
    return WATERFALL_NAME_MAP[normalized];
  }
  return rawName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const CustomWaterfallTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  const rawVal = data?.amount ?? payload[0]?.value ?? 0;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-md p-3 shadow-md text-xs font-sans">
      <p className="font-semibold text-slate-800 border-b border-slate-100 pb-1.5 mb-2">
        {label}
      </p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-600">Amount:</span>
        <span className="font-semibold font-mono text-slate-900">
          Rp {Number(rawVal).toLocaleString("en-US")}
        </span>
      </div>
    </div>
  );
};

export const TwoTierCashBreakdownChart: React.FC<TwoTierCashBreakdownChartProps> = ({
  simulationResult,
  waterfallData,
}) => {
  const formatRp = (val: number) => `Rp ${val.toLocaleString("en-US")}`;

  // If backend provided waterfallData, render Waterfall Chart.
  if (waterfallData && waterfallData.length > 0) {
    let runningTotal = 0;
    const chartData = waterfallData.map((item) => {
      const rawNodeName = item.name ?? item.label ?? "";
      const nodeName = sanitizeWaterfallName(rawNodeName);
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
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 25, right: 30, left: 15, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `Rp ${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomWaterfallTooltip />} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "15px" }} iconType="square" />
            {/* Floating waterfall transparent base */}
            <Bar dataKey="base" stackId="waterfall" fill="transparent" legendType="none" />
            <Bar dataKey="barVal" name="Financial Waterfall Item" stackId="waterfall" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => {
                let color = "#16a34a"; // Green for revenue
                if (entry.type === "cost") color = "#d97706"; // Amber for cost
                if (entry.type === "total" || entry.type === "profit") color = "#2563eb"; // Blue for net profit/total
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
      "Gross Grain & Duck Revenue": simulationResult.Total_Revenue,
      "Duckling Investment Cost": simulationResult.Cost_duck_buy,
      "Pure Absorbed Net Cash": simulationResult.Profit_net_cash,
    },
  ];

  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 25, right: 30, left: 15, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="category"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            tickFormatter={(v) => `Rp ${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: unknown) => [formatRp(Number(value)), ""]}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderColor: "#e2e8f0",
              borderRadius: "0.375rem",
              color: "#0f172a",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "15px" }} iconType="square" />
          <Bar dataKey="Gross Grain & Duck Revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Duckling Investment Cost" fill="#d97706" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Pure Absorbed Net Cash" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

