"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import {
  Transaction,
  CashflowVelocity,
  TransactionFilterCriteria,
  QuickEntryPayload,
} from "@/types/models";
import { financeService, CATEGORY_LABELS } from "@/services/financeService";
import { currentMonthKey } from "@/lib/calendar";
import {
  FinanceHeader,
  BalanceCard,
  AddTransactionModal,
  LedgerSection,
  CashflowVelocityCard,
} from "@/components/finance";

const errorText = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

export default function FinancePage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [velocity, setVelocity] = useState<CashflowVelocity | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [txLoading, setTxLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [addTransactionOpen, setAddTransactionOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

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
  const notify = (message: string, severity: "success" | "info" | "error" = "success") =>
    setSnackbar({ open: true, message, severity });

  // Balance + velocity load once; the ledger reloads on every filter change.
  useEffect(() => {
    Promise.all([financeService.getBalance(), financeService.getCashflowVelocity()])
      .then(([bal, vel]) => {
        setBalance(bal);
        setVelocity(vel);
      })
      .catch((err: unknown) => setError(errorText(err, "Failed to load financial records")))
      .finally(() => setLoading(false));
  }, []);

  // Only the latest request may write state, so fast filter clicks never show stale rows.
  const txRequest = useRef(0);
  const loadTransactions = useCallback(async (criteria: TransactionFilterCriteria, silent = false) => {
    const req = ++txRequest.current;
    if (!silent) setTxLoading(true);
    try {
      const res = await financeService.getTransactions(criteria);
      if (req !== txRequest.current) return;
      setTransactions(res.transactions);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
    } catch (err: unknown) {
      if (req === txRequest.current) {
        setSnackbar({ open: true, message: errorText(err, "Failed to load transactions"), severity: "error" });
      }
    } finally {
      if (req === txRequest.current) setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions(filterCriteria);
  }, [filterCriteria, loadTransactions]);

  // After a confirmed write, quietly re-sync pagination and velocity with the server.
  const resync = () => {
    loadTransactions(filterCriteria, true);
    financeService.getCashflowVelocity().then(setVelocity).catch(() => {});
  };

  // Optimistic: the row and balance update instantly, and roll back if the server refuses.
  const handleAddTransaction = async (entry: QuickEntryPayload) => {
    const amount = entry.intent === "received" ? entry.amount : -entry.amount;
    const temp: Transaction = {
      id: `temp-${Date.now()}`,
      amount,
      currency: entry.currency,
      flowType: entry.intent === "received" ? "inflow" : "outflow",
      category: entry.category,
      categoryLabel: CATEGORY_LABELS[entry.category] || entry.category,
      payeeOrPayer: entry.memo || CATEGORY_LABELS[entry.category] || "Quick Entry",
      note: entry.memo,
      date: entry.date,
      time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      paymentMethod: "card",
      status: "cleared",
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [temp, ...prev]);
    setTotalCount((c) => c + 1);
    setBalance((b) => b + amount);
    try {
      const saved = await financeService.recordTransaction(entry);
      setTransactions((prev) => prev.map((t) => (t.id === temp.id ? saved : t)));
      notify(`Saved: ${saved.payeeOrPayer} (${saved.amount > 0 ? "+" : "-"}Rs. ${Math.abs(saved.amount).toLocaleString("en-PK")})`);
      resync();
    } catch (err: unknown) {
      setTransactions((prev) => prev.filter((t) => t.id !== temp.id));
      setTotalCount((c) => c - 1);
      setBalance((b) => b - amount);
      notify(errorText(err, "Failed to record transaction"), "error");
    }
  };

  const handleConfirmDelete = async () => {
    const tx = deleting;
    if (!tx) return;
    setDeleting(null);
    const index = transactions.findIndex((t) => t.id === tx.id);
    setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
    setTotalCount((c) => c - 1);
    setBalance((b) => b - tx.amount);
    try {
      await financeService.deleteTransaction(tx.id);
      notify(`Deleted: ${tx.payeeOrPayer}`);
      resync();
    } catch (err: unknown) {
      setTransactions((prev) => [...prev.slice(0, index), tx, ...prev.slice(index)]);
      setTotalCount((c) => c + 1);
      setBalance((b) => b + tx.amount);
      notify(errorText(err, "Failed to delete transaction"), "error");
    }
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
      notify("Ledger export downloaded successfully", "info");
    } catch (err: unknown) {
      notify(errorText(err, "Failed to export CSV"), "error");
    }
  };

  // Add / remove funds directly on the balance
  const handleAdjustBalance = async (delta: number) => {
    setBalance((b) => b + delta);
    try {
      await financeService.adjustBalance(delta);
      notify(`${delta > 0 ? "Added" : "Removed"} Rs. ${Math.abs(delta).toLocaleString()} ${delta > 0 ? "to" : "from"} balance`);
    } catch (err: unknown) {
      setBalance((b) => b - delta);
      notify(errorText(err, "Failed to update balance"), "error");
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
            loading={txLoading}
            onDelete={setDeleting}
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
        onSubmit={handleAddTransaction}
      />

      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, bgcolor: "#FCFBF8", m: 2 } } }}
      >
        <DialogTitle sx={{ fontFamily: "var(--font-newsreader), Georgia, serif", color: "#0B1628" }}>
          Delete transaction?
        </DialogTitle>
        <DialogContent sx={{ color: "#68717C", fontSize: "0.9375rem", overflowWrap: "anywhere" }}>
          &ldquo;{deleting?.payeeOrPayer}&rdquo; ({(deleting?.amount ?? 0) > 0 ? "+" : "-"}Rs.{" "}
          {Math.abs(deleting?.amount ?? 0).toLocaleString("en-PK")}) will be removed and your balance adjusted.
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleting(null)} sx={{ color: "#68717C", textTransform: "none", minHeight: 40 }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{
              bgcolor: "#8C3F3B",
              textTransform: "none",
              fontWeight: 600,
              minHeight: 40,
              boxShadow: "none",
              "&:hover": { bgcolor: "#753330", boxShadow: "none" },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
