"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { CreateTaskPayload, PriorityLevel, Project } from "@/types/models";

export interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: CreateTaskPayload) => Promise<void> | void;
  onTaskAdded?: (payload: CreateTaskPayload) => void;
  projects?: Project[];
}

export default function AddTaskModal({
  open,
  onClose,
  onSubmit,
  onTaskAdded,
  projects = [],
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState<string>("proj-anchor");
  const [category, setCategory] = useState<string>("Engineering");
  const [priority, setPriority] = useState<PriorityLevel>("medium");
  const [dueSchedule, setDueSchedule] = useState("Today, 6:00 PM");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const selectedProject = projects.find((p) => p.id === projectId);

    const payload: CreateTaskPayload = {
      title: title.trim(),
      priority,
      projectId: projectId !== "inbox" ? projectId : undefined,
      projectName: selectedProject?.title || "Unassigned / Inbox",
      category,
      categoryLabel: category,
      dueDate: dueSchedule.includes("Tomorrow") ? "Tomorrow" : "Today",
      dueTime: "6:00 PM",
      dueInfo: dueSchedule,
      tabCategory: dueSchedule.toLowerCase().includes("tomorrow")
        ? "upcoming"
        : "today",
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else if (onTaskAdded) {
        onTaskAdded(payload);
      }
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setPriority("medium");
    setDueSchedule("Today, 6:00 PM");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          component: "form",
          onSubmit: handleSubmit,
          sx: {
            borderRadius: 3,
            bgcolor: "#FCFBF8",
            border: "1px solid rgba(17, 28, 46, 0.08)",
            p: 1.5,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          pb: 1,
        }}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 22, color: "#0B1628" }} />
        <Typography
          variant="h6"
          sx={{
            fontFamily: "var(--font-newsreader), Georgia, serif",
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#0B1628",
          }}
        >
          New Focus Task
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
        {/* Task Description */}
        <TextField
          autoFocus
          required
          label="Task Description"
          placeholder="e.g. Audit cold storage balances"
          fullWidth
          size="small"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          slotProps={{
            input: {
              sx: { bgcolor: "#FFFFFF", borderRadius: "8px" },
            },
          }}
        />

        {/* Project Select */}
        <FormControl fullWidth size="small">
          <InputLabel id="project-select-label">Project Domain</InputLabel>
          <Select
            labelId="project-select-label"
            label="Project Domain"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            sx={{ bgcolor: "#FFFFFF", borderRadius: "8px" }}
          >
            {projects.map((proj) => (
              <MenuItem key={proj.id} value={proj.id}>
                {proj.title}
              </MenuItem>
            ))}
            <MenuItem value="inbox">Unassigned / Inbox</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          {/* Category Select */}
          <FormControl fullWidth size="small">
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ bgcolor: "#FFFFFF", borderRadius: "8px" }}
            >
              <MenuItem value="Engineering">Engineering</MenuItem>
              <MenuItem value="Finance">Finance</MenuItem>
              <MenuItem value="Health">Health</MenuItem>
              <MenuItem value="Learning">Learning</MenuItem>
              <MenuItem value="Work">Work</MenuItem>
            </Select>
          </FormControl>

          {/* Priority Select */}
          <FormControl fullWidth size="small">
            <InputLabel id="priority-select-label">Priority</InputLabel>
            <Select
              labelId="priority-select-label"
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              sx={{ bgcolor: "#FFFFFF", borderRadius: "8px" }}
            >
              <MenuItem value="low">Low Priority</MenuItem>
              <MenuItem value="medium">Medium Priority</MenuItem>
              <MenuItem value="high">High Priority</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Due Schedule */}
        <TextField
          label="Due / Schedule (Optional)"
          placeholder="e.g. Today, 6:00 PM"
          fullWidth
          size="small"
          value={dueSchedule}
          onChange={(e) => setDueSchedule(e.target.value)}
          slotProps={{
            input: {
              sx: { bgcolor: "#FFFFFF", borderRadius: "8px" },
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 1.5 }}>
        <Button
          onClick={handleClose}
          sx={{
            color: "#68717C",
            textTransform: "none",
            "&:hover": { bgcolor: "transparent", color: "#0B1628" },
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || !title.trim()}
          sx={{
            bgcolor: "#0B1628",
            color: "#FCFBF8",
            borderRadius: "8px",
            px: 2.5,
            fontWeight: 600,
            textTransform: "none",
            "&:hover": { bgcolor: "#12243A" },
          }}
        >
          Commit Task
        </Button>
      </DialogActions>
    </Dialog>
  );
}
