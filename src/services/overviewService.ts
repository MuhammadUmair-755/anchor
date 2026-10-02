import {
  DailyTask,
  BudgetEnvelope,
  ExecutiveOverviewData,
} from '@/types/models';
import { mockOverviewData } from './mockData';

// Mutable in-memory store initialized with authoritative mock state
let state: ExecutiveOverviewData = JSON.parse(JSON.stringify(mockOverviewData));

/**
 * Overview Service - Decoupled asynchronous business logic for Executive Overview
 */
export const overviewService = {
  /**
   * Retrieves executive overview aggregated data
   */
  async getOverviewData(): Promise<ExecutiveOverviewData> {
    return JSON.parse(JSON.stringify(state));
  },

  /**
   * Toggles task completion state
   */
  async toggleTask(taskId: string): Promise<DailyTask> {
    const taskIndex = state.dailyTasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error(`Task with id "${taskId}" not found.`);
    }

    const task = state.dailyTasks[taskIndex];
    const isCompleted = !task.isCompleted;
    const updatedTask: DailyTask = {
      ...task,
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
      dueInfo: isCompleted
        ? `Completed ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : task.dueInfo,
    };

    state.dailyTasks[taskIndex] = updatedTask;
    return JSON.parse(JSON.stringify(updatedTask));
  },

  /**
   * Adds a new daily task
   */
  async addTask(task: Omit<DailyTask, 'id' | 'createdAt'>): Promise<DailyTask> {
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
