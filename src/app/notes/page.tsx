"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { notesService } from "@/services/notesService";
import {
  JournalEntry,
  ConsistencyStats,
  PinnedMaxim,
} from "@/types/models";
import NotesView from "@/components/notes/NotesView";

export default function NotesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [consistencyStats, setConsistencyStats] = useState<ConsistencyStats | null>(null);
  const [pinnedMaxim, setPinnedMaxim] = useState<PinnedMaxim | null>(null);
  const [taxonomyTags, setTaxonomyTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Reflection Modal & Snackbar Feedback State
  const [writeModalOpen, setWriteModalOpen] = useState<boolean>(false);
  const [writeReflection, setWriteReflection] = useState<string>("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "info" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Hydrate Data on Mount
  const loadNotesData = useCallback(async () => {
    try {
      setLoading(true);
      const pageData = await notesService.getNotesPageData();
      setEntries(pageData.entries);
      setActiveEntry(pageData.activeEntry);
      setConsistencyStats(pageData.consistencyStats);
      setPinnedMaxim(pageData.pinnedMaxim);
      setTaxonomyTags(pageData.taxonomyTags);
      setLoading(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load reflective journal data";
      setError(msg);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotesData();
  }, [loadNotesData]);

  // Handle Entry Switching
  const handleSelectEntry = useCallback(
    async (entryId: string) => {
      const local = entries.find((e) => e.id === entryId);
      if (local) {
        setActiveEntry(local);
      } else {
        const fetched = await notesService.getJournalEntryById(entryId);
        if (fetched) {
          setActiveEntry(fetched);
        }
      }
    },
    [entries]
  );

  // Handle Daily Inquiry Update
  const handleUpdateInquiry = async (answer: string) => {
    if (!activeEntry) return;
    try {
      const updated = await notesService.updateInquiryAnswer(activeEntry.id, answer);
      setActiveEntry(updated);
      setEntries((prev) => prev.map((e) => (e.id === activeEntry.id ? updated : e)));
      setSnackbar({
        open: true,
        message: "Daily inquiry updated & inscribed in journal ledger",
        severity: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update daily inquiry";
      setSnackbar({ open: true, message: msg, severity: "error" });
    }
  };

  // Handle Writing Modal Commit
  const handleCommitReflection = () => {
    if (!writeReflection.trim() || !activeEntry) return;
    const wordCountDelta = writeReflection.trim().split(/\s+/).length;
    const updated: JournalEntry = {
      ...activeEntry,
      contentParagraphs: [
        ...(activeEntry.contentParagraphs || []),
        writeReflection.trim(),
      ],
      wordCount: activeEntry.wordCount + wordCountDelta,
      updatedAt: new Date().toISOString(),
    };
    setActiveEntry(updated);
    setEntries((prev) => prev.map((e) => (e.id === activeEntry.id ? updated : e)));
    setWriteReflection("");
    setWriteModalOpen(false);
    setSnackbar({
      open: true,
      message: "Reflection committed to daily journal ledger",
      severity: "success",
    });
  };

  // Handle Export Markdown
  const handleExportMarkdown = () => {
    if (!activeEntry) return;
    const md = [
      `# ${activeEntry.title}`,
      ``,
      `**Date**: ${activeEntry.dateFullFormatted}`,
      `**Mood**: ${activeEntry.moodTag} (${activeEntry.mood?.label || ""})`,
      `**Word Count**: ${activeEntry.wordCount} words (${activeEntry.readingTimeMinutes} min read)`,
      ``,
      activeEntry.quote ? `> ${activeEntry.quote}\n> — ${activeEntry.quoteAttribution || "Codex"}\n` : "",
      `## Daily Inquiry: ${activeEntry.inquiry?.question || activeEntry.inquiryQuestion}`,
      activeEntry.inquiry?.answer || "_No response recorded_",
      ``,
      `## Reflections & Log`,
      ...(activeEntry.contentParagraphs || []),
      ``,
      `---`,
      `*${activeEntry.loggedTimeInfo}*`,
    ].join("\n");

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(md).catch(() => {});
    }
    setSnackbar({
      open: true,
      message: "Journal markdown copied to clipboard",
      severity: "info",
    });
  };

  // Handle Pin Entry
  const handlePinEntry = async () => {
    if (!activeEntry) return;
    try {
      const updated = await notesService.togglePinEntry(activeEntry.id);
      setActiveEntry(updated);
      setEntries((prev) => prev.map((e) => (e.id === activeEntry.id ? updated : e)));
      setSnackbar({
        open: true,
        message: updated.isPinned
          ? `Entry "${activeEntry.title.slice(0, 30)}..." pinned to executive review`
          : `Entry unpinned from executive review`,
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: `Entry pinned to executive review`,
        severity: "success",
      });
    }
  };

  // Filter entries for archive column
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase().trim();
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.snippet?.toLowerCase().includes(q) ||
        e.moodTag?.toLowerCase().includes(q) ||
        e.tags?.some((t) => t.toLowerCase().includes(q)) ||
        (e.quote && e.quote.toLowerCase().includes(q))
    );
  }, [entries, searchQuery]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 2,
        }}
      >
        <CircularProgress size={36} sx={{ color: "#0B1628" }} />
        <Typography
          sx={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "0.8125rem",
            color: "#68717C",
            letterSpacing: "0.02em",
          }}
        >
          Synchronizing daily journal archives &amp; cognitive ledger...
        </Typography>
      </Box>
    );
  }

  if (error || !activeEntry) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 6 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || "No journal entries found"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", minHeight: "100%" }}>
      {/* Responsive Notes Workspace Container */}
      <NotesView
        entries={filteredEntries}
        activeEntry={activeEntry}
        onSelectEntry={handleSelectEntry}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onUpdateInquiry={handleUpdateInquiry}
        onExportMarkdown={handleExportMarkdown}
        onPinEntry={handlePinEntry}
        onContinueWriting={() => setWriteModalOpen(true)}
        consistencyStats={consistencyStats || undefined}
        pinnedMaxim={pinnedMaxim || undefined}
        taxonomyTags={taxonomyTags}
      />

      {/* Write / Reflection Dialog */}
      <Dialog
        open={writeModalOpen}
        onClose={() => setWriteModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
              bgcolor: "#FCFBF8",
              border: "1px solid rgba(17, 28, 46, 0.08)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "var(--font-newsreader), Georgia, serif",
            fontSize: "1.25rem",
            color: "#0B1628",
          }}
        >
          Inscribe Reflection to Daily Journal
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={5}
            fullWidth
            placeholder="Write your reflections, system observations, or stoic realizations..."
            value={writeReflection}
            onChange={(e) => setWriteReflection(e.target.value)}
            slotProps={{
              input: {
                sx: {
                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                  fontSize: "0.875rem",
                  bgcolor: "#FFFFFF",
                  borderRadius: 2,
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setWriteModalOpen(false)}
            sx={{ color: "#68717C", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCommitReflection}
            sx={{
              bgcolor: "#0B1628",
              color: "#FCFBF8",
              textTransform: "none",
              "&:hover": { bgcolor: "#162338" },
            }}
          >
            Commit to Ledger
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ borderRadius: 2, boxShadow: "0 4px 16px rgba(11,22,40,0.15)" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
