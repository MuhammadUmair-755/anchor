import { DailyTask, TaskItem, ExecutiveOverviewData, TransactionCategory } from '@/types/models';
import { apiRequest } from '@/lib/api/client';

const toDailyTask = (t: TaskItem): DailyTask => ({
  id: t.id,
  title: t.title,
  category: t.category as DailyTask['category'],
  categoryLabel: t.categoryLabel || t.category.toUpperCase(),
  priority: t.priority,
  isCompleted: t.isCompleted,
  dueInfo: t.dueInfo,
  createdAt: t.createdAt,
  completedAt: t.completedAt,
});

/** Overview API client. Stateless; every call throws on failure so the UI can report it. */
export const overviewService = {
  getOverviewData(): Promise<ExecutiveOverviewData> {
    return apiRequest<ExecutiveOverviewData>('/api/overview');
  },

  async setTaskCompleted(taskId: string, isCompleted: boolean): Promise<DailyTask> {
    const task = await apiRequest<TaskItem>(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isCompleted }),
    });
    return toDailyTask(task);
  },

  /** Tasks added from "Today's Focus" are due today. */
  async addTask(task: Pick<DailyTask, 'title' | 'category' | 'priority'>): Promise<DailyTask> {
    const created = await apiRequest<TaskItem>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: task.title,
        priority: task.priority,
        category: task.category,
        dueDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD, local
      }),
    });
    return toDailyTask(created);
  },

  /** Saves this month's budget per category (amount 0 clears it). */
  async saveBudgets(budgets: { category: TransactionCategory; amount: number }[]): Promise<void> {
    await apiRequest('/api/budgets', { method: 'PUT', body: JSON.stringify({ budgets }) });
  },
};
