"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import { CalendarDay } from "@/types/models";
import { longDateLabel } from "@/lib/calendar";

interface DayPanelProps {
  day: CalendarDay;
  isToday: boolean;
  onAddEvent: () => void;
  onDeleteEvent: (id: string) => void;
  onToggleTask: (id: string, isCompleted: boolean) => void;
}

const money = (n: number) => `${n < 0 ? "-" : "+"}Rs. ${Math.abs(n).toLocaleString("en-IN")}`;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#68717C", mb: 0.75 }}>
        {title}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>{children}</Box>
    </Box>
  );
}

const rowSx = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  minHeight: 40,
  px: 1,
  borderRadius: 1.5,
  bgcolor: "rgba(240, 238, 232, 0.5)",
} as const;

export default function DayPanel({ day, isToday, onAddEvent, onDeleteEvent, onToggleTask }: DayPanelProps) {
  const net = day.transactions.reduce((sum, t) => sum + t.amount, 0);
  const isEmpty = day.events.length + day.tasks.length + day.transactions.length + day.notes.length === 0;

  return (
    <Box
      sx={{
        bgcolor: "#FCFBF8",
        border: "1px solid rgba(17, 28, 46, 0.08)",
        borderRadius: 3,
        p: { xs: 2, sm: 2.5 },
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
        <Box>
          {isToday && (
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#3F6853", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Today
            </Typography>
          )}
          <Typography sx={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontSize: "1.375rem", fontWeight: 500, color: "#0B1628", lineHeight: 1.25 }}>
            {longDateLabel(day.dateKey)}
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddEvent}
          sx={{ flexShrink: 0, textTransform: "none", color: "#0B1628", borderColor: "rgba(17, 28, 46, 0.2)" }}
        >
          Event
        </Button>
      </Box>

      {isEmpty && (
        <Typography sx={{ fontSize: "0.875rem", color: "#68717C", py: 2, textAlign: "center" }}>
          Nothing on this day yet.
        </Typography>
      )}

      {day.events.length > 0 && (
        <Section title="Events">
          {day.events.map((e) => (
            <Box key={e.id} sx={rowSx}>
              <Box sx={{ flex: 1, minWidth: 0, py: 0.75 }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#17202B" }}>
                  {e.time && <Box component="span" sx={{ color: "#40617E", mr: 0.75 }}>{e.time}</Box>}
                  {e.title}
                </Typography>
                {e.note && <Typography sx={{ fontSize: "0.75rem", color: "#68717C" }}>{e.note}</Typography>}
              </Box>
              <Tooltip title="Delete event">
                <IconButton aria-label={`Delete event ${e.title}`} onClick={() => onDeleteEvent(e.id)} sx={{ color: "#8C3F3B" }}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Section>
      )}

      {day.tasks.length > 0 && (
        <Section title="Tasks due">
          {day.tasks.map((t) => (
            <Box key={t.id} sx={rowSx}>
              <Checkbox
                size="small"
                checked={t.isCompleted}
                onChange={() => onToggleTask(t.id, !t.isCompleted)}
                slotProps={{ input: { "aria-label": `Mark "${t.title}" ${t.isCompleted ? "not done" : "done"}` } }}
                sx={{ p: 0.5 }}
              />
              <Typography
                sx={{ fontSize: "0.875rem", color: t.isCompleted ? "#68717C" : "#17202B", textDecoration: t.isCompleted ? "line-through" : "none" }}
              >
                {t.title}
              </Typography>
            </Box>
          ))}
        </Section>
      )}

      {day.transactions.length > 0 && (
        <Section title="Money">
          {day.transactions.map((tx) => (
            <Box key={tx.id} sx={{ ...rowSx, justifyContent: "space-between" }}>
              <Typography noWrap sx={{ fontSize: "0.875rem", color: "#17202B", minWidth: 0 }}>
                {tx.title}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: "0.8125rem", fontWeight: 600, color: tx.amount < 0 ? "#8C3F3B" : "#3F6853", whiteSpace: "nowrap" }}>
                {money(tx.amount)}
              </Typography>
            </Box>
          ))}
          <Typography sx={{ fontSize: "0.75rem", color: "#68717C", textAlign: "right", px: 1 }}>Net {money(net)}</Typography>
        </Section>
      )}

      {day.notes.length > 0 && (
        <Section title="Notes">
          {day.notes.map((n) => (
            <Box key={n.id} component={Link} href="/notes" sx={{ ...rowSx, textDecoration: "none", color: "#17202B", fontSize: "0.875rem", "&:hover": { bgcolor: "rgba(240, 238, 232, 0.9)" } }}>
              {n.title}
            </Box>
          ))}
        </Section>
      )}
    </Box>
  );
}
