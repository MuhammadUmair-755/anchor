"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import { TaskFilterTab } from "@/types/models";

export interface TasksHeaderProps {
  activeTab: TaskFilterTab;
  onTabChange: (tab: TaskFilterTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddTask: () => void;
  onFilterClick?: () => void;
  overdueCount?: number;
}

const TABS: { id: TaskFilterTab; label: string; hasAlert?: boolean }[] = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "overdue", label: "Overdue", hasAlert: true },
  { id: "completed", label: "Completed" },
  { id: "backlog", label: "Backlog" },
];

export default function TasksHeader({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onOpenAddTask,
  onFilterClick,
  overdueCount = 1,
}: TasksHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        pb: 2.5,
        borderBottom: "1px solid rgba(17, 28, 46, 0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      {/* Top Row: Title Cluster & Action CTAs */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
        }}
      >
        {/* Title & Metadata */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              variant="h1"
              sx={{
                fontFamily: "var(--font-newsreader), Georgia, serif",
                fontSize: { xs: "1.5rem", sm: "1.75rem" },
                fontWeight: 500,
                color: "#0B1628",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}
            >
              Tasks &amp; Execution Systems
            </Typography>
            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: "rgba(95, 146, 119, 0.15)",
                color: "#3F6853",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              System Online
            </Box>
          </Box>
          <Typography
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.8125rem",
              color: "#68717C",
            }}
          >
            Wednesday, October 23, 2024 •{" "}
            <Box
              component="span"
              sx={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontFeatureSettings: '"tnum" on',
              }}
            >
              Week 43 • Cycle 04
            </Box>
          </Typography>
        </Box>

        {/* Search, Filter & Add Task */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            width: { xs: "100%", md: "auto" },
          }}
        >
          <TextField
            size="small"
            placeholder="Search deliverables..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: "#75777D" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Box
                      component="kbd"
                      sx={{
                        px: 0.75,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: "#F0EEE8",
                        border: "1px solid rgba(17, 28, 46, 0.12)",
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        fontSize: "10px",
                        color: "#68717C",
                      }}
                    >
                      ⌘K
                    </Box>
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: "#FCFBF8",
                  borderRadius: "8px",
                  fontSize: "13px",
                  minWidth: { xs: "100%", sm: 220 },
                  "& fieldset": { borderColor: "rgba(17, 28, 46, 0.12)" },
                },
              },
            }}
            sx={{ flex: { xs: 1, sm: "none" } }}
          />

          <IconButton
            onClick={onFilterClick}
            size="small"
            sx={{
              border: "1px solid rgba(17, 28, 46, 0.12)",
              bgcolor: "#FCFBF8",
              borderRadius: "8px",
              p: 1,
              color: "#40617E",
              "&:hover": { bgcolor: "#F0EEE8" },
            }}
            aria-label="Filter deliverables"
          >
            <FilterListIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Button
            variant="contained"
            onClick={onOpenAddTask}
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: "#0B1628",
              color: "#FCFBF8",
              borderRadius: "8px",
              px: 2,
              py: 0.85,
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "none",
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "#12243A" },
            }}
          >
            + Add Task
          </Button>
        </Box>
      </Box>

      {/* Bottom Row: Tab Navigation */}
      <Box
        component="nav"
        aria-label="Task Filter Tabs"
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          borderBottom: "1px solid rgba(17, 28, 46, 0.04)",
          pb: 0.5,
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Box
              key={tab.id}
              component="button"
              type="button"
              onClick={() => onTabChange(tab.id)}
              sx={{
                background: "none",
                border: "none",
                cursor: "pointer",
                pb: 1,
                borderBottom: isActive ? "2px solid #0B1628" : "2px solid transparent",
                color: isActive ? "#0B1628" : "#68717C",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: "0.8125rem",
                fontWeight: isActive ? 600 : 500,
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                "&:hover": {
                  color: "#0B1628",
                },
              }}
            >
              <span>{tab.label}</span>
              {tab.hasAlert && overdueCount > 0 && (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#C76D68",
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
