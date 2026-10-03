"use client";

import React, { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CheckIcon from "@mui/icons-material/Check";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import EditNoteIcon from "@mui/icons-material/EditNote";
import MicIcon from "@mui/icons-material/Mic";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { JournalEntry } from "@/types/models";

export interface MobileNotesViewProps {
  entries: JournalEntry[];
  activeEntry: JournalEntry;
  onSelectEntry: (id: string) => void;
  onContinueWriting?: () => void;
  onVoiceMemo?: () => void;
  onAttachment?: () => void;
  onMoreActions?: () => void;
}

export default function MobileNotesView({
  entries,
  activeEntry,
  onSelectEntry,
  onContinueWriting,
  onVoiceMemo,
  onAttachment,
  onMoreActions,
}: MobileNotesViewProps) {
  // 5 Canonical Timeline Date Pills matching Stitch
  const datePills = useMemo(() => {
    return [
      { id: "entry-sep-11", dayOfWeek: "FRI", dayNumber: "11", label: "Today" },
      { id: "entry-sep-10", dayOfWeek: "THU", dayNumber: "10", label: "Entry" },
      { id: "entry-sep-09", dayOfWeek: "WED", dayNumber: "09", label: "Entry" },
      { id: "entry-sep-08", dayOfWeek: "TUE", dayNumber: "08", label: "Entry" },
      { id: "entry-sep-07", dayOfWeek: "MON", dayNumber: "07", label: "Entry" },
    ];
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 600,
        mx: "auto",
        px: { xs: 1.5, sm: 2 },
        pt: 1,
        pb: 12, // Clearance for sticky bottom tray + bottom nav
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* 1. HORIZONTAL DATE PILL RAIL */}
      <Box
        component="section"
        aria-label="Journal timeline dates"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          overflowX: "auto",
          py: 0.5,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {datePills.map((pill) => {
          const isSelected = activeEntry.id === pill.id;
          return (
            <Box
              key={pill.id}
              component="button"
              type="button"
              onClick={() => onSelectEntry(pill.id)}
              sx={{
                flexShrink: 0,
                minWidth: 56,
                px: 1.75,
                py: 1,
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: isSelected ? "1px solid #111C2E" : "1px solid rgba(17, 28, 46, 0.08)",
                bgcolor: isSelected ? "#111C2E" : "#FCFBF8",
                color: isSelected ? "#FCFBF8" : "#17202B",
                cursor: "pointer",
                boxShadow: isSelected ? "0 2px 8px rgba(11,22,40,0.18)" : "none",
                transition: "all 0.15s ease",
                "&:active": { transform: "scale(0.95)" },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: isSelected ? "#E4E2DD" : "#68717C",
                }}
              >
                {pill.dayOfWeek}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: isSelected ? "#FCFBF8" : "#17202B",
                  fontFeatureSettings: '"tnum" on',
                }}
              >
                {pill.dayNumber}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.5625rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: isSelected ? "#BCC7DF" : "#8E95A0",
                  mt: 0.25,
                }}
              >
                {pill.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* 2. MINDSET & CADENCE PROMPT CARD */}
      <Box
        sx={{
          bgcolor: "#FCFBF8",
          borderRadius: 3,
          p: 2,
          border: "1px solid rgba(17, 28, 46, 0.08)",
          boxShadow: "0 1px 3px rgba(11, 22, 40, 0.02)",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
            borderBottom: "1px solid rgba(17, 28, 46, 0.06)",
          }}
        >
          <Typography
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.6875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#68717C",
            }}
          >
            MINDSET &amp; CADENCE
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#40617E" }} />
            <Typography
              sx={{
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: "0.6875rem",
                fontWeight: 500,
                color: "#40617E",
              }}
            >
              Evening Reflection
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
          <Box>
            <Typography
              sx={{
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#17202B",
              }}
            >
              {activeEntry.inquiryQuestion || "How was today?"}
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: "0.75rem",
                color: "#68717C",
                mt: 0.25,
              }}
            >
              Assessed at 20:45 across focus, energy, and decision clarity.
            </Typography>
          </Box>
          <Box
            sx={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.25,
              py: 0.5,
              borderRadius: 2,
              bgcolor: "#F5F3ED",
              border: "1px solid rgba(17, 28, 46, 0.08)",
              color: "#0B1628",
            }}
          >
            <PsychologyAltIcon sx={{ fontSize: 16, color: "#40617E" }} />
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
              {activeEntry.mood?.label || activeEntry.moodTag || "Grounded & Calm"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 3. EDITORIAL JOURNAL BODY CARD */}
      <Box
        component="article"
        sx={{
          bgcolor: "#FCFBF8",
          borderRadius: 3,
          p: { xs: 2, sm: 2.5 },
          border: "1px solid rgba(17, 28, 46, 0.08)",
          boxShadow: "0 1px 3px rgba(11, 22, 40, 0.02)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Article Header */}
        <Box sx={{ pb: 1.5, borderBottom: "1px solid rgba(17, 28, 46, 0.08)" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography
              sx={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "0.6875rem",
                color: "#68717C",
                fontFeatureSettings: '"tnum" on',
              }}
            >
              ENTRY #{activeEntry.entryNumber || 254}
            </Typography>
            <IconButton
              size="small"
              onClick={onMoreActions}
              aria-label="More entry actions"
              sx={{ color: "#68717C", p: 0.5, "&:hover": { color: "#0B1628" } }}
            >
              <MoreHorizIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontFamily: "var(--font-newsreader), Georgia, serif",
              fontSize: { xs: "1.5rem", sm: "1.75rem" },
              fontWeight: 400,
              letterSpacing: "-0.01em",
              lineHeight: 1.25,
              color: "#0B1628",
              mt: 0.75,
            }}
          >
            {activeEntry.title}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "0.6875rem",
              color: "#68717C",
              fontFeatureSettings: '"tnum" on',
              pt: 0.75,
            }}
          >
            <span>{activeEntry.dateFullFormatted || "Friday, Sep 11, 2026"}</span>
            <span>·</span>
            <span>{activeEntry.wordCount} words</span>
            <span>·</span>
            <span>{activeEntry.readingTimeMinutes} min read</span>
          </Box>
        </Box>

        {/* Featured Excerpt Quote Block */}
        <Box
          component="blockquote"
          sx={{
            bgcolor: "#F5F3ED",
            borderRadius: 2,
            p: 2,
            borderLeft: "3px solid #0B1628",
          }}
        >
          <Typography
            sx={{
              fontFamily: "var(--font-newsreader), Georgia, serif",
              fontStyle: "italic",
              fontSize: "1rem",
              lineHeight: 1.5,
              color: "#0B1628",
            }}
          >
            &ldquo;{activeEntry.quote ||
              "Restraint is power. When life gets chaotic, tighten the system."}&rdquo;
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.6875rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#68717C",
              mt: 1,
            }}
          >
            {activeEntry.quoteAttribution || "Anchor Ledger Codex · Axiom 04"}
          </Typography>
        </Box>

        {/* Main Prose Paragraphs */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {activeEntry.contentParagraphs && activeEntry.contentParagraphs.length > 0 ? (
            activeEntry.contentParagraphs.map((paragraph, idx) => (
              <Typography
                key={idx}
                sx={{
                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                  fontSize: "0.9375rem",
                  lineHeight: 1.65,
                  color: "#17202B",
                }}
              >
                {paragraph}
              </Typography>
            ))
          ) : (
            <Typography
              sx={{
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: "0.9375rem",
                lineHeight: 1.65,
                color: "#17202B",
              }}
            >
              The morning opened with turbulent alerts across our external infrastructure integrations.
              Today, I practiced measured stillness.
            </Typography>
          )}
        </Box>

        {/* Recessed Micro-Observations Card */}
        <Box
          sx={{
            bgcolor: "#F0EEE8",
            borderRadius: 2,
            p: 1.75,
            border: "1px solid rgba(17, 28, 46, 0.08)",
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography
              sx={{
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#0B1628",
              }}
            >
              MICRO OBSERVATIONS
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "0.6875rem",
                color: "#68717C",
                fontFeatureSettings: '"tnum" on',
              }}
            >
              {activeEntry.microObservations?.time || "21:15"}
            </Typography>
          </Box>

          <Box
            component="ul"
            sx={{
              listStyle: "none",
              p: 0,
              m: 0,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {(
              activeEntry.microObservations?.items || [
                "Eliminated context switching across three distinct workspaces.",
                "Liquid reserves rebalanced cleanly into conservative short yields.",
                "Physical stamina maintained through disciplined afternoon hiatus.",
              ]
            ).map((obs, idx) => (
              <Box component="li" key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <CheckIcon sx={{ fontSize: 16, color: "#40617E", mt: 0.25, flexShrink: 0 }} />
                <Typography
                  sx={{
                    fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                    fontSize: "0.8125rem",
                    lineHeight: 1.45,
                    color: "#17202B",
                  }}
                >
                  {obs}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Cross-Link System Correlations */}
        <Box sx={{ pt: 1, borderTop: "1px solid rgba(17, 28, 46, 0.08)" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.6875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#68717C",
              mb: 1,
            }}
          >
            System Correlations
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {/* Project Link */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.25,
                py: 0.5,
                borderRadius: 2,
                bgcolor: "#F0EEE8",
                border: "1px solid rgba(17, 28, 46, 0.08)",
                color: "#0B1628",
              }}
            >
              <FolderOpenOutlinedIcon sx={{ fontSize: 15, color: "#0B1628" }} />
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                {activeEntry.linkedEntities?.project?.name ||
                  activeEntry.linkedProject?.name ||
                  "Project ANCHOR"}
              </Typography>
            </Box>

            {/* Financial Link */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.25,
                py: 0.5,
                borderRadius: 2,
                bgcolor: "rgba(199, 109, 104, 0.1)",
                border: "1px solid rgba(199, 109, 104, 0.25)",
                color: "#8C3F3B",
              }}
            >
              <PaymentsOutlinedIcon sx={{ fontSize: 15, color: "#C76D68" }} />
              <Typography
                sx={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  fontFeatureSettings: '"tnum" on',
                }}
              >
                {activeEntry.linkedEntities?.financialDebit?.subtitle ||
                  (activeEntry.linkedDebit
                    ? `-Rs. ${activeEntry.linkedDebit.amount.toLocaleString()} spent today`
                    : "-Rs. 1,300 spent today")}
              </Typography>
            </Box>

            {/* Tasks Completed Link */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.25,
                py: 0.5,
                borderRadius: 2,
                bgcolor: "rgba(95, 146, 119, 0.12)",
                border: "1px solid rgba(95, 146, 119, 0.25)",
                color: "#3F6853",
              }}
            >
              <TaskAltIcon sx={{ fontSize: 15, color: "#5F9277" }} />
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                {activeEntry.linkedEntities?.tasksResolved?.formattedText ||
                  (activeEntry.linkedTasksResolvedCount
                    ? `${activeEntry.linkedTasksResolvedCount} tasks done`
                    : "3 tasks done")}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 4. CONTEXTUAL STICKY ACTION TRAY */}
      <Box
        sx={{
          position: "sticky",
          bottom: { xs: 72, sm: 80 },
          zIndex: 1100,
          pt: 1,
          pb: 1,
        }}
      >
        <Box
          sx={{
            bgcolor: "rgba(252, 251, 248, 0.95)",
            backdropFilter: "blur(12px)",
            borderRadius: 3,
            p: 1,
            border: "1px solid rgba(17, 28, 46, 0.1)",
            boxShadow: "0 4px 20px rgba(11, 22, 40, 0.08)",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Button
            fullWidth
            variant="contained"
            startIcon={<EditNoteIcon sx={{ fontSize: 20 }} />}
            onClick={onContinueWriting}
            sx={{
              height: 44,
              bgcolor: "#0B1628",
              color: "#FCFBF8",
              borderRadius: 2,
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { bgcolor: "#162338" },
              "&:active": { transform: "scale(0.98)" },
            }}
          >
            Continue Writing
          </Button>

          <IconButton
            onClick={onVoiceMemo}
            aria-label="Voice memo capture"
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: "#F5F3ED",
              border: "1px solid rgba(17, 28, 46, 0.08)",
              color: "#0B1628",
              "&:hover": { bgcolor: "#EAE8E2" },
              "&:active": { transform: "scale(0.95)" },
            }}
          >
            <MicIcon sx={{ fontSize: 20 }} />
          </IconButton>

          <IconButton
            onClick={onAttachment}
            aria-label="Add attachment"
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: "#F5F3ED",
              border: "1px solid rgba(17, 28, 46, 0.08)",
              color: "#0B1628",
              "&:hover": { bgcolor: "#EAE8E2" },
              "&:active": { transform: "scale(0.95)" },
            }}
          >
            <AttachFileIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
