"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import AnchorIcon from "@mui/icons-material/Anchor";
import { NewCalendarEventPayload } from "@/types/models";

export interface NewEventModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: NewCalendarEventPayload) => Promise<void>;
  defaultDate?: string;
}

export default function NewEventModal({
  open,
  onClose,
  onSubmit,
  defaultDate = "2026-09-11",
}: NewEventModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [type, setType] = useState<"event" | "task" | "financial" | "journal">("task");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setDate(defaultDate);
      setTitle("");
      setAmount("");
      setNote("");
      setError(null);
    }
  }, [open, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide an entry title");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        title: title.trim(),
        date,
        type,
        amount: amount ? parseFloat(amount) : undefined,
        note: note.trim() || undefined,
      });
      // Reset form
      setTitle("");
      setAmount("");
      setNote("");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create entry";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "12px",
            bgcolor: "#FCFBF8",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow: "0 12px 32px rgba(11, 22, 40, 0.16)",
            p: 1,
          },
        },
      }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: "#111C2E",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AnchorIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "var(--font-newsreader), Georgia, serif",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "#1B1C18",
                  lineHeight: 1.2,
                }}
              >
                Log New Entry or Event
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  color: "#75777D",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                ANCHOR TEMPORAL CADENCE
              </Typography>
            </Box>
          </Stack>

          <IconButton size="small" onClick={onClose} sx={{ color: "#75777D" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}>
          {error && (
            <Box
              sx={{
                p: 1.5,
                bgcolor: "rgba(199, 109, 104, 0.12)",
                border: "1px solid rgba(199, 109, 104, 0.3)",
                borderRadius: "8px",
                color: "#8C3F3B",
                fontSize: "0.8125rem",
              }}
            >
              {error}
            </Box>
          )}

          {/* Title input */}
          <TextField
            label="Title / Description"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            placeholder="e.g. Systems Architecture Audit or Gym Conditioning"
            slotProps={{
              input: {
                sx: { borderRadius: "8px", bgcolor: "#FFFFFF" },
              },
            }}
          />

          {/* Grid row: Date & Type */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              label="Date (YYYY-MM-DD)"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  sx: { borderRadius: "8px", bgcolor: "#FFFFFF" },
                },
              }}
            />

            <TextField
              select
              label="Vector Classification"
              value={type}
              onChange={(e) => setType(e.target.value as "event" | "task" | "financial" | "journal")}
              fullWidth
              slotProps={{
                input: {
                  sx: { borderRadius: "8px", bgcolor: "#FFFFFF" },
                },
              }}
            >
              <MenuItem value="task">Operational Task</MenuItem>
              <MenuItem value="event">Calendar Event / Milestone</MenuItem>
              <MenuItem value="financial">Financial Flow</MenuItem>
              <MenuItem value="journal">Journal Inscription</MenuItem>
            </TextField>
          </Box>

          {/* Optional Amount if Financial */}
          {type === "financial" && (
            <TextField
              label="Amount in INR (e.g. 1500 for inflow, -850 for debit)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              slotProps={{
                input: {
                  sx: { borderRadius: "8px", bgcolor: "#FFFFFF" },
                },
              }}
            />
          )}

          {/* Optional Note */}
          <TextField
            label="Optional Note / Memo"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={2}
            fullWidth
            placeholder="Context, location, or strategic linkage..."
            slotProps={{
              input: {
                sx: { borderRadius: "8px", bgcolor: "#FFFFFF" },
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
          <Button
            onClick={onClose}
            sx={{
              color: "#75777D",
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={<AddIcon />}
            sx={{
              bgcolor: "#111C2E",
              color: "#FFFFFF",
              borderRadius: "8px",
              px: 2.5,
              py: 0.8,
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { bgcolor: "#0B1628" },
            }}
          >
            {loading ? "Recording..." : "Record Entry"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
