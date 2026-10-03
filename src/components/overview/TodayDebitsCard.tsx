"use client";

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { TodayDebitItem } from "@/types/models";

export interface TodayDebitsCardProps {
  debits?: TodayDebitItem[];
  onLogExpense?: () => void;
  currency?: string;
}

export default function TodayDebitsCard({
  debits,
  onLogExpense,
  currency = "Rs.",
}: TodayDebitsCardProps) {
  const defaultDebits: TodayDebitItem[] = [
    {
      id: "debit-1",
      title: "Blue Tokai Coffee & Lunch",
      category: "Food · Cash wallet",
      paymentMethod: "Cash wallet",
      amount: 850,
      currency: "INR",
      time: "08:15 AM",
      icon: "local_cafe",
    },
    {
      id: "debit-2",
      title: "Metro & Uber Cab",
      category: "Transit · HDFC Bank",
      paymentMethod: "HDFC Bank",
      amount: 300,
      currency: "INR",
      time: "10:15 AM",
      icon: "local_taxi",
    },
    {
      id: "debit-3",
      title: "Technical Publication Sub",
      category: "Books · Amex Platinum",
      paymentMethod: "Amex Platinum",
      amount: 150,
      currency: "INR",
      time: "11:45 AM",
      icon: "menu_book",
    },
  ];

  const currentDebits = debits && debits.length > 0 ? debits : defaultDebits;
  const totalSum = currentDebits.reduce((acc, curr) => acc + curr.amount, 0);

  const getDebitIcon = (iconName: string) => {
    switch (iconName) {
      case "local_cafe":
        return <LocalCafeIcon sx={{ fontSize: 18, color: "#17202B" }} />;
      case "directions_car":
      case "local_taxi":
        return <DirectionsCarIcon sx={{ fontSize: 18, color: "#17202B" }} />;
      case "menu_book":
      default:
        return <MenuBookIcon sx={{ fontSize: 18, color: "#17202B" }} />;
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "#FCFBF8",
        borderRadius: 3,
        border: "1px solid rgba(17, 28, 46, 0.08)",
        boxShadow: "0 2px 8px -2px rgba(11, 22, 40, 0.03)",
        p: { xs: 1.75, sm: 2.5, md: 3 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 2,
            mb: 2,
            borderBottom: "1px solid rgba(17, 28, 46, 0.06)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ReceiptLongIcon sx={{ fontSize: 20, color: "#68717C" }} />
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: "0.9375rem", sm: "1.0625rem" },
                fontWeight: 600,
                color: "#17202B",
              }}
            >
              Today&apos;s Debits
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#0B1628",
              fontFeatureSettings: '"tnum" on, "zero" on',
            }}
          >
            Total: {currency} {totalSum.toLocaleString("en-IN")}
          </Typography>
        </Box>

        {/* Itemized Debit Entries */}
        <Stack spacing={1.5}>
          {currentDebits.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.25,
                borderRadius: 2,
                bgcolor: "rgba(240, 238, 232, 0.4)",
                border: "1px solid rgba(17, 28, 46, 0.04)",
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: "rgba(240, 238, 232, 0.7)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: "#EAE8E2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {getDebitIcon(item.icon)}
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      color: "#17202B",
                      lineHeight: 1.2,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.6875rem",
                      color: "#68717C",
                      mt: 0.25,
                    }}
                  >
                    {item.category}
                  </Typography>
                </Box>
              </Box>

              <Typography
                sx={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#0B1628",
                  fontFeatureSettings: '"tnum" on, "zero" on',
                }}
              >
                {currency} {item.amount.toLocaleString("en-IN")}
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>

      {/* Footer Quick Action */}
      <Box
        sx={{
          mt: 2.5,
          pt: 1.5,
          borderTop: "1px solid rgba(17, 28, 46, 0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontSize: "0.75rem", color: "#68717C" }}>
          {currentDebits.length} recorded transactions
        </Typography>

        <Button
          onClick={onLogExpense}
          startIcon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />}
          sx={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#40617E",
            textTransform: "none",
            "&:hover": {
              color: "#0B1628",
              bgcolor: "transparent",
              textDecoration: "underline",
            },
          }}
        >
          + Log Expense
        </Button>
      </Box>
    </Card>
  );
}
