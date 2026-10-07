"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputBase from "@mui/material/InputBase";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Note } from "@/types/models";
import { notesService } from "@/services/notesService";
import NoteEditor from "./NoteEditor";

const UI_FONT = "var(--font-plus-jakarta-sans), sans-serif";
const SERIF = "var(--font-newsreader), Georgia, serif";
const BORDER = "1px solid rgba(17, 28, 46, 0.08)";

function shortDate(iso: string) {
  const d = new Date(iso);
  return d.toDateString() === new Date().toDateString()
    ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function errorText(err: unknown) {
  return err instanceof Error ? err.message : "Something went wrong";
}

export default function NotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Editor state. `editing` false = nothing open; `current` null while editing = unsaved new draft.
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  const dirty = editing && (title !== (current?.title ?? "") || body !== (current?.body ?? ""));
  // A new note has a temp id until the server answers; saving again then would create a duplicate.
  const creating = Boolean(current?.id.startsWith("temp-"));

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setNotes(await notesService.list());
    } catch (err) {
      setLoadError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Browser-level guard for tab close / reload with unsaved text.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q));
  }, [notes, search]);

  const openEditor = (note: Note | null) => {
    setCurrent(note);
    setTitle(note?.title ?? "");
    setBody(note?.body ?? "");
    setEditing(true);
  };

  // Run `action` now, or after the user confirms discarding unsaved changes.
  const guard = (action: () => void) => (dirty ? setPendingAction(() => action) : action());

  // Optimistic: the list and "Saved" state update now; typing during the request is never overwritten.
  const handleSave = async () => {
    const input = { title: title.trim() || "Untitled", body };
    const now = new Date().toISOString();
    const previous = current;
    const optimistic: Note = previous
      ? { ...previous, ...input, updatedAt: now }
      : { id: `temp-${Date.now()}`, ...input, createdAt: now, updatedAt: now };
    setNotes((prev) => [optimistic, ...prev.filter((n) => n.id !== optimistic.id)]);
    setCurrent(optimistic);
    setTitle(input.title);
    try {
      const saved = previous ? await notesService.update(previous.id, input) : await notesService.create(input);
      setNotes((prev) => prev.map((n) => (n.id === optimistic.id ? saved : n)));
      setCurrent((c) => (c?.id === optimistic.id ? saved : c));
    } catch (err) {
      setNotes((prev) =>
        previous ? prev.map((n) => (n.id === optimistic.id ? previous : n)) : prev.filter((n) => n.id !== optimistic.id)
      );
      setCurrent((c) => (c?.id === optimistic.id ? previous : c)); // edits stay in the editor as unsaved
      setToast({ message: errorText(err), severity: "error" });
    }
  };

  const handleDelete = async () => {
    if (!current) return;
    const note = current;
    const index = notes.findIndex((n) => n.id === note.id);
    setConfirmDelete(false);
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
    setEditing(false);
    setCurrent(null);
    try {
      await notesService.remove(note.id);
      setToast({ message: "Note deleted", severity: "success" });
    } catch (err) {
      setNotes((prev) => [...prev.slice(0, index), note, ...prev.slice(index)]);
      setToast({ message: errorText(err), severity: "error" });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress size={32} sx={{ color: "#3F6853" }} />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ maxWidth: 560, mx: "auto", mt: 6 }}>
        <Alert
          severity="error"
          action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}
          sx={{ borderRadius: 2 }}
        >
          Couldn&apos;t load notes: {loadError}
        </Alert>
      </Box>
    );
  }

  const newNoteButton = (label: string) => (
    <Button
      variant="contained"
      disableElevation
      startIcon={<AddRoundedIcon />}
      onClick={() => guard(() => openEditor(null))}
      sx={{ textTransform: "none", fontFamily: UI_FONT, bgcolor: "#3F6853", "&:hover": { bgcolor: "#345845" } }}
    >
      {label}
    </Button>
  );

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "#FCFBF8",
        border: BORDER,
        borderRadius: 3,
        overflow: "hidden",
        height: { md: "calc(100vh - 160px)" },
        minHeight: { xs: "calc(100vh - 200px)", md: 480 },
      }}
    >
      {/* List pane (hidden on mobile while editing) */}
      <Box
        sx={{
          display: { xs: editing ? "none" : "flex", md: "flex" },
          flexDirection: "column",
          width: { xs: "100%", md: 320 },
          flexShrink: 0,
          borderRight: { md: BORDER },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, pb: 1.5 }}>
          <Typography sx={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 500, color: "#0B1628" }}>
            Notes
          </Typography>
          {newNoteButton("New note")}
        </Box>

        <Box
          sx={{
            mx: 2,
            mb: 1.5,
            px: 1.25,
            display: "flex",
            alignItems: "center",
            gap: 1,
            border: BORDER,
            borderRadius: 2,
            bgcolor: "#F7F5EF",
          }}
        >
          <SearchRoundedIcon sx={{ fontSize: 18, color: "#68717C" }} />
          <InputBase
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes"
            inputProps={{ "aria-label": "Search notes" }}
            sx={{ flex: 1, py: 0.75, fontFamily: UI_FONT, fontSize: "0.875rem" }}
          />
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", borderTop: BORDER }}>
          {notes.length === 0 ? (
            <Box sx={{ textAlign: "center", px: 3, py: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <Typography sx={{ fontFamily: UI_FONT, color: "#68717C", fontSize: "0.9375rem" }}>
                No notes yet. Capture a thought, a plan, or anything worth keeping.
              </Typography>
              {newNoteButton("Write your first note")}
            </Box>
          ) : visible.length === 0 ? (
            <Typography sx={{ fontFamily: UI_FONT, color: "#68717C", fontSize: "0.875rem", p: 3, textAlign: "center" }}>
              No notes match &ldquo;{search}&rdquo;.
            </Typography>
          ) : (
            visible.map((note) => {
              const selected = editing && current?.id === note.id;
              return (
                <ButtonBase
                  key={note.id}
                  onClick={() => guard(() => openEditor(note))}
                  sx={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    px: 2,
                    py: 1.5,
                    borderBottom: BORDER,
                    bgcolor: selected ? "rgba(63, 104, 83, 0.10)" : "transparent",
                    borderLeft: `3px solid ${selected ? "#3F6853" : "transparent"}`,
                    "&:hover": { bgcolor: selected ? "rgba(63, 104, 83, 0.10)" : "rgba(17, 28, 46, 0.03)" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <Typography noWrap sx={{ flex: 1, fontFamily: UI_FONT, fontWeight: 600, fontSize: "0.9375rem", color: "#17202B" }}>
                      {note.title}
                    </Typography>
                    <Typography sx={{ fontFamily: UI_FONT, fontSize: "0.75rem", color: "#68717C", flexShrink: 0 }}>
                      {shortDate(note.updatedAt)}
                    </Typography>
                  </Box>
                  <Typography noWrap sx={{ fontFamily: UI_FONT, fontSize: "0.8125rem", color: "#68717C", mt: 0.25 }}>
                    {note.body.trim() || "No content"}
                  </Typography>
                </ButtonBase>
              );
            })
          )}
        </Box>
      </Box>

      {/* Editor pane */}
      <Box sx={{ display: { xs: editing ? "flex" : "none", md: "flex" }, flex: 1, minWidth: 0 }}>
        {editing ? (
          <NoteEditor
            title={title}
            body={body}
            onTitleChange={setTitle}
            onBodyChange={setBody}
            dirty={dirty}
            saving={creating}
            canDelete={Boolean(current) && !creating}
            onSave={handleSave}
            onDelete={() => setConfirmDelete(true)}
            onBack={() => guard(() => setEditing(false))}
          />
        ) : (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 4 }}>
            <Typography sx={{ fontFamily: UI_FONT, color: "#68717C", fontSize: "0.9375rem" }}>
              {notes.length ? "Select a note to read or edit it." : "Your notes will appear here."}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Discard unsaved changes? */}
      <Dialog open={pendingAction !== null} onClose={() => setPendingAction(null)}>
        <DialogTitle sx={{ fontFamily: UI_FONT, fontWeight: 600 }}>Discard unsaved changes?</DialogTitle>
        <DialogContent sx={{ fontFamily: UI_FONT, color: "#68717C" }}>
          Your edits to this note haven&apos;t been saved.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingAction(null)} sx={{ textTransform: "none", color: "#68717C" }}>
            Keep editing
          </Button>
          <Button
            onClick={() => {
              pendingAction?.();
              setPendingAction(null);
            }}
            sx={{ textTransform: "none", color: "#8C3F3B" }}
          >
            Discard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle sx={{ fontFamily: UI_FONT, fontWeight: 600 }}>Delete this note?</DialogTitle>
        <DialogContent sx={{ fontFamily: UI_FONT, color: "#68717C" }}>
          &ldquo;{current?.title}&rdquo; will be permanently deleted.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} sx={{ textTransform: "none", color: "#68717C" }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} sx={{ textTransform: "none", color: "#8C3F3B" }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast !== null}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toast?.severity ?? "success"} onClose={() => setToast(null)} sx={{ borderRadius: 2 }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
