"use client";

import React from "react";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TuneIcon from "@mui/icons-material/Tune";
import { BudgetEnvelope } from "@/types/models";

export interface BudgetHealthProps {
  envelopes?: BudgetEnvelope[];
  onAdjustAllocations?: () => void;
  currency?: string;
}

const statusColor = (pct: number) => (pct >= 100 ? "#8C3F3B" : pct >= 75 ? "#C4934A" : "#3F6853");

export default function BudgetHealth({ envelopes = [], onAdjustAllocations, currency = "Rs." }: BudgetHealthProps) {
  const money = (n: number) => `${currency} ${Math.round(n).toLocaleString("en-PK")}`;
  const monthLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const items = envelopes
    .map((env) => ({
      ...env,
      pct: env.allocatedAmount > 0 ? Math.round((env.spentAmount / env.allocatedAmount) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct);

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "#FCFBF8",
        borderRadius: 3,
        border: "1px solid rgba(17, 28, 46, 0.08)",
        p: { xs: 2, sm: 3 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ pb: 2, mb: 2, borderBottom: "1px solid rgba(17, 28, 46, 0.06)" }}>
        <Typography sx={{ fontSize: { xs: "1.0625rem", sm: "1.25rem" }, fontWeight: 600, color: "#17202B" }}>
          Budget Health
        </Typography>
        <Typography sx={{ fontSize: "0.8125rem", color: "#68717C", mt: 0.25 }}>
          {items.length > 0 ? `${items.length} budgets for ${monthLabel}` : monthLabel}
        </Typography>
      </Box>

      {items.length === 0 ? (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5, py: 4, textAlign: "center" }}>
          <Typography sx={{ fontSize: "0.875rem", color: "#68717C" }}>
            No budgets yet. Set monthly limits to track your spending.
          </Typography>
          <Button
            variant="contained"
            onClick={onAdjustAllocations}
            sx={{ bgcolor: "#0B1628", textTransform: "none", "&:hover": { bgcolor: "#162338" } }}
          >
            Set budgets
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
          {items.map((env) => {
            const over = env.spentAmount > env.allocatedAmount;
            const color = statusColor(env.pct);
            return (
              <Box key={env.id}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1, mb: 0.75 }}>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#17202B" }} noWrap>
                    {env.label}
                  </Typography>
                  <Typography sx={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: "0.8125rem", color: "#17202B", whiteSpace: "nowrap" }}>
                    {money(env.spentAmount)}
                    <Box component="span" sx={{ color: "#68717C" }}> / {money(env.allocatedAmount)}</Box>
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(env.pct, 100)}
                  aria-label={`${env.label}: ${env.pct}% of budget used`}
                  sx={{ height: 8, borderRadius: 4, bgcolor: "#EFECE2", "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 } }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color, display: "flex", alignItems: "center", gap: 0.5 }}>
                    {env.pct >= 90 && <WarningAmberIcon sx={{ fontSize: 14 }} />}
                    {env.pct}% used
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: over ? "#8C3F3B" : "#68717C" }}>
                    {over ? `Over by ${money(env.spentAmount - env.allocatedAmount)}` : `${money(env.allocatedAmount - env.spentAmount)} left`}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {items.length > 0 && (
        <Box sx={{ mt: "auto", pt: 2.5 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onAdjustAllocations}
            startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
            sx={{
              mt: 1,
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#0B1628",
              borderColor: "rgba(17, 28, 46, 0.15)",
              textTransform: "none",
              "&:hover": { borderColor: "#0B1628", bgcolor: "rgba(11, 22, 40, 0.03)" },
            }}
          >
            Adjust Category Allocations
          </Button>
        </Box>
      )}
    </Card>
  );
}
