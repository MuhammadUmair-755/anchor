"use client";

import React, { useMemo } from "react";
import Box from "@mui/material/Box";
import {
  TaskItem,
  Project,
  WeeklyRhythmDay,
  TaskFilterTab,
  MobileTaskTab,
  CreateTaskPayload,
} from "@/types/models";
import MobileTasksView from "./MobileTasksView";
import TasksHeader from "./TasksHeader";
import ExecutionCoreCard from "./ExecutionCoreCard";
import ExecutionPipeline from "./ExecutionPipeline";
import ActiveProjectsGrid from "./ActiveProjectsGrid";
import DailyVelocityCard from "./DailyVelocityCard";
import QuickTaskCaptureCard from "./QuickTaskCaptureCard";

export interface TasksViewProps {
  tasks: TaskItem[];
  projects: Project[];
  weeklyRhythm: WeeklyRhythmDay[];
  activeTab: TaskFilterTab;
  searchQuery: string;
  onTabChange: (tab: TaskFilterTab) => void;
  onSearchChange: (query: string) => void;
  onToggleTask: (taskId: string) => Promise<void> | void;
  onCreateTask: (payload: CreateTaskPayload) => Promise<void> | void;
  onOpenAddTask: () => void;
}

export default function TasksView({
  tasks,
  projects,
  weeklyRhythm,
  activeTab,
  searchQuery,
  onTabChange,
  onSearchChange,
  onToggleTask,
  onCreateTask,
  onOpenAddTask,
}: TasksViewProps) {
  // Mobile active tab sync
  const mobileActiveTab: MobileTaskTab = useMemo(() => {
    if (activeTab === "completed") return "completed";
    if (activeTab === "upcoming") return "upcoming";
    return "today";
  }, [activeTab]);

  const handleMobileTabChange = (mobileTab: MobileTaskTab) => {
    if (mobileTab === "projects") {
      onTabChange("today");
    } else {
      onTabChange(mobileTab);
    }
  };

  // Filter tasks based on search & active tab
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Tab filtering
    if (activeTab === "today") {
      result = result.filter(
        (t) =>
          !t.isCompleted ||
          t.dueInfo?.toLowerCase().includes("today") ||
          t.dueInfo?.toLowerCase().includes("am") ||
          t.dueInfo?.toLowerCase().includes("pm") ||
          t.tabCategory === "today"
      );
    } else if (activeTab === "upcoming") {
      result = result.filter(
        (t) =>
          !t.isCompleted &&
          (t.tabCategory === "upcoming" ||
            t.dueInfo?.toLowerCase().includes("tomorrow") ||
            t.dueInfo?.toLowerCase().includes("oct"))
      );
    } else if (activeTab === "overdue") {
      result = result.filter(
        (t) => (!t.isCompleted && t.priority === "high") || t.tabCategory === "overdue"
      );
    } else if (activeTab === "completed") {
      result = result.filter((t) => t.isCompleted);
    } else if (activeTab === "backlog") {
      result = result.filter(
        (t) => (!t.isCompleted && t.priority === "low") || t.tabCategory === "backlog"
      );
    }

    // Search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.categoryLabel?.toLowerCase().includes(q) ||
          t.domain?.toLowerCase().includes(q) ||
          t.projectName?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [tasks, activeTab, searchQuery]);

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const overdueCount = tasks.filter(
    (t) => !t.isCompleted && (t.priority === "high" || t.tabCategory === "overdue")
  ).length;

  return (
    <Box sx={{ width: "100%" }}>
      {/* 1. MOBILE VIEWPORT (<768px): Dedicated Mobile Flow */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <MobileTasksView
          tasks={filteredTasks}
          projects={projects}
          activeTab={mobileActiveTab}
          onTabChange={handleMobileTabChange}
          onToggleTask={onToggleTask}
          onOpenCaptureModal={onOpenAddTask}
        />
      </Box>

      {/* 2. TABLET & DESKTOP VIEWPORT (>=768px): Responsive Multi-Column Grid */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Box
          sx={{
            maxWidth: 1440,
            width: "100%",
            mx: "auto",
            px: { xs: 2, sm: 3, lg: 4 },
            pt: { xs: 2, lg: 3 },
            pb: 8,
            display: "flex",
            flexDirection: "column",
            gap: 3.5,
          }}
        >
          {/* Desktop Sub-Bar & Filter Header */}
          <TasksHeader
            activeTab={activeTab}
            onTabChange={onTabChange}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onOpenAddTask={onOpenAddTask}
            overdueCount={overdueCount}
          />

          {/* 12-Column Responsive Workspace Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(12, 1fr)",
              },
              gap: 3,
              alignItems: "flex-start",
            }}
          >
            {/* Column 1: Primary Task Execution (Desktop: 5 cols; Tablet: 7 cols) */}
            <Box
              sx={{
                gridColumn: { xs: "span 12", md: "span 7", xl: "span 5" },
                display: "flex",
                flexDirection: "column",
                gap: 3,
                minWidth: 0,
              }}
            >
              <ExecutionCoreCard tasks={tasks} />
              <ExecutionPipeline tasks={filteredTasks} onToggleTask={onToggleTask} />
            </Box>

            {/* Column 2: Projects & Systems Hub (Desktop: 4 cols; Tablet: 5 cols) */}
            <Box
              sx={{
                gridColumn: { xs: "span 12", md: "span 5", xl: "span 4" },
                display: "flex",
                flexDirection: "column",
                gap: 3,
                minWidth: 0,
              }}
            >
              <ActiveProjectsGrid projects={projects} />
            </Box>

            {/* Column 3: Execution Metrics & Quick Task Capture (Desktop: 3 cols; Tablet: 12 cols below) */}
            <Box
              sx={{
                gridColumn: { xs: "span 12", md: "span 12", xl: "span 3" },
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", xl: "1fr" },
                gap: 3,
                minWidth: 0,
              }}
            >
              <DailyVelocityCard
                weeklyRhythm={weeklyRhythm}
                completedCount={completedCount}
              />
              <QuickTaskCaptureCard projects={projects} onSubmit={onCreateTask} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
