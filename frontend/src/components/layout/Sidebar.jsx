import DashboardIcon from "@mui/icons-material/Dashboard";
import FlagIcon from "@mui/icons-material/Flag";
import GroupsIcon from "@mui/icons-material/Groups";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { NavLink } from "react-router-dom";

export const drawerWidth = 264;

const items = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "Employees", path: "/employees", icon: <GroupsIcon /> },
  { label: "Departments", path: "/departments", icon: <BusinessIcon /> },
  { label: "Job Titles", path: "/job-titles", icon: <WorkIcon /> },
  { label: "Countries", path: "/countries", icon: <FlagIcon /> }
];

function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          borderRight: "1px solid",
          borderColor: "divider",
          bgcolor: "#101828",
          color: "white"
        }
      }}
    >
      <Toolbar sx={{ px: 3 }}>
        <Box
          component={NavLink}
          to="/dashboard"
          sx={{ color: "inherit", textDecoration: "none" }}
        >
          <Typography variant="h6">SalaryOps</Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)" }}>
            People and payroll
          </Typography>
        </Box>
      </Toolbar>
      <List sx={{ px: 2 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              color: "rgba(255,255,255,0.78)",
              "&.active": {
                bgcolor: "rgba(255,255,255,0.12)",
                color: "white"
              }
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 700 }} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;
