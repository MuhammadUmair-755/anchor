"use client";

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AddIcon from "@mui/icons-material/Add";
import { DailyTask } from "@/types/models";

export interface DailyFocusCardProps {
  tasks?: DailyTask[];
  onToggleTask?: (taskId: string) => void;
  onAddNewTask?: () => void;
}

export default function DailyFocusCard({
  tasks,
  onToggleTask,
  onAddNewTask,
}: DailyFocusCardProps) {
  const defaultTasks: DailyTask[] = [
    {
      id: "task-1",
      title: "Complete API integration",
      category: "work",
      categoryLabel: "Work · High",
      priority: "high",
      isCompleted: true,
      dueInfo: "Completed 08:30 AM",
      createdAt: "2026-10-01T07:00:00Z",
    },
    {
      id: "task-2",
      title: "Morning gym session",
      category: "personal",
      categoryLabel: "Personal · Health",
      priority: "high",
      isCompleted: true,
      dueInfo: "Completed 09:15 AM",
      createdAt: "2026-10-01T07:15:00Z",
    },
    {
      id: "task-3",
      title: "Review monthly investment yield",
      category: "finance",
      categoryLabel: "Finance · Portfolio",
      priority: "high",
      isCompleted: true,
      dueInfo: "Completed 10:00 AM",
      createdAt: "2026-10-01T07:30:00Z",
    },
    {
      id: "task-4",
      title: "Study TypeScript 5.5 performance notes",
      category: "learning",
      categoryLabel: "Learning · Medium",
      priority: "medium",
      isCompleted: false,
      dueInfo: "Due 4:00 PM",
      createdAt: "2026-10-01T08:00:00Z",
    },
    {
      id: "task-5",
      title: "Weekly financial reconciliation",
      category: "finance",
      categoryLabel: "Finance · Due 6:00 PM",
      priority: "high",
      isCompleted: false,
      dueInfo: "Due 6:00 PM",
      createdAt: "2026-10-01T08:00:00Z",
    },
  ];

  const currentTasks = tasks && tasks.length > 0 ? tasks : defaultTasks;
  const completedCount = currentTasks.filter((t) => t.isCompleted).length;
  const totalCount = currentTasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "#FCFBF8",
        borderRadius: 3,
        border: "1px solid rgba(17, 28, 46, 0.08)",
        boxShadow: "0 2px 8px -2px rgba(11, 22, 40, 0.03)",
        p: { xs: 1.75, sm: 2.5, md: 3 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 2,
            mb: 2,
            borderBottom: "1px solid rgba(17, 28, 46, 0.06)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 20, color: "#40617E" }} />
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: "0.9375rem", sm: "1.0625rem" },
                fontWeight: 600,
                color: "#17202B",
              }}
            >
              Today&apos;s Focus
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: "#F0EEE8",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "#17202B",
              }}
            >
              {completedCount} / {totalCount} Done
            </Box>

            {/* Circular Progress Gauge */}
            <Box sx={{ position: "relative", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="14" fill="none" stroke="#EFECE2" strokeWidth="4" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#40617E"
                  strokeWidth="4"
                  strokeDasharray="88"
                  strokeDashoffset={88 - (88 * progressPercent) / 100}
                  strokeLinecap="round"
                />
              </svg>
            </Box>
          </Box>
        </Box>

        {/* Interactive Checklist */}
        <Stack spacing={1}>
          {currentTasks.map((task) => (
            <Box
              key={task.id}
              onClick={() => onToggleTask?.(task.id)}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.25,
                p: 1,
                borderRadius: 1.5,
                cursor: "pointer",
                transition: "all 0.15s ease",
                bgcolor: task.isCompleted ? "transparent" : "rgba(247, 245, 239, 0.4)",
                "&:hover": {
                  bgcolor: "rgba(240, 238, 232, 0.7)",
                },
              }}
            >
              <Checkbox
                checked={task.isCompleted}
                onChange={() => onToggleTask?.(task.id)}
                icon={<RadioButtonUncheckedIcon sx={{ fontSize: 18, color: "rgba(17, 28, 46, 0.3)" }} />}
                checkedIcon={<CheckCircleOutlineIcon sx={{ fontSize: 18, color: "#0B1628" }} />}
                sx={{ p: 0.25, mt: 0.25 }}
              />

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    fontWeight: task.isCompleted ? 400 : 500,
                    color: task.isCompleted ? "#8C929A" : "#17202B",
                    textDecoration: task.isCompleted ? "line-through" : "none",
                    lineHeight: 1.3,
                  }}
                >
                  {task.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.6875rem",
                    color: task.isCompleted
                      ? "#A3A7AF"
                      : task.priority === "high"
                      ? "#8C3F3B"
                      : "#40617E",
                    fontWeight: 500,
                    mt: 0.25,
                  }}
                >
                  {task.categoryLabel || `${task.category} · ${task.priority}`}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>

      {/* Footer Action */}
      <Box
        sx={{
          mt: 2.5,
          pt: 1.5,
          borderTop: "1px solid rgba(17, 28, 46, 0.06)",
        }}
      >
        <Button
          fullWidth
          onClick={onAddNewTask}
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          sx={{
            py: 0.75,
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "#68717C",
            borderRadius: 1.5,
            textTransform: "none",
            "&:hover": {
              bgcolor: "rgba(11, 22, 40, 0.04)",
              color: "#0B1628",
            },
          }}
        >
          Add new task
        </Button>
      </Box>
    </Card>
  );
}
