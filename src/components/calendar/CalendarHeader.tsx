"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Tooltip from "@mui/material/Tooltip";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import TuneIcon from "@mui/icons-material/Tune";
import AddIcon from "@mui/icons-material/Add";

export interface CalendarHeaderProps {
  currentMonthDisplay: string;
  quarterLabel?: string;
  activeView: "month" | "week" | "day";
  onViewChange: (view: "month" | "week" | "day") => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onOpenNewEvent: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterMatrix?: () => void;
  onNotifications?: () => void;
  onViewOptions?: () => void;
}

export default function CalendarHeader({
  currentMonthDisplay = "September 2026",
  quarterLabel = "Q3 Ledger",
  activeView,
  onViewChange,
  onPrevMonth,
  onNextMonth,
  onToday,
  onOpenNewEvent,
  searchQuery,
  onSearchChange,
  onFilterMatrix,
  onNotifications,
  onViewOptions,
}: CalendarHeaderProps) {
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        bgcolor: "rgba(251, 249, 243, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(117, 119, 125, 0.18)",
        px: { xs: 1.5, sm: 2.5, md: 4 },
        py: { xs: 1, sm: 1.5 },
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: { xs: 1.25, sm: 2 },
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left: Month Title & Controls */}
      <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ alignItems: "center", flexWrap: "wrap", gap: { xs: 1, sm: 1.5 } }}>
        {/* Month Heading & Ledger Badge */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: "var(--font-newsreader), Georgia, serif",
              fontSize: { xs: "1.25rem", md: "1.5rem" },
              fontWeight: 400,
              color: "#1B1C18",
              letterSpacing: "-0.01em",
            }}
          >
            {currentMonthDisplay}
          </Typography>

          <Box
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: "6px",
              bgcolor: "rgba(228, 226, 221, 0.8)",
              border: "1px solid rgba(197, 198, 205, 0.4)",
              fontSize: "0.6875rem",
              fontWeight: 500,
              color: "#1B1C18",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              letterSpacing: "0.02em",
            }}
          >
            {quarterLabel}
          </Box>
        </Stack>

        {/* Date Jump Controls: < | Today | > */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            bgcolor: "#F5F3ED",
            border: "1px solid rgba(197, 198, 205, 0.4)",
            borderRadius: "8px",
            p: "2px",
          }}
        >
          <Tooltip title="Previous Month">
            <IconButton
              size="small"
              onClick={onPrevMonth}
              sx={{
                p: 0.5,
                color: "#1B1C18",
                borderRadius: "6px",
                "&:hover": { bgcolor: "#EAE8E2" },
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Button
            size="small"
            onClick={onToday}
            sx={{
              px: 1.25,
              py: 0.25,
              minWidth: "auto",
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#1B1C18",
              borderLeft: "1px solid rgba(197, 198, 205, 0.3)",
              borderRight: "1px solid rgba(197, 198, 205, 0.3)",
              borderRadius: 0,
              "&:hover": { bgcolor: "#EAE8E2", color: "#000000" },
            }}
          >
            Today
          </Button>

          <Tooltip title="Next Month">
            <IconButton
              size="small"
              onClick={onNextMonth}
              sx={{
                p: 0.5,
                color: "#1B1C18",
                borderRadius: "6px",
                "&:hover": { bgcolor: "#EAE8E2" },
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Segmented View Toggle: Month | Week | Day */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            bgcolor: "#F5F3ED",
            border: "1px solid rgba(197, 198, 205, 0.4)",
            borderRadius: "8px",
            p: "2px",
          }}
        >
          {(["month", "week", "day"] as const).map((view) => {
            const isActive = activeView === view;
            return (
              <Button
                key={view}
                size="small"
                onClick={() => onViewChange(view)}
                sx={{
                  px: { xs: 1, sm: 1.5 },
                  py: { xs: 0.25, sm: 0.4 },
                  minWidth: "auto",
                  fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                  fontWeight: isActive ? 600 : 500,
                  textTransform: "capitalize",
                  borderRadius: "6px",
                  bgcolor: isActive ? "#FFFFFF" : "transparent",
                  color: isActive ? "#000000" : "#45474C",
                  boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  "&:hover": {
                    bgcolor: isActive ? "#FFFFFF" : "rgba(0,0,0,0.04)",
                    color: "#000000",
                  },
                }}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Button>
            );
          })}
        </Box>
      </Stack>

      {/* Center: Search Rail with ⌘K Badge */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 0.6,
          bgcolor: "#F5F3ED",
          border: "1px solid rgba(197, 198, 205, 0.4)",
          borderRadius: "8px",
          width: { md: 220, xl: 280 },
          transition: "all 0.15s ease",
          "&:focus-within": {
            borderColor: "#111C2E",
            bgcolor: "#FFFFFF",
            boxShadow: "0 0 0 2px rgba(17, 28, 46, 0.08)",
          },
        }}
      >
        <SearchIcon sx={{ fontSize: 18, color: "#75777D" }} />
        <InputBase
          inputRef={searchInputRef}
          placeholder="Search calendar, logs, goals..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            flex: 1,
            fontSize: "0.8125rem",
            color: "#1B1C18",
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            "& input::placeholder": {
              color: "#94A3B8",
              opacity: 1,
            },
          }}
        />
        <Box
          component="kbd"
          sx={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "0.625rem",
            fontWeight: 600,
            bgcolor: "#EAE8E2",
            color: "#75777D",
            px: 0.75,
            py: 0.25,
            borderRadius: "4px",
            border: "1px solid rgba(197, 198, 205, 0.4)",
          }}
        >
          ⌘K
        </Box>
      </Box>

      {/* Right: Actions & Primary Button */}
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            pr: 1,
            mr: 0.5,
            borderRight: "1px solid rgba(197, 198, 205, 0.3)",
          }}
        >
          <Tooltip title="Filter matrix">
            <IconButton
              size="small"
              onClick={onFilterMatrix}
              sx={{
                color: "#45474C",
                borderRadius: "8px",
                "&:hover": { bgcolor: "#EAE8E2", color: "#1B1C18" },
              }}
            >
              <FilterListIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton
              size="small"
              onClick={onNotifications}
              sx={{
                color: "#45474C",
                borderRadius: "8px",
                "&:hover": { bgcolor: "#EAE8E2", color: "#1B1C18" },
              }}
            >
              <NotificationsNoneIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="View options">
            <IconButton
              size="small"
              onClick={onViewOptions}
              sx={{
                color: "#45474C",
                borderRadius: "8px",
                "&:hover": { bgcolor: "#EAE8E2", color: "#1B1C18" },
              }}
            >
              <TuneIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Primary CTA: + New Entry / Event */}
        <Button
          variant="contained"
          onClick={onOpenNewEvent}
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          sx={{
            bgcolor: "#111C2E",
            color: "#FFFFFF",
            px: { xs: 1.25, sm: 2 },
            py: { xs: 0.6, sm: 0.75 },
            borderRadius: "8px",
            fontSize: { xs: "0.75rem", sm: "0.8125rem" },
            fontWeight: 500,
            textTransform: "none",
            whiteSpace: "nowrap",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            "&:hover": {
              bgcolor: "#0B1628",
            },
          }}
        >
          + New Entry / Event
        </Button>
      </Stack>
    </Box>
  );
}
