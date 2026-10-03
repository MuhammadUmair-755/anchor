"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import SyncIcon from "@mui/icons-material/Sync";
import CloudIcon from "@mui/icons-material/Cloud";
import TerminalIcon from "@mui/icons-material/Terminal";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PaymentIcon from "@mui/icons-material/Payment";
import { RecurringObligation } from "@/types/models";

interface RecurringObligationsCardProps {
  obligations: RecurringObligation[];
  totalMonthlyObligations: number;
}

export default function RecurringObligationsCard({
  obligations,
  totalMonthlyObligations,
}: RecurringObligationsCardProps) {
  const getObligationIcon = (name: string) => {
    if (name.toLowerCase().includes("aws") || name.toLowerCase().includes("cloud")) {
      return <CloudIcon sx={{ fontSize: 16 }} />;
    }
    if (name.toLowerCase().includes("bloomberg") || name.toLowerCase().includes("terminal")) {
      return <TerminalIcon sx={{ fontSize: 16 }} />;
    }
    if (name.toLowerCase().includes("lease") || name.toLowerCase().includes("rent")) {
      return <HomeWorkIcon sx={{ fontSize: 16 }} />;
    }
    return <PaymentIcon sx={{ fontSize: 16 }} />;
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
      <CardContent sx={{ p: { xs: 1.75, sm: 2.5 }, "&:last-child": { pb: { xs: 1.75, sm: 2.5 } } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1.5,
            borderBottom: "1px solid rgba(17, 28, 46, 0.08)",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SyncIcon sx={{ fontSize: 18, color: "#1B1C18" }} />
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                color: "#1B1C18",
              }}
            >
              Recurring Obligations
            </Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "12px",
              fontWeight: 600,
              color: "#1B1C18",
              fontFeatureSettings: '"tnum" on, "zero" on',
            }}
          >
            Rs. {totalMonthlyObligations.toLocaleString()}/mo
          </Typography>
        </Box>

        {/* Obligations List */}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {obligations.map((item, idx) => (
            <Box
              key={item.id}
              sx={{
                py: 1.5,
                borderBottom:
                  idx === obligations.length - 1
                    ? "none"
                    : "1px solid rgba(17, 28, 46, 0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "6px",
                    bgcolor: "#F0EEE8",
                    color: "#45474C",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {getObligationIcon(item.name)}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#1B1C18",
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                      fontSize: "10px",
                      color: item.status === "alert" ? "#C4934A" : "#75777D",
                    }}
                  >
                    {item.renewalNotice}
                  </Typography>
                </Box>
              </Box>

              <Typography
                sx={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#1B1C18",
                  fontFeatureSettings: '"tnum" on, "zero" on',
                }}
              >
                Rs. {item.amount.toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            pt: 1.5,
            mt: 0.5,
            borderTop: "1px solid rgba(17, 28, 46, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "11px",
            color: "#75777D",
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
          }}
        >
          <span>All debits tokenized &amp; verified</span>
          <Button
            size="small"
            sx={{
              p: 0,
              fontSize: "11px",
              fontWeight: 600,
              color: "#1B1C18",
              textTransform: "none",
              "&:hover": {
                color: "#40617E",
                bgcolor: "transparent",
                textDecoration: "underline",
              },
            }}
          >
            Manage →
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
