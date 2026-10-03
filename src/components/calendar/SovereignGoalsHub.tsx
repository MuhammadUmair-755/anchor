"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import { SovereignGoal } from "@/types/models";

export interface SovereignGoalsHubProps {
  goals: SovereignGoal[];
  onOpenAdjustMilestones: () => void;
  onExpandGoals?: () => void;
}

export default function SovereignGoalsHub({
  goals,
  onOpenAdjustMilestones,
  onExpandGoals,
}: SovereignGoalsHubProps) {
  return (
    <Box
      sx={{
        bgcolor: "#FCFBF8",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: "12px",
        p: { xs: 1.75, sm: 2.5, md: 3 },
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1.5,
          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
          mb: 2,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <FlagOutlinedIcon sx={{ fontSize: 18, color: "#111C2E" }} />
          <Typography
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#1B1C18",
            }}
          >
            Sovereign Goals Hub
          </Typography>
        </Stack>

        <Button
          size="small"
          onClick={onExpandGoals || onOpenAdjustMilestones}
          sx={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#40617E",
            p: 0,
            minWidth: "auto",
            "&:hover": { color: "#111C2E", bgcolor: "transparent" },
          }}
        >
          EXPAND
        </Button>
      </Box>

      {/* Goals Stack */}
      <Stack spacing={2}>
        {goals.map((goal) => {
          // Determine badge color styling based on percentage / meter color
          const badgeColor =
            goal.meterColor === "#111C2E"
              ? { text: "#3F6853", bg: "rgba(95, 146, 119, 0.15)" }
              : goal.meterColor === "#40617E"
              ? { text: "#40617E", bg: "rgba(188, 222, 255, 0.4)" }
              : { text: "#1B1C18", bg: "#EAE8E2" };

          return (
            <Box
              key={goal.id}
              sx={{
                p: 1.5,
                bgcolor: "rgba(245, 243, 237, 0.4)",
                borderRadius: "8px",
                border: "1px solid rgba(197, 198, 205, 0.3)",
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
              }}
            >
              {/* Goal Title, Subtitle, and Percentage Badge */}
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#1B1C18",
                      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                    }}
                  >
                    {goal.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.6875rem",
                      color: "#75777D",
                      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                    }}
                  >
                    {goal.subtitle}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: badgeColor.text,
                    bgcolor: badgeColor.bg,
                    px: 1,
                    py: 0.25,
                    borderRadius: "4px",
                    fontFeatureSettings: '"tnum" 1, "zero" 1',
                  }}
                >
                  {goal.progressPercentage}%
                </Box>
              </Box>

              {/* Meter Bar */}
              <Box
                sx={{
                  width: "100%",
                  height: 6,
                  bgcolor: "#E4E2DD",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    bgcolor: goal.meterColor,
                    borderRadius: "9999px",
                    width: `${goal.progressPercentage}%`,
                    transition: "width 0.4s ease",
                  }}
                />
              </Box>

              {/* Subtext Metrics */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: "0.6875rem",
                    color: "#75777D",
                    fontFeatureSettings: '"tnum" 1, "zero" 1',
                  }}
                >
                  {goal.achievedMetric}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: "0.6875rem",
                    color: "#75777D",
                    fontFeatureSettings: '"tnum" 1, "zero" 1',
                  }}
                >
                  {goal.gapMetric}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>

      {/* Bottom Micro CTA: Adjust Strategic Milestones */}
      <Button
        fullWidth
        variant="outlined"
        onClick={onOpenAdjustMilestones}
        startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
        sx={{
          mt: 2,
          py: 1,
          borderRadius: "8px",
          borderColor: "rgba(197, 198, 205, 0.5)",
          color: "#1B1C18",
          fontSize: "0.8125rem",
          fontWeight: 500,
          textTransform: "none",
          "&:hover": {
            bgcolor: "#F5F3ED",
            borderColor: "rgba(117, 119, 125, 0.5)",
          },
        }}
      >
        Adjust Strategic Milestones
      </Button>
    </Box>
  );
}
