"use client";

import React, { useState } from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { PriorityLevel, Project, CreateTaskPayload } from "@/types/models";

export interface QuickTaskCaptureCardProps {
  onCommitTask?: (payload: CreateTaskPayload) => Promise<void> | void;
  onSubmit?: (payload: CreateTaskPayload) => Promise<void> | void;
  projects?: Project[];
}

export default function QuickTaskCaptureCard({
  onCommitTask,
  onSubmit,
  projects = [],
}: QuickTaskCaptureCardProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("medium");
  const [projectId, setProjectId] = useState<string>("proj-anchor");
  const [dueDate, setDueDate] = useState("Today, 6:00 PM");
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
      dueDate: dueDate.includes("Today") ? "Today" : dueDate,
      dueTime: "6:00 PM",
      dueInfo: dueDate,
      category: "Engineering",
      categoryLabel: "Engineering",
      tabCategory: "today",
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else if (onCommitTask) {
        await onCommitTask(payload);
      }
      setTitle("");
      setPriority("medium");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "#FCFBF8",
        border: "1px solid rgba(17, 28, 46, 0.08)",
        borderRadius: "12px",
        p: 2.5,
        boxShadow: "0 2px 8px -2px rgba(11, 22, 40, 0.04)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <ElectricBoltIcon sx={{ fontSize: 18, color: "#0B1628" }} />
        <Typography
          sx={{
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: "#0B1628",
          }}
        >
          Quick Task Capture
        </Typography>
      </Box>

      {/* Form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {/* Task Definition */}
        <Box>
          <Typography
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.6875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#68717C",
              mb: 0.75,
            }}
          >
            Task Definition
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g. Audit cold storage balances"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            slotProps={{
              input: {
                sx: {
                  bgcolor: "#FCFBF8",
                  borderRadius: "8px",
                  fontSize: "13px",
                  "& fieldset": { borderColor: "rgba(17, 28, 46, 0.12)" },
                },
              },
            }}
          />
        </Box>

        {/* Priority Button Group */}
        <Box>
          <Typography
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.6875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#68717C",
              mb: 0.75,
            }}
          >
            Priority
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
            {(["low", "medium", "high"] as PriorityLevel[]).map((level) => {
              const isSelected = priority === level;
              const labels = { low: "Low", medium: "Medium", high: "High" };

              return (
                <Box
                  key={level}
                  component="button"
                  type="button"
                  onClick={() => setPriority(level)}
                  sx={{
                    py: 0.75,
                    borderRadius: "6px",
                    border: isSelected
                      ? level === "high"
                        ? "1.5px solid #8C3F3B"
                        : level === "medium"
                        ? "1.5px solid #274A65"
                        : "1.5px solid #68717C"
                      : "1px solid rgba(17, 28, 46, 0.12)",
                    bgcolor: isSelected
                      ? level === "high"
                        ? "rgba(199, 109, 104, 0.15)"
                        : level === "medium"
                        ? "rgba(205, 229, 255, 0.4)"
                        : "#F0EEE8"
                      : "#FCFBF8",
                    color: isSelected
                      ? level === "high"
                        ? "#8C3F3B"
                        : level === "medium"
                        ? "#274A65"
                        : "#17202B"
                      : "#68717C",
                    fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: isSelected ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      borderColor: "rgba(17, 28, 46, 0.3)",
                    },
                  }}
                >
                  {labels[level]}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Project Assignment Select */}
        <Box>
          <Typography
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.6875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#68717C",
              mb: 0.75,
            }}
          >
            Project Assignment
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              sx={{
                bgcolor: "#FCFBF8",
                borderRadius: "8px",
                fontSize: "13px",
                "& fieldset": { borderColor: "rgba(17, 28, 46, 0.12)" },
              }}
            >
              {projects.map((proj) => (
                <MenuItem key={proj.id} value={proj.id}>
                  {proj.title}
                </MenuItem>
              ))}
              <MenuItem value="inbox">Unassigned / Inbox</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Due Date Input */}
        <Box>
          <Typography
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.6875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#68717C",
              mb: 0.75,
            }}
          >
            Due Date
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon sx={{ fontSize: 16, color: "#75777D" }} />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: "#FCFBF8",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  "& fieldset": { borderColor: "rgba(17, 28, 46, 0.12)" },
                },
              },
            }}
          />
        </Box>

        {/* Submit CTA */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting || !title.trim()}
          startIcon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />}
          sx={{
            bgcolor: "#0B1628",
            color: "#FCFBF8",
            borderRadius: "8px",
            py: 1,
            fontSize: "13px",
            fontWeight: 600,
            textTransform: "none",
            mt: 0.5,
            "&:hover": { bgcolor: "#12243A" },
          }}
        >
          Commit Task to Ledger
        </Button>
      </Box>

      {/* Real-time Ledger Integrity Badge */}
      <Box
        sx={{
          p: 1.25,
          bgcolor: "#F7F5EF",
          borderRadius: "8px",
          border: "1px solid rgba(17, 28, 46, 0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 0.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "#3F6853",
            }}
          />
          <Typography
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.6875rem",
              fontWeight: 500,
              color: "#3F6853",
            }}
          >
            Sync Status: Real-time
          </Typography>
        </Box>

        <Typography
          sx={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "0.6875rem",
            color: "#75777D",
            fontFeatureSettings: '"tnum" on',
          }}
        >
          224ms
        </Typography>
      </Box>
    </Card>
  );
}
