"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import LinearProgress from "@mui/material/LinearProgress";
import { BudgetEnvelope, OutflowSector, TransactionCategory } from "@/types/models";
import { BUDGET_CATEGORIES } from "@/lib/budgets";

export interface AdjustAllocationsModalProps {
  open: boolean;
  onClose: () => void;
  envelopes: BudgetEnvelope[];
  /** This month's spending per category, shown next to each budget */
  sectors: OutflowSector[];
  /** Called with every category's budget (0 = none); the modal closes immediately. */
  onSave: (budgets: { category: TransactionCategory; amount: number }[]) => void;
}

const money = (n: number) => `Rs. ${Math.round(n).toLocaleString("en-PK")}`;

function BudgetForm({ onClose, envelopes, sectors, onSave }: Omit<AdjustAllocationsModalProps, "open">) {
  // Keep inputs as strings so the user can clear a field; blank means "no budget".
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      BUDGET_CATEGORIES.map(({ category }) => {
        const env = envelopes.find((e) => e.category === category);
        return [category, env && env.allocatedAmount > 0 ? String(env.allocatedAmount) : ""];
      })
    )
  );

  const amountOf = (category: string) => {
    const n = parseFloat(values[category]);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  const spentOf = (category: string) => sectors.find((s) => s.category === category)?.amount ?? 0;
  const total = BUDGET_CATEGORIES.reduce((sum, c) => sum + amountOf(c.category), 0);
  const invalid = BUDGET_CATEGORIES.some((c) => values[c.category] !== "" && !(parseFloat(values[c.category]) >= 0));

  const handleSave = () => {
    onSave(BUDGET_CATEGORIES.map((c) => ({ category: c.category, amount: amountOf(c.category) })));
    onClose();
  };

  return (
    <>
      <DialogContent sx={{ pt: 0.5 }}>
        <Typography sx={{ fontSize: "0.8125rem", color: "#68717C", mb: 2 }}>
          Set a monthly limit for each category. Leave a field empty for no budget.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {BUDGET_CATEGORIES.map(({ category, label }) => {
            const budget = amountOf(category);
            const spent = spentOf(category);
            const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
            const over = budget > 0 && spent > budget;
            return (
              <Box
                key={category}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 170px" },
                  gap: { xs: 1, sm: 2 },
                  alignItems: "center",
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid rgba(17, 28, 46, 0.06)",
                  bgcolor: "rgba(247, 245, 239, 0.5)",
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#17202B" }}>{label}</Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: over ? "#8C3F3B" : "#68717C" }}>
                    Spent {money(spent)} this month
                    {budget > 0 && (over ? ` · over by ${money(spent - budget)}` : ` · ${money(budget - spent)} left`)}
                  </Typography>
                  {budget > 0 && (
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(pct, 100)}
                      sx={{
                        mt: 0.75,
                        height: 4,
                        borderRadius: 2,
                        bgcolor: "#EFECE2",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 2,
                          bgcolor: over ? "#8C3F3B" : pct >= 75 ? "#C4934A" : "#3F6853",
                        },
                      }}
                    />
                  )}
                </Box>
                <TextField
                  size="small"
                  type="number"
                  placeholder="No budget"
                  value={values[category]}
                  onChange={(e) => setValues((prev) => ({ ...prev, [category]: e.target.value }))}
                  slotProps={{
                    htmlInput: { min: 0, step: 500, inputMode: "decimal", "aria-label": `${label} monthly budget` },
                    input: {
                      startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                      sx: { bgcolor: "#FFFFFF", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: "0.875rem" },
                    },
                  }}
                />
              </Box>
            );
          })}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, px: 0.5 }}>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#17202B" }}>Total monthly budget</Typography>
          <Typography sx={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: "0.875rem", fontWeight: 600 }}>
            {money(total)}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: "#68717C", textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={invalid}
          sx={{ bgcolor: "#0B1628", color: "#FCFBF8", textTransform: "none", "&:hover": { bgcolor: "#162338" } }}
        >
          Save budgets
        </Button>
      </DialogActions>
    </>
  );
}

export default function AdjustAllocationsModal({ open, ...rest }: AdjustAllocationsModalProps) {
  return (
    <Dialog
      open={open}
      onClose={rest.onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: { sx: { borderRadius: 3, bgcolor: "#FCFBF8", border: "1px solid rgba(17, 28, 46, 0.08)" } },
      }}
    >
      <DialogTitle sx={{ fontSize: "1.125rem", fontWeight: 600, color: "#0B1628" }}>Monthly budgets</DialogTitle>
      {open && <BudgetForm {...rest} />}
    </Dialog>
  );
}
