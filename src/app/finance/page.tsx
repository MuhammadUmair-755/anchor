"use client";

import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import {
  Account,
  Transaction,
  CashflowVelocity,
  RecurringObligation,
  TransactionFilterCriteria,
  QuickEntryPayload,
} from "@/types/models";
import { financeService } from "@/services/financeService";
import {
  FinanceHeader,
  AccountsRibbon,
  LedgerSection,
  QuickEntryDock,
  CashflowVelocityCard,
  RecurringObligationsCard,
  AddTransactionModal,
} from "@/components/finance";

export default function FinancePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [velocity, setVelocity] = useState<CashflowVelocity | null>(null);
  const [recurring, setRecurring] = useState<RecurringObligation[]>([]);
  const [totalMonthlyObligations, setTotalMonthlyObligations] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Pagination State
  const [filterCriteria, setFilterCriteria] = useState<TransactionFilterCriteria>({
    selectedMonth: "2026-09",
    category: "all",
    accountId: "all",
    flowType: "all",
    searchQuery: "",
    sortBy: "date_desc",
    page: 1,
    pageSize: 8,
  });

  // Modal State
  const [addTransactionOpen, setAddTransactionOpen] = useState<boolean>(false);

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
      const [accs, txResponse, vel, recs] = await Promise.all([
        financeService.getAccounts(),
        financeService.getTransactions(filterCriteria),
        financeService.getCashflowVelocity(),
        financeService.getRecurringObligations(),
      ]);

      setAccounts(accs);
      setTransactions(txResponse.transactions);
      setTotalCount(txResponse.totalCount);
      setTotalPages(txResponse.totalPages);
      setVelocity(vel);
      setRecurring(recs);

      const sumObligations = recs.reduce((acc, curr) => acc + curr.amount, 0);
      setTotalMonthlyObligations(sumObligations);
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

  // Handle Quick Entry & Transaction Creation
  const handleCreateTransaction = async (payload: QuickEntryPayload) => {
    try {
      const newTx = await financeService.recordTransaction(payload);
      setSnackbar({
        open: true,
        message: `Transaction recorded: "${newTx.payeeOrPayer}" (Rs. ${Math.abs(newTx.amount).toLocaleString()})`,
        severity: "success",
      });
      // Refresh ledger & accounts
      await loadFinanceData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record transaction";
      setSnackbar({
        open: true,
        message: msg,
        severity: "error",
      });
    }
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

  // Calculate Total Net Capital across accounts
  const totalNetCapital = accounts.reduce((sum, acc) => sum + acc.balance, 0);

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
        px: { xs: 2, sm: 4, lg: 6 },
        pt: { xs: 3, lg: 4 },
        pb: 8,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {/* 1. Top Editorial Header & Philosophy */}
      <FinanceHeader
        selectedMonth={filterCriteria.selectedMonth || "2026-09"}
        onMonthChange={handleMonthChange}
        onExportCsv={handleExportCsv}
        onOpenAddTransaction={() => setAddTransactionOpen(true)}
      />

      {/* 2. Liquidity & Holdings Accounts Ribbon */}
      <AccountsRibbon accounts={accounts} totalNetCapital={totalNetCapital} />

      {/* 3. Main Working Split (Asymmetric 68% / 32% on desktop) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 4,
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

        {/* Right Column: Financial Intelligence & Fast Entry */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
          {/* Docked Quick Entry Panel */}
          <QuickEntryDock onSubmit={handleCreateTransaction} />

          {/* Monthly Cashflow Velocity */}
          {velocity && <CashflowVelocityCard velocity={velocity} />}

          {/* Recurring Obligations */}
          <RecurringObligationsCard
            obligations={recurring}
            totalMonthlyObligations={totalMonthlyObligations}
          />
        </Box>
      </Box>

      {/* Add Transaction Dialog */}
      <AddTransactionModal
        open={addTransactionOpen}
        onClose={() => setAddTransactionOpen(false)}
        onSubmit={handleCreateTransaction}
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
