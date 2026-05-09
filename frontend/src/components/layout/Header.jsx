import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { currentUser, signOut } from "../../api/auth.js";
import { drawerWidth } from "./Sidebar.jsx";

function Header() {
  const navigate = useNavigate();
  const user = currentUser();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <AppBar
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        ml: { md: `${drawerWidth}px` },
        width: { md: `calc(100% - ${drawerWidth}px)` }
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">Salary Management</Typography>
          <Typography variant="body2" color="text.secondary">
            HR operations workspace
          </Typography>
        </Box>
        <Chip label="HR Admin" color="primary" variant="outlined" />
        <Avatar sx={{ bgcolor: "secondary.main" }}>{user?.first_name?.[0] || "H"}</Avatar>
        <Button color="inherit" onClick={handleSignOut}>Sign out</Button>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
