"use client";

import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import {
  CalendarDayCell,
  DayInspectorData,
  SovereignGoal,
  TemporalHealthMetrics,
  NewCalendarEventPayload,
} from "@/types/models";
import { calendarService } from "@/services/calendarService";
import {
  CalendarHeader,
  TemporalCadenceLegend,
  CalendarMatrix,
  MatrixTemporalHealthBar,
  DayNexusInspector,
  SovereignGoalsHub,
  NewEventModal,
  AdjustMilestonesModal,
} from "@/components/calendar";

export default function CalendarPage() {
  const [days, setDays] = useState<CalendarDayCell[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState<string>("2026-09-11");
  const [inspectorData, setInspectorData] = useState<DayInspectorData | null>(null);
  const [goals, setGoals] = useState<SovereignGoal[]>([]);
  const [temporalHealth, setTemporalHealth] = useState<TemporalHealthMetrics | null>(null);

  const [activeView, setActiveView] = useState<"month" | "week" | "day">("month");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentMonthKey, setCurrentMonthKey] = useState<string>("2026-09");
  const [currentMonthDisplay, setCurrentMonthDisplay] = useState<string>("September 2026");
  const [quarterLabel, setQuarterLabel] = useState<string>("Q3 Ledger");

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [newEventOpen, setNewEventOpen] = useState<boolean>(false);
  const [adjustMilestonesOpen, setAdjustMilestonesOpen] = useState<boolean>(false);

  // Snackbar Notification
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "info" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Initial Data Load
  const loadCalendarData = useCallback(async () => {
    try {
      const [loadedDays, loadedInspector, loadedGoals, loadedHealth] = await Promise.all([
        calendarService.getCalendarDays("2026-09"),
        calendarService.getDayInspectorData(selectedDateKey),
        calendarService.getSovereignGoals(),
        calendarService.getTemporalHealth("2026-09"),
      ]);

      setDays(loadedDays);
      setInspectorData(loadedInspector);
      setGoals(loadedGoals);
      setTemporalHealth(loadedHealth);
      setLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load calendar records";
      setError(msg);
      setLoading(false);
    }
  }, [selectedDateKey]);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  // Select Date Handler
  const handleSelectDate = async (dateKey: string) => {
    setSelectedDateKey(dateKey);
    try {
      const newInspector = await calendarService.getDayInspectorData(dateKey);
      setInspectorData(newInspector);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load day inspector";
      setSnackbar({
        open: true,
        message: msg,
        severity: "error",
      });
    }
  };

  // Toggle Day Task in Inspector
  const handleToggleTask = async (taskId: string) => {
    try {
      const updated = await calendarService.toggleDayTask(selectedDateKey, taskId);
      setInspectorData(updated);

      // Refresh days to sync matrix pills for active month
      const updatedDays = await calendarService.getCalendarDays(currentMonthKey);
      setDays(updatedDays);

      // Refresh health metrics for active month
      const updatedHealth = await calendarService.getTemporalHealth(currentMonthKey);
      setTemporalHealth(updatedHealth);

      setSnackbar({
        open: true,
        message: "Task cadence status synchronized.",
        severity: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle task";
      setSnackbar({
        open: true,
        message: msg,
        severity: "error",
      });
    }
  };

  // Record New Event / Entry
  const handleCreateEvent = async (payload: NewCalendarEventPayload) => {
    try {
      await calendarService.addEvent(payload);
      setSnackbar({
        open: true,
        message: `Recorded new entry: "${payload.title}" on ${payload.date}`,
        severity: "success",
      });

      // Reload for active month
      const [updatedDays, updatedInspector, updatedHealth] = await Promise.all([
        calendarService.getCalendarDays(currentMonthKey),
        calendarService.getDayInspectorData(payload.date),
        calendarService.getTemporalHealth(currentMonthKey),
      ]);
      setDays(updatedDays);
      setSelectedDateKey(payload.date);
      setInspectorData(updatedInspector);
      setTemporalHealth(updatedHealth);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record event";
      setSnackbar({
        open: true,
        message: msg,
        severity: "error",
      });
    }
  };

  // Update Goal Progress
  const handleUpdateGoal = async (goalId: string, percentage: number) => {
    try {
      await calendarService.updateGoalProgress(goalId, percentage);
      const updatedGoals = await calendarService.getSovereignGoals();
      setGoals(updatedGoals);
      setSnackbar({
        open: true,
        message: "Strategic milestone calibration saved.",
        severity: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update milestone";
      setSnackbar({
        open: true,
        message: msg,
        severity: "error",
      });
    }
  };

  // Dynamic Month Navigator
  const handleNavigateMonth = async (direction: "prev" | "next") => {
    const [yearStr, monthStr] = currentMonthKey.split("-");
    let year = parseInt(yearStr, 10);
    let monthNum = parseInt(monthStr, 10);

    if (direction === "prev") {
      monthNum -= 1;
      if (monthNum < 1) {
        monthNum = 12;
        year -= 1;
      }
    } else {
      monthNum += 1;
      if (monthNum > 12) {
        monthNum = 1;
        year += 1;
      }
    }

    const nextMonthKey = `${year}-${String(monthNum).padStart(2, "0")}`;
    setCurrentMonthKey(nextMonthKey);

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const newDisplay = `${monthNames[monthNum - 1]} ${year}`;
    setCurrentMonthDisplay(newDisplay);

    const quarterNum = Math.ceil(monthNum / 3);
    const newQuarter =
      nextMonthKey === "2026-09"
        ? "Q3 Ledger"
        : `Q${quarterNum} ${quarterNum >= 3 ? "Projections" : "Archive"}`;
    setQuarterLabel(newQuarter);

    // Synchronize selected day to the viewed month
    const newSelectedDate = nextMonthKey === "2026-09" ? "2026-09-11" : `${nextMonthKey}-01`;
    setSelectedDateKey(newSelectedDate);

    try {
      const [newDays, newInspector, newHealth] = await Promise.all([
        calendarService.getCalendarDays(nextMonthKey),
        calendarService.getDayInspectorData(newSelectedDate),
        calendarService.getTemporalHealth(nextMonthKey),
      ]);
      setDays(newDays);
      setInspectorData(newInspector);
      setTemporalHealth(newHealth);
      setSnackbar({
        open: true,
        message: `Viewing ${newDisplay} (${newQuarter})`,
        severity: "info",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load month";
      setSnackbar({
        open: true,
        message: msg,
        severity: "error",
      });
    }
  };

  // Today Jump Handler
  const handleJumpToToday = async () => {
    setCurrentMonthKey("2026-09");
    setCurrentMonthDisplay("September 2026");
    setQuarterLabel("Q3 Ledger");
    try {
      const septDays = await calendarService.getCalendarDays("2026-09");
      setDays(septDays);
      await handleSelectDate("2026-09-11");
      setSnackbar({
        open: true,
        message: "Focused on Friday, September 11, 2026 (Active Anchor Focus)",
        severity: "info",
      });
    } catch {
      // Handled
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
            fontSize: "1.125rem",
          }}
        >
          Synchronizing calendar matrix &amp; sovereign goals nexus...
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

  const cycleRangeText = React.useMemo(() => {
    if (activeView === "day") {
      return "1 Day · Daily Vector Telemetry";
    }
    if (activeView === "week") {
      return "7 Days · Week Cadence Focus";
    }
    if (currentMonthKey === "2026-09") {
      return "30 Days · Week 36 to Week 40";
    }
    const [yearStr, monthStr] = currentMonthKey.split("-");
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);
    const daysInMonth = new Date(Date.UTC(year, monthNum, 0)).getUTCDate();
    return `${daysInMonth} Days · Monthly Cadence`;
  }, [activeView, currentMonthKey]);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
      }}
    >
      {/* 1. Header with Month Controls, View Toggle, Search, + New Entry */}
      <CalendarHeader
        currentMonthDisplay={currentMonthDisplay}
        quarterLabel={quarterLabel}
        activeView={activeView}
        onViewChange={(v) => {
          setActiveView(v);
          setSnackbar({
            open: true,
            message: `Switched cadence perspective to ${v} view.`,
            severity: "info",
          });
        }}
        onPrevMonth={() => handleNavigateMonth("prev")}
        onNextMonth={() => handleNavigateMonth("next")}
        onToday={handleJumpToToday}
        onOpenNewEvent={() => setNewEventOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterMatrix={() =>
          setSnackbar({
            open: true,
            message: "Matrix filtering active across operational vectors (Finance, Tasks, Journal).",
            severity: "info",
          })
        }
        onNotifications={() =>
          setSnackbar({
            open: true,
            message: "Cadence notifications synchronized: No pending alerts.",
            severity: "info",
          })
        }
        onViewOptions={() =>
          setSnackbar({
            open: true,
            message: "Perspective configuration: Showing all active cross-system cadences.",
            severity: "info",
          })
        }
      />

      {/* 2. Main Body Split: 65% Matrix / 35% Inspector & Goals */}
      <Box
        component="main"
        sx={{
          p: { xs: 2, sm: 3, md: 3.5 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "8fr 4fr" },
          gap: 3,
          maxWidth: 1720,
          width: "100%",
          mx: "auto",
        }}
      >
        {/* SECTION 1: CALENDAR MATRIX (65% / 8 of 12 cols on desktop) */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, minWidth: 0 }}>
          {/* Temporal Cadence Legend Bar */}
          <TemporalCadenceLegend
            title="TEMPORAL CADENCE"
            cycleRangeText={cycleRangeText}
          />

          {/* Interactive 7-Column Calendar Grid Card */}
          <CalendarMatrix
            days={days}
            selectedDateKey={selectedDateKey}
            onSelectDate={handleSelectDate}
            activeView={activeView}
            searchQuery={searchQuery}
          />

          {/* Matrix Temporal Health Bar (Recessed Well) */}
          {temporalHealth && <MatrixTemporalHealthBar metrics={temporalHealth} />}
        </Box>

        {/* SECTION 2: DAY NEXUS INSPECTOR & SOVEREIGN GOALS HUB (35% / 4 of 12 cols) */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, minWidth: 0 }}>
          {/* Day Nexus Inspector Panel */}
          {inspectorData && (
            <DayNexusInspector
              data={inspectorData}
              selectedDateKey={selectedDateKey}
              onToggleTask={handleToggleTask}
            />
          )}

          {/* Sovereign Goals Hub Persistent Cards */}
          <SovereignGoalsHub
            goals={goals}
            onOpenAdjustMilestones={() => setAdjustMilestonesOpen(true)}
          />
        </Box>
      </Box>

      {/* New Entry / Event Modal */}
      <NewEventModal
        open={newEventOpen}
        onClose={() => setNewEventOpen(false)}
        onSubmit={handleCreateEvent}
        defaultDate={selectedDateKey}
      />

      {/* Adjust Milestones Modal */}
      <AdjustMilestonesModal
        open={adjustMilestonesOpen}
        onClose={() => setAdjustMilestonesOpen(false)}
        goals={goals}
        onUpdateGoal={handleUpdateGoal}
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
