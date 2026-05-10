import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function InsightBarChart({ data, xKey, yKey, barColor = "#2563eb", valueFormatter }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 12, left: 8, bottom: 12 }}>
        <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={xKey}
          interval={0}
          tick={{ fill: "#667085", fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "#d0d5dd" }}
        />
        <YAxis
          tick={{ fill: "#667085", fontSize: 12 }}
          tickFormatter={valueFormatter}
          tickLine={false}
          axisLine={false}
          width={72}
        />
        <Tooltip
          formatter={(value) => (valueFormatter ? valueFormatter(value) : value)}
          cursor={{ fill: "rgba(37, 99, 235, 0.08)" }}
        />
        <Bar dataKey={yKey} fill={barColor} radius={[6, 6, 0, 0]} maxBarSize={52} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default InsightBarChart;
