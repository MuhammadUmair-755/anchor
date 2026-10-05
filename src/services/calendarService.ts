import {
  CalendarDayCell,
  SovereignGoal,
  DayInspectorData,
  TemporalHealthMetrics,
  NewCalendarEventPayload,
} from '@/types/models';
import {
  mockCalendarDays,
  mockDayInspectorData,
  mockSovereignGoals,
  mockTemporalHealth,
} from './mockData';
import { apiFetch } from '@/lib/api/client';

class CalendarService {
  private calendarDays: CalendarDayCell[];
  private dayInspectors: Map<string, DayInspectorData>;
  private sovereignGoals: SovereignGoal[];
  private temporalHealth: TemporalHealthMetrics;

  private extraDayCells: Map<string, CalendarDayCell>;

  constructor() {
    this.calendarDays = JSON.parse(JSON.stringify(mockCalendarDays));
    this.extraDayCells = new Map();
    this.dayInspectors = new Map();
    this.dayInspectors.set('2026-09-11', JSON.parse(JSON.stringify(mockDayInspectorData)));
    this.sovereignGoals = JSON.parse(JSON.stringify(mockSovereignGoals));
    this.temporalHealth = JSON.parse(JSON.stringify(mockTemporalHealth));
  }

  public async resetState(): Promise<void> {
    this.calendarDays = JSON.parse(JSON.stringify(mockCalendarDays));
    this.extraDayCells = new Map();
    this.dayInspectors = new Map();
    this.dayInspectors.set('2026-09-11', JSON.parse(JSON.stringify(mockDayInspectorData)));
    this.sovereignGoals = JSON.parse(JSON.stringify(mockSovereignGoals));
    this.temporalHealth = JSON.parse(JSON.stringify(mockTemporalHealth));
  }

  public async getCalendarDays(month: string = '2026-10'): Promise<CalendarDayCell[]> {
    const apiRes = await apiFetch<{ days: CalendarDayCell[] }>(`/api/calendar?selectedDate=${month}-05`);
    if (apiRes?.days && apiRes.days.length > 0) {
      return apiRes.days;
    }

    if (month === '2026-09') {
      const septCells = this.calendarDays.slice(0, 35).map((cell) => {
        const inspector = this.dayInspectors.get(cell.dateKey);
        if (inspector) {
          return {
            ...cell,
            tasksDone: inspector.tasksDone,
            tasksTotal: inspector.tasksList.length,
            financeAmount: cell.financeAmount !== undefined ? cell.financeAmount : inspector.ledgerTotal,
            hasJournal: cell.hasJournal || inspector.journalQuote.length > 0,
          };
        }
        return cell;
      });
      return JSON.parse(JSON.stringify(septCells));
    }

    // Dynamic month matrix generator for any YYYY-MM
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10); // 1-12
    const monthIdx = monthNum - 1; // 0-11

    const firstDate = new Date(Date.UTC(year, monthIdx, 1));
    const firstDayOfWeek = firstDate.getUTCDay(); // 0 = Sun
    const daysInMonth = new Date(Date.UTC(year, monthNum, 0)).getUTCDate();
    const daysInPrevMonth = new Date(Date.UTC(year, monthIdx, 0)).getUTCDate();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const prevMonthIdx = (monthIdx + 11) % 12;
    const nextMonthIdx = (monthIdx + 1) % 12;

    const cells: CalendarDayCell[] = [];

    // Helper to enrich a cell with any saved event or inspector data
    const enrichCell = (baseCell: CalendarDayCell): CalendarDayCell => {
      const existing = this.calendarDays.find((c) => c.dateKey === baseCell.dateKey) || this.extraDayCells.get(baseCell.dateKey);
      const inspector = this.dayInspectors.get(baseCell.dateKey);

      return {
        ...baseCell,
        tasksDone: inspector?.tasksDone ?? existing?.tasksDone,
        tasksTotal: inspector ? inspector.tasksList.length : existing?.tasksTotal,
        financeAmount: inspector?.ledgerTotal ?? existing?.financeAmount,
        specialNote: existing?.specialNote ?? baseCell.specialNote,
        hasJournal: inspector ? inspector.journalQuote.length > 0 : (existing?.hasJournal ?? baseCell.hasJournal),
      };
    };

