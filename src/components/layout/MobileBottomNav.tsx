"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Fab from "@mui/material/Fab";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddIcon from "@mui/icons-material/Add";

interface MobileBottomNavProps {
  onOpenQuickEntry: () => void;
}

export default function MobileBottomNav({ onOpenQuickEntry }: MobileBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveTab = () => {
    if (!pathname) return 0;
    if (pathname === "/") return 0;
    if (pathname.startsWith("/finance")) return 1;
    if (pathname.startsWith("/tasks")) return 3;
    if (pathname.startsWith("/calendar")) return 4;
    return 0;
  };

  const handleNavChange = (_event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        router.push("/");
        break;
      case 1:
        router.push("/finance");
        break;
      case 2:
        // Center item handled by FAB
        break;
      case 3:
        router.push("/tasks");
        break;
      case 4:
        router.push("/calendar");
        break;
      default:
        break;
    }
  };

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
        value={getActiveTab()}
        onChange={handleNavChange}
        sx={{
          height: 64,
          bgcolor: "#FCFBF8",
          position: "relative",
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
        <BottomNavigationAction
          label="Overview"
          icon={<DashboardIcon sx={{ fontSize: 20 }} />}
        />
        <BottomNavigationAction
          label="Finance"
          icon={<AccountBalanceWalletIcon sx={{ fontSize: 20 }} />}
        />

        {/* Center Dummy Action for FAB Spacer */}
        <BottomNavigationAction
          disabled
          sx={{
            cursor: "default",
            opacity: 0,
            pointerEvents: "none",
            width: 56,
          }}
        />

        <BottomNavigationAction
          label="Tasks"
          icon={<CheckCircleOutlineIcon sx={{ fontSize: 20 }} />}
        />
        <BottomNavigationAction
          label="Calendar"
          icon={<CalendarMonthIcon sx={{ fontSize: 20 }} />}
        />
      </BottomNavigation>

      {/* Elevated Floating Quick Entry FAB */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1300,
        }}
      >
        <Fab
          onClick={onOpenQuickEntry}
          aria-label="Quick Entry"
          sx={{
            width: 48,
            height: 48,
            bgcolor: "#0B1628",
            color: "#FCFBF8",
            boxShadow: "0 4px 12px rgba(11, 22, 40, 0.3)",
            "&:hover": {
              bgcolor: "#162338",
            },
          }}
        >
          <AddIcon sx={{ fontSize: 24 }} />
        </Fab>
      </Box>
    </Box>
  );
}
