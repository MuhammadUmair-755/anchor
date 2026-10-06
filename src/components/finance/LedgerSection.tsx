"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HomeIcon from "@mui/icons-material/Home";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import { Transaction, TransactionFilterCriteria, FlowType, TransactionCategory } from "@/types/models";

interface LedgerSectionProps {
  transactions: Transaction[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  filterCriteria: TransactionFilterCriteria;
  onFilterChange: (newCriteria: Partial<TransactionFilterCriteria>) => void;
  onPageChange: (newPage: number) => void;
  onExportCsv: () => void;
}

export default function LedgerSection({
  transactions,
  totalCount,
  currentPage,
  totalPages,
  filterCriteria,
  onFilterChange,
  onPageChange,
  onExportCsv,
}: LedgerSectionProps) {
  const categories = [
    { key: "all", label: "All" },
    { key: "food_dining", label: "Food & Dining" },
    { key: "housing_utilities", label: "Housing & Utilities" },
    { key: "transport_transit", label: "Transport" },
    { key: "shopping_gear", label: "Shopping" },
    { key: "knowledge_subs", label: "Subscriptions" },
  ];

  const flowTypes: { key: FlowType | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "inflow", label: "Inflow (+)" },
    { key: "outflow", label: "Outflow (-)" },
  ];

  // Resolve category icon
  const getCategoryIcon = (category: string, flowType: FlowType) => {
    if (flowType === "inflow") {
      return <TrendingUpIcon sx={{ fontSize: 18 }} />;
    }
    switch (category) {
      case "food_dining":
        return <RestaurantIcon sx={{ fontSize: 18 }} />;
      case "transport_transit":
        return <DirectionsCarIcon sx={{ fontSize: 18 }} />;
      case "knowledge_subs":
        return <AutoStoriesIcon sx={{ fontSize: 18 }} />;
      case "shopping_gear":
        return <ShoppingBasketIcon sx={{ fontSize: 18 }} />;
      case "housing_utilities":
        return <HomeIcon sx={{ fontSize: 18 }} />;
      case "health_wellness":
        return <FitnessCenterIcon sx={{ fontSize: 18 }} />;
      case "salary_payroll":
        return <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />;
      default:
        return <LocalAtmIcon sx={{ fontSize: 18 }} />;
    }
  };

  // Group transactions by date
  const groupedTransactions: { [dateStr: string]: Transaction[] } = {};
  transactions.forEach((tx) => {
    const key = tx.date;
    if (!groupedTransactions[key]) {
      groupedTransactions[key] = [];
    }
    groupedTransactions[key].push(tx);
  });

