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
   * Retrieves journal entries with optional search, mood, tag, and month filtering
   */
  async getJournalEntries(filter?: NotesFilterOptions): Promise<JournalEntry[]> {
    let result = [...journalEntriesStore];

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
            entry.mood.label.toLowerCase().includes(query) ||
            entry.observations.some(
              (o) =>
                o.title.toLowerCase().includes(query) ||
                o.note.toLowerCase().includes(query)
            )
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

      if (filter.selectedMonth && filter.selectedMonth.trim()) {
        const monthQuery = filter.selectedMonth.toLowerCase();
        result = result.filter(
          (entry) =>
            entry.dateFullFormatted.toLowerCase().includes(monthQuery) ||
            entry.dateKey.startsWith('2026-09')
        );
      }
    }

    return JSON.parse(JSON.stringify(result));
  },

  /**
   * Retrieves a single journal entry by its unique identifier
   */
  async getJournalEntryById(id: string): Promise<JournalEntry | null> {
    const entry = journalEntriesStore.find((e) => e.id === id);
    if (!entry) {
      return null;
    }
    return JSON.parse(JSON.stringify(entry));
  },

  /**
   * Searches entries across title, snippet, prose paragraphs, quotes, tags, and moods
   */
  async searchJournalEntries(query: string): Promise<JournalEntry[]> {
    if (!query || !query.trim()) {
      return JSON.parse(JSON.stringify(journalEntriesStore));
    }
    const q = query.trim().toLowerCase();
    const result = journalEntriesStore.filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) ||
        entry.snippet.toLowerCase().includes(q) ||
        (entry.quote && entry.quote.toLowerCase().includes(q)) ||
        entry.contentParagraphs.some((p) => p.toLowerCase().includes(q)) ||
        entry.tags.some((t) => t.toLowerCase().includes(q)) ||
        entry.moodTag.toLowerCase().includes(q) ||
        entry.mood.label.toLowerCase().includes(q) ||
        entry.observations.some(
          (o) =>
            o.title.toLowerCase().includes(q) ||
            o.note.toLowerCase().includes(q)
        )
    );
    return JSON.parse(JSON.stringify(result));
  },

  /**
   * Updates daily inquiry response and persists answer state in memory
   */
  async updateInquiryAnswer(id: string, answer: string): Promise<JournalEntry> {
    const entryIndex = journalEntriesStore.findIndex((e) => e.id === id);
    if (entryIndex === -1) {
      throw new Error(`Journal entry with id "${id}" not found.`);
    }

    const entry = journalEntriesStore[entryIndex];
    const updatedEntry: JournalEntry = {
      ...entry,
      inquiryAnswered: true,
      inquiry: {
        ...entry.inquiry,
        isAnswered: true,
        answer: answer.trim(),
        statusBadge: 'Answered',
      },
      updatedAt: new Date().toISOString(),
    };

    journalEntriesStore[entryIndex] = updatedEntry;
    return JSON.parse(JSON.stringify(updatedEntry));
  },

  /**
   * Retrieves the 30-day spark dots consistency matrix and tone statistics
   */
  async getConsistencyStats(): Promise<ConsistencyStats> {
    return JSON.parse(JSON.stringify(consistencyStatsStore));
  },

  /**
   * Retrieves the categorized taxonomy tags list
   */
  async getTaxonomyTags(): Promise<string[]> {
    return JSON.parse(JSON.stringify(taxonomyTagsStore));
  },

  /**
   * Retrieves the pinned maxim quote card
   */
  async getPinnedMaxim(): Promise<PinnedMaxim> {
    return JSON.parse(JSON.stringify(pinnedMaximStore));
  },

  /**
   * Toggles pinned status for a journal entry
   */
  async togglePinEntry(id: string): Promise<JournalEntry> {
    const entryIndex = journalEntriesStore.findIndex((e) => e.id === id);
    if (entryIndex === -1) {
      throw new Error(`Journal entry with id "${id}" not found.`);
    }

    const entry = journalEntriesStore[entryIndex];
    const updatedEntry: JournalEntry = {
      ...entry,
      isPinned: !entry.isPinned,
      updatedAt: new Date().toISOString(),
    };

    journalEntriesStore[entryIndex] = updatedEntry;
    return JSON.parse(JSON.stringify(updatedEntry));
  },

  /**
   * Aggregates complete page payload for unified server or client rendering
   */
  async getNotesPageData(activeId?: string): Promise<NotesPageData> {
    const [entries, consistencyStats, pinnedMaxim, taxonomyTags] = await Promise.all([
      this.getJournalEntries(),
      this.getConsistencyStats(),
      this.getPinnedMaxim(),
      this.getTaxonomyTags(),
    ]);

    let activeEntry = entries[0];
    if (activeId) {
      const found = entries.find((e) => e.id === activeId);
      if (found) {
        activeEntry = found;
      }
    }

    return {
      entries,
      activeEntry,
      consistencyStats,
      pinnedMaxim,
      taxonomyTags,
      termBadge: mockNotesPageData.termBadge,
      currentMonth: mockNotesPageData.currentMonth,
      syncStatus: mockNotesPageData.syncStatus,
    };
  },

  /**
   * Resets in-memory stores back to authoritative fixtures
   */
  async resetState(): Promise<void> {
    journalEntriesStore = JSON.parse(JSON.stringify(mockJournalEntries));
    consistencyStatsStore = JSON.parse(JSON.stringify(mockConsistencyStats));
    pinnedMaximStore = JSON.parse(JSON.stringify(mockPinnedMaxim));
    taxonomyTagsStore = JSON.parse(JSON.stringify(mockTaxonomyTags));
  },
};
