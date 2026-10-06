"use client";

import React, { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import { CalendarDay, NewCalendarEventPayload } from "@/types/models";
import { calendarService } from "@/services/calendarService";
import { tasksService } from "@/services/tasksService";
import { CalendarGrid, DayPanel, EventModal } from "@/components/calendar";
import { currentMonthKey, monthLabel, shiftMonth, todayKey } from "@/lib/calendar";

export default function CalendarPage() {
  const [today, setToday] = useState<string>(todayKey);
  const [month, setMonth] = useState<string>(currentMonthKey);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>("");
  const [eventModalOpen, setEventModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  const showError = (err: unknown, fallback: string) =>
    setToast({ message: err instanceof Error ? err.message : fallback, severity: "error" });

  const loadMonth = useCallback(async (m: string) => {
    try {
      const data = await calendarService.getMonth(m);
      setDays(data.days);
      setLoadError("");
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Failed to load calendar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMonth(month);
  }, [month, loadMonth]);

  const goToMonth = (m: string) => {
    setMonth(m);
    // Keep the selection inside the visible month: today if it's there, else the 1st
    setSelectedDateKey(today.startsWith(m) ? today : `${m}-01`);
  };

  const goToToday = () => {
    const now = todayKey(); // the page may have been open past midnight
    setToday(now);
    setMonth(now.slice(0, 7));
    setSelectedDateKey(now);
  };

  const handleAddEvent = async (payload: NewCalendarEventPayload): Promise<boolean> => {
    try {
      await calendarService.addEvent(payload);
      setToast({ message: `Added "${payload.title}"`, severity: "success" });
      setSelectedDateKey(payload.date);
      if (payload.date.slice(0, 7) !== month) setMonth(payload.date.slice(0, 7));
      else await loadMonth(month);
      return true;
    } catch (err: unknown) {
      showError(err, "Failed to add event");
      return false;
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await calendarService.deleteEvent(id);
      setToast({ message: "Event deleted", severity: "success" });
      await loadMonth(month);
    } catch (err: unknown) {
      showError(err, "Failed to delete event");
    }
  };

  const handleToggleTask = async (id: string, isCompleted: boolean) => {
    try {
      await tasksService.updateTask(id, { isCompleted });
      await loadMonth(month);
    } catch (err: unknown) {
      showError(err, "Failed to update task");
    }
  };

  const selectedDay = days.find((d) => d.dateKey === selectedDateKey);

  return (
    <Box sx={{ width: "100%", maxWidth: 1400, mx: "auto", display: "flex", flexDirection: "column", gap: { xs: 2, md: 2.5 } }}>
      {/* Header: month, navigation, add */}
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton aria-label="Previous month" onClick={() => goToMonth(shiftMonth(month, -1))} sx={{ border: "1px solid rgba(17, 28, 46, 0.12)" }}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography
            component="h1"
            sx={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontSize: { xs: "1.5rem", sm: "2rem" }, fontWeight: 500, color: "#0B1628", minWidth: { sm: 230 }, textAlign: "center" }}
          >
            {monthLabel(month)}
          </Typography>
          <IconButton aria-label="Next month" onClick={() => goToMonth(shiftMonth(month, 1))} sx={{ border: "1px solid rgba(17, 28, 46, 0.12)" }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" onClick={goToToday} sx={{ textTransform: "none", color: "#0B1628", borderColor: "rgba(17, 28, 46, 0.2)" }}>
            Today
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setEventModalOpen(true)}
            sx={{ textTransform: "none", bgcolor: "#0B1628", "&:hover": { bgcolor: "#162338" } }}
          >
            Add event
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress sx={{ color: "#0B1628" }} />
        </Box>
      ) : loadError ? (
        <Alert severity="error" action={<Button color="inherit" onClick={() => loadMonth(month)}>Retry</Button>}>
          {loadError}
        </Alert>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) minmax(320px, 1fr)" }, gap: { xs: 2, md: 2.5 }, alignItems: "start" }}>
          <CalendarGrid days={days} selectedDateKey={selectedDateKey} todayKey={today} onSelectDate={setSelectedDateKey} />
          {selectedDay && (
            <DayPanel
              day={selectedDay}
              isToday={selectedDay.dateKey === today}
              onAddEvent={() => setEventModalOpen(true)}
              onDeleteEvent={handleDeleteEvent}
              onToggleTask={handleToggleTask}
            />
          )}
        </Box>
      )}

      <EventModal open={eventModalOpen} defaultDate={selectedDateKey} onClose={() => setEventModalOpen(false)} onSubmit={handleAddEvent} />

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ mb: { xs: 9, lg: 0 } }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} sx={{ borderRadius: 2 }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
