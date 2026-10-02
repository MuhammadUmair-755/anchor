"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import {
  ExecutiveOverviewData,
  DailyTask,
  BudgetEnvelope,
  Transaction,
  TodayDebitItem,
} from "@/types/models";
import { overviewService } from "@/services/overviewService";
import {
  FilterStrip,
  LiquidityHero,
  OutflowDonutChart,
  BudgetHealth,
  DailyFocusCard,
  TodayDebitsCard,
  MindsetGoalCard,
  AdjustAllocationsModal,
  AddTaskModal,
} from "@/components/overview";
import QuickEntryModal from "@/components/layout/QuickEntryModal";

export default function OverviewPage() {
  const [data, setData] = useState<ExecutiveOverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter strip state
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-09");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [temporalRange, setTemporalRange] = useState<"today" | "week" | "month" | "quarter">("month");

  // Interactive Modals
  const [adjustAllocationsOpen, setAdjustAllocationsOpen] = useState<boolean>(false);
  const [addTaskOpen, setAddTaskOpen] = useState<boolean>(false);
  const [quickEntryOpen, setQuickEntryOpen] = useState<boolean>(false);

  // Feedback Notification
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "info" }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    let isSubscribed = true;

    overviewService
      .getOverviewData()
      .then((overviewData) => {
        if (isSubscribed) {
          setData(overviewData);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isSubscribed) {
          const msg = err instanceof Error ? err.message : "Failed to load overview data";
          setError(msg);
          setLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Task Toggle Handler
  const handleToggleTask = async (taskId: string) => {
    if (!data) return;
    try {
      const updatedTask = await overviewService.toggleTask(taskId);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          dailyTasks: prev.dailyTasks.map((t) => (t.id === taskId ? updatedTask : t)),
        };
      });
      setSnackbar({
        open: true,
        message: updatedTask.isCompleted ? `Task completed: "${updatedTask.title}"` : `Task reopened: "${updatedTask.title}"`,
        severity: "success",
      });
    } catch (err: unknown) {
      console.error("Failed to toggle task:", err);
    }
  };

  // Add Task Handler
  const handleTaskAdded = (newTask: DailyTask) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        dailyTasks: [newTask, ...prev.dailyTasks],
      };
    });
    setSnackbar({
      open: true,
      message: `New task added: "${newTask.title}"`,
      severity: "success",
    });
  };

  // Budget Allocations Updated Handler
  const handleAllocationsUpdated = (updatedEnvelopes: BudgetEnvelope[]) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        budgetEnvelopes: updatedEnvelopes,
      };
    });
    setSnackbar({
      open: true,
      message: "Budget envelope allocations successfully updated.",
      severity: "success",
    });
  };

  // Quick Entry Success Handler
  const handleQuickEntrySuccess = (transaction: Transaction) => {
    // If it's an outflow debit, add it to today's debits card in state
    if (transaction.flowType === "outflow" || transaction.amount < 0) {
      const newDebit: TodayDebitItem = {
        id: `debit-${Date.now()}`,
        title: transaction.payeeOrPayer,
        category: transaction.categoryLabel,
        paymentMethod: transaction.accountName,
        amount: Math.abs(transaction.amount),
        currency: transaction.currency,
        time: transaction.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        icon: "receipt_long",
      };

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          todayDebits: [newDebit, ...prev.todayDebits],
          totalSpent: prev.totalSpent + Math.abs(transaction.amount),
        };
      });
    }

    setSnackbar({
      open: true,
      message: `Transaction recorded: ${transaction.payeeOrPayer} (${transaction.amount > 0 ? "+" : ""}Rs. ${Math.abs(transaction.amount).toLocaleString("en-IN")})`,
      severity: "success",
    });
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
        <CircularProgress size={36} sx={{ color: "#0B1628" }} />
        <Typography
          sx={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "0.8125rem",
            color: "#68717C",
          }}
        >
          Synchronizing executive vault...
        </Typography>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="error" sx={{ maxWidth: 480, mx: "auto", mb: 2 }}>
          {error || "Unable to load executive command data."}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1360,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: { xs: 2.5, sm: 3, md: 3.5 },
      }}
    >
      {/* 1. PERSISTENT FILTER STRIP */}
      <FilterStrip
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedAccount={selectedAccount}
        onAccountChange={setSelectedAccount}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        temporalRange={temporalRange}
        onTemporalRangeChange={setTemporalRange}
      />

      {/* 2. PRIMARY FINANCIAL ANCHOR HERO SECTION (Asymmetric Ledger) */}
      <LiquidityHero
        totalLiquidity={data.totalLiquidity}
        liquidityTrendPercent={data.liquidityTrendPercent}
        monthlyInflow={data.monthlyInflow}
        monthlyInflowTrendPercent={data.monthlyInflowTrendPercent}
        inflowSourcesCount={data.inflowSourcesCount}
        totalExpenses={data.totalExpenses}
        expensesBurnRatePercent={data.expensesBurnRatePercent}
        netRetained={data.netRetained}
        retentionRatePercent={data.retentionRatePercent}
      />

      {/* 3. MIDDLE ANALYTICS GRID (Asymmetrical 60/40 Split: Outflow Donut 7-cols, Budget Health 5-cols) */}
      <Grid container spacing={{ xs: 2.5, md: 3 }} sx={{ alignItems: "stretch" }}>
        {/* Outflow Donut Chart (Desktop 7 cols / 60%) */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <OutflowDonutChart
            totalSpent={data.totalSpent}
            budgetCap={data.budgetCap}
            sectors={data.outflowSectors}
          />
        </Grid>

        {/* Budget Health Envelopes (Desktop 5 cols / 40%) */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <BudgetHealth
            envelopes={data.budgetEnvelopes}
            onAdjustAllocations={() => setAdjustAllocationsOpen(true)}
          />
        </Grid>
      </Grid>

      {/* 4. BOTTOM OPERATIONAL TRIO (Daily Focus, Today's Debits, Mindset & Goal) */}
      <Grid container spacing={{ xs: 2.5, md: 3 }} sx={{ alignItems: "stretch" }}>
        {/* Card A: Today's Focus */}
        <Grid size={{ xs: 12, md: 4 }}>
          <DailyFocusCard
            tasks={data.dailyTasks}
            onToggleTask={handleToggleTask}
            onAddNewTask={() => setAddTaskOpen(true)}
          />
        </Grid>

        {/* Card B: Today's Itemized Spending */}
        <Grid size={{ xs: 12, md: 4 }}>
          <TodayDebitsCard
            debits={data.todayDebits}
            onLogExpense={() => setQuickEntryOpen(true)}
          />
        </Grid>

        {/* Card C: Today's Journal & Goal Anchor */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MindsetGoalCard mindsetGoal={data.mindsetGoal} />
        </Grid>
      </Grid>

      {/* MODAL DIALOGS */}
      {/* 1. Adjust Allocations Dialog */}
      <AdjustAllocationsModal
        open={adjustAllocationsOpen}
        onClose={() => setAdjustAllocationsOpen(false)}
        envelopes={data.budgetEnvelopes}
        onAllocationsUpdated={handleAllocationsUpdated}
      />

      {/* 2. Add New Task Dialog */}
      <AddTaskModal
        open={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        onTaskAdded={handleTaskAdded}
      />

      {/* 3. Quick Entry Dialog (from + Log Expense) */}
      <QuickEntryModal
        open={quickEntryOpen}
        onClose={() => setQuickEntryOpen(false)}
        onSuccess={handleQuickEntrySuccess}
        initialIntent="spent"
      />

      {/* Subtle Toast Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            bgcolor: "#0B1628",
            color: "#FCFBF8",
            fontSize: "0.8125rem",
            fontWeight: 500,
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(11, 22, 40, 0.15)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
