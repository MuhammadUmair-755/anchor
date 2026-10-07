"use client";

import React, { useState } from "react";
import Link from "next/link";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { OutflowSector } from "@/types/models";

export interface OutflowDonutChartProps {
  sectors?: OutflowSector[];
  /** Spent in categories that have a budget, and the sum of those budgets */
  totalSpent?: number;
  budgetCap?: number;
  currency?: string;
}

// Color follows the category, never its rank (validated categorical palette, fixed order).
const CATEGORY_COLORS: Record<string, string> = {
  food_dining: "#2a78d6",
  housing_utilities: "#eb6834",
  transport_transit: "#1baf7a",
  shopping_gear: "#eda100",
  health_wellness: "#e87ba4",
  knowledge_subs: "#008300",
};
const OTHER_COLOR = "#8a8f98";

const SEGMENT_GAP = 0.8; // % of circumference left as surface between segments

const formatMoney = (currency: string, n: number) => `${currency} ${Math.round(n).toLocaleString("en-PK")}`;

export default function OutflowDonutChart({
  sectors = [],
  totalSpent = 0,
  budgetCap = 0,
  currency = "Rs.",
}: OutflowDonutChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const total = sectors.reduce((sum, s) => sum + s.amount, 0);
  const rows = [...sectors]
    .filter((s) => s.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map((s) => ({
      id: s.id,
      label: s.label,
      amount: s.amount,
      pct: total > 0 ? (s.amount / total) * 100 : 0,
      color: CATEGORY_COLORS[s.category] || OTHER_COLOR,
    }));

  const gap = rows.length > 1 ? SEGMENT_GAP : 0;
  const segments = rows.map((r, i) => ({
    ...r,
    dash: Math.max(r.pct - gap, 0.1),
    offset: rows.slice(0, i).reduce((sum, prev) => sum + prev.pct, 0),
  }));

  const active = rows.find((r) => r.id === hovered);
  const budgetPercent = budgetCap > 0 ? Math.round((totalSpent / budgetCap) * 100) : null;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: { xs: 2.5, sm: 3 },
        borderColor: "rgba(17, 28, 46, 0.08)",
        bgcolor: "#FCFBF8",
        boxShadow: "0 1px 3px rgba(11, 22, 40, 0.02)",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3 },
          "&:last-child": { pb: { xs: 2, sm: 3 } },
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography sx={{ fontSize: { xs: "1.0625rem", sm: "1.25rem" }, fontWeight: 600, color: "#17202B" }}>
          Spending by Category
        </Typography>
        <Typography sx={{ fontSize: "0.8125rem", color: "#68717C", mt: 0.25 }}>
          Where your money went this month
        </Typography>

        {rows.length === 0 ? (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", py: 6 }}>
            <Typography sx={{ fontSize: "0.875rem", color: "#68717C" }}>
              No spending recorded this month yet.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              mt: 3,
              flex: 1,
              alignContent: "center",
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "200px 1fr" },
              gap: { xs: 3, sm: 4 },
              alignItems: "center",
            }}
          >
            {/* Donut */}
            <Box sx={{ position: "relative", width: 200, height: 200, mx: "auto" }}>
              <svg viewBox="0 0 42 42" width="200" height="200" role="img" aria-label="Spending by category donut chart">
                <circle cx="21" cy="21" r="15.915" fill="none" stroke="#F0EEE8" strokeWidth="5" />
                {segments.map((s) => (
                  <circle
                    key={s.id}
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="none"
                    stroke={s.color}
                    strokeWidth={hovered === s.id ? 6 : 5}
                    strokeDasharray={`${s.dash} ${100 - s.dash}`}
                    strokeDashoffset={-s.offset}
                    transform="rotate(-90 21 21)"
                    opacity={hovered && hovered !== s.id ? 0.35 : 1}
                    style={{ cursor: "pointer", transition: "opacity 0.15s, stroke-width 0.15s" }}
                    onMouseEnter={() => setHovered(s.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <title>{`${s.label}: ${formatMoney(currency, s.amount)} (${Math.round(s.pct)}%)`}</title>
                  </circle>
                ))}
              </svg>
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
                  px: 4,
                }}
              >
                <Typography sx={{ fontSize: "0.6875rem", fontWeight: 600, color: "#68717C", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {active ? active.label : "Total spent"}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    color: "#0B1628",
                    fontFeatureSettings: '"tnum" on',
                  }}
                >
                  {formatMoney(currency, active ? active.amount : total)}
                </Typography>
                {active && (
                  <Typography sx={{ fontSize: "0.75rem", color: "#68717C" }}>{Math.round(active.pct)}% of spending</Typography>
                )}
              </Box>
            </Box>

            {/* Legend: color + name + share + amount, so identity is never color alone */}
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 0.5 }}>
              {rows.map((r) => (
                <Box
                  component="li"
                  key={r.id}
                  onMouseEnter={() => setHovered(r.id)}
                  onMouseLeave={() => setHovered(null)}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "12px 1fr auto auto",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1,
                    py: 0.75,
                    borderRadius: 1.5,
                    bgcolor: hovered === r.id ? "rgba(17, 28, 46, 0.04)" : "transparent",
                  }}
                >
                  <Box sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: r.color }} />
                  <Typography sx={{ fontSize: "0.875rem", color: "#17202B", minWidth: 0 }} noWrap>
                    {r.label}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#68717C", fontFeatureSettings: '"tnum" on' }}>
                    {Math.round(r.pct)}%
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#17202B",
                      textAlign: "right",
                      minWidth: 88,
                      fontFeatureSettings: '"tnum" on',
                    }}
                  >
                    {formatMoney(currency, r.amount)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Box
          sx={{
            mt: "auto",
            pt: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
            borderTop: "1px solid rgba(17, 28, 46, 0.06)",
          }}
        >
          <Typography sx={{ fontSize: "0.8125rem", color: "#68717C" }}>
            {budgetPercent === null
              ? "No budgets set yet"
              : `Budgeted categories: ${formatMoney(currency, totalSpent)} of ${formatMoney(currency, budgetCap)} (${budgetPercent}%)`}
          </Typography>
          <Button
            component={Link}
            href="/finance"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#40617E", textTransform: "none", px: 0 }}
          >
            View ledger
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
