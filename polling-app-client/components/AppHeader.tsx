"use client";

import { useState, MouseEvent } from "react";
import Link from "next/link";
import {
  AppBar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useAuth } from "@/lib/auth-context";
import { AppButton } from "./ui/AppButton";

export function AppHeader() {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const openMenu = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    closeMenu();
    logout("/", "You're successfully logged out.");
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{ textDecoration: "none", color: "text.primary", fontWeight: 700 }}
        >
          Polling App
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isAuthenticated && currentUser ? (
            <>
              <IconButton component={Link} href="/" aria-label="home">
                <HomeIcon />
              </IconButton>
              <IconButton component={Link} href="/poll/new" aria-label="new poll">
                <AddCircleOutlineIcon />
              </IconButton>
              <IconButton onClick={openMenu} aria-label="profile menu">
                <AccountCircleIcon />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
                <MenuItem disabled sx={{ opacity: 1, flexDirection: "column", alignItems: "flex-start" }}>
                  <Typography variant="body2" fontWeight={600}>
                    {currentUser.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    @{currentUser.username}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem
                  component={Link}
                  href={`/users/${currentUser.username}`}
                  onClick={closeMenu}
                >
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <AppButton appVariant="plain" component={Link} href="/login">
                Login
              </AppButton>
              <AppButton component={Link} href="/signup">
                Signup
              </AppButton>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