    // Leading days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevYear = monthIdx === 0 ? year - 1 : year;
      const prevMonthStr = String(prevMonthIdx + 1).padStart(2, '0');
      const dateKey = `${prevYear}-${prevMonthStr}-${String(dayNum).padStart(2, '0')}`;
      cells.push(enrichCell({
        dateKey,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateKey === '2026-09-11',
        monthLabel: monthNames[prevMonthIdx],
      }));
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${monthStr}-${String(d).padStart(2, '0')}`;
      const isToday = dateKey === '2026-09-11';
      cells.push(enrichCell({
        dateKey,
        dayNumber: d,
        isCurrentMonth: true,
        isToday,
      }));
    }

    // Trailing days to fill standard 5-row (35) or 6-row (42) matrix
    const totalCells = cells.length > 35 ? 42 : 35;
    let nextDayNum = 1;
    while (cells.length < totalCells) {
      const nextYear = monthIdx === 11 ? year + 1 : year;
      const nextMonthStr = String(nextMonthIdx + 1).padStart(2, '0');
      const dateKey = `${nextYear}-${nextMonthStr}-${String(nextDayNum).padStart(2, '0')}`;
      cells.push(enrichCell({
        dateKey,
        dayNumber: nextDayNum,
        isCurrentMonth: false,
        isToday: dateKey === '2026-09-11',
        monthLabel: monthNames[nextMonthIdx],
      }));
      nextDayNum++;
    }

    return cells;
  }

  public async getDayInspectorData(dateKey: string): Promise<DayInspectorData> {
    if (this.dayInspectors.has(dateKey)) {
      return JSON.parse(JSON.stringify(this.dayInspectors.get(dateKey)!));
    }

    // Generate synthesized inspector data for any clicked date
    const dayCell = this.calendarDays.find((d) => d.dateKey === dateKey);
    const dateObj = new Date(dateKey + 'T12:00:00Z');
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
    const dayNum = dateObj.getUTCDate();
    const year = dateObj.getUTCFullYear();

    const tasksTotal = dayCell?.tasksTotal ?? (dayCell?.specialNote ? 2 : 3);
    const tasksDone = dayCell?.tasksDone ?? Math.min(tasksTotal, 2);
    const tasksPending = Math.max(0, tasksTotal - tasksDone);

    const taskTitlesPool = [
      dayCell?.specialNote ? `${dayCell.specialNote} milestone review` : 'Core System Architecture & Sync check',
      'Tactical conditioning & deep work sequence',
      'Capital allocation & ledger reconciliation',
      'Distributed telemetry & pipeline audit',
      'Sovereign protocol calibration & review',
      'Evening strategic alignment & log inscription',
      'Infrastructure latency & failover benchmark',
      'Weekly cadence retrospective & synthesis',
    ];

    const generatedTasks = Array.from({ length: tasksTotal }, (_, i) => ({
      id: `task-${dateKey}-${i + 1}`,
      title: taskTitlesPool[i] || `Operational vector execution ${i + 1}`,
      isCompleted: i < tasksDone,
    }));

    const financeAmount = dayCell?.financeAmount ?? (dayCell?.isCurrentMonth ? -650 : 0);
    const ledgerItems =
      financeAmount > 0
        ? [{ category: 'Consulting / Dividend', amount: financeAmount }]
        : [
            { category: 'Food & Dining', amount: Math.abs(Math.round(financeAmount * 0.6)) || 400 },
            { category: 'Transit & Operations', amount: Math.abs(Math.round(financeAmount * 0.4)) || 250 },
          ];

    const generatedInspector: DayInspectorData = {
      dateTitle: `${dayOfWeek}, ${monthName} ${dayNum}, ${year}`,
      subtitle: 'Synchronized telemetry across active operational vectors.',
      tasksDone,
      tasksPending,
      tasksList: generatedTasks,
      ledgerItems,
      ledgerTotal: financeAmount,
      journalQuote: dayCell?.hasJournal
        ? 'Steadfast execution in silent discipline. Every metric in balance.'
        : 'Observational stillness. Systems running smoothly without unnecessary intervention.',
      journalTime: dayCell?.hasJournal ? 'Inscribed 08:15 AM' : 'No inscription recorded',
      cadenceDelta: financeAmount >= 0 ? '+1.8% to Reserve' : '+0.9% to Reserve',
    };

    this.dayInspectors.set(dateKey, generatedInspector);
    return JSON.parse(JSON.stringify(generatedInspector));
  }

  public async toggleDayTask(dateKey: string, taskId: string): Promise<DayInspectorData> {
    let inspector = this.dayInspectors.get(dateKey);
    if (!inspector) {
      await this.getDayInspectorData(dateKey);
      inspector = this.dayInspectors.get(dateKey)!;
    }

    const task = inspector.tasksList.find((t) => t.id === taskId);
    if (task) {
      const wasCompleted = task.isCompleted;
      task.isCompleted = !wasCompleted;
      inspector.tasksDone = inspector.tasksList.filter((t) => t.isCompleted).length;
      inspector.tasksPending = inspector.tasksList.filter((t) => !t.isCompleted).length;

      // Update the day cell's task count in calendarDays or extraDayCells
      const dayCell = this.calendarDays.find((d) => d.dateKey === dateKey);
      if (dayCell) {
        dayCell.tasksDone = inspector.tasksDone;
        dayCell.tasksTotal = inspector.tasksList.length;
      } else {
        let extraCell = this.extraDayCells.get(dateKey);
        if (!extraCell) {
          const dateObj = new Date(dateKey + 'T12:00:00Z');
          extraCell = {
            dateKey,
            dayNumber: dateObj.getUTCDate(),
            isCurrentMonth: true,
            isToday: dateKey === '2026-09-11',
            tasksDone: inspector.tasksDone,
            tasksTotal: inspector.tasksList.length,
            financeAmount: inspector.ledgerTotal,
          };
          this.extraDayCells.set(dateKey, extraCell);
        } else {
          extraCell.tasksDone = inspector.tasksDone;
          extraCell.tasksTotal = inspector.tasksList.length;
        }
      }

      // Synchronize resolved tasks count in temporal health
      if (task.isCompleted) {
        this.temporalHealth.tasksResolvedCount += 1;
      } else {
        this.temporalHealth.tasksResolvedCount = Math.max(0, this.temporalHealth.tasksResolvedCount - 1);
      }
    }

    return JSON.parse(JSON.stringify(inspector));
  }

  public async getSovereignGoals(): Promise<SovereignGoal[]> {
    return JSON.parse(JSON.stringify(this.sovereignGoals));
  }

  public async updateGoalProgress(goalId: string, percentage: number): Promise<SovereignGoal> {
    const goal = this.sovereignGoals.find((g) => g.id === goalId);
    if (!goal) {
      throw new Error(`Goal with id "${goalId}" not found`);
    }
    goal.progressPercentage = Math.min(100, Math.max(0, percentage));

    // Dynamically recalculate achieved & gap metrics for consistency
    if (goal.id === 'goal-capital-reserve') {
      const achieved = Math.round((goal.progressPercentage / 100) * 100000);
      const gap = Math.max(0, 100000 - achieved);
      goal.achievedMetric = `Rs. ${achieved.toLocaleString()} achieved`;
      goal.gapMetric = `Gap: Rs. ${gap.toLocaleString()}`;
    } else if (goal.id === 'goal-nextjs-mastery') {
      const doneModules = Math.round((goal.progressPercentage / 100) * 20);
      const remModules = Math.max(0, 20 - doneModules);
      goal.achievedMetric = `${doneModules} of 20 modules completed`;
      goal.gapMetric = remModules === 0 ? 'Full mastery reached' : `${remModules} remaining`;
    } else if (goal.id === 'goal-physical-resilience') {
      const doneSessions = Math.round((goal.progressPercentage / 100) * 22);
      goal.achievedMetric = `${doneSessions} of 22 sessions logged this month`;
      goal.gapMetric = goal.progressPercentage >= 80 ? 'Cadence on track' : 'Cadence needs attention';
    }

    return JSON.parse(JSON.stringify(goal));
  }

  public async getTemporalHealth(month: string = '2026-09'): Promise<TemporalHealthMetrics> {
    const health = JSON.parse(JSON.stringify(this.temporalHealth));
    if (month !== '2026-09') {
      const [yearStr, monthStr] = month.split('-');
      const year = parseInt(yearStr, 10);
      const monthNum = parseInt(monthStr, 10);
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      const monthName = `${monthNames[monthNum - 1]} ${year}`;
      health.monthName = monthName;
      health.operationalEquilibriumTitle = `${monthNames[monthNum - 1]} Operational Equilibrium`;
    }
    return health;
  }

  public async addEvent(payload: NewCalendarEventPayload): Promise<CalendarDayCell> {
    apiFetch('/api/calendar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch(() => {});

    let dayCell = this.calendarDays.find((d) => d.dateKey === payload.date);
    if (!dayCell) {
      dayCell = this.extraDayCells.get(payload.date);
    }
    if (!dayCell) {
      const dateObj = new Date(payload.date + 'T12:00:00Z');
      dayCell = {
        dateKey: payload.date,
        dayNumber: dateObj.getUTCDate(),
        isCurrentMonth: true,
        isToday: payload.date === '2026-09-11',
        specialNote: payload.title,
      };
      this.extraDayCells.set(payload.date, dayCell);
    }

    // Ensure day inspector exists so we do NOT lose existing data
    let inspector = this.dayInspectors.get(payload.date);
    if (!inspector) {
      await this.getDayInspectorData(payload.date);
      inspector = this.dayInspectors.get(payload.date)!;
    }

    if (payload.type === 'task') {
      const newTask = {
        id: `task-${payload.date}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: payload.title,
        isCompleted: false,
      };
      inspector.tasksList.push(newTask);
      inspector.tasksPending += 1;
      dayCell.tasksTotal = inspector.tasksList.length;
      dayCell.tasksDone = inspector.tasksDone;
      this.temporalHealth.tasksTotalCount += 1;
    } else if (payload.type === 'financial' && payload.amount !== undefined) {
      dayCell.financeAmount = (dayCell.financeAmount || 0) + payload.amount;
      inspector.ledgerTotal = (inspector.ledgerTotal || 0) + payload.amount;
      inspector.ledgerItems.push({
        category: payload.title || payload.note || 'Ledger Entry',
        amount: Math.abs(payload.amount),
      });
      this.temporalHealth.netBalanceMtd += payload.amount;
    } else if (payload.type === 'journal') {
      dayCell.hasJournal = true;
      inspector.journalQuote = payload.title + (payload.note ? ': ' + payload.note : '');
      inspector.journalTime = 'Inscribed ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } else {
      dayCell.specialNote = payload.title;
    }

    return JSON.parse(JSON.stringify(dayCell));
  }
}

export const calendarService = new CalendarService();
