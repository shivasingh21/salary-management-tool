import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#2563eb", "#0f766e", "#f59e0b", "#dc2626"];

const salaryRangeLabels = {
  "0-50000": "$0 - $50,000",
  "50001-100000": "$50,001 - $100,000",
  "100001-200000": "$100,001 - $200,000",
  "200000+": "$200,000+"
};

function formatSalaryRange(range) {
  return salaryRangeLabels[range] || range;
}

function InsightPieChart({ data }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        height: "100%"
      }}
    >
      <Box sx={{ flex: 1, minHeight: 270, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="employee_count"
              nameKey="range"
              cx="50%"
              cy="50%"
              innerRadius={72}
              outerRadius={120}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={entry.range} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${Number(value).toLocaleString()} employees`, formatSalaryRange(name)]}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Stack
        direction="row"
        flexWrap="wrap"
        gap={1.5}
        spacing={1.25}
        useFlexGap
        sx={{ alignItems: "center", justifyContent: "center", width: "100%" }}
      >
        {data.map((entry, index) => (
          <Box
            key={entry.range}
            sx={{
              alignItems: "center",
              display: "inline-flex",
              gap: 0.75
            }}
          >
            <Box
              component="span"
              sx={{
                bgcolor: COLORS[index % COLORS.length],
                borderRadius: "50%",
                height: 10,
                width: 10
              }}
            />
            <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 700 }}>
              {formatSalaryRange(entry.range)}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export default InsightPieChart;