  const formatGroupHeader = (dateStr: string) => {
    if (dateStr === "2026-09-11") return "TODAY — FRIDAY, SEP 11";
    if (dateStr === "2026-09-10") return "YESTERDAY — THURSDAY, SEP 10";
    if (dateStr === "2026-09-08") return "EARLIER THIS WEEK — TUESDAY, SEP 08";
    if (dateStr === "2026-09-01") return "SEPTEMBER 01";
    return dateStr;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Ledger Header & Multi-level Filter Controls */}
      <Box
        sx={{
          bgcolor: "#FCFBF8",
          border: "1px solid rgba(17, 28, 46, 0.08)",
          borderRadius: "12px",
          p: { xs: 1.5, sm: 2.5 },
          boxShadow: "0 1px 3px rgba(17, 28, 46, 0.03)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          minWidth: 0,
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: "15px",
                fontWeight: 700,
                color: "#1B1C18",
                letterSpacing: "0.02em",
              }}
            >
              THE LEDGER &amp; CASHFLOW
            </Typography>
            <Box
              sx={{
                px: 1.5,
                py: 0.2,
                borderRadius: "9999px",
                bgcolor: "#F0EEE8",
                color: "#45474C",
                fontSize: "11px",
                fontWeight: 600,
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}
            >
              {totalCount} total
            </Box>
          </Box>

          {/* Quick Search & Sort */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <TextField
              size="small"
              placeholder="Filter records..."
              value={filterCriteria.searchQuery || ""}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value, page: 1 })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 16, color: "#75777D" }} />
                    </InputAdornment>
                  ),
                  sx: {
                    fontSize: "12px",
                    bgcolor: "#F7F5EF",
                    borderRadius: "8px",
                    "& fieldset": { borderColor: "rgba(17, 28, 46, 0.08)" },
                  },
                },
              }}
              sx={{ width: { xs: "100%", sm: 170 } }}
            />

            <Select
              size="small"
              value={filterCriteria.sortBy || "date_desc"}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as TransactionFilterCriteria["sortBy"], page: 1 })}
              sx={{
                fontSize: "12px",
                bgcolor: "#F7F5EF",
                borderRadius: "8px",
                "& fieldset": { borderColor: "rgba(17, 28, 46, 0.08)" },
              }}
            >
              <MenuItem value="date_desc">Date (Newest)</MenuItem>
              <MenuItem value="date_asc">Date (Oldest)</MenuItem>
              <MenuItem value="amount_desc">Amount (High to Low)</MenuItem>
              <MenuItem value="amount_asc">Amount (Low to High)</MenuItem>
            </Select>
          </Box>
        </Box>

        <Box sx={{ height: "1px", bgcolor: "rgba(17, 28, 46, 0.08)" }} />

        {/* Filter Trays: Categories */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0, maxWidth: "100%" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              overflowX: "auto",
              maxWidth: "100%",
              width: "100%",
              minWidth: 0,
              pb: 0.5,
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 700,
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#75777D",
                mr: 0.5,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Category:
            </Typography>
            {categories.map((cat) => {
              const isSelected = (filterCriteria.category || "all") === cat.key;
              return (
                <Button
                  key={cat.key}
                  size="small"
                  onClick={() => onFilterChange({ category: cat.key as TransactionCategory | "all", page: 1 })}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: isSelected ? 600 : 500,
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    bgcolor: isSelected ? "#111C2E" : "#F0EEE8",
                    color: isSelected ? "#FFFFFF" : "#45474C",
                    boxShadow: isSelected ? "0 1px 3px rgba(17,28,46,0.15)" : "none",
                    "&:hover": {
                      bgcolor: isSelected ? "#000000" : "#E4E2DD",
                    },
                  }}
                >
                  {cat.label}
                </Button>
              );
            })}
          </Box>

          {/* Flow Type Bar */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "flex-end",
              gap: 1.5,
              pt: 1,
              borderTop: "1px solid rgba(17, 28, 46, 0.05)",
              minWidth: 0,
              maxWidth: "100%",
            }}
          >
            {/* Inflow / Outflow Flow Type Segmented Toggle */}
            <Box
              sx={{
                display: "inline-flex",
                bgcolor: "#F0EEE8",
                p: 0.5,
                borderRadius: "8px",
                maxWidth: "100%",
                overflowX: "auto",
                flexShrink: 0,
                alignSelf: { xs: "flex-start", sm: "auto" },
              }}
            >
              {flowTypes.map((ft) => {
                const isSelected = (filterCriteria.flowType || "all") === ft.key;
                return (
                  <Button
                    key={ft.key}
                    size="small"
                    onClick={() => onFilterChange({ flowType: ft.key, page: 1 })}
                    sx={{
                      px: 1.5,
                      py: 0.3,
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: isSelected ? 600 : 500,
                      textTransform: "none",
                      whiteSpace: "nowrap",
                      bgcolor: isSelected ? "#FCFBF8" : "transparent",
                      color: isSelected ? "#1B1C18" : "#45474C",
                      boxShadow: isSelected ? "0 1px 2px rgba(17,28,46,0.06)" : "none",
                      "&:hover": {
                        bgcolor: isSelected ? "#FFFFFF" : "rgba(17,28,46,0.04)",
                      },
                    }}
                  >
                    {ft.label}
                  </Button>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Transaction Stream Container */}
      <Box
        sx={{
          bgcolor: "#FCFBF8",
          border: "1px solid rgba(17, 28, 46, 0.08)",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(17, 28, 46, 0.03)",
        }}
      >
        {Object.keys(groupedTransactions).length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#75777D" }}>
              No transactions match the selected filter criteria.
            </Typography>
          </Box>
        ) : (
          Object.entries(groupedTransactions).map(([dateStr, items]) => {
            // Compute group balance delta
            const groupSum = items.reduce((sum, item) => {
              return sum + item.amount; // amounts are already signed
            }, 0);
            const isGroupPositive = groupSum >= 0;

            return (
              <Box key={dateStr} sx={{ borderBottom: "1px solid rgba(17, 28, 46, 0.08)" }}>
                {/* Date Group Header */}
                <Box
                  sx={{
                    px: { xs: 1.5, sm: 2.5, md: 3 },
                    py: 1.5,
                    bgcolor: "rgba(245, 243, 237, 0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(17, 28, 46, 0.04)",
                  }}
                >
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
                    {formatGroupHeader(dateStr)}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: isGroupPositive ? "#3F6853" : "#45474C",
                      fontFeatureSettings: '"tnum" on, "zero" on',
                    }}
                  >
                    {isGroupPositive ? `Net: +Rs. ${groupSum.toLocaleString()}` : `Outflow: -Rs. ${Math.abs(groupSum).toLocaleString()}`}
                  </Typography>
                </Box>

                {/* Items in this date group */}
                <Box sx={{ divideY: "1px solid rgba(17, 28, 46, 0.05)" }}>
                  {items.map((tx) => {
                    const isInflow = tx.flowType === "inflow";
                    return (
                      <Box
                        key={tx.id}
                        sx={{
                          px: { xs: 1.5, sm: 2.5, md: 3 },
                          py: { xs: 1.5, sm: 2 },
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          bgcolor: isInflow ? "rgba(95, 146, 119, 0.04)" : "transparent",
                          transition: "background-color 0.15s",
                          "&:hover": {
                            bgcolor: isInflow
                              ? "rgba(95, 146, 119, 0.08)"
                              : "rgba(245, 243, 237, 0.5)",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.25, sm: 2 }, minWidth: 0, mr: 1 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "8px",
                              bgcolor: isInflow ? "rgba(95, 146, 119, 0.15)" : "#F0EEE8",
                              color: isInflow ? "#3F6853" : "#45474C",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {getCategoryIcon(tx.category, tx.flowType)}
                          </Box>
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography
                                sx={{
                                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: "#1B1C18",
                                }}
                              >
                                {tx.payeeOrPayer}
                              </Typography>
                              {tx.note && (
                                <Box
                                  sx={{
                                    px: 1,
                                    py: 0.1,
                                    borderRadius: "4px",
                                    bgcolor: isInflow ? "rgba(95, 146, 119, 0.2)" : "#F0EEE8",
                                    color: isInflow ? "#3F6853" : "#75777D",
                                    fontSize: "10px",
                                    fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                                  }}
                                >
                                  {tx.note}
                                </Box>
                              )}
                            </Box>
                            <Typography
                              sx={{
                                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                                fontSize: "12px",
                                color: "#75777D",
                              }}
                            >
                              {tx.categoryLabel}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            sx={{
                              fontFamily: "var(--font-jetbrains-mono), monospace",
                              fontSize: "14px",
                              fontWeight: isInflow ? 700 : 600,
                              color: isInflow ? "#3F6853" : "#1B1C18",
                              fontFeatureSettings: '"tnum" on, "zero" on',
                            }}
                          >
                            {isInflow ? "+" : "-"}Rs. {Math.abs(tx.amount).toLocaleString()}
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                              fontSize: "11px",
                              color: "#75777D",
                            }}
                          >
                            {tx.time}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })
        )}

        {/* Pagination & Filter Summary Footer */}
        <Box
          sx={{
            p: 2,
            bgcolor: "#FCFBF8",
            borderTop: "1px solid rgba(17, 28, 46, 0.08)",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#45474C", fontSize: "12px" }}>
            <FilterAltIcon sx={{ fontSize: 16 }} />
            <span>
              Showing <strong>{transactions.length}</strong> of <strong>{totalCount}</strong> transactions
            </span>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isActive = pageNum === currentPage;
                return (
                  <Button
                    key={pageNum}
                    size="small"
                    onClick={() => onPageChange(pageNum)}
                    sx={{
                      minWidth: 28,
                      height: 28,
                      p: 0,
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: isActive ? 700 : 500,
                      bgcolor: isActive ? "#111C2E" : "transparent",
                      color: isActive ? "#FFFFFF" : "#45474C",
                      "&:hover": {
                        bgcolor: isActive ? "#000000" : "#F0EEE8",
                      },
                    }}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </Box>

            <Box sx={{ width: 1, height: 16, bgcolor: "rgba(17, 28, 46, 0.15)" }} />

            <Button
              size="small"
              onClick={onExportCsv}
              endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#1B1C18",
                textTransform: "none",
                p: 0.5,
                "&:hover": {
                  color: "#40617E",
                  bgcolor: "transparent",
                  textDecoration: "underline",
                },
              }}
            >
              Download statement
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
