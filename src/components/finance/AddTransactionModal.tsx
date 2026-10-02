"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { QuickEntryPayload, FlowType, TransactionCategory } from "@/types/models";

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: QuickEntryPayload) => Promise<void>;
}

export default function AddTransactionModal({
  open,
  onClose,
  onSubmit,
}: AddTransactionModalProps) {
  const [flowType, setFlowType] = useState<FlowType>("outflow");
  const [amount, setAmount] = useState<string>("");
  const [payee, setPayee] = useState<string>("");
  const [category, setCategory] = useState<string>("food_dining");
  const [accountId, setAccountId] = useState<string>("acc_bank_01");
  const [date, setDate] = useState<string>("2026-09-11");
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(cleanAmount) || cleanAmount <= 0) return;

    setSubmitting(true);
    try {
      const intent: "spent" | "received" | "moved" =
        flowType === "outflow" ? "spent" : flowType === "inflow" ? "received" : "moved";

      await onSubmit({
        intent,
        amount: cleanAmount,
        currency: "INR",
        category: category as TransactionCategory,
        accountId,
        date,
        memo: note ? `${payee ? payee + " · " : ""}${note}` : payee || undefined,
      });
      // Reset
      setAmount("");
      setPayee("");
      setNote("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: "#FCFBF8",
            border: "1px solid rgba(17, 28, 46, 0.12)",
            borderRadius: "12px",
            boxShadow: "0 12px 32px -4px rgba(11,22,40,0.12)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1.5,
          borderBottom: "1px solid rgba(17, 28, 46, 0.08)",
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            fontSize: "16px",
            fontWeight: 700,
            color: "#1B1C18",
          }}
        >
          Add Transaction
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "#75777D" }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2.5 }}>
          {/* Flow Type Toggle */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 0.5,
              bgcolor: "#F0EEE8",
              p: 0.5,
              borderRadius: "8px",
            }}
          >
            <Button
              size="small"
              onClick={() => setFlowType("outflow")}
              sx={{
                py: 0.75,
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: flowType === "outflow" ? 600 : 500,
                textTransform: "none",
                bgcolor: flowType === "outflow" ? "#111C2E" : "transparent",
                color: flowType === "outflow" ? "#FFFFFF" : "#45474C",
                boxShadow: flowType === "outflow" ? "0 1px 3px rgba(17,28,46,0.15)" : "none",
              }}
            >
              Outflow (-)
            </Button>
            <Button
              size="small"
              onClick={() => setFlowType("inflow")}
              sx={{
                py: 0.75,
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: flowType === "inflow" ? 600 : 500,
                textTransform: "none",
                bgcolor: flowType === "inflow" ? "#111C2E" : "transparent",
                color: flowType === "inflow" ? "#FFFFFF" : "#45474C",
                boxShadow: flowType === "inflow" ? "0 1px 3px rgba(17,28,46,0.15)" : "none",
              }}
            >
              Inflow (+)
            </Button>
            <Button
              size="small"
              onClick={() => setFlowType("transfer")}
              sx={{
                py: 0.75,
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: flowType === "transfer" ? 600 : 500,
                textTransform: "none",
                bgcolor: flowType === "transfer" ? "#111C2E" : "transparent",
                color: flowType === "transfer" ? "#FFFFFF" : "#45474C",
                boxShadow: flowType === "transfer" ? "0 1px 3px rgba(17,28,46,0.15)" : "none",
              }}
            >
              Transfer
            </Button>
          </Box>

          {/* Amount */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#75777D",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              }}
            >
              Amount (Rs.)
            </Typography>
            <TextField
              required
              fullWidth
              size="small"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ fontWeight: 600, color: "#75777D", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                        Rs.
                      </Typography>
                    </InputAdornment>
                  ),
                  sx: {
                    fontSize: "16px",
                    fontWeight: 700,
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    bgcolor: "#F7F5EF",
                    borderRadius: "8px",
                  },
                },
              }}
            />
          </Box>

          {/* Payee / Description */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#75777D",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              }}
            >
              Payee / Entity
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Acme Corp / Blue Tokai"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              slotProps={{
                input: {
                  sx: { fontSize: "13px", bgcolor: "#F7F5EF", borderRadius: "8px" },
                },
              }}
            />
          </Box>

          {/* Category & Account */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#75777D",
                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                }}
              >
                Category
              </Typography>
              <Select
                size="small"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                sx={{ fontSize: "13px", bgcolor: "#F7F5EF", borderRadius: "8px" }}
              >
                <MenuItem value="food_dining">Food &amp; Dining</MenuItem>
                <MenuItem value="housing_utilities">Housing &amp; Utilities</MenuItem>
                <MenuItem value="transport_transit">Transport &amp; Transit</MenuItem>
                <MenuItem value="shopping_gear">Shopping &amp; Gear</MenuItem>
                <MenuItem value="health_wellness">Health &amp; Wellness</MenuItem>
                <MenuItem value="knowledge_subs">Knowledge &amp; Subscriptions</MenuItem>
                <MenuItem value="consulting_inflow">Consulting Inflow</MenuItem>
                <MenuItem value="salary_payroll">Salary / Payroll</MenuItem>
              </Select>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#75777D",
                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                }}
              >
                Account
              </Typography>
              <Select
                size="small"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                sx={{ fontSize: "13px", bgcolor: "#F7F5EF", borderRadius: "8px" }}
              >
                <MenuItem value="acc_bank_01">Operating Bank ••4092</MenuItem>
                <MenuItem value="acc_cash_02">Physical Vault (Cash)</MenuItem>
                <MenuItem value="acc_vault_03">High-Yield Vault</MenuItem>
                <MenuItem value="acc_amex_04">Amex Platinum ••1042</MenuItem>
              </Select>
            </Box>
          </Box>

          {/* Date & Note */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#75777D",
                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                }}
              >
                Date
              </Typography>
              <TextField
                type="date"
                size="small"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                slotProps={{
                  input: {
                    sx: { fontSize: "13px", bgcolor: "#F7F5EF", borderRadius: "8px" },
                  },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#75777D",
                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                }}
              >
                Memo / Note
              </Typography>
              <TextField
                size="small"
                placeholder="Optional memo..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                slotProps={{
                  input: {
                    sx: { fontSize: "13px", bgcolor: "#F7F5EF", borderRadius: "8px" },
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1, borderTop: "1px solid rgba(17, 28, 46, 0.08)" }}>
          <Button onClick={onClose} sx={{ color: "#75777D", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              bgcolor: "#111C2E",
              color: "#FFFFFF",
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              "&:hover": { bgcolor: "#000000" },
            }}
          >
            {submitting ? "Recording..." : "Record Transaction"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
