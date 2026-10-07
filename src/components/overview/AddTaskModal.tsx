"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { DailyTask, TaskCategory, PriorityLevel } from "@/types/models";

export interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with a valid task; the modal closes immediately and the page saves optimistically. */
  onSubmit: (task: Pick<DailyTask, "title" | "category" | "priority">) => void;
}

export default function AddTaskModal({
  open,
  onClose,
  onSubmit,
}: AddTaskModalProps) {
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<TaskCategory>("work");
  const [priority, setPriority] = useState<PriorityLevel>("medium");
  const [error, setError] = useState<string>("");

  const handleReset = () => {
    setTitle("");
    setCategory("work");
    setPriority("medium");
    setError("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    onSubmit({ title: title.trim(), category, priority });
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          component: "form",
          onSubmit: handleSubmit,
          sx: {
            borderRadius: 3,
            bgcolor: "#FCFBF8",
            border: "1px solid rgba(17, 28, 46, 0.08)",
            p: 1,
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 20, color: "#0B1628" }} />
        <Typography component="span" variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600, color: "#0B1628" }}>
          New Focus Task
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2.5}>
          <TextField
            autoFocus
            fullWidth
            label="Task Description"
            placeholder="e.g. Audit Q3 treasury yields"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError("");
            }}
            error={Boolean(error)}
            helperText={error}
            size="small"
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#FFFFFF",
              },
            }}
          />

          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              sx={{ bgcolor: "#FFFFFF" }}
            >
              <MenuItem value="work">Work · Engineering</MenuItem>
              <MenuItem value="finance">Finance · Operating</MenuItem>
              <MenuItem value="personal">Personal · Health</MenuItem>
              <MenuItem value="learning">Learning · Research</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Priority</InputLabel>
            <Select
              value={priority}
              label="Priority"
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              sx={{ bgcolor: "#FFFFFF" }}
            >
              <MenuItem value="high">High Priority</MenuItem>
              <MenuItem value="medium">Medium Priority</MenuItem>
              <MenuItem value="low">Low Priority</MenuItem>
            </Select>
          </FormControl>

        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button onClick={handleClose} sx={{ color: "#68717C" }}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          sx={{
            bgcolor: "#0B1628",
            color: "#FCFBF8",
            "&:hover": { bgcolor: "#162338" },
          }}
        >
          Add Task
        </Button>
      </DialogActions>
    </Dialog>
  );
}
