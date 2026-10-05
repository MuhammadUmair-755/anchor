import {
  JournalEntry,
  NotesFilterOptions,
  ConsistencyStats,
  PinnedMaxim,
  NotesPageData,
} from '@/types/models';
import {
  mockJournalEntries,
  mockConsistencyStats,
  mockPinnedMaxim,
  mockTaxonomyTags,
  mockNotesPageData,
} from './mockData';
import { apiFetch } from '@/lib/api/client';

// Mutable in-memory stores initialized with deep clones of authoritative fixtures
let journalEntriesStore: JournalEntry[] = JSON.parse(JSON.stringify(mockJournalEntries));
let consistencyStatsStore: ConsistencyStats = JSON.parse(JSON.stringify(mockConsistencyStats));
let pinnedMaximStore: PinnedMaxim = JSON.parse(JSON.stringify(mockPinnedMaxim));
let taxonomyTagsStore: string[] = JSON.parse(JSON.stringify(mockTaxonomyTags));

/**
 * Notes Service - Asynchronous business logic for Daily Notes & Reflective Journal Workspace
 */
export const notesService = {
  /**
   * Retrieves aggregated notes page data from /api/notes
   */
  async getNotesPageData(activeEntryId?: string): Promise<NotesPageData> {
    const apiData = await apiFetch<NotesPageData>('/api/notes');
    if (apiData) {
      if (apiData.entries?.length) {
        journalEntriesStore = apiData.entries;
      }
      if (apiData.consistencyStats) {
        consistencyStatsStore = apiData.consistencyStats;
      }
      if (apiData.pinnedMaxim) {
        pinnedMaximStore = apiData.pinnedMaxim;
      }
      if (activeEntryId) {
        const found = apiData.entries.find((e) => e.id === activeEntryId || e.dateKey === activeEntryId);
        if (found) {
          apiData.activeEntry = found;
        }
      }
      return apiData;
    }

    const active = activeEntryId
      ? journalEntriesStore.find((e) => e.id === activeEntryId || e.dateKey === activeEntryId) || journalEntriesStore[0]
      : journalEntriesStore[0];

    return {
      entries: JSON.parse(JSON.stringify(journalEntriesStore)),
      activeEntry: JSON.parse(JSON.stringify(active)),
      consistencyStats: JSON.parse(JSON.stringify(consistencyStatsStore)),
      pinnedMaxim: JSON.parse(JSON.stringify(pinnedMaximStore)),
      taxonomyTags: JSON.parse(JSON.stringify(taxonomyTagsStore)),
      termBadge: mockNotesPageData.termBadge,
      currentMonth: mockNotesPageData.currentMonth,
      syncStatus: mockNotesPageData.syncStatus,
    };
  },

  /**
   * Retrieves journal entries with optional search, mood, tag, and month filtering
   */
  async getJournalEntries(filter?: NotesFilterOptions): Promise<JournalEntry[]> {
    const pageData = await this.getNotesPageData();
    let result = [...pageData.entries];

    if (filter) {
      if (filter.searchQuery && filter.searchQuery.trim()) {
        const query = filter.searchQuery.trim().toLowerCase();
        result = result.filter(
          (entry) =>
            entry.title.toLowerCase().includes(query) ||
            entry.snippet.toLowerCase().includes(query) ||
            (entry.quote && entry.quote.toLowerCase().includes(query)) ||
            entry.contentParagraphs.some((p) => p.toLowerCase().includes(query)) ||
            entry.tags.some((t) => t.toLowerCase().includes(query)) ||
            entry.moodTag.toLowerCase().includes(query) ||
            entry.mood.label.toLowerCase().includes(query)
        );
      }

      if (filter.selectedMood && filter.selectedMood !== 'all') {
        result = result.filter((entry) => entry.moodTag === filter.selectedMood);
      }

      if (filter.selectedTag && filter.selectedTag.trim()) {
        const tag = filter.selectedTag.trim().toLowerCase();
        result = result.filter((entry) =>
          entry.tags.some((t) => t.toLowerCase() === tag)
        );
      }
    }

    return JSON.parse(JSON.stringify(result));
  },

  /**
   * Retrieves a single journal entry by its unique identifier or dateKey
   */
  async getJournalEntryById(idOrDateKey: string): Promise<JournalEntry | null> {
    const entry = journalEntriesStore.find((e) => e.id === idOrDateKey || e.dateKey === idOrDateKey);
    if (!entry) {
      return null;
    }
    return JSON.parse(JSON.stringify(entry));
  },

  /**
   * Searches entries across title, snippet, prose paragraphs, quotes, tags, and moods
   */
  async searchJournalEntries(query: string): Promise<JournalEntry[]> {
    return this.getJournalEntries({ searchQuery: query });
  },

  /**
   * Updates an entry's daily inquiry response and persists to /api/notes
   */
  async saveInquiryAnswer(entryId: string, answer: string): Promise<JournalEntry> {
    const entryIndex = journalEntriesStore.findIndex((e) => e.id === entryId);
    const existing = entryIndex !== -1 ? journalEntriesStore[entryIndex] : null;

    // Call API
    await apiFetch('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        dateKey: existing?.dateKey,
        inquiryAnswer: answer,
      }),
    });

    if (!existing) {
      throw new Error(`Journal entry with id "${entryId}" not found.`);
    }

    const updatedEntry: JournalEntry = {
      ...existing,
      inquiry: {
        ...existing.inquiry,
        answer,
        isAnswered: true,
        statusBadge: 'Answered',
      },
      inquiryAnswered: true,
      updatedAt: new Date().toISOString(),
    };

    journalEntriesStore[entryIndex] = updatedEntry;
    return JSON.parse(JSON.stringify(updatedEntry));
  },

  /**
   * Creates a new journal entry and unshifts to top of timeline
   */
  async createEntry(newEntry: Partial<JournalEntry>): Promise<JournalEntry> {
    const apiRes = await apiFetch<{ entry?: JournalEntry }>('/api/notes', {
      method: 'POST',
      body: JSON.stringify(newEntry),
    });

    if (apiRes?.entry) {
      // Refresh page data
      await this.getNotesPageData();
      return journalEntriesStore[0];
    }

    const todayDate = new Date();
    const dateKey = todayDate.toISOString().split('T')[0];
    const created: JournalEntry = {
      id: `entry-${Date.now()}`,
      dateKey,
      date: dateKey,
      dateDisplay: 'Today',
      dateShort: todayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dateFullFormatted: todayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      dayNumber: todayDate.getDate(),
      dayOfWeek: todayDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      title: newEntry.title || 'Untitled Reflection',
      snippet: newEntry.snippet || '',
      wordCount: 120,
      readingTimeMinutes: 2,
      mood: newEntry.mood || journalEntriesStore[0].mood,
      moodTag: newEntry.moodTag || 'Strategic',
      moodColor: '#40617E',
      inquiry: {
        id: `inq-${Date.now()}`,
        question: 'How was today? What did you refrain from reacting to?',
        isAnswered: false,
      },
      inquiryQuestion: 'How was today? What did you refrain from reacting to?',
      inquiryAnswered: false,
      contentParagraphs: newEntry.contentParagraphs || [''],
      observations: [],
      linkedEntities: {},
      loggedTimeInfo: 'Logged just now',
      tags: newEntry.tags || ['#clarity'],
      createdAt: todayDate.toISOString(),
      updatedAt: todayDate.toISOString(),
    };

    journalEntriesStore.unshift(created);
    return JSON.parse(JSON.stringify(created));
  },

  /**
   * Alias for saveInquiryAnswer for test compatibility
   */
  async updateInquiryAnswer(entryId: string, answer: string): Promise<JournalEntry> {
    return this.saveInquiryAnswer(entryId, answer);
  },

  /**
   * Toggles the pinned status of a journal entry
   */
  async togglePinEntry(entryId: string): Promise<JournalEntry> {
    const entryIndex = journalEntriesStore.findIndex((e) => e.id === entryId);
    if (entryIndex === -1) {
      throw new Error(`Journal entry with id "${entryId}" not found.`);
    }

    const current = journalEntriesStore[entryIndex];
    const isPinned = !current.isPinned;
    const updated: JournalEntry = {
      ...current,
      isPinned,
      updatedAt: new Date().toISOString(),
    };

    journalEntriesStore[entryIndex] = updated;
    return JSON.parse(JSON.stringify(updated));
  },

  /**
   * Retrieves 30-day consistency telemetry and score percentage
   */
  async getConsistencyStats(): Promise<ConsistencyStats> {
    const data = await this.getNotesPageData();
    return data.consistencyStats;
  },

  /**
   * Retrieves the current active pinned codex axiom
   */
  async getPinnedMaxim(): Promise<PinnedMaxim> {
    const data = await this.getNotesPageData();
    return data.pinnedMaxim;
  },

  /**
   * Retrieves taxonomy tag cloud
   */
  async getTaxonomyTags(): Promise<string[]> {
    return JSON.parse(JSON.stringify(taxonomyTagsStore));
  },

  /**
   * Resets in-memory stores back to canonical baseline (for test suites)
   */
  async resetState(): Promise<void> {
    journalEntriesStore = JSON.parse(JSON.stringify(mockJournalEntries));
    consistencyStatsStore = JSON.parse(JSON.stringify(mockConsistencyStats));
    pinnedMaximStore = JSON.parse(JSON.stringify(mockPinnedMaxim));
    taxonomyTagsStore = JSON.parse(JSON.stringify(mockTaxonomyTags));
  },
};
