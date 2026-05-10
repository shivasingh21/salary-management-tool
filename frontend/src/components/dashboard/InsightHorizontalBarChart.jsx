import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { truncateLabel } from "./chartHelpers.js";

function ChartTooltip({ active, payload, labelKey, valueFormatter }) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0].payload;
  const value = payload[0].value;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #d0d5dd",
        borderRadius: 8,
        boxShadow: "0 8px 20px rgba(16, 24, 40, 0.12)",
        padding: "10px 12px"
      }}
    >
      <div style={{ color: "#172033", fontWeight: 700, marginBottom: 4 }}>{row[labelKey]}</div>
      <div style={{ color: "#667085", fontSize: 13 }}>
        {valueFormatter ? valueFormatter(value) : value}
      </div>
    </div>
  );
}

function InsightHorizontalBarChart({
  data,
  xKey,
  yKey,
  barColor = "#0f766e",
  valueFormatter,
  labelMaxLength = 24,
  yAxisWidth = 150
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
        barCategoryGap={12}
      >
        <CartesianGrid stroke="#eef2f6" strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "#667085", fontSize: 12 }}
          tickFormatter={valueFormatter}
          tickLine={false}
          axisLine={{ stroke: "#d0d5dd" }}
        />
        <YAxis
          dataKey={yKey}
          type="category"
          width={yAxisWidth}
          tick={{ fill: "#344054", fontSize: 12 }}
          tickFormatter={(value) => truncateLabel(value, labelMaxLength)}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          content={<ChartTooltip labelKey={yKey} valueFormatter={valueFormatter} />}
          cursor={{ fill: "rgba(15, 118, 110, 0.08)" }}
        />
        <Bar dataKey={xKey} fill={barColor} radius={[0, 6, 6, 0]} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default InsightHorizontalBarChart;
