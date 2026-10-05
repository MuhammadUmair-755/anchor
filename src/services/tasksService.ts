import {
  TaskItem,
  TaskFilterTab,
  CreateTaskPayload,
  Project,
  WeeklyRhythmDay,
  ExecutionRhythmData,
  SystemPhase,
  TasksVelocityMetrics,
  TasksPageData,
} from '@/types/models';
import {
  mockTaskItems,
  mockActiveProjects,
  mockWeeklyRhythm,
  mockExecutionRhythm,
  mockSystemPhases,
  mockVelocityMetrics,
} from './mockData';
import { apiFetch } from '@/lib/api/client';

// Mutable in-memory stores initialized with deep clones of authoritative fixtures
let tasksStore: TaskItem[] = JSON.parse(JSON.stringify(mockTaskItems));
let projectsStore: Project[] = JSON.parse(JSON.stringify(mockActiveProjects));
let weeklyRhythmStore: WeeklyRhythmDay[] = JSON.parse(JSON.stringify(mockWeeklyRhythm));
let executionRhythmStore: ExecutionRhythmData = JSON.parse(JSON.stringify(mockExecutionRhythm));
let systemPhasesStore: SystemPhase[] = JSON.parse(JSON.stringify(mockSystemPhases));

/**
 * Tasks Service - Asynchronous business logic for Tasks & Projects Command Center
 */
export const tasksService = {
  /**
   * Retrieves full page data from /api/tasks
   */
  async getPageData(): Promise<TasksPageData> {
    const apiData = await apiFetch<TasksPageData>('/api/tasks');
    if (apiData) {
      tasksStore = apiData.tasks;
      projectsStore = apiData.activeProjects;
      return apiData;
    }

    return {
      tasks: JSON.parse(JSON.stringify(tasksStore)),
      activeProjects: JSON.parse(JSON.stringify(projectsStore)),
      weeklyRhythm: JSON.parse(JSON.stringify(weeklyRhythmStore)),
      executionRhythm: JSON.parse(JSON.stringify(executionRhythmStore)),
      velocityMetrics: {
        completedCount: tasksStore.filter((t) => t.isCompleted).length,
        weeklyAverageDelta: mockVelocityMetrics.weeklyAverageDelta,
        weeklyRhythm: JSON.parse(JSON.stringify(weeklyRhythmStore)),
        syncStatus: 'Local Store',
        syncLatencyMs: 0,
      },
      systemPhases: JSON.parse(JSON.stringify(systemPhasesStore)),
    };
  },

  /**
   * Retrieves tasks filtered by tab category (or all tasks if unspecified)
   */
  async getTasks(filter?: TaskFilterTab): Promise<TaskItem[]> {
    const url = filter ? `/api/tasks?tab=${filter}` : '/api/tasks';
    const apiData = await apiFetch<TasksPageData>(url);
    if (apiData?.tasks) {
      tasksStore = apiData.tasks;
      return apiData.tasks;
    }

    let result = [...tasksStore];
    if (filter) {
      if (filter === 'completed') {
        result = result.filter((t) => t.isCompleted);
      } else if (filter === 'today') {
        result = result.filter((t) => t.tabCategory === 'today');
      } else {
        result = result.filter((t) => t.tabCategory === filter);
      }
    }

    return JSON.parse(JSON.stringify(result));
  },

  /**
   * Toggles completion status of a task and synchronizes project statistics
   */
  async toggleTask(id: string): Promise<TaskItem> {
    const taskIndex = tasksStore.findIndex((t) => t.id === id);
    const existing = taskIndex !== -1 ? tasksStore[taskIndex] : null;
    const nextCompleted = existing ? !existing.isCompleted : true;

    const apiTask = await apiFetch<TaskItem>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isCompleted: nextCompleted }),
    });

    if (apiTask) {
      if (taskIndex !== -1) {
        tasksStore[taskIndex] = apiTask;
      }
      return apiTask;
    }

    if (!existing) {
      throw new Error(`Task with id "${id}" not found.`);
    }

    const updatedTask: TaskItem = {
      ...existing,
      isCompleted: nextCompleted,
      completedAt: nextCompleted ? new Date().toISOString() : undefined,
      statusBadge: nextCompleted ? 'Done' : existing.priority === 'high' ? 'HIGH' : undefined,
    };

    tasksStore[taskIndex] = updatedTask;
    return JSON.parse(JSON.stringify(updatedTask));
  },

  /**
   * Creates a new task via Quick Task Capture and unshifts into the active queue
   */
  async createTask(payload: CreateTaskPayload): Promise<TaskItem> {
    const apiTask = await apiFetch<TaskItem>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (apiTask) {
      tasksStore.unshift(apiTask);
      return apiTask;
    }

    const id = `task-local-${Date.now()}`;
    const newTask: TaskItem = {
      id,
      title: payload.title.trim(),
      isCompleted: false,
      priority: payload.priority,
      category: payload.category || 'work',
      categoryLabel: (payload.category || 'work').toUpperCase(),
      dueDate: payload.dueDate || '2026-10-05',
      dueInfo: payload.dueInfo || 'Today',
      tabCategory: payload.tabCategory || 'today',
      createdAt: new Date().toISOString(),
    };

    tasksStore.unshift(newTask);
    return JSON.parse(JSON.stringify(newTask));
  },

  /**
   * Deletes a task by ID
   */
  async deleteTask(id: string): Promise<void> {
    await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
    tasksStore = tasksStore.filter((t) => t.id !== id);
  },

  /**
   * Retrieves the 3 active portfolio projects
   */
  async getActiveProjects(): Promise<Project[]> {
    return JSON.parse(JSON.stringify(projectsStore));
  },

  /**
   * Retrieves 7-day weekly rhythm bar heights
   */
  async getWeeklyRhythm(): Promise<WeeklyRhythmDay[]> {
    return JSON.parse(JSON.stringify(weeklyRhythmStore));
  },

  /**
   * Retrieves contextual execution rhythm guardrail copy
   */
  async getExecutionRhythm(): Promise<ExecutionRhythmData> {
    return JSON.parse(JSON.stringify(executionRhythmStore));
  },

  /**
   * Retrieves velocity analytics data dynamically incorporating current task completion
   */
  async getVelocityMetrics(): Promise<TasksVelocityMetrics> {
    const completedCount = tasksStore.filter((t) => t.isCompleted).length;
    const metrics: TasksVelocityMetrics = {
      ...mockVelocityMetrics,
      completedCount,
      weeklyRhythm: JSON.parse(JSON.stringify(weeklyRhythmStore)),
    };
    return JSON.parse(JSON.stringify(metrics));
  },

  /**
   * Retrieves system phases ledger tray
   */
  async getSystemPhases(): Promise<SystemPhase[]> {
    return JSON.parse(JSON.stringify(systemPhasesStore));
  },

  /**
   * Aggregates complete page payload for unified server or client loading
   */
  async getTasksPageData(): Promise<TasksPageData> {
    return this.getPageData();
  },

  /**
   * Resets in-memory stores back to baseline fixtures (for testing)
   */
  async resetState(): Promise<void> {
    tasksStore = JSON.parse(JSON.stringify(mockTaskItems));
    projectsStore = JSON.parse(JSON.stringify(mockActiveProjects));
    weeklyRhythmStore = JSON.parse(JSON.stringify(mockWeeklyRhythm));
    executionRhythmStore = JSON.parse(JSON.stringify(mockExecutionRhythm));
    systemPhasesStore = JSON.parse(JSON.stringify(mockSystemPhases));
  },
};
