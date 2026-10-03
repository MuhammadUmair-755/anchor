"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { CashflowVelocity } from "@/types/models";

interface CashflowVelocityCardProps {
  velocity: CashflowVelocity;
}

export default function CashflowVelocityCard({
  velocity,
}: CashflowVelocityCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        bgcolor: "#FCFBF8",
        borderColor: "rgba(17, 28, 46, 0.08)",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(17, 28, 46, 0.03)",
      }}
    >
      <CardContent sx={{ p: { xs: 1.75, sm: 2.5 }, "&:last-child": { pb: { xs: 1.75, sm: 2.5 } } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1.5,
            borderBottom: "1px solid rgba(17, 28, 46, 0.08)",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <QueryStatsIcon sx={{ fontSize: 18, color: "#1B1C18" }} />
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                color: "#1B1C18",
              }}
            >
              Cashflow Velocity
            </Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#40617E",
            }}
          >
            Day {velocity.cycleDay} of {velocity.cycleTotalDays}
          </Typography>
        </Box>

        {/* Inflow vs Outflow Inset Box */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1.5,
            bgcolor: "#F7F5EF",
            p: 2,
            borderRadius: "8px",
            border: "1px solid rgba(17, 28, 46, 0.05)",
            mb: 2.5,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography
              sx={{
                fontSize: "10px",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#75777D",
              }}
            >
              Total Inflow
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "16px",
                fontWeight: 700,
                color: "#3F6853",
                mt: 0.25,
                fontFeatureSettings: '"tnum" on, "zero" on',
              }}
            >
              Rs. {velocity.totalInflow.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: "10px", color: "#75777D", mt: 0.25 }}>
              {velocity.inflowCount} deposits
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography
              sx={{
                fontSize: "10px",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#75777D",
              }}
            >
              Total Outflow
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "16px",
                fontWeight: 700,
                color: "#8C3F3B",
                mt: 0.25,
                fontFeatureSettings: '"tnum" on, "zero" on',
              }}
            >
              Rs. {velocity.totalOutflow.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: "10px", color: "#75777D", mt: 0.25 }}>
              {velocity.outflowCount} debits
            </Typography>
          </Box>
        </Box>

        {/* Monthly Retention Rate Meter */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#1B1C18",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              }}
            >
              Monthly Retention Rate
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "14px",
                fontWeight: 700,
                color: "#3F6853",
                fontFeatureSettings: '"tnum" on, "zero" on',
              }}
            >
              {velocity.retentionRate}%
            </Typography>
          </Box>

          {/* Segmented Dual Bar */}
          <Box
            sx={{
              width: "100%",
              height: 8,
              bgcolor: "#F0EEE8",
              borderRadius: "9999px",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <Box
              sx={{
                width: `${velocity.retentionRate}%`,
                height: "100%",
                bgcolor: "#5F9277",
                borderRadius: "9999px 0 0 9999px",
              }}
            />
            <Box
              sx={{
                width: `${100 - velocity.retentionRate}%`,
                height: "100%",
                bgcolor: "rgba(17, 28, 46, 0.15)",
              }}
            />
          </Box>

          <Typography
            sx={{
              fontSize: "11px",
              fontStyle: "italic",
              color: "#75777D",
              fontFamily: "var(--font-newsreader), Georgia, serif",
            }}
          >
            Sovereign Target: {velocity.targetRetentionRate}% retention rate for capital velocity
          </Typography>
        </Box>

        {/* Velocity Hotspots Warning Box */}
        <Box
          sx={{
            p: 1.5,
            bgcolor: "#F0EEE8",
            borderRadius: "8px",
            border: "1px solid rgba(17, 28, 46, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningAmberIcon sx={{ fontSize: 15, color: "#C4934A" }} />
            <Typography
              sx={{
                fontSize: "10px",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#1B1C18",
              }}
            >
              Observed Velocity Hotspots
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {velocity.hotspots.map((item, idx) => (
              <Box
                key={item.id || idx}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  color: "#45474C",
                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                }}
              >
                <span>{item.title}</span>
                <Typography
                  component="span"
                  sx={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: item.severity === "critical" ? "#8C3F3B" : item.severity === "warning" ? "#C4934A" : "#1B1C18",
                    fontFeatureSettings: '"tnum" on, "zero" on',
                  }}
                >
                  {item.metric}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
