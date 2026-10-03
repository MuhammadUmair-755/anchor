"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { JournalEntry } from "@/types/models";

export interface JournalArchiveColumnProps {
  entries: JournalEntry[];
  activeId: string;
  onSelectEntry: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentMonthLabel?: string;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

export default function JournalArchiveColumn({
  entries,
  activeId,
  onSelectEntry,
  searchQuery,
  onSearchChange,
  currentMonthLabel = "September 2026",
  onPrevMonth,
  onNextMonth,
}: JournalArchiveColumnProps) {
  return (
    <Box
      component="aside"
      aria-label="Journal archives list"
      sx={{
        width: 320,
        minWidth: 320,
        borderRight: "1px solid rgba(17, 28, 46, 0.08)",
        bgcolor: "#F7F5EF",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* 1. Month Navigator & Filter Bar */}
      <Box
        sx={{
          p: 2,
          pb: 1.5,
          borderBottom: "1px solid rgba(17, 28, 46, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          bgcolor: "#FCFBF8",
        }}
      >
        {/* Month Selector Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarMonthIcon sx={{ fontSize: 18, color: "#40617E" }} />
            <Typography
              sx={{
                fontFamily: "var(--font-newsreader), Georgia, serif",
                fontSize: "1.0625rem",
                fontWeight: 600,
                color: "#0B1628",
                letterSpacing: "-0.01em",
              }}
            >
              {currentMonthLabel}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={onPrevMonth}
              aria-label="Previous month"
              sx={{ color: "#68717C", p: 0.5 }}
            >
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={onNextMonth}
              aria-label="Next month"
              sx={{ color: "#68717C", p: 0.5 }}
            >
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Search Input */}
        <TextField
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter journals, thoughts..."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "#68717C" }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: "#FFFFFF",
                borderRadius: 2,
                fontSize: "0.8125rem",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                "& fieldset": {
                  borderColor: "rgba(17, 28, 46, 0.12)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(17, 28, 46, 0.25)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#0B1628",
                  borderWidth: "1px",
                },
              },
            },
          }}
        />
      </Box>

      {/* 2. Scrollable Journal Stream */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {entries.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center", color: "#68717C" }}>
            <Typography
              sx={{
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: "0.8125rem",
              }}
            >
              No entries matching filter criteria.
            </Typography>
          </Box>
        ) : (
          entries.map((entry) => {
            const isActive = entry.id === activeId;
            return (
              <Box
                key={entry.id}
                component="button"
                type="button"
                onClick={() => onSelectEntry(entry.id)}
                sx={{
                  position: "relative",
                  textAlign: "left",
                  p: 1.75,
                  borderRadius: 2.5,
                  bgcolor: isActive ? "#FFFFFF" : "transparent",
                  border: isActive
                    ? "1px solid rgba(11, 22, 40, 0.12)"
                    : "1px solid transparent",
                  boxShadow: isActive
                    ? "0 2px 8px -2px rgba(11, 22, 40, 0.06)"
                    : "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.75,
                  "&:hover": {
                    bgcolor: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.65)",
                    borderColor: isActive
                      ? "rgba(11, 22, 40, 0.15)"
                      : "rgba(17, 28, 46, 0.08)",
                  },
                }}
              >
                {/* Active Left Indicator Bar */}
                {isActive && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: 12,
                      bottom: 12,
                      width: 4,
                      bgcolor: "#0B1628",
                      borderRadius: "0 4px 4px 0",
                    }}
                  />
                )}

                {/* Top Metadata Row: Date & Mood Pill */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: isActive ? "#0B1628" : "#40617E",
                      fontFeatureSettings: '"tnum" on',
                    }}
                  >
                    {entry.dateDisplay || entry.dateShort}
                  </Typography>

                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: entry.mood?.bgColor || "rgba(95, 146, 119, 0.15)",
                      color: entry.mood?.color || "#3F6853",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {entry.moodTag}
                    </Typography>
                  </Box>
                </Box>

                {/* Entry Title */}
                <Typography
                  sx={{
                    fontFamily: "var(--font-newsreader), Georgia, serif",
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    lineHeight: 1.3,
                    color: "#17202B",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {entry.title}
                </Typography>

                {/* Entry Snippet */}
                <Typography
                  sx={{
                    fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                    fontSize: "0.75rem",
                    lineHeight: 1.45,
                    color: "#68717C",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {entry.snippet}
                </Typography>

                {/* Footer Metrics */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    pt: 0.25,
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: "0.6875rem",
                    color: "#8E95A0",
                    fontFeatureSettings: '"tnum" on',
                  }}
                >
                  <span>{entry.wordCount} words</span>
                  <span>•</span>
                  <span>{entry.linksCount || 2} links</span>
                  {entry.readingTimeMinutes && (
                    <>
                      <span>•</span>
                      <span>{entry.readingTimeMinutes} min</span>
                    </>
                  )}
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
