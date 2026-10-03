"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FilterListIcon from "@mui/icons-material/FilterList";
import TuneIcon from "@mui/icons-material/Tune";

export interface NotesSubBarProps {
  termLabel?: string;
  syncTimeLabel?: string;
  onFilterClick?: () => void;
  onSettingsClick?: () => void;
}

export default function NotesSubBar({
  termLabel = "Autumn Term 2026",
  syncTimeLabel = "Synced 2m ago",
  onFilterClick,
  onSettingsClick,
}: NotesSubBarProps) {
  return (
    <Box
      component="header"
      sx={{
        height: 56,
        bgcolor: "#FCFBF8",
        borderBottom: "1px solid rgba(17, 28, 46, 0.08)",
        px: { xs: 2, md: 3 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      {/* Left: Breadcrumbs & Term Badge */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.6875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#68717C",
              whiteSpace: "nowrap",
            }}
          >
            WORKSPACE
          </Typography>
          <Typography sx={{ color: "rgba(17, 28, 46, 0.25)", fontSize: "0.875rem" }}>
            /
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#17202B",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Daily Notes &amp; Reflective Journal
          </Typography>
        </Box>

        {/* Term Badge */}
        <Box
          sx={{
            display: { xs: "none", sm: "inline-flex" },
            alignItems: "center",
            px: 1.25,
            py: 0.25,
            borderRadius: 1.5,
            bgcolor: "#F0EEE8",
            border: "1px solid rgba(17, 28, 46, 0.08)",
          }}
        >
          <Typography
            sx={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "0.6875rem",
              fontWeight: 600,
              color: "#40617E",
              fontFeatureSettings: '"tnum" on',
              letterSpacing: "0.02em",
            }}
          >
            {termLabel}
          </Typography>
        </Box>
      </Box>

      {/* Right: Sync Telemetry & Controls */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
        {/* Real-time Sync Status */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              bgcolor: "#3F6853",
              boxShadow: "0 0 0 2px rgba(63, 104, 83, 0.2)",
            }}
          />
          <Typography
            sx={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "0.6875rem",
              color: "#68717C",
              fontFeatureSettings: '"tnum" on',
              display: { xs: "none", sm: "inline" },
            }}
          >
            {syncTimeLabel}
          </Typography>
        </Box>

        {/* Action Triggers */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title="Filter entries">
            <IconButton
              size="small"
              onClick={onFilterClick}
              aria-label="Filter entries"
              sx={{
                color: "#68717C",
                p: 0.75,
                borderRadius: 1.5,
                border: "1px solid rgba(17, 28, 46, 0.08)",
                bgcolor: "#FFFFFF",
                "&:hover": { color: "#0B1628", bgcolor: "#F5F3ED" },
              }}
            >
              <FilterListIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="View preferences">
            <IconButton
              size="small"
              onClick={onSettingsClick}
              aria-label="View preferences"
              sx={{
                color: "#68717C",
                p: 0.75,
                borderRadius: 1.5,
                border: "1px solid rgba(17, 28, 46, 0.08)",
                bgcolor: "#FFFFFF",
                "&:hover": { color: "#0B1628", bgcolor: "#F5F3ED" },
              }}
            >
              <TuneIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
