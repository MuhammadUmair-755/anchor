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
   * Retrieves tasks filtered by tab category (or all tasks if unspecified)
   */
  async getTasks(filter?: TaskFilterTab): Promise<TaskItem[]> {
    let result = [...tasksStore];

    if (filter) {
      if (filter === 'completed') {
        result = result.filter((t) => t.isCompleted);
      } else if (filter === 'today') {
        // Includes tasks flagged for today (both completed and pending)
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
    if (taskIndex === -1) {
      throw new Error(`Task with id "${id}" not found.`);
    }

    const task = tasksStore[taskIndex];
    const nextCompleted = !task.isCompleted;

    const updatedTask: TaskItem = {
      ...task,
      isCompleted: nextCompleted,
      completedAt: nextCompleted ? new Date().toISOString() : undefined,
      statusBadge: nextCompleted
        ? 'Done'
        : task.priority === 'high'
        ? 'HIGH'
        : task.category.toLowerCase() === 'learning'
        ? 'Learning'
        : undefined,
    };

    tasksStore[taskIndex] = updatedTask;

    // Synchronize parent project completed task counter if linked
    if (task.projectId && task.projectId !== 'inbox') {
      const projectIndex = projectsStore.findIndex((p) => p.id === task.projectId);
      if (projectIndex !== -1) {
        const project = projectsStore[projectIndex];
        const nextCompletedCount = nextCompleted
          ? Math.min(project.totalTasks, project.tasksCompleted + 1)
          : Math.max(0, project.tasksCompleted - 1);
        const nextPercent =
          project.totalTasks > 0
            ? Math.round((nextCompletedCount / project.totalTasks) * 100)
            : 0;

        projectsStore[projectIndex] = {
          ...project,
          tasksCompleted: nextCompletedCount,
          progressPercentage: nextPercent,
        };
      }
    }

    return JSON.parse(JSON.stringify(updatedTask));
  },

  /**
   * Creates a new task via Quick Task Capture and unshifts into the active queue
   */
  async createTask(payload: CreateTaskPayload): Promise<TaskItem> {
    if (!payload.title || !payload.title.trim()) {
      throw new Error('Task title is required.');
    }

    let projectName = payload.projectName || 'Unassigned / Inbox';
    const projectId = payload.projectId || 'inbox';

    // Synchronize with project if assigned
    if (projectId !== 'inbox') {
      const projectIndex = projectsStore.findIndex((p) => p.id === projectId);
      if (projectIndex !== -1) {
        const project = projectsStore[projectIndex];
        projectName = project.title;
        const nextTotal = project.totalTasks + 1;
        const nextPercent = Math.round((project.tasksCompleted / nextTotal) * 100);

        projectsStore[projectIndex] = {
          ...project,
          totalTasks: nextTotal,
          progressPercentage: nextPercent,
        };
      }
    }

    const priority = payload.priority || 'medium';
    const category = payload.category || 'Engineering';
    const categoryLabel = payload.categoryLabel || category;
    const dueDate = payload.dueDate || 'Today';
    const dueTime = payload.dueTime || '6:00 PM';
    const dueInfo = payload.dueInfo || (payload.dueTime ? `Due ${payload.dueTime}` : dueDate);
    const tabCategory =
      payload.tabCategory ||
      (dueDate.toLowerCase().includes('tomorrow') ? 'upcoming' : 'today');

    const newTask: TaskItem = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: payload.title.trim(),
      isCompleted: false,
      priority,
      category,
      categoryLabel,
      statusBadge: priority === 'high' ? 'HIGH' : undefined,
      dueInfo,
      dueTime,
      dueDate,
      projectId,
      projectName,
      metaPill: payload.metaPill || categoryLabel,
      estimatedMinutes: payload.estimatedMinutes,
      tabCategory,
      createdAt: new Date().toISOString(),
    };

    tasksStore.unshift(newTask);
    return JSON.parse(JSON.stringify(newTask));
  },

  /**
   * Retrieves the 3 active portfolio projects
   */
  async getActiveProjects(): Promise<Project[]> {
    return JSON.parse(JSON.stringify(projectsStore));
  },

  /**
   * Retrieves 7-day weekly rhythm bar heights (Mon-Sun with Wednesday active)
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
    const [tasks, activeProjects, weeklyRhythm, executionRhythm, velocityMetrics, systemPhases] =
      await Promise.all([
        this.getTasks('today'),
        this.getActiveProjects(),
        this.getWeeklyRhythm(),
        this.getExecutionRhythm(),
        this.getVelocityMetrics(),
        this.getSystemPhases(),
      ]);

    return {
      tasks,
      activeProjects,
      weeklyRhythm,
      executionRhythm,
      velocityMetrics,
      systemPhases,
    };
  },

  /**
   * Resets in-memory stores back to pristine fixtures
   */
  async resetState(): Promise<void> {
    tasksStore = JSON.parse(JSON.stringify(mockTaskItems));
    projectsStore = JSON.parse(JSON.stringify(mockActiveProjects));
    weeklyRhythmStore = JSON.parse(JSON.stringify(mockWeeklyRhythm));
    executionRhythmStore = JSON.parse(JSON.stringify(mockExecutionRhythm));
    systemPhasesStore = JSON.parse(JSON.stringify(mockSystemPhases));
  },
};
