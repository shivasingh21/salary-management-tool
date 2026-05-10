import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function InsightHorizontalBarChart({ data, xKey, yKey, barColor = "#0f766e", valueFormatter }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 20, left: 12, bottom: 8 }}
      >
        <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" horizontal={false} />
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
          width={132}
          tick={{ fill: "#344054", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value) => (valueFormatter ? valueFormatter(value) : value)}
          cursor={{ fill: "rgba(15, 118, 110, 0.08)" }}
        />
        <Bar dataKey={xKey} fill={barColor} radius={[0, 6, 6, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default InsightHorizontalBarChart;
