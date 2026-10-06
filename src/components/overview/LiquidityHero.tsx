"use client";

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

export interface LiquidityHeroProps {
  totalLiquidity?: number;
  monthlyInflow?: number;
  inflowSourcesCount?: number;
  totalExpenses?: number;
  expensesBurnRatePercent?: number;
  netRetained?: number;
  retentionRatePercent?: number;
  currency?: string;
}

export default function LiquidityHero({
  totalLiquidity = 0,
  monthlyInflow = 0,
  inflowSourcesCount = 0,
  totalExpenses = 0,
  expensesBurnRatePercent = 0,
  netRetained = 0,
  retentionRatePercent = 0,
  currency = "Rs.",
}: LiquidityHeroProps) {
  const formattedLiquidity = totalLiquidity.toLocaleString("en-IN");
  const formattedInflow = monthlyInflow.toLocaleString("en-IN");
  const formattedExpenses = totalExpenses.toLocaleString("en-IN");
  const formattedRetained = netRetained.toLocaleString("en-IN");

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "#FCFBF8",
        borderRadius: 3,
        border: "1px solid rgba(17, 28, 46, 0.08)",
        boxShadow: "0 2px 8px -2px rgba(11, 22, 40, 0.03)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.75, md: 3.5 }, "&:last-child": { pb: { xs: 2, sm: 2.75, md: 3.5 } } }}>
        <Grid container spacing={{ xs: 2.5, lg: 4 }} sx={{ alignItems: "center" }}>
          {/* Left Column (Desktop 5-cols): Total Balance Anchor */}
          <Grid
            size={{ xs: 12, lg: 5 }}
            sx={{
              pr: { lg: 3 },
              borderRight: { lg: "1px solid rgba(17, 28, 46, 0.08)" },
            }}
          >
            {/* Tag & Live Vault Status */}
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#68717C",
                  textTransform: "uppercase",
                }}
              >
                TOTAL LIQUIDITY & BALANCE
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#5F9277",
                    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    "@keyframes pulse": {
                      "0%, 100%": { opacity: 1, transform: "scale(1)" },
                      "50%": { opacity: 0.4, transform: "scale(0.85)" },
                    },
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: "0.75rem",
                    color: "#68717C",
                    fontWeight: 500,
                  }}
                >
                  Live Vault
                </Typography>
              </Box>
            </Stack>

            {/* Primary Net Capital Value & Delta Pill */}
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, flexWrap: "wrap" }}>
              <Typography
                component="span"
                sx={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: { xs: "1.75rem", sm: "2.25rem", lg: "2.75rem" },
                  lineHeight: 1.1,
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: "#0B1628",
                  fontFeatureSettings: '"tnum" on, "zero" on',
                }}
              >
                {currency} {formattedLiquidity}
              </Typography>

            </Box>

            {/* Explanatory Subtext */}
            <Typography
              variant="body2"
              sx={{
                mt: 1.25,
                fontSize: "0.8125rem",
                color: "#68717C",
                lineHeight: 1.5,
              }}
            >
              Your current balance across everything you track.
            </Typography>
          </Grid>

          {/* Right Column (Desktop 7-cols): 3-Column Sub-Ledger Inset Well */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              {/* Monthly Inflow */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    bgcolor: "rgba(247, 245, 239, 0.65)",
                    border: "1px solid rgba(17, 28, 46, 0.05)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography
                      sx={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        color: "#68717C",
                        textTransform: "uppercase",
                      }}
                    >
                      Monthly Inflow
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      my: 1,
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: "#0B1628",
                      fontFeatureSettings: '"tnum" on, "zero" on',
                    }}
                  >
                    {currency} {formattedInflow}
                  </Typography>

                  <Typography sx={{ fontSize: "0.6875rem", color: "#68717C" }}>
                    {inflowSourcesCount} {inflowSourcesCount === 1 ? "payment" : "payments"} received this month
                  </Typography>
                </Box>
              </Grid>

              {/* Total Expenses */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    bgcolor: "rgba(247, 245, 239, 0.65)",
                    border: "1px solid rgba(17, 28, 46, 0.05)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography
                      sx={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        color: "#68717C",
                        textTransform: "uppercase",
                      }}
                    >
                      Total Expenses
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.6875rem",
                        fontWeight: 500,
                        color: "#68717C",
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                      }}
                    >
                      {Math.round(expensesBurnRatePercent)}% of income
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      my: 1,
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: "#0B1628",
                      fontFeatureSettings: '"tnum" on, "zero" on',
                    }}
                  >
                    {currency} {formattedExpenses}
                  </Typography>

                  <Typography sx={{ fontSize: "0.6875rem", color: "#68717C" }}>
                    Spent this month
                  </Typography>
                </Box>
              </Grid>

              {/* Net Retained */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    bgcolor: "rgba(247, 245, 239, 0.65)",
                    border: "1px solid rgba(17, 28, 46, 0.05)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography
                      sx={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        color: "#68717C",
                        textTransform: "uppercase",
                      }}
                    >
                      Net Retained
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      my: 1,
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: "#3F6853",
                      fontFeatureSettings: '"tnum" on, "zero" on',
                    }}
                  >
                    {currency} {formattedRetained}
                  </Typography>

                  <Typography sx={{ fontSize: "0.6875rem", color: "#68717C" }}>
                    {Math.round(retentionRatePercent)}% of income kept
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
