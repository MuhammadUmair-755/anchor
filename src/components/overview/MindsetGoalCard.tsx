"use client";

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import { MindsetGoalAnchor } from "@/types/models";

export interface MindsetGoalCardProps {
  mindsetGoal?: MindsetGoalAnchor;
  currency?: string;
}

export default function MindsetGoalCard({
  mindsetGoal,
  currency = "Rs.",
}: MindsetGoalCardProps) {
  const quote =
    mindsetGoal?.quote ||
    "Today I finally stabilized the core data pipelines. The feeling of financial grounding brings immense creative clarity. Restraint is power.";
  const entryTime = mindsetGoal?.entryTime || "10:45 AM Entry";
  const goalTitle = mindsetGoal?.goalTitle || "SAVE Rs. 100,000 RESERVE";
  const currentAmount = mindsetGoal?.currentAmount ?? 72000;
  const targetDate = mindsetGoal?.targetDate || "Dec 31";
  const achievedPercent = mindsetGoal?.achievedPercentage ?? 72;

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "#FCFBF8",
        borderRadius: 3,
        border: "1px solid rgba(17, 28, 46, 0.08)",
        boxShadow: "0 2px 8px -2px rgba(11, 22, 40, 0.03)",
        p: { xs: 1.75, sm: 2.5, md: 3 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 2,
            mb: 2,
            borderBottom: "1px solid rgba(17, 28, 46, 0.06)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AutoStoriesIcon sx={{ fontSize: 20, color: "#68717C" }} />
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: "0.9375rem", sm: "1.0625rem" },
                fontWeight: 600,
                color: "#17202B",
              }}
            >
              Mindset & Goal
            </Typography>
          </Box>

          <Typography sx={{ fontSize: "0.6875rem", color: "#68717C" }}>
            {entryTime}
          </Typography>
        </Box>

        {/* Editorial Journal Note Preview */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "#F7F5EF",
            border: "1px solid rgba(17, 28, 46, 0.04)",
            position: "relative",
          }}
        >
          <Typography
            sx={{
              position: "absolute",
              top: 6,
              left: 8,
              fontSize: "1.75rem",
              lineHeight: 1,
              fontFamily: "var(--font-newsreader), Georgia, serif",
              color: "rgba(64, 97, 126, 0.4)",
              userSelect: "none",
            }}
          >
            “
          </Typography>
          <Typography
            sx={{
              pl: 2.5,
              fontFamily: "var(--font-newsreader), Georgia, serif",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              fontStyle: "italic",
              color: "#45474C",
            }}
          >
            {quote}
          </Typography>
        </Box>

        {/* Goal Anchor Spotlight */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            border: "1px solid rgba(17, 28, 46, 0.08)",
            bgcolor: "#FCFBF8",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 0.75,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.625rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#17202B",
                textTransform: "uppercase",
              }}
            >
              Annual Target
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "#3F6853",
              }}
            >
              {achievedPercent}% Achieved
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#17202B",
              mb: 1.25,
            }}
          >
            {goalTitle}
          </Typography>

          <LinearProgress
            variant="determinate"
            value={achievedPercent}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "#EFECE2",
              "& .MuiLinearProgress-bar": {
                bgcolor: "#0B1628",
                borderRadius: 3,
              },
            }}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 1,
              fontSize: "0.6875rem",
              color: "#68717C",
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "0.6875rem",
                color: "#68717C",
                fontFeatureSettings: '"tnum" on, "zero" on',
              }}
            >
              {currency} {currentAmount.toLocaleString("en-IN")} recorded
            </Typography>
            <Typography sx={{ fontSize: "0.6875rem", color: "#68717C" }}>
              Target {targetDate}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
