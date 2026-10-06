"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

interface BalanceCardProps {
  balance: number;
  onAdjust: (delta: number) => Promise<void>;
}

export default function BalanceCard({ balance, onAdjust }: BalanceCardProps) {
  const [amount, setAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const parsed = parseFloat(amount.replace(/,/g, ""));
  const isValid = Number.isFinite(parsed) && parsed > 0;
  const isNegative = balance < 0;

  const handleAdjust = async (sign: 1 | -1) => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await onAdjust(sign * parsed);
      setAmount("");
    } finally {
      setSubmitting(false);
    }
  };

  const buttonSx = {
    px: 2,
    height: 40,
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    textTransform: "none",
    whiteSpace: "nowrap",
  } as const;

  return (
    <Card
      component="section"
      variant="outlined"
      sx={{
        bgcolor: "#FCFBF8",
        borderColor: "rgba(17, 28, 46, 0.08)",
        borderRadius: "12px",
        boxShadow: "0 2px 6px -1px rgba(11,22,40,0.03)",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          "&:last-child": { pb: { xs: 2, sm: 2.5 } },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#45474C",
            }}
          >
            Balance
          </Typography>
          <Typography
            data-testid="balance-amount"
            sx={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: { xs: "26px", sm: "32px" },
              fontWeight: 600,
              color: isNegative ? "#8C3F3B" : "#1B1C18",
              fontFeatureSettings: '"tnum" on, "zero" on',
              lineHeight: 1.2,
            }}
          >
            {isNegative ? "-" : ""}Rs. {Math.abs(balance).toLocaleString()}
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            handleAdjust(1);
          }}
          sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}
        >
          <TextField
            size="small"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            slotProps={{
              htmlInput: { inputMode: "decimal", "aria-label": "Balance adjustment amount" },
              input: {
                startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                sx: {
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: "14px",
                  bgcolor: "#F7F5EF",
                  borderRadius: "8px",
                  height: 40,
                },
              },
            }}
            sx={{ flex: { xs: "1 1 100%", sm: "0 1 200px" } }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || submitting}
            startIcon={<AddIcon />}
            sx={{ ...buttonSx, bgcolor: "#111C2E", "&:hover": { bgcolor: "#000000" } }}
          >
            Add funds
          </Button>
          <Button
            variant="outlined"
            disabled={!isValid || submitting}
            onClick={() => handleAdjust(-1)}
            startIcon={<RemoveIcon />}
            sx={{ ...buttonSx, color: "#8C3F3B", borderColor: "rgba(140, 63, 59, 0.4)" }}
          >
            Remove funds
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
