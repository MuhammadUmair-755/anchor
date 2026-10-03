"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useClerk } from "@clerk/nextjs";

interface MobileTopBarProps {
  systemStatus?: "steady" | "reconciling" | "attention";
  onOpenNavDrawer?: () => void;
}

export default function MobileTopBar({
  systemStatus = "steady",
  onOpenNavDrawer,
}: MobileTopBarProps) {
  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      await signOut({ redirectUrl: "/sign-in" });
    } catch {
      window.location.href = "/sign-in";
    }
  };
  return (
    <Box
      component="header"
      sx={{
        height: 56,
        px: 2,
        bgcolor: "#FCFBF8",
        borderBottom: "1px solid rgba(17, 28, 46, 0.08)",
        display: { xs: "flex", lg: "none" },
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1100,
      }}
    >
      {/* Brand Anchor Logo & Mobile Menu Drawer Trigger */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          size="small"
          onClick={onOpenNavDrawer}
          aria-label="open navigation menu"
          sx={{
            color: "#0B1628",
            p: 0.75,
            "&:hover": { bgcolor: "rgba(11, 22, 40, 0.06)" },
          }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: "#0B1628",
            color: "#F7F5EF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
            fontWeight: 700,
            boxShadow: "0 2px 4px rgba(11, 22, 40, 0.2)",
          }}
        >
          ⚓
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "var(--font-newsreader), Georgia, serif",
            fontSize: "1.25rem",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "#0B1628",
            lineHeight: 1,
          }}
        >
          ANCHOR
        </Typography>

        {/* Pulsing Status Pill */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: 0.25,
            borderRadius: "9999px",
            bgcolor: "rgba(95, 146, 119, 0.12)",
            border: "1px solid rgba(95, 146, 119, 0.25)",
            ml: 0.5,
          }}
        >
          <Box
            sx={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              bgcolor: systemStatus === "steady" ? "#5F9277" : "#C4934A",
            }}
          />
          <Typography
            sx={{
              fontSize: "0.625rem",
              fontWeight: 600,
              color: "#3F6853",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            Steady
          </Typography>
        </Box>
      </Box>

      {/* Right Action: Logout */}
      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
        <Tooltip title="Log Out">
          <IconButton
            size="small"
            onClick={handleLogout}
            aria-label="Log Out"
            sx={{
              color: "#68717C",
              width: 36,
              height: 36,
              "&:hover": { color: "#8C3F3B", bgcolor: "rgba(199, 109, 104, 0.08)" },
            }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}
