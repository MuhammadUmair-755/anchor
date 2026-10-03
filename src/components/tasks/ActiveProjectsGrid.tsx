"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Project } from "@/types/models";

export interface ActiveProjectsGridProps {
  projects: Project[];
  onViewAll?: () => void;
  onSelectProject?: (projectId: string) => void;
}

export default function ActiveProjectsGrid({
  projects,
  onViewAll,
  onSelectProject,
}: ActiveProjectsGridProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
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
            Portfolio Domains
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontFamily: "var(--font-newsreader), Georgia, serif",
              fontSize: "1.5rem",
              fontWeight: 500,
              color: "#0B1628",
              mt: 0.25,
            }}
          >
            Active Projects
          </Typography>
        </Box>

        <Button
          onClick={onViewAll}
          endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
          sx={{
            color: "#40617E",
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "none",
            p: 0,
            minWidth: "auto",
            "&:hover": { bgcolor: "transparent", color: "#0B1628" },
          }}
        >
          View All
        </Button>
      </Box>

      {/* Projects Cards */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {projects.map((project) => {
          const isSovereign = project.id.includes("sovereign");
          const isNextJs = project.id.includes("nextjs");

          const tagBg = isSovereign
            ? "rgba(255, 242, 178, 0.5)"
            : isNextJs
            ? "rgba(95, 146, 119, 0.15)"
            : "rgba(205, 229, 255, 0.4)";

          const tagColor = isSovereign
            ? "#7A5B10"
            : isNextJs
            ? "#3F6853"
            : "#274a65";

          const barColor = isSovereign ? "#3F6853" : "#0B1628";

          return (
            <Box
              key={project.id}
              onClick={() => onSelectProject?.(project.id)}
              sx={{
                bgcolor: "#FCFBF8",
                borderRadius: "12px",
                p: 2.5,
                border: "1px solid rgba(17, 28, 46, 0.08)",
                boxShadow: "0 2px 8px -2px rgba(11, 22, 40, 0.04)",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                cursor: onSelectProject ? "pointer" : "default",
                transition: "all 0.15s ease",
                "&:hover": {
                  borderColor: "rgba(17, 28, 46, 0.2)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              {/* Top Row: Tag & Percentage */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    px: 1,
                    py: 0.35,
                    borderRadius: 1,
                    bgcolor: tagBg,
                    color: tagColor,
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {project.tag}
                </Box>
                <Typography
                  sx={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: isSovereign ? "#3F6853" : "#0B1628",
                    fontFeatureSettings: '"tnum" on',
                  }}
                >
                  {project.progressPercentage}%
                </Typography>
              </Box>

              {/* Title & Description */}
              <Box>
                <Typography
                  sx={{
                    fontFamily: "var(--font-newsreader), Georgia, serif",
                    fontSize: "1.0625rem",
                    fontWeight: 600,
                    color: "#0B1628",
                  }}
                >
                  {project.title}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                    fontSize: "0.75rem",
                    color: "#68717C",
                    lineHeight: 1.5,
                    mt: 0.25,
                  }}
                >
                  {project.description}
                </Typography>
              </Box>

              {/* Progress Meter */}
              <Box sx={{ mt: 0.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={project.progressPercentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "#EFECE2",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: barColor,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>

              {/* Footer Milestone */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  pt: 1,
                  borderTop: "1px solid rgba(17, 28, 46, 0.05)",
                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                  fontSize: "0.6875rem",
                  color: "#68717C",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  {isSovereign ? (
                    <CalendarMonthIcon sx={{ fontSize: 15, color: "#68717C" }} />
                  ) : (
                    <FlagOutlinedIcon sx={{ fontSize: 15, color: "#68717C" }} />
                  )}
                  <span>
                    {isSovereign ? "Target: " : "Next: "}
                    {project.nextMilestone}
                  </span>
                </Box>
                <Box
                  sx={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontFeatureSettings: '"tnum" on',
                  }}
                >
                  {project.tasksCompleted}/{project.totalTasks} tasks
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* System Phases Ledger Tray */}
      <Box
        sx={{
          bgcolor: "#F5F3ED",
          borderRadius: "12px",
          p: 2,
          border: "1px solid rgba(17, 28, 46, 0.06)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
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
            System Phases
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "0.6875rem",
              color: "#68717C",
            }}
          >
            Q4 Active
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Box
            sx={{
              px: 1.25,
              py: 0.5,
              borderRadius: 1.5,
              bgcolor: "#FCFBF8",
              border: "1px solid rgba(17, 28, 46, 0.08)",
              fontSize: "0.6875rem",
              fontWeight: 500,
              color: "#17202B",
            }}
          >
            Phase I: Foundation
          </Box>
          <Box
            sx={{
              px: 1.25,
              py: 0.5,
              borderRadius: 1.5,
              bgcolor: "#0B1628",
              color: "#FCFBF8",
              fontSize: "0.6875rem",
              fontWeight: 600,
            }}
          >
            Phase II: Scaling (Active)
          </Box>
          <Box
            sx={{
              px: 1.25,
              py: 0.5,
              borderRadius: 1.5,
              bgcolor: "#FCFBF8",
              border: "1px solid rgba(17, 28, 46, 0.08)",
              fontSize: "0.6875rem",
              fontWeight: 500,
              color: "#75777D",
            }}
          >
            Phase III: Hardening
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
