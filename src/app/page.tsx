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
  TransactionCategory,
} from "@/types/models";
import { BUDGET_CATEGORIES, currentCycle, toEnvelope } from "@/lib/budgets";
import { overviewService } from "@/services/overviewService";
import {
  LiquidityHero,
  OutflowDonutChart,
  BudgetHealth,
  DailyFocusCard,
  TodayDebitsCard,
  AdjustAllocationsModal,
  AddTaskModal,
} from "@/components/overview";

export default function OverviewPage() {
  const [data, setData] = useState<ExecutiveOverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  // Interactive Modals
  const [adjustAllocationsOpen, setAdjustAllocationsOpen] = useState<boolean>(false);
  const [addTaskOpen, setAddTaskOpen] = useState<boolean>(false);

  // Feedback Notification
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
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

  const notify = (message: string, severity: "success" | "error" = "success") =>
    setSnackbar({ open: true, message, severity });
  const errorText = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);
  const setTasks = (fn: (tasks: DailyTask[]) => DailyTask[]) =>
    setData((prev) => (prev ? { ...prev, dailyTasks: fn(prev.dailyTasks) } : prev));

  // All writes are optimistic: the UI changes now and rolls back if the server refuses.
  const handleToggleTask = async (taskId: string) => {
    const current = data?.dailyTasks.find((t) => t.id === taskId);
    if (!current || taskId.startsWith("temp-")) return;
    const flip = (t: DailyTask, isCompleted: boolean) => (t.id === taskId ? { ...t, isCompleted } : t);
    setTasks((tasks) => tasks.map((t) => flip(t, !current.isCompleted)));
    try {
      const updated = await overviewService.setTaskCompleted(taskId, !current.isCompleted);
      setTasks((tasks) => tasks.map((t) => (t.id === taskId ? updated : t)));
    } catch (err: unknown) {
      setTasks((tasks) => tasks.map((t) => flip(t, current.isCompleted)));
      notify(errorText(err, "Failed to update task"), "error");
    }
  };

  const handleAddTask = async (task: Pick<DailyTask, "title" | "category" | "priority">) => {
    const temp: DailyTask = {
      ...task,
      id: `temp-${Date.now()}`,
      categoryLabel: task.category.toUpperCase(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((tasks) => [temp, ...tasks]);
    try {
      const created = await overviewService.addTask(task);
      setTasks((tasks) => tasks.map((t) => (t.id === temp.id ? created : t)));
      notify(`New task added: "${created.title}"`);
    } catch (err: unknown) {
      setTasks((tasks) => tasks.filter((t) => t.id !== temp.id));
      notify(errorText(err, "Failed to create task"), "error");
    }
  };

  const handleSaveBudgets = async (budgets: { category: TransactionCategory; amount: number }[]) => {
    if (!data) return;
    const previous = data;
    const spentOf = (c: TransactionCategory) => data.outflowSectors.find((s) => s.category === c)?.amount ?? 0;
    const budgetEnvelopes = budgets
      .filter((b) => b.amount > 0)
      .map((b) => {
        const existing = data.budgetEnvelopes.find((e) => e.category === b.category);
        const meta = BUDGET_CATEGORIES.find((c) => c.category === b.category)!;
        return toEnvelope({
          id: existing?.id ?? `temp-${b.category}`,
          category: b.category,
          label: existing?.label ?? meta.label,
          allocated: b.amount,
          spent: spentOf(b.category),
          cycle: currentCycle(),
          icon: existing?.icon ?? meta.icon,
        });
      });
    setData({
      ...data,
      budgetEnvelopes,
      budgetCap: budgetEnvelopes.reduce((sum, e) => sum + e.allocatedAmount, 0),
      totalSpent: budgetEnvelopes.reduce((sum, e) => sum + e.spentAmount, 0),
    });
    try {
      await overviewService.saveBudgets(budgets);
      notify("Budgets updated.");
      overviewService.getOverviewData().then(setData).catch(() => {}); // quiet re-sync
    } catch (err: unknown) {
      setData(previous);
      notify(errorText(err, "Failed to save budgets"), "error");
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
        gap: { xs: 2, sm: 2.5, md: 3.5 },
      }}
    >

      {/* 2. PRIMARY FINANCIAL ANCHOR HERO SECTION (Asymmetric Ledger) */}
      <LiquidityHero
        totalLiquidity={data.totalLiquidity}
        monthlyInflow={data.monthlyInflow}
        inflowSourcesCount={data.inflowSourcesCount}
        totalExpenses={data.totalExpenses}
        expensesBurnRatePercent={data.expensesBurnRatePercent}
        netRetained={data.netRetained}
        retentionRatePercent={data.retentionRatePercent}
      />

      {/* 3. MIDDLE ANALYTICS GRID (Asymmetrical 60/40 Split: Outflow Donut 7-cols, Budget Health 5-cols) */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ alignItems: "stretch" }}>
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

      {/* 4. BOTTOM ROW (Daily Focus, Today's Debits) */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ alignItems: "stretch" }}>
        {/* Card A: Today's Focus */}
        <Grid size={{ xs: 12, md: 6 }}>
          <DailyFocusCard
            tasks={data.dailyTasks}
            onToggleTask={handleToggleTask}
            onAddNewTask={() => setAddTaskOpen(true)}
          />
        </Grid>

        {/* Card B: Today's Itemized Spending */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TodayDebitsCard debits={data.todayDebits} />
        </Grid>
      </Grid>

      {/* MODAL DIALOGS */}
      {/* 1. Adjust Allocations Dialog */}
      <AdjustAllocationsModal
        open={adjustAllocationsOpen}
        onClose={() => setAdjustAllocationsOpen(false)}
        envelopes={data.budgetEnvelopes}
        sectors={data.outflowSectors}
        onSave={handleSaveBudgets}
      />

      {/* 2. Add New Task Dialog */}
      <AddTaskModal
        open={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        onSubmit={handleAddTask}
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
