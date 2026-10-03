"use client";

import React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import { TaskItem } from "@/types/models";

export interface ExecutionCoreCardProps {
  completedCount?: number;
  totalCount?: number;
  baselineVelocityPercent?: number;
  targetDeliverables?: number;
  tasks?: TaskItem[];
}

export default function ExecutionCoreCard({
  completedCount: propCompleted,
  totalCount: propTotal,
  baselineVelocityPercent: propVelocity,
  targetDeliverables: propTarget,
  tasks,
}: ExecutionCoreCardProps) {
  const completed =
    propCompleted !== undefined
      ? propCompleted
      : tasks
      ? tasks.filter((t) => t.isCompleted).length
      : 3;

  const total =
    propTotal !== undefined
      ? propTotal
      : tasks && tasks.length > 0
      ? tasks.length
      : 5;

  const progressPercent =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  const velocityPercent =
    propVelocity !== undefined ? propVelocity : progressPercent;

  const target = propTarget !== undefined ? propTarget : 5;
  const remaining = Math.max(0, target - completed);

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "#FCFBF8",
        border: "1px solid rgba(17, 28, 46, 0.08)",
        borderRadius: "12px",
        p: { xs: 2.5, sm: 3 },
        boxShadow: "0 2px 8px -2px rgba(11, 22, 40, 0.04)",
      }}
    >
      {/* Header & Metric Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box>
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
            Execution Core
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontFamily: "var(--font-newsreader), Georgia, serif",
              fontSize: "1.5rem",
              fontWeight: 500,
              color: "#0B1628",
              mt: 0.25,
            }}
          >
            Today&apos;s Focus
          </Typography>
        </Box>

        <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
          <Typography
            sx={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "#0B1628",
              fontFeatureSettings: '"tnum" on',
            }}
          >
            {completed} of {total} completed
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#3F6853",
              mt: 0.25,
            }}
          >
            {velocityPercent}% of baseline velocity
          </Typography>
        </Box>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mt: 2.5, mb: 1.5 }}>
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: "#EFECE2",
            "& .MuiLinearProgress-bar": {
              bgcolor: "#0B1628",
              borderRadius: 4,
              transition: "transform 0.4s ease",
            },
          }}
        />
      </Box>

      {/* Footer Metrics */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: "0.6875rem",
          color: "#75777D",
          fontFeatureSettings: '"tnum" on',
        }}
      >
        <span>Target: {target} deliverables</span>
        <span>{remaining} remaining</span>
      </Box>
    </Card>
  );
}
