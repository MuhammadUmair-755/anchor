"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CalendarDay } from "@/types/models";

interface CalendarGridProps {
  days: CalendarDay[];
  selectedDateKey: string;
  todayKey: string;
  onSelectDate: (dateKey: string) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const compactMoney = (n: number) =>
  `${n < 0 ? "-" : "+"}Rs. ${Math.abs(n) >= 1000 ? `${Math.round(Math.abs(n) / 100) / 10}k` : Math.round(Math.abs(n))}`;

export default function CalendarGrid({ days, selectedDateKey, todayKey, onSelectDate }: CalendarGridProps) {
  return (
    <Box
      sx={{
        bgcolor: "#FCFBF8",
        border: "1px solid rgba(17, 28, 46, 0.08)",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid rgba(17, 28, 46, 0.08)" }}>
        {WEEKDAYS.map((d) => (
          <Typography
            key={d}
            sx={{ py: 1, textAlign: "center", fontSize: "0.75rem", fontWeight: 600, color: "#68717C", textTransform: "uppercase", letterSpacing: "0.04em" }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      <Box component="div" role="grid" sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {days.map((day, i) => {
          const isToday = day.dateKey === todayKey;
          const isSelected = day.dateKey === selectedDateKey;
          const net = day.transactions.reduce((sum, t) => sum + t.amount, 0);
          const openTasks = day.tasks.filter((t) => !t.isCompleted).length;
          const hasAnything = day.events.length + day.tasks.length + day.transactions.length + day.notes.length > 0;

          return (
            <Box
              key={day.dateKey}
              component="button"
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              aria-label={`${day.dateKey}${hasAnything ? ", has entries" : ""}`}
              onClick={() => onSelectDate(day.dateKey)}
              sx={{
                all: "unset",
                boxSizing: "border-box",
                cursor: "pointer",
                minHeight: { xs: 56, sm: 92, md: 108 },
                p: { xs: 0.5, sm: 1 },
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                minWidth: 0,
                borderRight: (i + 1) % 7 === 0 ? "none" : "1px solid rgba(17, 28, 46, 0.06)",
                borderBottom: "1px solid rgba(17, 28, 46, 0.06)",
                bgcolor: isSelected ? "rgba(11, 22, 40, 0.05)" : day.inMonth ? "transparent" : "rgba(240, 238, 232, 0.45)",
                outline: isSelected ? "2px solid #0B1628" : "none",
                outlineOffset: "-2px",
                "&:hover": { bgcolor: "rgba(11, 22, 40, 0.04)" },
                "&:focus-visible": { outline: "2px solid #40617E", outlineOffset: "-2px" },
              }}
            >
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf: { xs: "center", sm: "flex-start" },
                  fontSize: "0.8125rem",
                  fontWeight: isToday ? 700 : 500,
                  bgcolor: isToday ? "#0B1628" : "transparent",
                  color: isToday ? "#FCFBF8" : day.inMonth ? "#17202B" : "#A3A7AD",
                }}
              >
                {day.dayNumber}
              </Box>

              {/* Desktop/tablet: short readable summaries */}
              <Box sx={{ display: { xs: "none", sm: "flex" }, flexDirection: "column", gap: 0.25, minWidth: 0 }}>
                {day.events.slice(0, 2).map((e) => (
                  <Typography
                    key={e.id}
                    noWrap
                    sx={{ fontSize: "0.6875rem", fontWeight: 600, color: "#40617E", bgcolor: "rgba(64, 97, 126, 0.1)", borderRadius: 0.75, px: 0.5 }}
                  >
                    {e.time ? `${e.time} ` : ""}
                    {e.title}
                  </Typography>
                ))}
                {day.events.length > 2 && (
                  <Typography sx={{ fontSize: "0.6875rem", color: "#68717C" }}>+{day.events.length - 2} more</Typography>
                )}
                {day.tasks.length > 0 && (
                  <Typography noWrap sx={{ fontSize: "0.6875rem", color: "#68717C" }}>
                    {openTasks > 0 ? `${openTasks} task${openTasks > 1 ? "s" : ""} open` : `${day.tasks.length} done`}
                  </Typography>
                )}
                {day.transactions.length > 0 && (
                  <Typography noWrap sx={{ fontSize: "0.6875rem", fontWeight: 600, color: net < 0 ? "#8C3F3B" : "#3F6853" }}>
                    {compactMoney(net)}
                  </Typography>
                )}
              </Box>

              {/* Phone: dots only */}
              {hasAnything && (
                <Box sx={{ display: { xs: "flex", sm: "none" }, justifyContent: "center", gap: 0.25 }}>
                  {day.events.length > 0 && <Dot color="#40617E" />}
                  {day.tasks.length > 0 && <Dot color="#C4934A" />}
                  {day.transactions.length > 0 && <Dot color={net < 0 ? "#8C3F3B" : "#3F6853"} />}
                  {day.notes.length > 0 && <Dot color="#68717C" />}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

const Dot = ({ color }: { color: string }) => <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: color }} />;
