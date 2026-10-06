import { CalendarEvent, CalendarMonthData, NewCalendarEventPayload } from '@/types/models';
import { apiRequest } from '@/lib/api/client';

/** Calendar API client. Every call throws on failure so the UI can report it. */
export const calendarService = {
  getMonth(month: string): Promise<CalendarMonthData> {
    return apiRequest<CalendarMonthData>(`/api/calendar?month=${encodeURIComponent(month)}`);
  },

  addEvent(payload: NewCalendarEventPayload): Promise<CalendarEvent> {
    return apiRequest<CalendarEvent>('/api/calendar', { method: 'POST', body: JSON.stringify(payload) });
  },

  async deleteEvent(id: string): Promise<void> {
    await apiRequest(`/api/calendar/${id}`, { method: 'DELETE' });
  },
};
