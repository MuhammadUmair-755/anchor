"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const TABS = [
  { label: "Overview", href: "/", icon: <DashboardIcon sx={{ fontSize: 20 }} /> },
  { label: "Finance", href: "/finance", icon: <AccountBalanceWalletIcon sx={{ fontSize: 20 }} /> },
  { label: "Tasks", href: "/tasks", icon: <CheckCircleOutlineIcon sx={{ fontSize: 20 }} /> },
  { label: "Notes", href: "/notes", icon: <EditNoteIcon sx={{ fontSize: 20 }} /> },
  { label: "Calendar", href: "/calendar", icon: <CalendarMonthIcon sx={{ fontSize: 20 }} /> },
];

export default function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname() || "/";

  const activeIndex = Math.max(
    0,
    TABS.findIndex((t) => (t.href === "/" ? pathname === "/" : pathname.startsWith(t.href)))
  );

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        display: { xs: "block", lg: "none" },
        borderTop: "1px solid rgba(17, 28, 46, 0.08)",
        bgcolor: "#FCFBF8",
        boxShadow: "0 -2px 10px rgba(11, 22, 40, 0.04)",
      }}
    >
      <BottomNavigation
        showLabels
        value={activeIndex}
        onChange={(_e, i: number) => router.push(TABS[i].href)}
        sx={{
          height: 64,
          bgcolor: "#FCFBF8",
          "& .MuiBottomNavigationAction-root": {
            minWidth: "auto",
            px: 1,
            color: "#68717C",
            "&.Mui-selected": {
              color: "#0B1628",
              fontWeight: 600,
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.6875rem",
              "&.Mui-selected": {
                fontSize: "0.6875rem",
                fontWeight: 600,
              },
            },
          },
        }}
      >
        {TABS.map((t) => (
          <BottomNavigationAction key={t.href} label={t.label} icon={t.icon} />
        ))}
      </BottomNavigation>
    </Box>
  );
}
