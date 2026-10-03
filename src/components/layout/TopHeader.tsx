"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import EditNoteIcon from "@mui/icons-material/EditNote";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useClerk } from "@clerk/nextjs";

interface TopHeaderProps {
  onOpenQuickEntry: (intent?: "spent" | "received" | "moved") => void;
  systemStatus?: "steady" | "reconciling" | "attention";
}

export default function TopHeader({
  onOpenQuickEntry,
  systemStatus = "steady",
}: TopHeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      await signOut({ redirectUrl: "/sign-in" });
    } catch {
      window.location.href = "/sign-in";
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleQuickAction = (intent: "spent" | "received" | "moved") => {
    handleMenuClose();
    onOpenQuickEntry(intent);
  };

  return (
    <Box
      component="header"
      sx={{
        height: 68,
        px: { xs: 2, md: 3.5 },
        bgcolor: "#FCFBF8",
        borderBottom: "1px solid rgba(17, 28, 46, 0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1100,
      }}
    >
      {/* Left: Greeting & Status Pill */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "var(--font-newsreader), Georgia, serif",
            fontSize: { xs: "1.125rem", md: "1.375rem" },
            fontWeight: 400,
            letterSpacing: "-0.015em",
            color: "#0B1628",
          }}
        >
          Good morning, Alex.
        </Typography>

        {/* System Steady Pill */}
        <Box
          sx={{
            display: { xs: "none", sm: "inline-flex" },
            alignItems: "center",
            gap: 0.75,
            px: 1.25,
            py: 0.4,
            borderRadius: "9999px",
            bgcolor: systemStatus === "steady" ? "rgba(95, 146, 119, 0.12)" : "rgba(196, 147, 74, 0.12)",
            border: systemStatus === "steady" ? "1px solid rgba(95, 146, 119, 0.3)" : "1px solid rgba(196, 147, 74, 0.3)",
          }}
        >
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              bgcolor: systemStatus === "steady" ? "#5F9277" : "#C4934A",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.4 },
              },
            }}
          />
          <Typography
            sx={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              color: systemStatus === "steady" ? "#3F6853" : "#8C6B28",
              letterSpacing: "0.03em",
              textTransform: "uppercase",
            }}
          >
            {systemStatus === "steady" ? "System Steady" : "Reconciling"}
          </Typography>
        </Box>
      </Box>

      {/* Right: Logout & + Add Entry Flyout */}
      <Stack direction="row" spacing={{ xs: 1, md: 1.5 }} sx={{ alignItems: "center" }}>
        {/* Logout Button */}
        <Tooltip title="Sign out of ANCHOR">
          <Button
            variant="outlined"
            onClick={handleLogout}
            startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
            sx={{
              color: "#68717C",
              borderColor: "rgba(17, 28, 46, 0.12)",
              borderRadius: 2,
              px: 1.75,
              py: 0.6,
              fontSize: "0.8125rem",
              fontWeight: 600,
              textTransform: "none",
              bgcolor: "#FFFFFF",
              "&:hover": {
                bgcolor: "rgba(199, 109, 104, 0.08)",
                borderColor: "#C76D68",
                color: "#8C3F3B",
              },
            }}
          >
            Log Out
          </Button>
        </Tooltip>

        {/* Contextual "+ Add Entry" Button & Dropdown Menu */}
        <Button
          variant="contained"
          onClick={handleMenuClick}
          endIcon={<KeyboardArrowDownIcon />}
          startIcon={<AddIcon />}
          sx={{
            bgcolor: "#0B1628",
            color: "#FCFBF8",
            px: 2,
            py: 0.8,
            borderRadius: 2,
            fontSize: "0.8125rem",
            fontWeight: 600,
            boxShadow: "0 2px 4px rgba(11, 22, 40, 0.12)",
            "&:hover": {
              bgcolor: "#162338",
            },
          }}
        >
          Add Entry
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: {
                width: 220,
                mt: 1,
                borderRadius: 2.5,
                border: "1px solid rgba(17, 28, 46, 0.08)",
                boxShadow: "0 8px 24px rgba(11, 22, 40, 0.12)",
                bgcolor: "#FCFBF8",
              },
            },
          }}
        >
          <MenuItem onClick={() => handleQuickAction("spent")} sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 32, color: "#8C3F3B" }}>
              <ArrowDownwardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#17202B" }}>
                  Log Expense
                </Typography>
              }
            />
          </MenuItem>

          <MenuItem onClick={() => handleQuickAction("received")} sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 32, color: "#3F6853" }}>
              <ArrowUpwardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#17202B" }}>
                  Log Income
                </Typography>
              }
            />
          </MenuItem>

          <MenuItem onClick={() => handleQuickAction("moved")} sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 32, color: "#40617E" }}>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#17202B" }}>
                  Transfer Funds
                </Typography>
              }
            />
          </MenuItem>

          <Box sx={{ my: 0.5, borderTop: "1px solid rgba(17, 28, 46, 0.06)" }} />

          <MenuItem
            onClick={() => {
              handleMenuClose();
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: "#68717C" }}>
              <CheckCircleOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: "0.8125rem", color: "#17202B" }}>
                  Add Focus Task
                </Typography>
              }
            />
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleMenuClose();
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: "#68717C" }}>
              <EditNoteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: "0.8125rem", color: "#17202B" }}>
                  New Journal Note
                </Typography>
              }
            />
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleMenuClose();
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: "#C4934A" }}>
              <FlagOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: "0.8125rem", color: "#17202B" }}>
                  Set Target Goal
                </Typography>
              }
            />
          </MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
}
