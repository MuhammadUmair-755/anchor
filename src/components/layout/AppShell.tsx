"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import DesktopSidebar from "./DesktopSidebar";
import TopHeader from "./TopHeader";
import MobileTopBar from "./MobileTopBar";
import MobileBottomNav from "./MobileBottomNav";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  if (isAuthPage) {
    return (
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          bgcolor: "#F7F5EF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 4 },
        }}
      >
        {children}
      </Box>
    );
  }

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const sidebarWidth = sidebarCollapsed ? 72 : 256;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#F7F5EF", // Mineral Canvas Base Ground
        color: "#17202B",
      }}
    >
      {/* Desktop Persistent Left Navigation Spine */}
      <DesktopSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          ml: { xs: 0, lg: `${sidebarWidth}px` },
          transition: "margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          pb: { xs: 10, lg: 4 }, // Space for mobile bottom bar
        }}
      >
        {/* Desktop Sticky Header */}
        <Box sx={{ display: { xs: "none", lg: "block" } }}>
          <TopHeader />
        </Box>

        {/* Mobile Sticky Top Bar */}
        <MobileTopBar />

        {/* Primary Page Canvas */}
        <Box
          component="main"
          sx={{
            flex: 1,
            width: "100%",
            maxWidth: 1440,
            mx: "auto",
            px: { xs: 1.25, sm: 2.5, md: 3.5, lg: 4 },
            py: { xs: 1.5, sm: 2.5, md: 3 },
          }}
        >
          {children}
        </Box>

        {/* Mobile Fixed Bottom Navigation */}
        <MobileBottomNav />
      </Box>

    </Box>
  );
}
