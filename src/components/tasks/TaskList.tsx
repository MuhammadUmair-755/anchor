"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import { TaskItem } from "@/types/models";
import { CATEGORY_LABELS, TaskCategory, formatDue } from "@/services/tasksService";
import { localISODate } from "@/app/api/tasks/shared";

export interface TaskListProps {
  tasks: TaskItem[];
  emptyMessage: string;
  onToggle: (task: TaskItem) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
  onAdd: () => void;
}

const PRIORITY_COLORS = { high: "#8C3F3B", medium: "#9A6B1F", low: "#68717C" } as const;

export default function TaskList({ tasks, emptyMessage, onToggle, onEdit, onDelete, onAdd }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8, px: 2, border: "1px dashed rgba(17, 28, 46, 0.15)", borderRadius: 3 }}>
        <Typography sx={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontSize: "1.25rem", color: "#17202B", mb: 0.5 }}>
          {emptyMessage}
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", color: "#68717C", mb: 2.5 }}>
          Add a task to keep track of what matters.
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{ textTransform: "none", fontWeight: 600, color: "#3F6853", minHeight: 40 }}
        >
          Add task
        </Button>
      </Box>
    );
  }

  const today = localISODate();

  return (
    <Box
      component="ul"
      sx={{ listStyle: "none", m: 0, p: 0, bgcolor: "#FCFBF8", border: "1px solid rgba(17, 28, 46, 0.08)", borderRadius: 3, overflow: "hidden" }}
    >
      {tasks.map((task) => {
        const due = formatDue(task.dueDate, task.dueTime, today);
        const overdue = !task.isCompleted && !!task.dueDate && task.dueDate < today;
        return (
          <Box
            component="li"
            key={task.id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              pl: 1,
              pr: 1,
              py: 1,
              "& + li": { borderTop: "1px solid rgba(17, 28, 46, 0.08)" },
            }}
          >
            <Checkbox
              checked={task.isCompleted}
              onChange={() => onToggle(task)}
              slotProps={{ input: { "aria-label": task.isCompleted ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done` } }}
              sx={{ color: "rgba(17, 28, 46, 0.3)", "&.Mui-checked": { color: "#3F6853" } }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                  color: task.isCompleted ? "#68717C" : "#17202B",
                  textDecoration: task.isCompleted ? "line-through" : "none",
                  overflowWrap: "anywhere",
                }}
              >
                {task.title}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 1.25, rowGap: 0.25, mt: 0.25, fontSize: "0.75rem", color: "#68717C" }}>
                <Box component="span" sx={{ px: 0.75, borderRadius: 1, bgcolor: "rgba(63, 104, 83, 0.1)", color: "#3F6853", fontWeight: 600 }}>
                  {CATEGORY_LABELS[task.category as TaskCategory] ?? task.category}
                </Box>
                <Box component="span" sx={{ color: PRIORITY_COLORS[task.priority], fontWeight: 600, textTransform: "capitalize" }}>
                  {task.priority} priority
                </Box>
                {due && (
                  <Box component="span" sx={{ color: overdue ? "#8C3F3B" : "#68717C" }}>
                    {overdue ? `Overdue · ${due}` : due}
                  </Box>
                )}
              </Box>
            </Box>
            <Tooltip title="Edit">
              <IconButton aria-label={`Edit "${task.title}"`} onClick={() => onEdit(task)} sx={{ width: 40, height: 40, color: "#68717C" }}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton aria-label={`Delete "${task.title}"`} onClick={() => onDelete(task)} sx={{ width: 40, height: 40, color: "#68717C", "&:hover": { color: "#8C3F3B" } }}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      })}
    </Box>
  );
}
