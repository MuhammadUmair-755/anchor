"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import { PriorityLevel, TaskItem } from "@/types/models";
import { CATEGORY_LABELS, TaskCategory, TaskInput } from "@/services/tasksService";

export interface TaskModalProps {
  open: boolean;
  /** Task being edited; omit to create a new one. */
  task?: TaskItem | null;
  onClose: () => void;
  /** Should throw on failure so the modal stays open. */
  onSubmit: (input: TaskInput) => Promise<void>;
}

const fieldSx = { "& .MuiInputBase-root": { bgcolor: "#FFFFFF", borderRadius: "8px" } };

export default function TaskModal({ open, task, onClose, onSubmit }: TaskModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 3, bgcolor: "#FCFBF8", border: "1px solid rgba(17, 28, 46, 0.08)", m: 2, width: "calc(100% - 32px)" },
        },
      }}
    >
      {/* Remount the form per open/task so fields reset without effects */}
      {open && <TaskForm key={task?.id ?? "new"} task={task} onClose={onClose} onSubmit={onSubmit} />}
    </Dialog>
  );
}

function TaskForm({ task, onClose, onSubmit }: Omit<TaskModalProps, "open">) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [category, setCategory] = useState<TaskCategory>((task?.category as TaskCategory) ?? "work");
  const [priority, setPriority] = useState<PriorityLevel>(task?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [dueTime, setDueTime] = useState(task?.dueTime ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await onSubmit({ title: title.trim(), category, priority, dueDate: dueDate || null, dueTime: (dueDate && dueTime) || null });
    } catch {
      // error is surfaced by the page; keep the form open with the user's input
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogTitle
        sx={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontSize: "1.375rem", fontWeight: 500, color: "#0B1628" }}
      >
        {task ? "Edit task" : "New task"}
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
        <TextField
          autoFocus
          required
          label="Title"
          placeholder="What needs to get done?"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          slotProps={{ htmlInput: { maxLength: 200 } }}
          sx={fieldSx}
        />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value as TaskCategory)} sx={fieldSx}>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as PriorityLevel)} sx={fieldSx}>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </TextField>
          <TextField
            type="date"
            label="Due date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={fieldSx}
          />
          <TextField
            type="time"
            label="Time (optional)"
            disabled={!dueDate}
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={fieldSx}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: "#68717C", textTransform: "none", minHeight: 40 }}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={saving || !title.trim()}
          sx={{
            bgcolor: "#0B1628",
            color: "#FCFBF8",
            borderRadius: "8px",
            px: 2.5,
            minHeight: 40,
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "none",
            "&:hover": { bgcolor: "#12243A", boxShadow: "none" },
          }}
        >
          {saving ? "Saving..." : task ? "Save changes" : "Add task"}
        </Button>
      </DialogActions>
    </Box>
  );
}
