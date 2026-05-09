import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar, { drawerWidth } from "./Sidebar.jsx";

function AppLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Header />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, ml: { md: `${drawerWidth}px` }, p: { xs: 2, md: 3 } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default AppLayout;
