import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
  duckling_investment_cost: "Duckling Acquisition Cost",
  duck_buy_cost: "Duckling Acquisition Cost",
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

  // If backend provided waterfallData, render Vertical Layout Bar Chart.
  if (waterfallData && waterfallData.length > 0) {
    const chartData = waterfallData.map((item) => {
      const rawNodeName = item.name ?? item.label ?? "";
      const nodeName = sanitizeWaterfallName(rawNodeName);
      const nodeAmount = item.amount ?? item.value ?? 0;
      const nodeType = item.type ?? item.node_type ?? "cost";

      return {
        name: nodeName,
        amount: nodeAmount,
        type: nodeType,
      };
    });

    return (
      <div className="w-full">
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis
                type="number"
                stroke="#64748b"
                tickLine={false}
                tickMargin={10}
                tick={{ fontSize: 12, fill: "#475569" }}
                tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(1)}M`}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={170}
                stroke="#64748b"
                tickLine={false}
                tickMargin={10}
                tick={{ fontSize: 12, fill: "#334155", fontWeight: 500 }}
              />
              <Tooltip content={<CustomWaterfallTooltip />} />
              <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                {chartData.map((entry, index) => {
                  let color = "#10b981"; // Emerald green for revenue
                  if (entry.type === "cost") color = "#ef4444"; // Red for cost
                  if (entry.type === "total" || entry.type === "profit") color = "#3b82f6"; // Blue for net cash
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* External HTML Legend */}
        <div className="mt-4 p-4 bg-slate-50/50 border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500 flex-shrink-0"></span>
            <span><strong>Gross Revenue:</strong> Inflow from grain and duck yield sales.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-500 flex-shrink-0"></span>
            <span><strong>Acquisition Cost:</strong> Direct outflow for duckling procurement.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-500 flex-shrink-0"></span>
            <span><strong>Pure Net Cash:</strong> Hero financial metric (Gross Revenue - Costs).</span>
          </div>
        </div>
      </div>
    );
  }

  // Pure Cash Liquidity fallback chart (Vertical Layout)
  const fallbackData = [
    {
      name: "Gross Grain & Duck Revenue",
      amount: simulationResult.Total_Revenue,
      type: "revenue",
    },
    {
      name: "Duckling Acquisition Cost",
      amount: simulationResult.Cost_duck_buy,
      type: "cost",
    },
    {
      name: "Pure Absorbed Net Cash",
      amount: simulationResult.Profit_net_cash,
      type: "profit",
    },
  ];

  return (
    <div className="w-full">
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={fallbackData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis
              type="number"
              stroke="#64748b"
              tickLine={false}
              tickMargin={10}
              tick={{ fontSize: 12, fill: "#475569" }}
              tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(1)}M`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={170}
              stroke="#64748b"
              tickLine={false}
              tickMargin={10}
              tick={{ fontSize: 12, fill: "#334155", fontWeight: 500 }}
            />
            <Tooltip
              formatter={(value: unknown) => [formatRp(Number(value)), "Amount"]}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderColor: "#e2e8f0",
                borderRadius: "0.375rem",
                color: "#0f172a",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
              {fallbackData.map((entry, index) => {
                let color = "#10b981"; // Emerald green for revenue
                if (entry.type === "cost") color = "#ef4444"; // Red for cost
                if (entry.type === "profit") color = "#3b82f6"; // Blue for net cash
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* External HTML Legend */}
      <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-emerald-500 flex-shrink-0"></span>
          <span><strong>Gross Revenue:</strong> Inflow from grain and duck yield sales.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-red-500 flex-shrink-0"></span>
          <span><strong>Acquisition Cost:</strong> Direct outflow for duckling procurement.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-blue-500 flex-shrink-0"></span>
          <span><strong>Pure Net Cash:</strong> Hero financial metric (Gross Revenue - Costs).</span>
        </div>
      </div>
    </div>
  );
};

