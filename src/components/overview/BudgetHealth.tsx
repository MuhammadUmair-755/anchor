"use client";

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DirectionsSubwayIcon from "@mui/icons-material/DirectionsSubway";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import BoltIcon from "@mui/icons-material/Bolt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TuneIcon from "@mui/icons-material/Tune";
import { BudgetEnvelope } from "@/types/models";

export interface BudgetHealthProps {
  envelopes?: BudgetEnvelope[];
  onAdjustAllocations?: () => void;
  currency?: string;
}

interface EnvelopeDisplayConfig {
  id: string;
  label: string;
  spent: number;
  allocated: number;
  percentage: number;
  color: string;
  statusLabel: string;
  bufferLabel: string;
  isAlert?: boolean;
  icon: React.ReactNode;
}

export default function BudgetHealth({
  envelopes,
  onAdjustAllocations,
  currency = "Rs.",
}: BudgetHealthProps) {
  const getIconForCategory = (categoryId: string) => {
    switch (categoryId) {
      case "env-food":
      case "food_dining":
        return <RestaurantIcon sx={{ fontSize: 16, color: "#68717C" }} />;
      case "env-transport":
      case "transport_transit":
        return <DirectionsSubwayIcon sx={{ fontSize: 16, color: "#68717C" }} />;
      case "env-shopping":
      case "shopping_gear":
        return <ShoppingBagIcon sx={{ fontSize: 16, color: "#C48858" }} />;
      case "env-housing":
      case "env-bills":
      case "housing_utilities":
      case "knowledge_subs":
      default:
        return <BoltIcon sx={{ fontSize: 16, color: "#68717C" }} />;
    }
  };

  const defaultEnvelopes: EnvelopeDisplayConfig[] = [
    {
      id: "env-food",
      label: "Food & Groceries",
      spent: 11200,
      allocated: 15000,
      percentage: 74,
      color: "#5F9277", // Sage Green
      statusLabel: "Normal burn rate",
      bufferLabel: "Rs. 3,800 buffer remains",
      icon: <RestaurantIcon sx={{ fontSize: 16, color: "#68717C" }} />,
    },
    {
      id: "env-transport",
      label: "Transport & Commute",
      spent: 4300,
      allocated: 10000,
      percentage: 43,
      color: "#508E8C", // Mineral Teal
      statusLabel: "Well contained",
      bufferLabel: "Rs. 5,700 available",
      icon: <DirectionsSubwayIcon sx={{ fontSize: 16, color: "#68717C" }} />,
    },
    {
      id: "env-shopping",
      label: "Shopping & Gear",
      spent: 18500,
      allocated: 20000,
      percentage: 92,
      color: "#C76D68", // Soft Coral Alert
      statusLabel: "Approaching limit",
      bufferLabel: "Rs. 1,500 runway",
      isAlert: true,
      icon: <ShoppingBagIcon sx={{ fontSize: 16, color: "#C48858" }} />,
    },
    {
      id: "env-bills",
      label: "Bills & Utilities",
      spent: 8200,
      allocated: 9000,
      percentage: 91,
      color: "#40617E", // Slate
      statusLabel: "Recurring debits completed",
      bufferLabel: "Rs. 800 balance",
      icon: <BoltIcon sx={{ fontSize: 16, color: "#68717C" }} />,
    },
  ];

  const items: EnvelopeDisplayConfig[] =
    envelopes && envelopes.length >= 4
      ? envelopes.slice(0, 4).map((env) => {
          const spent = env.spentAmount;
          const allocated = env.allocatedAmount;
          const percentage = Math.round((spent / allocated) * 100);
          const isAlert = percentage >= 90;
          let color = "#5F9277";
          if (isAlert) color = "#C76D68";
          else if (percentage >= 75) color = "#40617E";
          else if (percentage < 50) color = "#508E8C";

          return {
            id: env.id,
            label: env.label,
            spent,
            allocated,
            percentage,
            color,
            statusLabel: isAlert
              ? "Approaching limit"
              : percentage >= 75
              ? "Recurring debits completed"
              : percentage < 50
              ? "Well contained"
              : "Normal burn rate",
            bufferLabel: `${currency} ${Math.max(0, allocated - spent).toLocaleString("en-IN")} buffer`,
            isAlert,
            icon: getIconForCategory(env.id || env.category),
          };
        })
      : defaultEnvelopes;

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
        {/* Header & Active Count Badge */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 2,
            mb: 2.5,
            borderBottom: "1px solid rgba(17, 28, 46, 0.06)",
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
              Budget Health
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
              Active envelope thresholds for September 2026
            </Typography>
          </Box>

          <Box
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 1,
              bgcolor: "#F0EEE8",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "0.6875rem",
              fontWeight: 600,
              color: "#68717C",
            }}
          >
            4 Active
          </Box>
        </Box>

        {/* 4 Interactive Envelope Progress Bars */}
        <Stack spacing={2.5}>
          {items.map((env) => (
            <Box key={env.id} sx={{ spaceY: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 0.5,
                  mb: 0.75,
                }}
              >
                {/* Category Icon & Name */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {env.icon}
                  <Typography
                    sx={{
                      fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                      fontWeight: 600,
                      color: "#17202B",
                    }}
                  >
                    {env.label}
                  </Typography>
                </Box>

                {/* Amounts & Percentage Badge */}
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, flexWrap: "wrap" }}>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                      fontWeight: 600,
                      color: env.isAlert ? "#C76D68" : "#17202B",
                      fontFeatureSettings: '"tnum" on, "zero" on',
                    }}
                  >
                    {currency} {env.spent.toLocaleString("en-IN")}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                      color: "#68717C",
                      fontFeatureSettings: '"tnum" on, "zero" on',
                    }}
                  >
                    / {currency} {env.allocated.toLocaleString("en-IN")}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      color: env.isAlert ? "#8C3F3B" : "#3F6853",
                    }}
                  >
                    ({env.percentage}%)
                  </Typography>
                </Box>
              </Box>

              {/* Progress Bar Track */}
              <LinearProgress
                variant="determinate"
                value={Math.min(env.percentage, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "#EFECE2",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: env.color,
                    borderRadius: 4,
                  },
                }}
              />

              {/* Status and Buffer Caption */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mt: 0.5,
                  fontSize: "0.6875rem",
                }}
              >
                {env.isAlert ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#8C3F3B" }}>
                    <WarningAmberIcon sx={{ fontSize: 13 }} />
                    <Typography sx={{ fontSize: "0.6875rem", fontWeight: 600, color: "#8C3F3B" }}>
                      {env.statusLabel}
                    </Typography>
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: "0.6875rem", color: "#68717C" }}>
                    {env.statusLabel}
                  </Typography>
                )}

                <Typography sx={{ fontSize: "0.6875rem", color: "#68717C" }}>
                  {env.bufferLabel}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>

      {/* Action Footer */}
      <Box
        sx={{
          mt: 3,
          pt: 2,
          borderTop: "1px solid rgba(17, 28, 46, 0.06)",
          textAlign: "center",
        }}
      >
        <Button
          onClick={onAdjustAllocations}
          startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
          sx={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#40617E",
            textTransform: "none",
            "&:hover": {
              color: "#0B1628",
              bgcolor: "rgba(11, 22, 40, 0.04)",
            },
          }}
        >
          Adjust Category Allocations
        </Button>
      </Box>
    </Card>
  );
}
