// Header.js
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Box,
  Typography
} from "@mui/material";
import {
  Home as HomeIcon,
  MeetingRoom as RoomIcon,
  Map as MapIcon
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const pages = [
    { label: "Home", path: "/homepage", icon: <HomeIcon /> },
    { label: "Room Details", path: "/room-details", icon: <RoomIcon /> },
    { label: "Floor Plan", path: "/floor-plan", icon: <MapIcon /> }
  ];
  
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = pages.findIndex((p) => p.path === location.pathname);

  const handleTabChange = (event, newValue) => {
    navigate(pages[newValue].path);
  };
  
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // ✅ New logout handler
  const handleLogout = () => {
    handleMenuClose();
    // Optionally, clear any auth tokens/localStorage here
    navigate("/"); // Goes to the SignIn page
  };
  
  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(to right, #99cce5, #336699)",
        color: "#ffffff"
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          OptiRoom
        </Typography>

        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          textColor="inherit"
          TabIndicatorProps={{ style: { backgroundColor: "#ffffff" } }}
        >
          {pages.map((page, idx) => (
            <Tooltip key={idx} title={page.label} arrow>
              <Tab
                icon={page.icon}
                sx={{ minWidth: 50, padding: 0, marginX: 1 }}
                aria-label={page.label}
              />
            </Tooltip>
          ))}
        </Tabs>

        <Box>
          <Tooltip title="User Menu" arrow>
            <IconButton onClick={handleMenuOpen} sx={{ padding: 0 }}>
              <Avatar sx={{ width: 32, height: 32 }} />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            MenuListProps={{ disablePadding: true }}
            PaperProps={{ elevation: 3, sx: { mt: 1, borderRadius: 2 } }}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
