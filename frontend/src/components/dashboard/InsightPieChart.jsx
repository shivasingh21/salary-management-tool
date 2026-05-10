import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#2563eb", "#0f766e", "#f59e0b", "#dc2626"];

function InsightPieChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="employee_count"
          nameKey="range"
          cx="50%"
          cy="46%"
          innerRadius={58}
          outerRadius={96}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.range} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} employees`, "Count"]} />
        <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default InsightPieChart;
