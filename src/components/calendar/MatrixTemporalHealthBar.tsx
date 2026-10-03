"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import InsightsIcon from "@mui/icons-material/Insights";
import { TemporalHealthMetrics } from "@/types/models";

export interface MatrixTemporalHealthBarProps {
  metrics: TemporalHealthMetrics;
}

export default function MatrixTemporalHealthBar({ metrics }: MatrixTemporalHealthBarProps) {
  const netSign = metrics.netBalanceMtd >= 0 ? "+" : "-";
  const formattedNet = `${netSign}Rs. ${Math.abs(metrics.netBalanceMtd).toLocaleString()}`;

  return (
    <Box
      sx={{
        bgcolor: "#EFECE2",
        border: "1px solid rgba(0, 0, 0, 0.05)",
        borderRadius: "12px",
        p: { xs: 1.5, sm: 2.25 },
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      {/* Left Icon and Status Details */}
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#40617E",
          }}
        >
          <InsightsIcon sx={{ fontSize: 24 }} />
        </Box>

        <Box>
          <Typography
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#1B1C18",
              lineHeight: 1.3,
            }}
          >
            {metrics.operationalEquilibriumTitle}
          </Typography>

          <Typography
            sx={{
              fontSize: "0.875rem",
              color: "#45474C",
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            }}
          >
            {metrics.operationalEquilibriumSubtext}
          </Typography>
        </Box>
      </Stack>

      {/* Right Metrics: Tasks Resolved & Net Balance MTD */}
      <Stack
        direction="row"
        spacing={{ xs: 2.5, sm: 4 }}
        sx={{
          alignItems: "center",
          width: { xs: "100%", sm: "auto" },
          justifyContent: { xs: "space-between", sm: "flex-end" },
        }}
      >
        {/* Tasks Resolved Metric */}
        <Box sx={{ textAlign: "right" }}>
          <Typography
            sx={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#75777D",
            }}
          >
            TASKS RESOLVED
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "#1B1C18",
              fontFeatureSettings: '"tnum" 1, "zero" 1',
            }}
          >
            {metrics.tasksResolvedCount} / {metrics.tasksTotalCount}
          </Typography>
        </Box>

        {/* Net Balance MTD Metric */}
        <Box sx={{ textAlign: "right" }}>
          <Typography
            sx={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#75777D",
            }}
          >
            NET BALANCE MTD
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "#3F6853",
              fontFeatureSettings: '"tnum" 1, "zero" 1',
            }}
          >
            {formattedNet}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
