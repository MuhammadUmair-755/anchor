"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import { QuickEntryPayload, FlowType, TransactionCategory } from "@/types/models";

interface QuickEntryDockProps {
  onSubmit: (payload: QuickEntryPayload) => Promise<void>;
}

export default function QuickEntryDock({ onSubmit }: QuickEntryDockProps) {
  const [flowType, setFlowType] = useState<FlowType>("outflow");
  const [amount, setAmount] = useState<string>("2,500");
  const [category, setCategory] = useState<TransactionCategory>("food_dining");
  const [accountId, setAccountId] = useState<string>("acc_cash_02");
  const [date, setDate] = useState<string>("Today (Sep 11, 2026)");
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanAmount = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(cleanAmount) || cleanAmount <= 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        intent: flowType === "outflow" ? "spent" : flowType === "inflow" ? "received" : "moved",
        amount: cleanAmount,
        currency: "INR",
        category,
        accountId,
        date: "2026-09-11",
        memo: note.trim() || undefined,
      });
      // Clear form
      setAmount("");
      setNote("");
    } finally {
      setSubmitting(false);
    }
  };

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
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
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
            <EditSquareIcon sx={{ fontSize: 18, color: "#1B1C18" }} />
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                color: "#1B1C18",
              }}
            >
              Quick Entry
            </Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "11px",
              color: "#75777D",
            }}
          >
            ESC to clear
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Segmented Intent Toggle */}
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
                  "&:hover": {
                    bgcolor: flowType === "outflow" ? "#000000" : "rgba(17,28,46,0.04)",
                  },
                }}
              >
                I spent
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
                  "&:hover": {
                    bgcolor: flowType === "inflow" ? "#000000" : "rgba(17,28,46,0.04)",
                  },
                }}
              >
                I received
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
                  "&:hover": {
                    bgcolor: flowType === "transfer" ? "#000000" : "rgba(17,28,46,0.04)",
                  },
                }}
              >
                I moved
              </Button>
            </Box>

            {/* Currency Amount Input */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
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
                Amount
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography
                          sx={{
                            fontFamily: "var(--font-jetbrains-mono), monospace",
                            fontSize: "15px",
                            fontWeight: 600,
                            color: "#75777D",
                          }}
                        >
                          Rs.
                        </Typography>
                      </InputAdornment>
                    ),
                    sx: {
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: "18px",
                      fontWeight: 700,
                      bgcolor: "#F7F5EF",
                      borderRadius: "8px",
                      "& fieldset": { borderColor: "rgba(17, 28, 46, 0.08)" },
                      fontFeatureSettings: '"tnum" on, "zero" on',
                    },
                  },
                }}
              />
            </Box>

            {/* Category & Account Selects Grid */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
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
                  Category
                </Typography>
                <Select
                  size="small"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                  sx={{
                    fontSize: "12px",
                    bgcolor: "#F7F5EF",
                    borderRadius: "8px",
                    "& fieldset": { borderColor: "rgba(17, 28, 46, 0.08)" },
                  }}
                >
                  <MenuItem value="food_dining">Food &amp; Dining</MenuItem>
                  <MenuItem value="transport_transit">Transport</MenuItem>
                  <MenuItem value="housing_utilities">Housing</MenuItem>
                  <MenuItem value="knowledge_subs">Knowledge</MenuItem>
                  <MenuItem value="health_wellness">Wellness</MenuItem>
                  <MenuItem value="shopping_gear">Shopping</MenuItem>
                </Select>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
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
                  Account
                </Typography>
                <Select
                  size="small"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  sx={{
                    fontSize: "12px",
                    bgcolor: "#F7F5EF",
                    borderRadius: "8px",
                    "& fieldset": { borderColor: "rgba(17, 28, 46, 0.08)" },
                  }}
                >
                  <MenuItem value="acc_cash_02">Cash Wallet</MenuItem>
                  <MenuItem value="acc_bank_01">Primary Bank ••4092</MenuItem>
                  <MenuItem value="acc_amex_04">Amex Platinum ••1042</MenuItem>
                  <MenuItem value="acc_vault_03">High-Yield Vault</MenuItem>
                </Select>
              </Box>
            </Box>

            {/* Date & Note Inputs */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
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
                  Date
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  slotProps={{
                    input: {
                      sx: {
                        fontSize: "12px",
                        bgcolor: "#F7F5EF",
                        borderRadius: "8px",
                        "& fieldset": { borderColor: "rgba(17, 28, 46, 0.08)" },
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
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
                  Note / Memo
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Dinner with founders at Aer..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  slotProps={{
                    input: {
                      sx: {
                        fontSize: "12px",
                        bgcolor: "#F7F5EF",
                        borderRadius: "8px",
                        "& fieldset": { borderColor: "rgba(17, 28, 46, 0.08)" },
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Submit Action */}
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              fullWidth
              sx={{
                bgcolor: "#111C2E",
                color: "#FFFFFF",
                py: 1.25,
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                "&:hover": {
                  bgcolor: "#000000",
                },
              }}
            >
              <span>{submitting ? "Recording..." : "Record Entry"}</span>
              <Box
                component="span"
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  px: 1,
                  py: 0.2,
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              >
                Enter ↵
              </Box>
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
}
