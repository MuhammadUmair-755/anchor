"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import TuneIcon from "@mui/icons-material/Tune";
import { BudgetEnvelope } from "@/types/models";
import { overviewService } from "@/services/overviewService";

export interface AdjustAllocationsModalProps {
  open: boolean;
  onClose: () => void;
  envelopes: BudgetEnvelope[];
  onAllocationsUpdated: (updatedEnvelopes: BudgetEnvelope[]) => void;
}

interface AdjustAllocationsFormProps {
  onClose: () => void;
  envelopes: BudgetEnvelope[];
  onAllocationsUpdated: (updatedEnvelopes: BudgetEnvelope[]) => void;
}

function AdjustAllocationsForm({
  onClose,
  envelopes,
  onAllocationsUpdated,
}: AdjustAllocationsFormProps) {
  const [allocations, setAllocations] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    envelopes.forEach((env) => {
      initial[env.id] = env.allocatedAmount;
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleAmountChange = (envelopeId: string, val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ""), 10) || 0;
    setAllocations((prev) => ({
      ...prev,
      [envelopeId]: num,
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const updatedList: BudgetEnvelope[] = [];
      for (const env of envelopes) {
        const newAllocated = allocations[env.id] ?? env.allocatedAmount;
        const updated = await overviewService.updateBudgetEnvelope(env.id, newAllocated);
        updatedList.push(updated);
      }
      onAllocationsUpdated(updatedList);
      onClose();
    } catch (err) {
      console.error("Failed to update envelope allocations:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#68717C", mb: 3 }}>
          Update envelope thresholds for September 2026. Changes recalculate burn rates and buffer runway immediately.
        </Typography>

        <Stack spacing={2.5}>
          {envelopes.map((env) => {
            const currentAllocated = allocations[env.id] ?? env.allocatedAmount;
            const spent = env.spentAmount;
            const newPercentage =
              currentAllocated > 0 ? Math.round((spent / currentAllocated) * 100) : 100;
            const newBuffer = Math.max(0, currentAllocated - spent);

            return (
              <Box
                key={env.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(247, 245, 239, 0.5)",
                  border: "1px solid rgba(17, 28, 46, 0.06)",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#17202B" }}>
                    {env.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: "0.75rem",
                      color: "#68717C",
                    }}
                  >
                    Spent: Rs. {spent.toLocaleString("en-IN")}
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  label="Monthly Allocation Ceiling"
                  value={currentAllocated.toLocaleString("en-IN")}
                  onChange={(e) => handleAmountChange(env.id, e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography
                            sx={{
                              fontFamily: "var(--font-jetbrains-mono), monospace",
                              fontSize: "0.8125rem",
                              color: "#68717C",
                            }}
                          >
                            Rs.
                          </Typography>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#FFFFFF",
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: "0.875rem",
                    },
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                    fontSize: "0.6875rem",
                    color: "#68717C",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      color: newPercentage >= 90 ? "#C76D68" : "#3F6853",
                    }}
                  >
                    Burn: {newPercentage}%
                  </Typography>
                  <Typography sx={{ fontSize: "0.6875rem", color: "#68717C" }}>
                    Buffer: Rs. {newBuffer.toLocaleString("en-IN")}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button onClick={onClose} disabled={isSubmitting} sx={{ color: "#68717C" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isSubmitting}
          sx={{
            bgcolor: "#0B1628",
            color: "#FCFBF8",
            "&:hover": { bgcolor: "#162338" },
          }}
        >
          {isSubmitting ? "Saving..." : "Save Allocations"}
        </Button>
      </DialogActions>
    </>
  );
}

export default function AdjustAllocationsModal({
  open,
  onClose,
  envelopes,
  onAllocationsUpdated,
}: AdjustAllocationsModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            bgcolor: "#FCFBF8",
            border: "1px solid rgba(17, 28, 46, 0.08)",
            p: 1,
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <TuneIcon sx={{ fontSize: 20, color: "#0B1628" }} />
        <Typography component="span" variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600, color: "#0B1628" }}>
          Adjust Budget Allocations
        </Typography>
      </DialogTitle>

      {open && (
        <AdjustAllocationsForm
          envelopes={envelopes}
          onClose={onClose}
          onAllocationsUpdated={onAllocationsUpdated}
        />
      )}
    </Dialog>
  );
}
