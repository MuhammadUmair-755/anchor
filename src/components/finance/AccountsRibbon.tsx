"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentsIcon from "@mui/icons-material/Payments";
import LockIcon from "@mui/icons-material/Lock";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HistoryIcon from "@mui/icons-material/History";
import PercentIcon from "@mui/icons-material/Percent";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { Account } from "@/types/models";

interface AccountsRibbonProps {
  accounts: Account[];
  totalNetCapital: number;
}

export default function AccountsRibbon({
  accounts,
  totalNetCapital,
}: AccountsRibbonProps) {
  // Helper to resolve icon by account type
  const getAccountIcon = (type: Account["type"]) => {
    switch (type) {
      case "checking":
        return <AccountBalanceIcon sx={{ fontSize: 20 }} />;
      case "cash":
        return <PaymentsIcon sx={{ fontSize: 20 }} />;
      case "savings":
        return <LockIcon sx={{ fontSize: 20 }} />;
      case "credit":
        return <CreditCardIcon sx={{ fontSize: 20 }} />;
      default:
        return <AccountBalanceIcon sx={{ fontSize: 20 }} />;
    }
  };

  return (
    <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Section Header */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#45474C",
            }}
          >
            LIQUIDITY &amp; HOLDINGS
          </Typography>

          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.3,
              borderRadius: "9999px",
              bgcolor: "#F0EEE8",
              border: "1px solid rgba(17, 28, 46, 0.05)",
              color: "#45474C",
              fontSize: "11px",
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "#5F9277",
              }}
            />
            <span>Reconciled 10m ago</span>
          </Box>
        </Box>

        {/* Total Net Capital Badge */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "#FCFBF8",
            border: "1px solid rgba(17, 28, 46, 0.08)",
            px: 2,
            py: 0.75,
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(17, 28, 46, 0.03)",
          }}
        >
          <Typography
            sx={{
              fontSize: "11px",
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#45474C",
            }}
          >
            Total Net Capital:
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "14px",
              fontWeight: 600,
              color: "#1B1C18",
              fontFeatureSettings: '"tnum" on, "zero" on',
            }}
          >
            Rs. {totalNetCapital.toLocaleString()}
          </Typography>
        </Box>
      </Box>

      {/* Grid of 4 Distinct Account Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
        }}
      >
        {accounts.map((acc) => {
          const isNegative = acc.balance < 0;
          return (
            <Box key={acc.id} sx={{ height: "100%" }}>
              <Card
                variant="outlined"
                sx={{
                  bgcolor: "#FCFBF8",
                  borderColor: "rgba(17, 28, 46, 0.08)",
                  borderRadius: "12px",
                  boxShadow: "0 2px 6px -1px rgba(11,22,40,0.03)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "border-color 0.2s, transform 0.2s",
                  "&:hover": {
                    borderColor: "rgba(17, 28, 46, 0.2)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "8px",
                          bgcolor: "#F0EEE8",
                          color: "#1B1C18",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {getAccountIcon(acc.type)}
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#1B1C18",
                            lineHeight: 1.2,
                          }}
                        >
                          {acc.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                            fontSize: "11px",
                            color: "#75777D",
                          }}
                        >
                          {acc.institution} {acc.accountNumberMasked}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Tag badge */}
                    <Box
                      sx={{
                        px: 1,
                        py: 0.2,
                        borderRadius: "4px",
                        bgcolor:
                          acc.type === "credit"
                            ? "rgba(199, 109, 104, 0.1)"
                            : "#F0EEE8",
                        color: acc.type === "credit" ? "#8C3F3B" : "#1B1C18",
                        fontSize: "10px",
                        fontWeight: 600,
                        fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {acc.type.toUpperCase()}
                    </Box>
                  </Box>

                  {/* Divider and Balance Section */}
                  <Box
                    sx={{
                      mt: 2,
                      pt: 1.5,
                      borderTop: "1px solid rgba(17, 28, 46, 0.08)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "var(--font-jetbrains-mono), monospace",
                          fontSize: "20px",
                          fontWeight: 600,
                          color: isNegative ? "#8C3F3B" : "#1B1C18",
                          fontFeatureSettings: '"tnum" on, "zero" on',
                        }}
                      >
                        {isNegative ? "-" : ""}Rs.{" "}
                        {Math.abs(acc.balance).toLocaleString()}
                      </Typography>

                      {acc.creditLimit && (
                        <Typography
                          sx={{
                            fontFamily: "var(--font-jetbrains-mono), monospace",
                            fontSize: "11px",
                            color: "#75777D",
                          }}
                        >
                          / Rs. {acc.creditLimit.toLocaleString()}
                        </Typography>
                      )}
                    </Box>

                    {/* Subtitle / Micro status */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mt: 0.5,
                        fontSize: "11px",
                        color: acc.trendLabel?.includes("+")
                          ? "#3F6853"
                          : "#75777D",
                        fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                      }}
                    >
                      {acc.type === "checking" && (
                        <TrendingUpIcon sx={{ fontSize: 13 }} />
                      )}
                      {acc.type === "cash" && <HistoryIcon sx={{ fontSize: 13 }} />}
                      {acc.type === "savings" && <PercentIcon sx={{ fontSize: 13 }} />}
                      {acc.type === "credit" && <ScheduleIcon sx={{ fontSize: 13 }} />}
                      <span>{acc.trendLabel}</span>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
