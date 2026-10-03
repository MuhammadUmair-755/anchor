"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EditNoteIcon from "@mui/icons-material/EditNote";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AnchorIcon from "@mui/icons-material/Anchor";
import { CalendarDayCell } from "@/types/models";

export interface CalendarMatrixProps {
  days: CalendarDayCell[];
  selectedDateKey: string;
  onSelectDate: (dateKey: string) => void;
  activeView?: "month" | "week" | "day";
  searchQuery?: string;
}

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function CalendarMatrix({
  days,
  selectedDateKey,
  onSelectDate,
  activeView = "month",
  searchQuery = "",
}: CalendarMatrixProps) {
  const formatDayNumber = (n: number) => {
    return n < 10 ? `0${n}` : `${n}`;
  };

  const formatCurrency = (amt: number) => {
    const sign = amt >= 0 ? "+" : "-";
    return `${sign}Rs. ${Math.abs(amt).toLocaleString()}`;
  };

  // Determine which days to display based on activeView
  const displayedDays = React.useMemo(() => {
    if (activeView === "month") {
      return days;
    }

    const selectedIdx = days.findIndex((d) => d.dateKey === selectedDateKey);

    if (activeView === "week") {
      // Find the 7-day row containing selectedDateKey, default to row 1 (Sep 06 - 12)
      const startIdx = selectedIdx !== -1 ? Math.floor(selectedIdx / 7) * 7 : 7;
      return days.slice(startIdx, startIdx + 7);
    }

    if (activeView === "day") {
      const found = days.find((d) => d.dateKey === selectedDateKey);
      if (found) return [found];
      const fallbackIdx = days.length > 0 ? Math.min(12, days.length - 1) : 0;
      return days[fallbackIdx] ? [days[fallbackIdx]] : [];
    }

    return days;
  }, [days, activeView, selectedDateKey]);

  // Headers to display: for day view, show only that day's weekday
  const displayedWeekdays = React.useMemo(() => {
    if (activeView === "day" && displayedDays.length === 1) {
      const selectedIdx = days.findIndex((d) => d.dateKey === displayedDays[0].dateKey);
      const weekdayIdx = selectedIdx !== -1 ? selectedIdx % 7 : 5; // Friday
      return [WEEKDAYS[weekdayIdx]];
    }
    return WEEKDAYS;
  }, [activeView, displayedDays, days]);

  const numCols = activeView === "day" ? 1 : 7;

  return (
    <Box
      sx={{
        bgcolor: "#FCFBF8",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
      }}
    >
      {/* Weekday Headers */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${numCols}, 1fr)`,
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          bgcolor: "rgba(245, 243, 237, 0.4)",
        }}
      >
        {displayedWeekdays.map((day) => {
          const isFriday = day === "FRI";
          return (
            <Box
              key={day}
              sx={{
                py: 1.25,
                textAlign: "center",
                fontSize: "0.6875rem",
                fontWeight: isFriday ? 700 : 600,
                letterSpacing: "0.08em",
                color: isFriday ? "#1B1C18" : "#75777D",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              }}
            >
              {day}
            </Box>
          );
        })}
      </Box>

      {/* Grid Matrix */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${numCols}, 1fr)`,
          "& > div": {
            borderRight: numCols > 1 ? "1px solid rgba(0, 0, 0, 0.06)" : "none",
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
          },
          ...(numCols > 1 && {
            "& > div:nth-of-type(7n)": {
              borderRight: "none",
            },
          }),
        }}
      >
        {displayedDays.map((day) => {
          const isSelected = selectedDateKey === day.dateKey;
          const isSep11 = day.dateKey === "2026-09-11";
          const dayIndexInAll = days.findIndex((d) => d.dateKey === day.dateKey);
          const isWeekend = dayIndexInAll % 7 === 0 || dayIndexInAll % 7 === 6;

          // Search match query filter (dim non-matching cells)
          const isSearchMatch = (() => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.trim().toLowerCase();
            const dateNumStr = day.dayNumber.toString();
            const paddedDateNum = formatDayNumber(day.dayNumber);

            // Exact or padded day number match (e.g. "5", "11", "01")
            if (dateNumStr === q || paddedDateNum === q) return true;

            // Date key match (e.g. "2026-09-11", "09-11")
            if (day.dateKey.includes(q)) return true;

            // Month name matching
            if ((q.includes("sep") || q.includes("september")) && day.isCurrentMonth) return true;
            if (day.monthLabel && day.monthLabel.toLowerCase().includes(q)) return true;

            // Weekday name matching (e.g. "fri", "friday", "mon", "monday")
            const weekday = (dayIndexInAll >= 0 ? WEEKDAYS[dayIndexInAll % 7] : "")?.toLowerCase();
            const fullWeekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const fullWeekday = dayIndexInAll >= 0 ? fullWeekdays[dayIndexInAll % 7] : "";
            if (
              (weekday && (weekday === q || (q.length >= 3 && (weekday.startsWith(q) || q.startsWith(weekday))))) ||
              (fullWeekday && (fullWeekday === q || fullWeekday.startsWith(q)))
            ) {
              return true;
            }

            // Special note matching
            if (day.specialNote && day.specialNote.toLowerCase().includes(q)) return true;

            // Financial amount matching
            if (day.financeAmount !== undefined) {
              const formattedAmt = formatCurrency(day.financeAmount).toLowerCase();
              if (day.financeAmount.toString().includes(q) || formattedAmt.includes(q)) return true;
            }

            // Journal search
            if ((q === "journal" || q === "inscribed" || q === "note") && day.hasJournal) return true;

            return false;
          })();

          const cellOpacity = isSearchMatch ? (day.isCurrentMonth ? 1 : 0.5) : 0.25;
          const cellMinHeight =
            activeView === "day"
              ? { xs: 140, sm: 180 }
              : activeView === "week"
              ? { xs: 90, sm: 120 }
              : { xs: 85, sm: 112 };

          // Out-of-month cell (muted)
          if (!day.isCurrentMonth) {
            return (
              <Box
                key={day.dateKey}
                onClick={() => onSelectDate(day.dateKey)}
                sx={{
                  minHeight: cellMinHeight,
                  p: { xs: 0.75, sm: 1 },
                  bgcolor: isSelected ? "rgba(17, 28, 46, 0.06)" : "rgba(245, 243, 237, 0.2)",
                  boxShadow: isSelected ? "inset 0 0 0 2px #40617E" : "none",
                  color: "#C5C6CD",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  opacity: cellOpacity,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: "rgba(245, 243, 237, 0.5)",
                    opacity: 0.8,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    fontWeight: 500,
                    fontFeatureSettings: '"tnum" 1, "zero" 1',
                  }}
                >
                  {formatDayNumber(day.dayNumber)}
                </Typography>
                {day.monthLabel && (
                  <Typography
                    sx={{
                      fontSize: "0.625rem",
                      color: "#94A3B8",
                      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                    }}
                  >
                    {day.monthLabel}
                  </Typography>
                )}
              </Box>
            );
          }

          // Active Focus Day: Friday, Sep 11
          if (isSep11) {
            const sep11Finance = day.financeAmount ?? -1300;
            const isSep11Positive = sep11Finance >= 0;
            const tasksDone = day.tasksDone ?? 3;
            const tasksTotal = day.tasksTotal ?? 5;

            return (
              <Box
                key={day.dateKey}
                onClick={() => onSelectDate(day.dateKey)}
                sx={{
                  minHeight: cellMinHeight,
                  p: { xs: 0.75, sm: 1 },
                  bgcolor: "#F5F1E5",
                  boxShadow: isSelected
                    ? "inset 0 0 0 2px #111C2E, 0 0 0 1px rgba(17, 28, 46, 0.1)"
                    : "inset 0 0 0 2px #111C2E",
                  borderRadius: "2px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  cursor: "pointer",
                  opacity: cellOpacity,
                  transition: "all 0.15s ease",
                }}
              >
                {/* Header Row */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                    <Box
                      sx={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                        fontWeight: 700,
                        color: "#FFFFFF",
                        bgcolor: "#111C2E",
                        borderRadius: "4px",
                        px: { xs: 0.5, sm: 0.75 },
                        py: "1px",
                        lineHeight: 1.2,
                        fontFeatureSettings: '"tnum" 1, "zero" 1',
                      }}
                    >
                      11
                    </Box>
                    <AnchorIcon
                      sx={{
                        fontSize: 14,
                        color: "#111C2E",
                      }}
                      titleAccess="Anchor Active Focus"
                    />
                  </Stack>

                  <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                    <EditNoteIcon sx={{ fontSize: 15, color: "#111C2E" }} titleAccess="Journal Inscribed" />
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor: "#111C2E",
                        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                        "@keyframes pulse": {
                          "0%, 100%": { opacity: 1 },
                          "50%": { opacity: 0.3 },
                        },
                      }}
                    />
                  </Stack>
                </Box>

                {/* Bottom Rollups */}
                <Stack spacing={0.5}>
                  {/* Spend Pill */}
                  <Box
                    sx={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: { xs: "0.5625rem", sm: "0.6875rem" },
                      fontWeight: 600,
                      color: isSep11Positive ? "#3F6853" : "#8C3F3B",
                      bgcolor: isSep11Positive ? "rgba(95, 146, 119, 0.15)" : "rgba(199, 109, 104, 0.15)",
                      border: isSep11Positive ? "1px solid rgba(95, 146, 119, 0.2)" : "1px solid rgba(199, 109, 104, 0.2)",
                      borderRadius: "4px",
                      py: 0.25,
                      px: 0.5,
                      textAlign: "center",
                      fontFeatureSettings: '"tnum" 1, "zero" 1',
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {formatCurrency(sep11Finance)}
                  </Box>

                  {/* Task Rollup */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.625rem",
                      fontWeight: 600,
                      color: "#111C2E",
                    }}
                  >
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", minWidth: 0 }}>
                      <TaskAltIcon sx={{ fontSize: 13, color: "#111C2E", flexShrink: 0 }} />
                      <Typography
                        sx={{
                          fontSize: { xs: "0.5625rem", sm: "0.625rem" },
                          fontWeight: 600,
                          color: "inherit",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {tasksDone}/{tasksTotal} done
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        display: { xs: "none", sm: "block" },
                        fontSize: "0.5625rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "#40617E",
                      }}
                    >
                      Active
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            );
          }

          // Standard Current Month Day Cell
          const hasNetPill = day.financeAmount !== undefined;
          const isPositive = (day.financeAmount ?? 0) > 0;
          const isLargeExpense = (day.financeAmount ?? 0) <= -2000;

          return (
            <Box
              key={day.dateKey}
              onClick={() => onSelectDate(day.dateKey)}
              sx={{
                minHeight: cellMinHeight,
                p: { xs: 0.75, sm: 1 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                bgcolor: isSelected
                  ? "rgba(17, 28, 46, 0.04)"
                  : isWeekend
                  ? "rgba(245, 243, 237, 0.35)"
                  : "transparent",
                boxShadow: isSelected ? "inset 0 0 0 2px #40617E" : "none",
                cursor: "pointer",
                opacity: cellOpacity,
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: "rgba(245, 243, 237, 0.6)",
                },
              }}
            >
              {/* Day Cell Header: Number + Optional Journal Icon or Task Indicator */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    fontWeight: 500,
                    color: "#1B1C18",
                    fontFeatureSettings: '"tnum" 1, "zero" 1',
                  }}
                >
                  {formatDayNumber(day.dayNumber)}
                </Typography>

                {day.hasJournal ? (
                  <EditNoteIcon sx={{ fontSize: 14, color: "#75777D" }} />
                ) : day.dateKey === "2026-09-15" ? (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "#40617E",
                    }}
                    title="Tasks indicator"
                  />
                ) : null}
              </Box>

              {/* Day Cell Body: Financial Pill, Task Ratio, Special Note */}
              <Stack spacing={0.5}>
                {hasNetPill && (
                  <Box
                    sx={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: { xs: "0.5625rem", sm: "0.6875rem" },
                      fontWeight: 500,
                      color: isPositive
                        ? "#3F6853"
                        : isLargeExpense
                        ? "#8C3F3B"
                        : "#45474C",
                      bgcolor: isPositive
                        ? "rgba(95, 146, 119, 0.12)"
                        : isLargeExpense
                        ? "rgba(199, 109, 104, 0.12)"
                        : "rgba(234, 232, 226, 0.6)",
                      borderRadius: "4px",
                      py: 0.25,
                      px: { xs: 0.25, sm: 0.5 },
                      textAlign: "center",
                      fontFeatureSettings: '"tnum" 1, "zero" 1',
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {formatCurrency(day.financeAmount!)}
                  </Box>
                )}

                {day.tasksDone !== undefined && day.tasksTotal !== undefined && (
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        bgcolor: "#40617E",
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: { xs: "0.5625rem", sm: "0.625rem" },
                        color: "#45474C",
                        fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {day.tasksDone}/{day.tasksTotal}{" "}
                      {day.tasksDone === day.tasksTotal ? "done" : "tasks"}
                    </Typography>
                  </Stack>
                )}

                {day.specialNote && (
                  <Typography
                    sx={{
                      fontSize: { xs: "0.5625rem", sm: "0.625rem" },
                      color: "#45474C",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                    }}
                  >
                    {day.specialNote}
                  </Typography>
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
