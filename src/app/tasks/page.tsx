"use client";

import React, { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { TaskItem } from "@/types/models";
import { tasksService, filterTasks, TaskInput, TaskTab } from "@/services/tasksService";
import TaskList from "@/components/tasks/TaskList";
import TaskModal from "@/components/tasks/TaskModal";

const TABS: { id: TaskTab; label: string; empty: string }[] = [
  { id: "open", label: "Open", empty: "Nothing open. Nice work." },
  { id: "today", label: "Today", empty: "Nothing due today." },
  { id: "upcoming", label: "Upcoming", empty: "Nothing scheduled ahead." },
  { id: "completed", label: "Completed", empty: "No completed tasks yet." },
];

const errorText = (err: unknown) => (err instanceof Error ? err.message : "Something went wrong");

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<TaskTab>("open");
  const [query, setQuery] = useState("");
  // undefined = modal closed, null = creating, TaskItem = editing
  const [editing, setEditing] = useState<TaskItem | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<TaskItem | null>(null);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  useEffect(() => {
    tasksService
      .getTasks()
      .then(setTasks)
      .catch((err) => setLoadError(errorText(err)))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => filterTasks(tasks, tab, query), [tasks, tab, query]);
  const replace = (t: TaskItem) => setTasks((prev) => prev.map((p) => (p.id === t.id ? t : p)));
  const fail = (err: unknown) => setToast({ message: errorText(err), severity: "error" });

  const handleSave = async (input: TaskInput) => {
    try {
      if (editing) {
        replace(await tasksService.updateTask(editing.id, input));
        setToast({ message: "Task updated", severity: "success" });
      } else {
        const created = await tasksService.createTask(input);
        setTasks((prev) => [created, ...prev]);
        setToast({ message: "Task added", severity: "success" });
      }
      setEditing(undefined);
    } catch (err) {
      fail(err);
      throw err; // keeps the modal open
    }
  };

  const handleToggle = async (task: TaskItem) => {
    replace({ ...task, isCompleted: !task.isCompleted }); // optimistic
    try {
      replace(await tasksService.updateTask(task.id, { isCompleted: !task.isCompleted }));
    } catch (err) {
      replace(task);
      fail(err);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const task = deleting;
    setDeleting(null);
    try {
      await tasksService.deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      setToast({ message: "Task deleted", severity: "success" });
    } catch (err) {
      fail(err);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 880, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 2.5, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
        <Typography
          component="h1"
          sx={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontSize: { xs: "1.75rem", md: "2rem" }, fontWeight: 500, color: "#0B1628" }}
        >
          Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setEditing(null)}
          sx={{
            bgcolor: "#0B1628",
            color: "#FCFBF8",
            borderRadius: "8px",
            minHeight: 40,
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "none",
            "&:hover": { bgcolor: "#12243A", boxShadow: "none" },
          }}
        >
          Add task
        </Button>
      </Box>

      <TextField
        fullWidth
        size="small"
        placeholder="Search tasks"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "#68717C" }} />
              </InputAdornment>
            ),
            sx: { bgcolor: "#FCFBF8", borderRadius: "8px", minHeight: 40 },
          },
        }}
      />

      <Tabs
        value={tab}
        onChange={(_, v: TaskTab) => setTab(v)}
        variant="scrollable"
        scrollButtons={false}
        sx={{
          my: 2,
          minHeight: 40,
          borderBottom: "1px solid rgba(17, 28, 46, 0.08)",
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600, minHeight: 40, color: "#68717C", px: 1.5, minWidth: 0 },
          "& .Mui-selected": { color: "#0B1628 !important" },
          "& .MuiTabs-indicator": { bgcolor: "#3F6853" },
        }}
      >
        {TABS.map((t) => (
          <Tab key={t.id} value={t.id} label={t.label} />
        ))}
      </Tabs>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={32} sx={{ color: "#0B1628" }} />
        </Box>
      ) : loadError ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Couldn&apos;t load tasks: {loadError}
        </Alert>
      ) : (
        <TaskList
          tasks={visible}
          emptyMessage={query.trim() ? "No tasks match your search." : TABS.find((t) => t.id === tab)!.empty}
          onToggle={handleToggle}
          onEdit={setEditing}
          onDelete={setDeleting}
          onAdd={() => setEditing(null)}
        />
      )}

      <TaskModal open={editing !== undefined} task={editing} onClose={() => setEditing(undefined)} onSubmit={handleSave} />

      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, bgcolor: "#FCFBF8", m: 2 } } }}
      >
        <DialogTitle sx={{ fontFamily: "var(--font-newsreader), Georgia, serif", color: "#0B1628" }}>Delete task?</DialogTitle>
        <DialogContent sx={{ color: "#68717C", fontSize: "0.9375rem", overflowWrap: "anywhere" }}>
          &ldquo;{deleting?.title}&rdquo; will be permanently removed.
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleting(null)} sx={{ color: "#68717C", textTransform: "none", minHeight: 40 }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
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

      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast?.severity ?? "success"} onClose={() => setToast(null)} sx={{ borderRadius: 2 }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
