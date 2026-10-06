import { PriorityLevel, TaskItem } from '@/types/models';
import { apiRequest } from '@/lib/api/client';
import { localISODate } from '@/app/api/tasks/shared';

export type TaskCategory = 'work' | 'personal' | 'finance' | 'learning';
export type TaskTab = 'open' | 'today' | 'upcoming' | 'completed';

export interface TaskInput {
  title: string;
  category: TaskCategory;
  priority: PriorityLevel;
  dueDate: string | null; // YYYY-MM-DD
  dueTime: string | null; // HH:MM
}

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  work: 'Work',
  personal: 'Personal',
  finance: 'Finance',
  learning: 'Learning',
};

/** Tasks API client. Every call throws on failure so the UI can report it. */
export const tasksService = {
  async getTasks(): Promise<TaskItem[]> {
    return (await apiRequest<{ tasks: TaskItem[] }>('/api/tasks')).tasks;
  },

  createTask(input: TaskInput): Promise<TaskItem> {
    return apiRequest<TaskItem>('/api/tasks', { method: 'POST', body: JSON.stringify(input) });
  },

  updateTask(id: string, input: Partial<TaskInput> & { isCompleted?: boolean }): Promise<TaskItem> {
    return apiRequest<TaskItem>(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
  },

  async deleteTask(id: string): Promise<void> {
    await apiRequest(`/api/tasks/${id}`, { method: 'DELETE' });
  },
};

/** Tab + search filter over real task data. `today` is local YYYY-MM-DD. */
export function filterTasks(tasks: TaskItem[], tab: TaskTab, query: string, today = localISODate()): TaskItem[] {
  const q = query.trim().toLowerCase();
  return tasks.filter((t) => {
    if (q && !t.title.toLowerCase().includes(q)) return false;
    if (tab === 'completed') return t.isCompleted;
    if (t.isCompleted) return false;
    if (tab === 'today') return t.dueDate === today;
    if (tab === 'upcoming') return !!t.dueDate && t.dueDate > today;
    return true;
  });
}

/** "Today", "Tomorrow", "Yesterday" or "Mon, Oct 12", plus time if set. */
export function formatDue(dueDate?: string, dueTime?: string, today = localISODate()): string | null {
  if (!dueDate) return null;
  const [y, m, d] = dueDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const [ty, tm, td] = today.split('-').map(Number);
  const diff = Math.round((date.getTime() - new Date(ty, tm - 1, td).getTime()) / 86400000);
  const day =
    diff === 0 ? 'Today'
    : diff === 1 ? 'Tomorrow'
    : diff === -1 ? 'Yesterday'
    : date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        ...(y !== ty ? { year: 'numeric' } : {}),
      });
  if (!dueTime) return day;
  const [h, min] = dueTime.split(':').map(Number);
  return `${day}, ${new Date(2000, 0, 1, h, min).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}
