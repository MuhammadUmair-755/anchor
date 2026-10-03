"use client";

import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { tasksService } from "@/services/tasksService";
import {
  TaskItem,
  Project,
  WeeklyRhythmDay,
  TaskFilterTab,
  CreateTaskPayload,
} from "@/types/models";
import TasksView from "@/components/tasks/TasksView";
import AddTaskModal from "@/components/tasks/AddTaskModal";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [weeklyRhythm, setWeeklyRhythm] = useState<WeeklyRhythmDay[]>([]);
  const [activeTab, setActiveTab] = useState<TaskFilterTab>("today");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal & Feedback Toast State
  const [addTaskModalOpen, setAddTaskModalOpen] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "info" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Initial Data Hydration
  const loadTasksData = useCallback(async () => {
    try {
      const [fetchedTasks, fetchedProjects, fetchedRhythm] = await Promise.all([
        tasksService.getTasks(),
        tasksService.getActiveProjects(),
        tasksService.getWeeklyRhythm(),
      ]);
      setTasks(fetchedTasks);
      setProjects(fetchedProjects);
      setWeeklyRhythm(fetchedRhythm);
      setLoading(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load tasks and projects data";
      setError(msg);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasksData();
  }, [loadTasksData]);

  // Handle Interactive Task Completion Toggle
  const handleToggleTask = async (taskId: string) => {
    try {
      const updatedTask = await tasksService.toggleTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updatedTask : t))
      );
      // Also update projects in state to reflect completion sync
      const updatedProjects = await tasksService.getActiveProjects();
      setProjects(updatedProjects);

      setSnackbar({
        open: true,
        message: updatedTask.isCompleted
          ? `Task resolved: "${updatedTask.title}"`
          : `Task reopened: "${updatedTask.title}"`,
        severity: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle task";
      setSnackbar({ open: true, message: msg, severity: "error" });
    }
  };

  // Handle New Task Creation
  const handleCreateTask = async (payload: CreateTaskPayload) => {
    try {
      const newTask = await tasksService.createTask(payload);
      setTasks((prev) => [newTask, ...prev]);
      const updatedProjects = await tasksService.getActiveProjects();
      setProjects(updatedProjects);
      setAddTaskModalOpen(false);
      setSnackbar({
        open: true,
        message: `Task committed to ledger: "${newTask.title}"`,
        severity: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create task";
      setSnackbar({ open: true, message: msg, severity: "error" });
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 2,
        }}
      >
        <CircularProgress size={36} sx={{ color: "#0B1628" }} />
        <Typography
          sx={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "0.8125rem",
            color: "#68717C",
          }}
        >
          Synchronizing execution cadence &amp; project pipelines...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 6 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", minHeight: "100%" }}>
      {/* Primary Responsive Workspace */}
      <TasksView
        tasks={tasks}
        projects={projects}
        weeklyRhythm={weeklyRhythm}
        activeTab={activeTab}
        searchQuery={searchQuery}
        onTabChange={setActiveTab}
        onSearchChange={setSearchQuery}
        onToggleTask={handleToggleTask}
        onCreateTask={handleCreateTask}
        onOpenAddTask={() => setAddTaskModalOpen(true)}
      />

      {/* Rapid Task Capture Modal */}
      <AddTaskModal
        open={addTaskModalOpen}
        onClose={() => setAddTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        projects={projects}
      />

      {/* Floating Feedback Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ borderRadius: 2, boxShadow: "0 4px 16px rgba(11,22,40,0.15)" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
