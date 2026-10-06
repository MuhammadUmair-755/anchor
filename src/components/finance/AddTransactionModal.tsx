"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

import { QuickEntryPayload, Transaction, TransactionCategory } from "@/types/models";
import { financeService } from "@/services/financeService";

interface QuickEntryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (transaction: Transaction) => void;
  initialIntent?: "spent" | "received";
}

const CATEGORY_OPTIONS: { value: TransactionCategory; label: string }[] = [
  { value: "food_dining", label: "Food & Dining" },
  { value: "housing_utilities", label: "Housing & Utilities" },
  { value: "transport_transit", label: "Transport & Transit" },
  { value: "shopping_gear", label: "Shopping & Gear" },
  { value: "health_wellness", label: "Health & Wellness" },
  { value: "knowledge_subs", label: "Knowledge & Subscriptions" },
  { value: "consulting_inflow", label: "Consulting Inflow" },
  { value: "salary_payroll", label: "Salary / Payroll" },
  { value: "other", label: "Other / General" },
];

interface QuickEntryFormProps {
  initialIntent: "spent" | "received";
  onClose: () => void;
  onSuccess?: (transaction: Transaction) => void;
}

function QuickEntryForm({
  initialIntent,
  onClose,
  onSuccess,
}: QuickEntryFormProps) {
  const [intent, setIntent] = useState<"spent" | "received">(initialIntent);
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<TransactionCategory>("food_dining");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [memo, setMemo] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Please enter a valid amount greater than zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: QuickEntryPayload = {
        intent,
        amount: parsedAmount,
        currency: "INR",
        category,
        date: date || new Date().toISOString().slice(0, 10),
        memo: memo.trim() || undefined,
      };

      const newTx = await financeService.recordTransaction(payload);
      setAmount("");
      setMemo("");
      if (onSuccess) {
        onSuccess(newTx);
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to record transaction";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent sx={{ px: 3, py: 2 }}>
        <Stack spacing={2.5}>
          {/* Intent Switcher */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 1,
              p: 0.5,
              bgcolor: "#F0EEE8",
              borderRadius: 2,
            }}
          >
            <Button
              size="small"
              onClick={() => setIntent("spent")}
              startIcon={<ArrowDownwardIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: intent === "spent" ? "#FFFFFF" : "transparent",
                color: intent === "spent" ? "#8C3F3B" : "#68717C",
                boxShadow: intent === "spent" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                fontWeight: intent === "spent" ? 600 : 500,
                "&:hover": {
                  bgcolor: intent === "spent" ? "#FFFFFF" : "rgba(0,0,0,0.04)",
                },
              }}
            >
              I spent
            </Button>
            <Button
              size="small"
              onClick={() => setIntent("received")}
              startIcon={<ArrowUpwardIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: intent === "received" ? "#FFFFFF" : "transparent",
                color: intent === "received" ? "#3F6853" : "#68717C",
                boxShadow: intent === "received" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                fontWeight: intent === "received" ? 600 : 500,
                "&:hover": {
                  bgcolor: intent === "received" ? "#FFFFFF" : "rgba(0,0,0,0.04)",
                },
              }}
            >
              I received
            </Button>
          </Box>

          {/* Amount Field */}
          <Box>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography
                        sx={{
                          fontFamily: "var(--font-jetbrains-mono), monospace",
                          fontWeight: 600,
                          color: "#0B1628",
                        }}
                      >
                        Rs.
                      </Typography>
                    </InputAdornment>
                  ),
                  sx: {
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: "1.25rem",
                    fontWeight: 600,
                  },
                },
              }}
            />
          </Box>

          {/* Category & Date Grid */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              select
              fullWidth
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />
          </Box>

          {/* Memo / Description */}
          <TextField
            fullWidth
            label="Merchant / Note"
            placeholder="e.g. Blue Tokai Coffee Roasters"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />

          {errorMsg && (
            <Typography variant="body2" sx={{ color: "#8C3F3B", fontWeight: 500 }}>
              {errorMsg}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{
            px: 3,
            backgroundColor: "#0B1628",
            "&:hover": { backgroundColor: "#162338" },
          }}
        >
          {isSubmitting ? "Recording..." : "Save Transaction ↵"}
        </Button>
      </DialogActions>
    </form>
  );
}

export default function QuickEntryModal({
  open,
  onClose,
  onSuccess,
  initialIntent = "spent",
}: QuickEntryModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="quick-entry-dialog-title"
    >
      <DialogTitle
        id="quick-entry-dialog-title"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          pt: 2.5,
          px: 3,
        }}
      >
        <Box>
          <Typography
            component="span"
            sx={{
              fontFamily: "var(--font-newsreader), Georgia, serif",
              fontSize: "1.375rem",
              fontWeight: 500,
              color: "#0B1628",
              display: "block",
            }}
          >
            Add Transaction
          </Typography>
          <Typography variant="caption" sx={{ color: "#68717C" }}>
            Record money spent or received
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{ color: "#68717C" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {open && (
        <QuickEntryForm
          key={initialIntent}
          initialIntent={initialIntent}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Dialog>
  );
}
