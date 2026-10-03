"use client";

import React, { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import SplitscreenIcon from "@mui/icons-material/Splitscreen";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AddIcon from "@mui/icons-material/Add";
import EditNoteIcon from "@mui/icons-material/EditNote";
import EventIcon from "@mui/icons-material/Event";
import CodeIcon from "@mui/icons-material/Code";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CheckIcon from "@mui/icons-material/Check";
import { TaskItem, Project, MobileTaskTab } from "@/types/models";

export interface MobileTasksViewProps {
  tasks: TaskItem[];
  projects: Project[];
  activeTab: MobileTaskTab;
  onTabChange: (tab: MobileTaskTab) => void;
  onToggleTask: (taskId: string) => Promise<void> | void;
  onOpenCaptureModal: () => void;
}

export default function MobileTasksView({
  tasks,
  projects,
  activeTab,
  onTabChange,
  onToggleTask,
  onOpenCaptureModal,
}: MobileTasksViewProps) {
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length || 1;
  const velocityPercent = Math.round((completedCount / totalCount) * 100);
  const pendingCount = Math.max(0, totalCount - completedCount);

  // Filter tasks based on activeTab
  const visibleTasks = useMemo(() => {
    if (activeTab === "completed") return tasks.filter((t) => t.isCompleted);
    if (activeTab === "upcoming")
      return tasks.filter(
        (t) =>
          !t.isCompleted &&
          (t.dueInfo?.toLowerCase().includes("tomorrow") ||
            t.dueInfo?.toLowerCase().includes("oct"))
      );
    // 'today' or 'projects' shows all relevant daily tasks
    return tasks;
  }, [tasks, activeTab]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 480,
        mx: "auto",
        px: { xs: 1.5, sm: 2 },
        pt: 1,
        pb: 12, // Clearance for MobileBottomNav + FAB
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      {/* 1. EDITORIAL HEADER STRIP */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          pt: 0.5,
        }}
      >
        <Box>
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
            Temporal Focus
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "var(--font-newsreader), Georgia, serif",
              fontSize: "1.75rem",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              color: "#0B1628",
              lineHeight: 1.2,
            }}
          >
            Daily Cadence
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#40617E",
              fontFeatureSettings: '"tnum" on',
            }}
          >
            WED, OCT 25
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "0.6875rem",
              color: "#68717C",
              fontFeatureSettings: '"tnum" on',
            }}
          >
            WEEK 43 / CYCLE II
          </Typography>
        </Box>
      </Box>

      {/* 2. VIEW SWITCHER PILL TABS */}
      <Box
        component="nav"
        aria-label="View Switcher"
        sx={{
          bgcolor: "rgba(17, 28, 46, 0.05)",
          p: 0.5,
          borderRadius: 2,
          display: "flex",
          gap: 0.5,
        }}
      >
        {(["today", "upcoming", "projects", "completed"] as MobileTaskTab[]).map(
          (tab) => {
            const isActive = activeTab === tab;
            const labels: Record<MobileTaskTab, string> = {
              today: "Today",
              upcoming: "Upcoming",
              projects: "Projects",
              completed: "Completed",
            };
            return (
              <Box
                key={tab}
                component="button"
                type="button"
                onClick={() => onTabChange(tab)}
                sx={{
                  flex: 1,
                  py: 0.75,
                  px: 1,
                  borderRadius: 1.5,
                  border: "none",
                  cursor: "pointer",
                  bgcolor: isActive ? "#FCFBF8" : "transparent",
                  color: isActive ? "#0B1628" : "#68717C",
                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  boxShadow: isActive ? "0 1px 3px rgba(11,22,40,0.08)" : "none",
                  transition: "all 0.15s ease",
                  "&:active": { transform: "scale(0.96)" },
                }}
              >
                {labels[tab]}
              </Box>
            );
          }
        )}
      </Box>

      {/* 3. TODAY'S VELOCITY CARD */}
      <Box
        sx={{
          bgcolor: "#FCFBF8",
          borderRadius: 3,
          p: 2,
          border: "1px solid rgba(17, 28, 46, 0.08)",
          boxShadow: "0 2px 8px -2px rgba(11, 22, 40, 0.04)",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#40617E" }} />
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
              Daily Momentum
            </Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#0B1628",
              fontFeatureSettings: '"tnum" on',
            }}
          >
            {velocityPercent}% Velocity
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
            <Typography
              sx={{
                fontFamily: "var(--font-newsreader), Georgia, serif",
                fontSize: "1.75rem",
                fontWeight: 500,
                color: "#0B1628",
                lineHeight: 1,
                fontFeatureSettings: '"tnum" on',
              }}
            >
              {completedCount}
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: "0.875rem",
                color: "#68717C",
              }}
            >
              of
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-newsreader), Georgia, serif",
                fontSize: "1.5rem",
                fontWeight: 500,
                color: "#0B1628",
                lineHeight: 1,
                fontFeatureSettings: '"tnum" on',
              }}
            >
              {totalCount}
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: "0.75rem",
                color: "#68717C",
                ml: 0.5,
              }}
            >
              Tasks Completed
            </Typography>
          </Box>

          <Button
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
            onClick={onOpenCaptureModal}
            sx={{
              minHeight: 36,
              px: 1.5,
              bgcolor: "#F0EEE8",
              color: "#0B1628",
              borderRadius: 2,
              border: "1px solid rgba(17, 28, 46, 0.06)",
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              "&:hover": { bgcolor: "#EAE8E2" },
              "&:active": { transform: "scale(0.96)" },
            }}
          >
            Quick Task
          </Button>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ pt: 0.5 }}>
          <LinearProgress
            variant="determinate"
            value={velocityPercent}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "#F0EEE8",
              "& .MuiLinearProgress-bar": {
                bgcolor: "#0B1628",
                borderRadius: 4,
                transition: "transform 0.4s ease",
              },
            }}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 1,
              color: "#68717C",
              fontSize: "0.6875rem",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontFeatureSettings: '"tnum" on',
            }}
          >
            <span>{pendingCount} pending for evening closure</span>
            <span>Target: 100% by 20:00</span>
          </Box>
        </Box>
      </Box>

      {/* 4. CHRONOLOGICAL EXECUTION QUEUE */}
      {activeTab !== "projects" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SplitscreenIcon sx={{ fontSize: 18, color: "#40617E" }} />
              <Typography
                sx={{
                  fontFamily: "var(--font-newsreader), Georgia, serif",
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "#0B1628",
                }}
              >
                Chronological Execution
              </Typography>
            </Box>
            <Typography
              sx={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "0.6875rem",
                color: "#68717C",
                fontFeatureSettings: '"tnum" on',
              }}
            >
              {visibleTasks.length} REGISTERED
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {visibleTasks.map((task) => {
              const isHighPriority = task.priority === "high";
              return (
                <Box
                  key={task.id}
                  sx={{
                    bgcolor: "#FCFBF8",
                    borderRadius: 2,
                    p: 1.75,
                    border: "1px solid rgba(17, 28, 46, 0.08)",
                    borderLeft:
                      !task.isCompleted && isHighPriority
                        ? "3px solid #C76D68"
                        : "1px solid rgba(17, 28, 46, 0.08)",
                    boxShadow: "0 1px 3px rgba(11, 22, 40, 0.02)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    transition: "border-color 0.15s ease",
                    "&:hover": { borderColor: "rgba(17, 28, 46, 0.2)" },
                  }}
                >
                  {/* Custom Checkbox */}
                  <Box
                    component="button"
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    aria-label={`Mark "${task.title}" as ${task.isCompleted ? "incomplete" : "complete"}`}
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
                      transition: "all 0.12s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        borderColor: "#0B1628",
                      },
                    }}
                  >
                    {task.isCompleted && <CheckIcon sx={{ fontSize: 14, color: "#FCFBF8" }} />}
                  </Box>

                  {/* Task Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      onClick={() => onToggleTask(task.id)}
                      sx={{
                        fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                        fontSize: "0.875rem",
                        fontWeight: task.isCompleted ? 400 : 500,
                        color: task.isCompleted ? "#68717C" : "#0B1628",
                        textDecoration: task.isCompleted ? "line-through" : "none",
                        cursor: "pointer",
                        lineHeight: 1.4,
                      }}
                    >
                      {task.title}
                    </Typography>

                    {/* Metadata Chips */}
                    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.75, mt: 0.75 }}>
                      {isHighPriority && (
                        <Box
                          sx={{
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: "rgba(199, 109, 104, 0.15)",
                            color: "#8C3F3B",
                            fontSize: "0.625rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          High Priority
                        </Box>
                      )}

                      {task.categoryLabel && (
                        <>
                          {isHighPriority && <Typography sx={{ color: "#68717C", fontSize: "0.625rem" }}>•</Typography>}
                          <Box
                            sx={{
                              px: 0.75,
                              py: 0.25,
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
                              letterSpacing: "0.05em",
                            }}
                          >
                            {task.categoryLabel}
                          </Box>
                        </>
                      )}

                      {task.dueInfo && (
                        <>
                          <Typography sx={{ color: "#68717C", fontSize: "0.625rem" }}>•</Typography>
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

                      {task.estimatedMinutes && (
                        <>
                          <Typography sx={{ color: "#68717C", fontSize: "0.625rem" }}>•</Typography>
                          <Typography
                            sx={{
                              fontFamily: "var(--font-jetbrains-mono), monospace",
                              fontSize: "0.6875rem",
                              color: "#40617E",
                              fontFeatureSettings: '"tnum" on',
                            }}
                          >
                            Est {task.estimatedMinutes}m
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* Trailing Icon Option */}
                  <IconButton
                    size="small"
                    sx={{
                      color: "#68717C",
                      p: 0.5,
                      "&:hover": { color: "#0B1628" },
                    }}
                  >
                    {task.isFocusBlock ? (
                      <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <MoreHorizIcon sx={{ fontSize: 18 }} />
                    )}
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* 5. ACTIVE PROJECTS SNAPSHOT CARDS */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FolderSpecialIcon sx={{ fontSize: 18, color: "#40617E" }} />
            <Typography
              sx={{
                fontFamily: "var(--font-newsreader), Georgia, serif",
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "#0B1628",
              }}
            >
              Active Projects Snapshot
            </Typography>
          </Box>
          <Box
            component="button"
            type="button"
            onClick={() => onTabChange("projects")}
            sx={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.6875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "#40617E",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            View All
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 1.5 }}>
          {projects.slice(0, 2).map((project, idx) => (
            <Box
              key={project.id}
              sx={{
                bgcolor: "#FCFBF8",
                borderRadius: 3,
                p: 2,
                border: "1px solid rgba(17, 28, 46, 0.08)",
                boxShadow: "0 2px 8px -2px rgba(11, 22, 40, 0.04)",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#68717C",
                    }}
                  >
                    DOMAIN 0{idx + 1}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-newsreader), Georgia, serif",
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#0B1628",
                      mt: 0.25,
                    }}
                  >
                    {project.title}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: "#F0EEE8",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#40617E",
                    fontFeatureSettings: '"tnum" on',
                  }}
                >
                  {project.progressPercentage}%
                </Box>
              </Box>

              {/* Progress bar */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                <LinearProgress
                  variant="determinate"
                  value={project.progressPercentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "#F0EEE8",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "#0B1628",
                      borderRadius: 3,
                    },
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "#68717C" }}>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: "0.6875rem",
                      color: "#0B1628",
                      fontWeight: 500,
                      fontFeatureSettings: '"tnum" on',
                    }}
                  >
                    {project.tasksCompleted} of {project.totalTasks} tasks closed
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: "0.6875rem",
                      color: "#68717C",
                    }}
                  >
                    Updated 2h ago
                  </Typography>
                </Box>
              </Box>

              {/* Milestone Footer */}
              <Box
                sx={{
                  pt: 1.25,
                  borderTop: "1px solid rgba(17, 28, 46, 0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "#68717C" }}>
                  {idx === 0 ? <EventIcon sx={{ fontSize: 16 }} /> : <CodeIcon sx={{ fontSize: 16 }} />}
                  <Typography sx={{ fontSize: "0.6875rem", color: "#68717C" }}>
                    {project.nextMilestone}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    p: 0,
                    minWidth: "auto",
                    color: "#0B1628",
                    fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    "&:hover": { bgcolor: "transparent", opacity: 0.8 },
                  }}
                >
                  Open
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 6. CRYPTOGRAPHIC LEDGER STAMP WELL */}
      <Box
        sx={{
          bgcolor: "#F0EEE8",
          borderRadius: 2,
          p: 1.5,
          border: "1px solid rgba(17, 28, 46, 0.05)",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <VerifiedUserIcon sx={{ fontSize: 20, color: "#40617E" }} />
        <Typography
          sx={{
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            fontSize: "0.75rem",
            color: "#68717C",
            lineHeight: 1.5,
          }}
        >
          All execution cycles are cryptographically stamped to ledger storage every night at 23:59 GMT.
        </Typography>
      </Box>

      {/* 7. FLOATING ACTION BUTTON (FAB) DOCKED AT BOTTOM-RIGHT */}
      <Box
        sx={{
          position: "fixed",
          bottom: 80, // Sits above 64px MobileBottomNav
          right: 16,
          zIndex: 1150,
          display: { xs: "block", md: "none" },
        }}
      >
        <Button
          variant="contained"
          onClick={onOpenCaptureModal}
          startIcon={<EditNoteIcon sx={{ fontSize: 20 }} />}
          sx={{
            minHeight: 48,
            px: 2.25,
            borderRadius: "9999px",
            bgcolor: "#0B1628",
            color: "#FCFBF8",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 8px 20px -4px rgba(11, 22, 40, 0.3)",
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            "&:hover": { bgcolor: "#162338" },
            "&:active": { transform: "scale(0.96)" },
          }}
        >
          Capture
        </Button>
      </Box>
    </Box>
  );
}
