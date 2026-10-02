"use client";

import React, { useState } from "react";
import Link from "next/link";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import LinearProgress from "@mui/material/LinearProgress";
import InsightsIcon from "@mui/icons-material/Insights";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { OutflowSector } from "@/types/models";

export interface OutflowDonutChartProps {
  totalSpent?: number;
  budgetCap?: number;
  sectors?: OutflowSector[];
  currency?: string;
}

export default function OutflowDonutChart({
  totalSpent = 65000,
  budgetCap = 70000,
  sectors,
  currency = "Rs.",
}: OutflowDonutChartProps) {
  const [viewMode, setViewMode] = useState<"donut" | "cadence">("donut");

  const defaultSectors = [
    {
      id: "food",
      label: "Food & Dining",
      percentage: 30,
      amount: 19500,
      color: "#111C2E",
      dashArray: "117 273",
      dashOffset: 0,
      mobileDash: "71.6 167.1",
      mobileOffset: 0,
    },
    {
      id: "housing",
      label: "Housing & Base",
      percentage: 25,
      amount: 16250,
      color: "#40617E",
      dashArray: "97.5 292.5",
      dashOffset: -120,
      mobileDash: "59.7 179",
      mobileOffset: -71.6,
    },
    {
      id: "shopping",
      label: "Shopping & Gear",
      percentage: 18,
      amount: 11700,
      color: "#C48858",
      dashArray: "70 320",
      dashOffset: -282,
      mobileDash: "43 195.7",
      mobileOffset: -131.3,
    },
    {
      id: "transit",
      label: "Transit & Travel",
      percentage: 15,
      amount: 9750,
      color: "#508E8C",
      dashArray: "58.5 331.5",
      dashOffset: -220,
      mobileDash: "35.8 202.9",
      mobileOffset: -174.3,
    },
    {
      id: "health",
      label: "Health & Fitness",
      percentage: 12,
      amount: 7800,
      color: "#93A8B8",
      dashArray: "47 343",
      dashOffset: -354,
      mobileDash: "28.6 210.1",
      mobileOffset: -210.1,
    },
  ];

  const displaySectors = sectors && sectors.length > 0
    ? sectors.map((s, idx) => ({
        id: s.id,
        label: s.label,
        percentage: s.percentage,
        amount: s.amount,
        color: s.color || defaultSectors[idx % defaultSectors.length].color,
        dashArray: s.strokeDashArray || defaultSectors[idx % defaultSectors.length].dashArray,
        dashOffset: s.strokeDashOffset || defaultSectors[idx % defaultSectors.length].dashOffset,
        mobileDash: defaultSectors[idx % defaultSectors.length].mobileDash,
        mobileOffset: defaultSectors[idx % defaultSectors.length].mobileOffset,
      }))
    : defaultSectors;

  const budgetBurnPercent = Math.round((totalSpent / budgetCap) * 100);

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "#FCFBF8",
        borderRadius: 3,
        border: "1px solid rgba(17, 28, 46, 0.08)",
        boxShadow: "0 2px 8px -2px rgba(11, 22, 40, 0.03)",
        p: { xs: 2.5, sm: 3 },
      }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        {/* Header & View Toggle */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            pb: 2,
            mb: 2.5,
            borderBottom: "1px solid rgba(17, 28, 46, 0.06)",
            gap: 1.5,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: "1rem", sm: "1.125rem" },
                fontWeight: 600,
                color: "#17202B",
                lineHeight: 1.3,
              }}
            >
              Outflow Distribution & Cadence
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.75rem",
                color: "#68717C",
                display: "block",
                mt: 0.25,
              }}
            >
              Allocated spending breakdown for current 30-day window
            </Typography>
          </Box>

          {/* Interactive View Toggle Pills */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_e, newMode) => {
              if (newMode) setViewMode(newMode);
            }}
            size="small"
            sx={{
              bgcolor: "#F0EEE8",
              p: 0.5,
              borderRadius: 2,
              border: "1px solid rgba(17, 28, 46, 0.08)",
              "& .MuiToggleButtonGroup-grouped": {
                border: 0,
                borderRadius: "6px !important",
                px: 1.5,
                py: 0.4,
                fontSize: "0.75rem",
                fontWeight: 500,
                textTransform: "none",
                color: "#68717C",
                "&.Mui-selected": {
                  bgcolor: "#FCFBF8",
                  color: "#0B1628",
                  fontWeight: 600,
                  boxShadow: "0 1px 3px rgba(11, 22, 40, 0.08)",
                },
              },
            }}
          >
            <ToggleButton value="donut">Category Donut</ToggleButton>
            <ToggleButton value="cadence">Cashflow Cadence</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {viewMode === "donut" ? (
          /* Visualization: Mathematical Donut SVG + Itemized Breakdown */
          <Grid container spacing={{ xs: 2.5, sm: 3 }} sx={{ alignItems: "center" }}>
            {/* SVG Donut Ring with Center Metrics */}
            <Grid
              size={{ xs: 12, sm: 5 }}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: { xs: 1, sm: 2 },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: { xs: 130, sm: 160 },
                  height: { xs: 130, sm: 160 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* SVG Ring rotated -90deg */}
                <svg
                  viewBox="0 0 160 160"
                  style={{
                    width: "100%",
                    height: "100%",
                    transform: "rotate(-90deg)",
                  }}
                  role="img"
                  aria-label="Spending Outflow Category Donut Chart"
                >
                  {/* Background Circle Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    fill="none"
                    stroke="#EFECE2"
                    strokeWidth="18"
                  />
                  {/* Category Arcs */}
                  {displaySectors.map((sector) => (
                    <circle
                      key={sector.id}
                      cx="80"
                      cy="80"
                      r="62"
                      fill="none"
                      stroke={sector.color}
                      strokeWidth="18"
                      strokeDasharray={sector.dashArray}
                      strokeDashoffset={sector.dashOffset}
                      strokeLinecap="round"
                    />
                  ))}
                </svg>

                {/* Center Metrics Overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "#68717C",
                      textTransform: "uppercase",
                    }}
                  >
                    Total Spent
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: { xs: "0.9375rem", sm: "1.0625rem" },
                      fontWeight: 600,
                      color: "#0B1628",
                      fontFeatureSettings: '"tnum" on, "zero" on',
                      mt: 0.25,
                    }}
                  >
                    {currency} {totalSpent.toLocaleString("en-IN")}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      color: "#3F6853",
                      mt: 0.25,
                    }}
                  >
                    {budgetBurnPercent}% of budget
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Surrounding Category Breakdown Badges */}
            <Grid size={{ xs: 12, sm: 7 }}>
              <Stack spacing={1}>
                {displaySectors.map((sector) => (
                  <Box
                    key={sector.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.25,
                      borderRadius: 1.5,
                      border: "1px solid transparent",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: "rgba(240, 238, 232, 0.6)",
                        borderColor: "rgba(17, 28, 46, 0.08)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: 0.75,
                          bgcolor: sector.color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "0.8125rem",
                          fontWeight: 500,
                          color: "#17202B",
                        }}
                      >
                        {sector.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "var(--font-jetbrains-mono), monospace",
                          fontSize: "0.6875rem",
                          color: "#68717C",
                          fontFeatureSettings: '"tnum" on, "zero" on',
                        }}
                      >
                        {sector.percentage}%
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "#0B1628",
                        fontFeatureSettings: '"tnum" on, "zero" on',
                      }}
                    >
                      {currency} {sector.amount.toLocaleString("en-IN")}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>
          </Grid>
        ) : (
          /* Cashflow Cadence Alternate View */
          <Box sx={{ py: 1.5, spaceY: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(247, 245, 239, 0.7)",
                    border: "1px solid rgba(17, 28, 46, 0.06)",
                  }}
                >
                  <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#68717C", textTransform: "uppercase" }}>
                    Daily Burn Velocity
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: "#0B1628",
                      mt: 0.5,
                      fontFeatureSettings: '"tnum" on, "zero" on',
                    }}
                  >
                    {currency} {Math.round(totalSpent / 30).toLocaleString("en-IN")}/day
                  </Typography>
                  <Typography sx={{ fontSize: "0.6875rem", color: "#3F6853", mt: 0.25 }}>
                    Contained within Rs. 2,333/day cap
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(247, 245, 239, 0.7)",
                    border: "1px solid rgba(17, 28, 46, 0.06)",
                  }}
                >
                  <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#68717C", textTransform: "uppercase" }}>
                    Weekly Rhythm
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: "#0B1628",
                      mt: 0.5,
                      fontFeatureSettings: '"tnum" on, "zero" on',
                    }}
                  >
                    {currency} {Math.round((totalSpent / 30) * 7).toLocaleString("en-IN")}/wk
                  </Typography>
                  <Typography sx={{ fontSize: "0.6875rem", color: "#68717C", mt: 0.25 }}>
                    4 calendar cycles in September
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(247, 245, 239, 0.7)",
                    border: "1px solid rgba(17, 28, 46, 0.06)",
                  }}
                >
                  <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#68717C", textTransform: "uppercase" }}>
                    Retention Pace
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: "#3F6853",
                      mt: 0.5,
                      fontFeatureSettings: '"tnum" on, "zero" on',
                    }}
                  >
                    45.8%
                  </Typography>
                  <Typography sx={{ fontSize: "0.6875rem", color: "#3F6853", mt: 0.25 }}>
                    Target 50.0% within reach
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Retention Pace Progress Bar */}
            <Box sx={{ mt: 2.5, px: 0.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#17202B" }}>
                  Cycle Target Preservation
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: "0.75rem",
                    color: "#3F6853",
                    fontWeight: 600,
                  }}
                >
                  45.8% / 50.0% Goal
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={91.6}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "#EFECE2",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: "#5F9277",
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </Box>
        )}

        {/* Mini Trend Footnote */}
        <Box
          sx={{
            mt: 2.5,
            pt: 2,
            borderTop: "1px solid rgba(17, 28, 46, 0.06)",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 1,
            fontSize: "0.75rem",
            color: "#68717C",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <InsightsIcon sx={{ fontSize: 16, color: "#3F6853" }} />
            <span>Discretionary expenses are 8.4% lower than August average</span>
          </Box>

          <Box
            component={Link}
            href="/finance"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#40617E",
              textDecoration: "none",
              transition: "color 0.15s ease",
              "&:hover": {
                color: "#0B1628",
                textDecoration: "underline",
              },
            }}
          >
            <span>View comprehensive ledger</span>
            <ArrowForwardIcon sx={{ fontSize: 13 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
