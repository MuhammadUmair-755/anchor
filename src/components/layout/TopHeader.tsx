"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import LogoutIcon from "@mui/icons-material/Logout";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface TopHeaderProps {
  systemStatus?: "steady" | "reconciling" | "attention";
}

export default function TopHeader({
  systemStatus = "steady",
}: TopHeaderProps) {
  const router = useRouter();
  const { signOut } = useClerk();
  const {
    displayName,
    avatarLetter,
    avatarUrl,
    email,
    openUserProfile,
  } = useUserProfile();

  const handleLogout = async () => {
    try {
      await signOut({ redirectUrl: "/sign-in" });
    } catch {
      router.push("/sign-in");
    } finally {
      router.push("/sign-in");
      router.refresh();
    }
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
          Good morning, {displayName}.
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

      {/* Right: Profile & Logout */}
      <Stack direction="row" spacing={{ xs: 1, md: 1.5 }} sx={{ alignItems: "center" }}>
        {/* User Profile Avatar Pill */}
        <Tooltip title={email ? `${displayName} (${email}) — Account Settings` : `${displayName} — Account Settings`}>
          <Box
            onClick={openUserProfile}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              p: 0.5,
              pr: { xs: 0.5, md: 1.25 },
              borderRadius: "9999px",
              bgcolor: "rgba(11, 22, 40, 0.03)",
              border: "1px solid rgba(17, 28, 46, 0.08)",
              transition: "all 0.15s ease",
              "&:hover": {
                bgcolor: "rgba(11, 22, 40, 0.06)",
                borderColor: "rgba(17, 28, 46, 0.15)",
              },
            }}
          >
            <Avatar
              src={avatarUrl}
              alt={displayName}
              sx={{
                width: 28,
                height: 28,
                bgcolor: "#0B1628",
                color: "#FCFBF8",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {avatarLetter}
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                display: { xs: "none", sm: "block" },
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#0B1628",
                maxWidth: 110,
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {displayName}
            </Typography>
          </Box>
        </Tooltip>

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

      </Stack>
    </Box>
  );
}
