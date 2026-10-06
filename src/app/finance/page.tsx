"use client";

import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import {
  Transaction,
  CashflowVelocity,
  TransactionFilterCriteria,
} from "@/types/models";
import { financeService } from "@/services/financeService";
import { currentMonthKey } from "@/lib/calendar";
import {
  FinanceHeader,
  BalanceCard,
  AddTransactionModal,
  LedgerSection,
  CashflowVelocityCard,
} from "@/components/finance";

export default function FinancePage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [velocity, setVelocity] = useState<CashflowVelocity | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Pagination State
  const [filterCriteria, setFilterCriteria] = useState<TransactionFilterCriteria>({
    selectedMonth: currentMonthKey(),
    category: "all",
    flowType: "all",
    searchQuery: "",
    sortBy: "date_desc",
    page: 1,
    pageSize: 8,
  });

  // Snackbar Notification State
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "info" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Load Transactions & Auxiliary Finance Data
  const loadFinanceData = useCallback(async () => {
    try {
      const [bal, txResponse, vel] = await Promise.all([
        financeService.getBalance(),
        financeService.getTransactions(filterCriteria),
        financeService.getCashflowVelocity(),
      ]);

      setBalance(bal);
      setTransactions(txResponse.transactions);
      setTotalCount(txResponse.totalCount);
      setTotalPages(txResponse.totalPages);
      setVelocity(vel);
      setLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load financial records";
      setError(msg);
      setLoading(false);
    }
  }, [filterCriteria]);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  const [addTransactionOpen, setAddTransactionOpen] = useState<boolean>(false);

  const handleTransactionSaved = (tx: Transaction) => {
    setSnackbar({
      open: true,
      message: `Saved: ${tx.payeeOrPayer} (${tx.amount > 0 ? "+" : "-"}Rs. ${Math.abs(tx.amount).toLocaleString("en-IN")})`,
      severity: "success",
    });
    loadFinanceData();
  };

  // Handle Criteria Change
  const handleFilterChange = (newCriteria: Partial<TransactionFilterCriteria>) => {
    setFilterCriteria((prev) => ({
      ...prev,
      ...newCriteria,
    }));
  };

  // Handle Month Change
  const handleMonthChange = (month: string) => {
    setFilterCriteria((prev) => ({
      ...prev,
      selectedMonth: month,
      page: 1,
    }));
  };

  // Export CSV Handler
  const handleExportCsv = async () => {
    try {
      const csvData = await financeService.exportLedgerToCsv(filterCriteria);
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `anchor-ledger-${filterCriteria.selectedMonth || "all"}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: "Ledger export downloaded successfully",
        severity: "info",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to export CSV";
      setSnackbar({
        open: true,
        message: msg,
        severity: "error",
      });
    }
  };

  // Add / remove funds directly on the balance
  const handleAdjustBalance = async (delta: number) => {
    try {
      setBalance(await financeService.adjustBalance(delta));
      setSnackbar({
        open: true,
        message: `${delta > 0 ? "Added" : "Removed"} Rs. ${Math.abs(delta).toLocaleString()} ${delta > 0 ? "to" : "from"} balance`,
        severity: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update balance";
      setSnackbar({ open: true, message: msg, severity: "error" });
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: "#111C2E" }} />
        <Typography
          sx={{
            fontFamily: "var(--font-newsreader), Georgia, serif",
            fontStyle: "italic",
            color: "#75777D",
            fontSize: "16px",
          }}
        >
          Loading sovereign ledger &amp; treasury...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 6 }}>
        <Alert severity="error" sx={{ borderRadius: "8px" }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1440,
        width: "100%",
        mx: "auto",
        px: { xs: 0, sm: 1, lg: 2 },
        pt: { xs: 1, lg: 2 },
        pb: { xs: 4, lg: 6 },
        display: "flex",
        flexDirection: "column",
        gap: { xs: 2.5, sm: 3, md: 4 },
      }}
    >
      {/* 1. Top Editorial Header & Philosophy */}
      <FinanceHeader
        selectedMonth={filterCriteria.selectedMonth || currentMonthKey()}
        onMonthChange={handleMonthChange}
        onExportCsv={handleExportCsv}
        onAddTransaction={() => setAddTransactionOpen(true)}
      />

      {/* 2. Single Balance */}
      <BalanceCard balance={balance} onAdjust={handleAdjustBalance} />

      {/* 3. Main Working Split (Asymmetric 68% / 32% on desktop) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: { xs: 2.5, sm: 3, md: 4 },
          alignItems: "flex-start",
        }}
      >
        {/* Left Column: Ledger & Cashflow Stream */}
        <Box sx={{ minWidth: 0 }}>
          <LedgerSection
            transactions={transactions}
            totalCount={totalCount}
            currentPage={filterCriteria.page || 1}
            totalPages={totalPages}
            filterCriteria={filterCriteria}
            onFilterChange={handleFilterChange}
            onPageChange={(page) => handleFilterChange({ page })}
            onExportCsv={handleExportCsv}
          />
        </Box>

        {/* Right Column: Financial Intelligence */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
          {/* Monthly Cashflow Velocity */}
          {velocity && <CashflowVelocityCard velocity={velocity} />}
        </Box>
      </Box>

      <AddTransactionModal
        open={addTransactionOpen}
        onClose={() => setAddTransactionOpen(false)}
        onSuccess={handleTransactionSaved}
      />

      {/* Notification Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ borderRadius: "8px", boxShadow: "0 4px 12px rgba(11,22,40,0.12)" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
