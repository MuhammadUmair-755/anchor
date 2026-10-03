"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import { TaskItem } from "@/types/models";

export interface ExecutionPipelineProps {
  tasks: TaskItem[];
  onToggleTask: (taskId: string) => Promise<void> | void;
  rhythmNote?: string;
}

export default function ExecutionPipeline({
  tasks,
  onToggleTask,
  rhythmNote = "Deep work block allocated for 2:30 PM — 4:00 PM. No context switching permitted during the TypeScript performance audit.",
}: ExecutionPipelineProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Group Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            fontSize: "0.6875rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#68717C",
          }}
        >
          Execution Pipeline
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "0.75rem",
            color: "#68717C",
            fontFeatureSettings: '"tnum" on',
          }}
        >
          {tasks.length} ITEMS
        </Typography>
      </Box>

      {/* Task Rows List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
        {tasks.length === 0 ? (
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              bgcolor: "#FCFBF8",
              borderRadius: "12px",
              border: "1px dashed rgba(17, 28, 46, 0.15)",
              color: "#68717C",
              fontSize: "0.875rem",
            }}
          >
            No tasks found matching this criteria.
          </Box>
        ) : (
          tasks.map((task) => {
            const isHighPriority = task.priority === "high";

            return (
              <Box
                key={task.id}
                sx={{
                  bgcolor: "#FCFBF8",
                  borderRadius: "10px",
                  p: 2,
                  border: "1px solid rgba(17, 28, 46, 0.08)",
                  borderLeft:
                    !task.isCompleted && isHighPriority
                      ? "3px solid #C76D68"
                      : "1px solid rgba(17, 28, 46, 0.08)",
                  boxShadow: "0 1px 3px rgba(11, 22, 40, 0.02)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                  transition: "all 0.15s ease",
                  "&:hover": {
                    borderColor: "rgba(17, 28, 46, 0.2)",
                  },
                }}
              >
                {/* Interactive Checkbox */}
                <Box
                  component="button"
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  aria-label={`Toggle task "${task.title}"`}
                  sx={{
                    mt: 0.25,
                    width: 20,
                    height: 20,
                    minWidth: 20,
                    borderRadius: "4px",
                    border: task.isCompleted
                      ? "1.5px solid #0B1628"
                      : "1.5px solid rgba(11, 22, 40, 0.28)",
                    bgcolor: task.isCompleted ? "#0B1628" : "#FCFBF8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    p: 0,
                    transition: "all 0.12s ease",
                    "&:hover": {
                      borderColor: "#0B1628",
                    },
                  }}
                >
                  {task.isCompleted && (
                    <CheckIcon sx={{ fontSize: 14, color: "#FCFBF8" }} />
                  )}
                </Box>

                {/* Task Details */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    onClick={() => onToggleTask(task.id)}
                    sx={{
                      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: task.isCompleted ? 400 : 500,
                      color: task.isCompleted ? "#75777D" : "#0B1628",
                      textDecoration: task.isCompleted ? "line-through" : "none",
                      cursor: "pointer",
                      lineHeight: 1.4,
                    }}
                  >
                    {task.title}
                  </Typography>

                  {/* Metadata Row */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 0.75,
                      mt: 0.75,
                    }}
                  >
                    {/* Status / Priority Pill */}
                    {task.statusBadge ? (
                      <Box
                        sx={{
                          px: 0.75,
                          py: 0.2,
                          borderRadius: 1,
                          fontSize: "0.625rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          bgcolor:
                            task.statusBadge.toLowerCase().includes("done")
                              ? "rgba(95, 146, 119, 0.15)"
                              : task.statusBadge === "HIGH"
                              ? "rgba(199, 109, 104, 0.15)"
                              : task.statusBadge === "Learning"
                              ? "rgba(188, 222, 255, 0.4)"
                              : "#F0EEE8",
                          color:
                            task.statusBadge.toLowerCase().includes("done")
                              ? "#3F6853"
                              : task.statusBadge === "HIGH"
                              ? "#8C3F3B"
                              : task.statusBadge === "Learning"
                              ? "#274A65"
                              : "#68717C",
                        }}
                      >
                        {task.statusBadge}
                      </Box>
                    ) : isHighPriority ? (
                      <Box
                        sx={{
                          px: 0.75,
                          py: 0.2,
                          borderRadius: 1,
                          bgcolor: "rgba(199, 109, 104, 0.15)",
                          color: "#8C3F3B",
                          fontSize: "0.625rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        High Priority
                      </Box>
                    ) : null}

                    {/* Category */}
                    {task.categoryLabel && (
                      <>
                        <Typography sx={{ color: "#9E9E9E", fontSize: "0.625rem" }}>
                          •
                        </Typography>
                        <Box
                          sx={{
                            px: 0.75,
                            py: 0.2,
                            borderRadius: 1,
                            bgcolor:
                              task.category.toLowerCase() === "finance"
                                ? "rgba(95, 146, 119, 0.16)"
                                : task.category.toLowerCase() === "learning"
                                ? "rgba(188, 222, 255, 0.5)"
                                : "#F0EEE8",
                            color:
                              task.category.toLowerCase() === "finance"
                                ? "#3F6853"
                                : task.category.toLowerCase() === "learning"
                                ? "#274A65"
                                : "#40617E",
                            fontSize: "0.625rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          {task.categoryLabel}
                        </Box>
                      </>
                    )}

                    {/* Due info / Notes */}
                    {task.dueInfo && (
                      <>
                        <Typography sx={{ color: "#9E9E9E", fontSize: "0.625rem" }}>
                          •
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "var(--font-jetbrains-mono), monospace",
                            fontSize: "0.6875rem",
                            color: "#68717C",
                            fontFeatureSettings: '"tnum" on',
                          }}
                        >
                          {task.dueInfo}
                        </Typography>
                      </>
                    )}

                    {/* Estimated minutes */}
                    {task.estimatedMinutes && (
                      <>
                        <Typography sx={{ color: "#9E9E9E", fontSize: "0.625rem" }}>
                          •
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "var(--font-jetbrains-mono), monospace",
                            fontSize: "0.6875rem",
                            color: "#40617E",
                            fontFeatureSettings: '"tnum" on',
                          }}
                        >
                          Est. {task.estimatedMinutes} min
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      {/* Contextual Rhythm Guardrail Inset */}
      <Box
        sx={{
          bgcolor: "#EFECE2",
          borderRadius: "12px",
          p: 2,
          border: "1px solid rgba(11, 22, 40, 0.06)",
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          mt: 1,
        }}
      >
        <LightbulbOutlinedIcon
          sx={{ fontSize: 20, color: "#45474C", mt: 0.25 }}
        />
        <Typography
          variant="body2"
          sx={{
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            fontSize: "0.75rem",
            color: "#45474C",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: "#17202B" }}>Rhythm Guardrail:</strong>{" "}
          {rhythmNote}
        </Typography>
      </Box>
    </Box>
  );
}
