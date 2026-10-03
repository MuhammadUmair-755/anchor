"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import DesktopSidebar from "./DesktopSidebar";
import TopHeader from "./TopHeader";
import MobileTopBar from "./MobileTopBar";
import MobileBottomNav from "./MobileBottomNav";
import MobileNavDrawer from "./MobileNavDrawer";
import QuickEntryModal from "./QuickEntryModal";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [quickEntryOpen, setQuickEntryOpen] = useState<boolean>(false);
  const [quickEntryIntent, setQuickEntryIntent] = useState<"spent" | "received" | "moved">("spent");

  const handleOpenQuickEntry = (intent: "spent" | "received" | "moved" = "spent") => {
    setQuickEntryIntent(intent);
    setQuickEntryOpen(true);
  };

  const handleCloseQuickEntry = () => {
    setQuickEntryOpen(false);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  // Keyboard shortcut listener for Command/Ctrl+K or quick actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        // Global search shortcut trigger
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
        onOpenQuickEntry={() => handleOpenQuickEntry("spent")}
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
          <TopHeader onOpenQuickEntry={handleOpenQuickEntry} />
        </Box>

        {/* Mobile Sticky Top Bar */}
        <MobileTopBar
          onOpenSearch={() => {}}
          onOpenNavDrawer={() => setMobileNavOpen(true)}
        />

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
        <MobileBottomNav onOpenQuickEntry={() => handleOpenQuickEntry("spent")} />
      </Box>

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onOpenQuickEntry={() => {
          setMobileNavOpen(false);
          handleOpenQuickEntry("spent");
        }}
      />

      {/* Quick Entry Dialog */}
      <QuickEntryModal
        open={quickEntryOpen}
        onClose={handleCloseQuickEntry}
        initialIntent={quickEntryIntent}
      />
    </Box>
  );
}
