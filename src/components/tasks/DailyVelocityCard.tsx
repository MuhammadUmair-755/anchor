"use client";

import React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { WeeklyRhythmDay } from "@/types/models";
import { mockWeeklyRhythm } from "@/services/mockData";

export interface DailyVelocityCardProps {
  completedCount?: number;
  completedTasksCount?: number;
  velocityDelta?: string;
  velocityDeltaPercent?: number;
  weeklyRhythm?: WeeklyRhythmDay[];
}

export default function DailyVelocityCard({
  completedCount,
  completedTasksCount,
  velocityDelta = "+20% vs 7-day average",
  velocityDeltaPercent,
  weeklyRhythm = mockWeeklyRhythm,
}: DailyVelocityCardProps) {
  const count = completedCount !== undefined ? completedCount : completedTasksCount !== undefined ? completedTasksCount : 5;
  const deltaText = velocityDeltaPercent !== undefined ? `+${velocityDeltaPercent}% vs 7-day average` : velocityDelta;

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "#FCFBF8",
        border: "1px solid rgba(17, 28, 46, 0.08)",
        borderRadius: "12px",
        p: 2.5,
        boxShadow: "0 2px 8px -2px rgba(11, 22, 40, 0.04)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            fontSize: "0.6875rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#68717C",
          }}
        >
          Performance
        </Typography>
        <TrendingUpIcon sx={{ fontSize: 18, color: "#68717C" }} />
      </Box>

      {/* Metric Headline */}
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <Typography
          sx={{
            fontFamily: "var(--font-newsreader), Georgia, serif",
            fontSize: "2rem",
            fontWeight: 500,
            color: "#0B1628",
            lineHeight: 1,
            fontFeatureSettings: '"tnum" on',
          }}
        >
          {count}
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            fontSize: "0.875rem",
            color: "#68717C",
          }}
        >
          tasks completed
        </Typography>
      </Box>

      {/* Velocity Badge */}
      <Box
        sx={{
          display: "inline-flex",
          alignSelf: "flex-start",
          px: 1,
          py: 0.35,
          borderRadius: 1,
          bgcolor: "rgba(95, 146, 119, 0.15)",
          color: "#3F6853",
          fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
          fontSize: "0.6875rem",
          fontWeight: 600,
        }}
      >
        {deltaText}
      </Box>

      {/* 7-Day Weekly Rhythm Bar Chart */}
      <Box sx={{ pt: 1, borderTop: "1px solid rgba(17, 28, 46, 0.05)" }}>
        <Typography
          sx={{
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            fontSize: "0.6875rem",
            color: "#75777D",
            mb: 1.5,
          }}
        >
          Weekly Rhythm:
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            height: 56,
            gap: 1,
          }}
        >
          {weeklyRhythm.map((item, index) => {
            const barHeight = Math.max(8, (item.heightPercent / 100) * 44);
            const isActive = item.isToday;

            return (
              <Box
                key={`${item.day}-${index}`}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 16,
                    height: `${barHeight}px`,
                    borderRadius: "3px 3px 0 0",
                    bgcolor: isActive ? "#0B1628" : "#EFECE2",
                    transition: "height 0.3s ease",
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: "0.6875rem",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#0B1628" : "#75777D",
                    mt: 0.5,
                  }}
                >
                  {item.day}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Card>
  );
}
