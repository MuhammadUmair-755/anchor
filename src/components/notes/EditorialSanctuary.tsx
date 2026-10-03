"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CheckIcon from "@mui/icons-material/Check";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { JournalEntry } from "@/types/models";

export interface EditorialSanctuaryProps {
  entry: JournalEntry;
  onUpdateInquiry?: (answer: string) => void;
}

export default function EditorialSanctuary({
  entry,
  onUpdateInquiry,
}: EditorialSanctuaryProps) {
  const [editingInquiry, setEditingInquiry] = useState<boolean>(false);
  const [inquiryText, setInquiryText] = useState<string>(
    entry.inquiry?.answer || ""
  );

  const handleSaveInquiry = () => {
    if (onUpdateInquiry && inquiryText.trim()) {
      onUpdateInquiry(inquiryText.trim());
    }
    setEditingInquiry(false);
  };

  return (
    <Box
      component="article"
      aria-label="Editorial journal sanctuary"
      sx={{
        flex: 1,
        bgcolor: "#FCFBF8",
        overflowY: "auto",
        height: "100%",
      }}
    >
      {/* Centered Reading Canvas */}
      <Box
        sx={{
          maxWidth: 768,
          mx: "auto",
          w: "100%",
          px: { xs: 2.5, sm: 4 },
          py: { xs: 3, sm: 4.5 },
          display: "flex",
          flexDirection: "column",
          gap: 3.5,
        }}
      >
        {/* 1. Header Metadata Strip & Mood Chip */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
            pb: 2,
            borderBottom: "1px solid rgba(17, 28, 46, 0.08)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#68717C",
              fontFeatureSettings: '"tnum" on',
            }}
          >
            <span>{entry.dateFullFormatted}</span>
            <span>•</span>
            <span>{entry.wordCount} words</span>
            <span>•</span>
            <span>{entry.readingTimeMinutes} min read</span>
          </Box>

          {/* Mood Chip */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.5,
              borderRadius: 3,
              bgcolor: entry.mood?.bgColor || "rgba(95, 146, 119, 0.12)",
              border: `1px solid ${entry.mood?.color ? `${entry.mood.color}33` : "rgba(95, 146, 119, 0.25)"}`,
              color: entry.mood?.color || "#3F6853",
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: entry.mood?.dotColor || entry.mood?.color || "#5F9277",
              }}
            />
            <Typography
              sx={{
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              {entry.mood?.label || entry.moodTag}
            </Typography>
          </Box>
        </Box>

        {/* 2. Daily Inquiry Callout Card */}
        <Box
          sx={{
            bgcolor: "#F7F5EF",
            borderRadius: 3,
            p: 2.5,
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
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PsychologyAltIcon sx={{ fontSize: 18, color: "#40617E" }} />
              <Typography
                sx={{
                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#40617E",
                }}
              >
                DAILY INQUIRY
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: "rgba(63, 104, 83, 0.12)",
                  color: "#3F6853",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                }}
              >
                {entry.inquiry?.statusBadge || "Answered"}
              </Box>

              {!editingInquiry && (
                <Button
                  size="small"
                  onClick={() => {
                    setInquiryText(entry.inquiry?.answer || "");
                    setEditingInquiry(true);
                  }}
                  startIcon={<EditNoteIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    fontSize: "0.6875rem",
                    color: "#68717C",
                    textTransform: "none",
                    p: 0.5,
                    minWidth: "auto",
                  }}
                >
                  Edit
                </Button>
              )}
            </Box>
          </Box>

          {/* Prompt Question */}
          <Typography
            sx={{
              fontFamily: "var(--font-newsreader), Georgia, serif",
              fontSize: "1.0625rem",
              fontStyle: "italic",
              lineHeight: 1.45,
              color: "#0B1628",
            }}
          >
            &ldquo;{entry.inquiry?.question || entry.inquiryQuestion}&rdquo;
          </Typography>

          {/* Answer Area */}
          {editingInquiry ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 0.5 }}>
              <TextField
                multiline
                rows={2}
                fullWidth
                value={inquiryText}
                onChange={(e) => setInquiryText(e.target.value)}
                placeholder="Inscribe today's reflective response..."
                slotProps={{
                  input: {
                    sx: {
                      bgcolor: "#FFFFFF",
                      borderRadius: 2,
                      fontSize: "0.875rem",
                      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                    },
                  },
                }}
              />
              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  onClick={() => setEditingInquiry(false)}
                  sx={{ color: "#68717C", textTransform: "none" }}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleSaveInquiry}
                  sx={{
                    bgcolor: "#0B1628",
                    color: "#FCFBF8",
                    textTransform: "none",
                    "&:hover": { bgcolor: "#162338" },
                  }}
                >
                  Save Answer
                </Button>
              </Box>
            </Box>
          ) : (
            entry.inquiry?.answer && (
              <Typography
                sx={{
                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                  color: "#17202B",
                  bgcolor: "#FFFFFF",
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid rgba(17, 28, 46, 0.06)",
                }}
              >
                {entry.inquiry.answer}
              </Typography>
            )
          )}
        </Box>

        {/* 3. Headline & Ambient Telemetry */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          <Typography
            variant="h1"
            sx={{
              fontFamily: "var(--font-newsreader), Georgia, serif",
              fontSize: { xs: "1.875rem", sm: "2.25rem" },
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.015em",
              color: "#0B1628",
            }}
          >
            {entry.title}
          </Typography>

          <Typography
            sx={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "0.6875rem",
              color: "#8E95A0",
              fontFeatureSettings: '"tnum" on',
            }}
          >
            {entry.loggedTimeInfo}
          </Typography>
        </Box>

        {/* 4. Longform Article Body */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
          {/* Paragraph 1 */}
          {entry.contentParagraphs?.[0] && (
            <Typography
              sx={{
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: "1rem",
                lineHeight: 1.7,
                color: "#17202B",
              }}
            >
              {entry.contentParagraphs[0]}
            </Typography>
          )}

          {/* Styled Editorial Blockquote */}
          {entry.quote && (
            <Box
              component="blockquote"
              sx={{
                borderLeft: "3px solid #0B1628",
                pl: 3,
                py: 2,
                my: 1,
                bgcolor: "#F5F3ED",
                borderRadius: "0 8px 8px 0",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-newsreader), Georgia, serif",
                  fontSize: { xs: "1.125rem", sm: "1.25rem" },
                  fontStyle: "italic",
                  lineHeight: 1.5,
                  color: "#0B1628",
                }}
              >
                &ldquo;{entry.quote}&rdquo;
              </Typography>
              {entry.quoteAttribution && (
                <Typography
                  sx={{
                    fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#68717C",
                    mt: 1,
                  }}
                >
                  {entry.quoteAttribution}
                </Typography>
              )}
            </Box>
          )}

          {/* Remaining Paragraphs */}
          {entry.contentParagraphs?.slice(1).map((para, idx) => (
            <Typography
              key={idx}
              sx={{
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: "1rem",
                lineHeight: 1.7,
                color: "#17202B",
              }}
            >
              {para}
            </Typography>
          ))}
        </Box>

        {/* 5. Bulleted Reflections & Observations */}
        {entry.observations && entry.observations.length > 0 && (
          <Box
            sx={{
              bgcolor: "#F7F5EF",
              borderRadius: 3,
              p: 2.5,
              border: "1px solid rgba(17, 28, 46, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
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
              REFLECTIONS &amp; OBSERVATIONS:
            </Typography>

            <Box
              component="ul"
              sx={{
                listStyle: "none",
                p: 0,
                m: 0,
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
              }}
            >
              {entry.observations.map((obs, idx) => (
                <Box
                  component="li"
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.25,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "#0B1628",
                      mt: 1,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                      fontSize: "0.875rem",
                      lineHeight: 1.55,
                      color: "#17202B",
                    }}
                  >
                    <Box component="strong" sx={{ fontWeight: 600, color: "#0B1628" }}>
                      {obs.title}{" "}
                    </Box>
                    {obs.note}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* 6. Linked Operating Entities Tray */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
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
            LINKED OPERATING ENTITIES
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 1.5,
            }}
          >
            {/* 1. Linked Project */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: "#FFFFFF",
                border: "1px solid rgba(17, 28, 46, 0.08)",
                boxShadow: "0 1px 3px rgba(11, 22, 40, 0.02)",
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1.5,
                    bgcolor: "rgba(11, 22, 40, 0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FolderOutlinedIcon sx={{ fontSize: 16, color: "#0B1628" }} />
                </Box>
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
                  PROJECT
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#17202B",
                }}
              >
                {entry.linkedEntities?.project?.name || entry.linkedProject?.name || "ANCHOR Core"}
              </Typography>
            </Box>

            {/* 2. Linked Financial Debit */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: "#FFFFFF",
                border: "1px solid rgba(17, 28, 46, 0.08)",
                boxShadow: "0 1px 3px rgba(11, 22, 40, 0.02)",
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1.5,
                    bgcolor: "rgba(199, 109, 104, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PaymentsOutlinedIcon sx={{ fontSize: 16, color: "#C76D68" }} />
                </Box>
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
                  FINANCE DEBIT
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#8C3F3B",
                  fontFeatureSettings: '"tnum" on',
                }}
              >
                {entry.linkedEntities?.financialDebit?.formattedText ||
                  (entry.linkedDebit ? `Rs. ${entry.linkedDebit.amount.toLocaleString()}` : "Rs. 1,300")}
              </Typography>
            </Box>

            {/* 3. Linked Tasks Resolved */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: "#FFFFFF",
                border: "1px solid rgba(17, 28, 46, 0.08)",
                boxShadow: "0 1px 3px rgba(11, 22, 40, 0.02)",
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1.5,
                    bgcolor: "rgba(95, 146, 119, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TaskAltIcon sx={{ fontSize: 16, color: "#3F6853" }} />
                </Box>
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
                  TASKS RESOLVED
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#3F6853",
                  fontFeatureSettings: '"tnum" on',
                }}
              >
                {entry.linkedEntities?.tasksResolved?.formattedText ||
                  (entry.linkedTasksResolvedCount
                    ? `${entry.linkedTasksResolvedCount} tasks checked`
                    : "3 tasks checked")}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 7. Footer Format Footnote */}
        <Box
          sx={{
            pt: 2,
            borderTop: "1px solid rgba(17, 28, 46, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            color: "#8E95A0",
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            fontSize: "0.75rem",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <span>Press</span>
            <Box
              component="kbd"
              sx={{
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                bgcolor: "#F0EEE8",
                border: "1px solid rgba(17, 28, 46, 0.12)",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "0.6875rem",
                color: "#17202B",
              }}
            >
              Cmd + E
            </Box>
            <span>to edit inline</span>
          </Box>
          <Typography
            sx={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "0.6875rem",
              color: "#8E95A0",
            }}
          >
            Anchor Journal Format v2.4
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
