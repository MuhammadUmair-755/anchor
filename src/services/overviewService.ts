import {
  DailyTask,
  TaskItem,
  BudgetEnvelope,
  ExecutiveOverviewData,
} from '@/types/models';
import { mockOverviewData } from './mockData';
import { apiFetch } from '@/lib/api/client';

// Mutable in-memory store initialized with authoritative mock state
let state: ExecutiveOverviewData = JSON.parse(JSON.stringify(mockOverviewData));

/**
 * Overview Service - Decoupled asynchronous business logic for Executive Overview
 */
export const overviewService = {
  /**
   * Retrieves executive overview aggregated data from /api/overview
   */
  async getOverviewData(): Promise<ExecutiveOverviewData> {
    const apiData = await apiFetch<ExecutiveOverviewData>('/api/overview');
    if (apiData) {
      state = apiData;
      return apiData;
    }
    return JSON.parse(JSON.stringify(state));
  },

  /**
   * Toggles task completion state via API
   */
  async toggleTask(taskId: string): Promise<DailyTask> {
    const taskIndex = state.dailyTasks.findIndex((t) => t.id === taskId);
    const existing = taskIndex !== -1 ? state.dailyTasks[taskIndex] : null;
    const targetCompleted = existing ? !existing.isCompleted : true;

    // Call API
    const apiTask = await apiFetch<TaskItem>(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isCompleted: targetCompleted }),
    });

    if (apiTask) {
      const updatedTask: DailyTask = {
        id: apiTask.id,
        title: apiTask.title,
        category: apiTask.category as DailyTask['category'],
        categoryLabel: apiTask.categoryLabel || apiTask.category.toUpperCase(),
        priority: apiTask.priority,
        isCompleted: apiTask.isCompleted,
        dueInfo: apiTask.dueInfo,
        createdAt: apiTask.createdAt,
        completedAt: apiTask.completedAt,
      };
      if (taskIndex !== -1) {
        state.dailyTasks[taskIndex] = updatedTask;
      }
      return updatedTask;
    }

    if (!existing) {
      throw new Error(`Task with id "${taskId}" not found.`);
    }

    const isCompleted = !existing.isCompleted;
    const fallbackTask: DailyTask = {
      ...existing,
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
      dueInfo: isCompleted
        ? `Completed ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : existing.dueInfo,
    };

    state.dailyTasks[taskIndex] = fallbackTask;
    return JSON.parse(JSON.stringify(fallbackTask));
  },

  /**
   * Adds a new daily task
   */
  async addTask(task: Omit<DailyTask, 'id' | 'createdAt'>): Promise<DailyTask> {
    const apiTask = await apiFetch<TaskItem>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: task.title,
        priority: task.priority,
        category: task.category,
        tabCategory: 'today',
      }),
    });

    if (apiTask) {
      const newTask: DailyTask = {
        id: apiTask.id,
        title: apiTask.title,
        category: apiTask.category as DailyTask['category'],
        categoryLabel: apiTask.categoryLabel || apiTask.category.toUpperCase(),
        priority: apiTask.priority,
        isCompleted: apiTask.isCompleted,
        dueInfo: apiTask.dueInfo,
        createdAt: apiTask.createdAt,
      };
      state.dailyTasks.unshift(newTask);
      return newTask;
    }

    const newTask: DailyTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    state.dailyTasks.unshift(newTask);
    return JSON.parse(JSON.stringify(newTask));
  },

  /**
   * Updates an envelope's allocated amount and recalculates burn rate
   */
  async updateBudgetEnvelope(
    envelopeId: string,
    allocatedAmount: number
  ): Promise<BudgetEnvelope> {
    const envelopeIndex = state.budgetEnvelopes.findIndex((e) => e.id === envelopeId);
    if (envelopeIndex === -1) {
      throw new Error(`Budget envelope with id "${envelopeId}" not found.`);
    }

    const current = state.budgetEnvelopes[envelopeIndex];
    const spentAmount = current.spentAmount;
    const burnPercentage = allocatedAmount > 0
      ? Number(((spentAmount / allocatedAmount) * 100).toFixed(1))
      : 100;
    const bufferRemaining = Math.max(0, allocatedAmount - spentAmount);

    let burnRateStatus: BudgetEnvelope['burnRateStatus'] = 'normal';
    if (burnPercentage >= 100) {
      burnRateStatus = 'exceeded';
    } else if (burnPercentage >= 90) {
      burnRateStatus = 'alert';
    } else if (burnPercentage >= 75) {
      burnRateStatus = 'contained';
    }

    const updatedEnvelope: BudgetEnvelope = {
      ...current,
      allocatedAmount,
      burnPercentage,
      bufferRemaining,
      burnRateStatus,
    };

    state.budgetEnvelopes[envelopeIndex] = updatedEnvelope;
    return JSON.parse(JSON.stringify(updatedEnvelope));
  },

  /**
   * Resets in-memory state back to baseline fixtures (useful for testing)
   */
  async resetState(): Promise<void> {
    state = JSON.parse(JSON.stringify(mockOverviewData));
  },
};
