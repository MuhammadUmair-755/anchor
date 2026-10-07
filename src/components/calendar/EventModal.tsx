"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { NewCalendarEventPayload } from "@/types/models";

interface EventModalProps {
  open: boolean;
  defaultDate: string;
  onClose: () => void;
  /** Called with a valid event; the modal closes immediately and the page saves optimistically. */
  onSubmit: (payload: NewCalendarEventPayload) => void;
}

function EventForm({ defaultDate, onClose, onSubmit }: Omit<EventModalProps, "open">) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onSubmit({ title: title.trim(), date, time: time || undefined, note: note.trim() || undefined });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
        <TextField label="Title" required autoFocus value={title} onChange={(e) => setTitle(e.target.value)} slotProps={{ htmlInput: { maxLength: 200 } }} />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField label="Date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Time (optional)" type="time" value={time} onChange={(e) => setTime(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        </Box>
        <TextField label="Note (optional)" multiline minRows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: "#68717C", textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!title.trim() || !date}
          sx={{ bgcolor: "#0B1628", textTransform: "none", "&:hover": { bgcolor: "#162338" } }}
        >
          Add event
        </Button>
      </DialogActions>
    </form>
  );
}

export default function EventModal({ open, ...rest }: EventModalProps) {
  return (
    <Dialog open={open} onClose={rest.onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: 3, bgcolor: "#FCFBF8" } } }}>
      <DialogTitle sx={{ fontWeight: 600, color: "#0B1628" }}>New event</DialogTitle>
      {open && <EventForm {...rest} />}
    </Dialog>
  );
}
