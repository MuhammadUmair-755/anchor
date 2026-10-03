"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import { ConsistencyStats, PinnedMaxim, JournalEntry } from "@/types/models";
import { mockConsistencyStats, mockPinnedMaxim, mockTaxonomyTags } from "@/services/mockData";

export interface ContextualIntelligenceAsideProps {
  entry?: JournalEntry;
  consistencyStats?: ConsistencyStats;
  pinnedMaxim?: PinnedMaxim;
  taxonomyTags?: string[];
  onExportMarkdown: () => void;
  onPinEntry: () => void;
  onAddTag?: () => void;
}

export default function ContextualIntelligenceAside({
  entry,
  consistencyStats = mockConsistencyStats,
  pinnedMaxim = mockPinnedMaxim,
  taxonomyTags = mockTaxonomyTags,
  onExportMarkdown,
  onPinEntry,
  onAddTag,
}: ContextualIntelligenceAsideProps) {
  const displayMaxim = pinnedMaxim || mockPinnedMaxim;
  const displayStats = consistencyStats || mockConsistencyStats;
  const displayTags = (entry && entry.tags && entry.tags.length > 0) ? entry.tags : taxonomyTags;

  return (
    <Box
      component="aside"
      aria-label="Reflective intelligence aside"
      sx={{
        width: 320,
        minWidth: 320,
        borderLeft: "1px solid rgba(17, 28, 46, 0.08)",
        bgcolor: "#F7F5EF",
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        overflowY: "auto",
        gap: 3,
      }}
    >
      {/* Top Stack of Intelligence Cards */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* Aside Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <InsightsOutlinedIcon sx={{ fontSize: 18, color: "#40617E" }} />
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
            INTELLIGENCE
          </Typography>
        </Box>

        {/* 1. Consistency Matrix Card */}
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
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
              CONSISTENCY
            </Typography>
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
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontFeatureSettings: '"tnum" on',
              }}
            >
              {displayStats.momChangeDelta}
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography
              sx={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "2rem",
                fontWeight: 700,
                lineHeight: 1,
                color: "#0B1628",
                fontFeatureSettings: '"tnum" on',
              }}
            >
              {displayStats.scorePercentage}%
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: "0.75rem",
                color: "#68717C",
              }}
            >
              over past {displayStats.totalDays} days
            </Typography>
          </Box>

          {/* 30-Day Spark Dots Matrix */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", color: "#8E95A0" }}>
              <Typography
                sx={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: "0.625rem",
                }}
              >
                {displayStats.startDateLabel}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: "0.625rem",
                }}
              >
                {displayStats.endDateLabel}
              </Typography>
            </Box>

            {/* 10-column Grid of 30 Dots */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(10, 1fr)",
                gap: 0.5,
              }}
            >
              {displayStats.sparkMatrix.map((dot) => {
                let dotBg = "#0B1628";
                let outline = "none";
                if (dot.status === "missed") {
                  dotBg = "rgba(197, 198, 205, 0.35)";
                } else if (dot.status === "today") {
                  dotBg = "#059669";
                  outline = "2px solid rgba(5, 150, 105, 0.25)";
                }

                return (
                  <Tooltip key={dot.dayIndex} title={dot.tooltipText || dot.label} arrow>
                    <Box
                      sx={{
                        height: 8,
                        borderRadius: "2px",
                        bgcolor: dotBg,
                        outline: outline,
                        transition: "transform 0.1s ease",
                        "&:hover": { transform: "scale(1.25)" },
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          </Box>

          {/* Dominant Tone */}
          <Box
            sx={{
              pt: 1,
              borderTop: "1px solid rgba(17, 28, 46, 0.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: "0.6875rem",
                color: "#68717C",
              }}
            >
              Dominant Tone
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#0B1628",
              }}
            >
              {displayStats.dominantTone}
            </Typography>
          </Box>
        </Box>

        {/* 2. Pinned Maxim Card */}
        <Box
          sx={{
            bgcolor: "#FCFBF8",
            borderRadius: 3,
            p: 2,
            border: "1px solid rgba(17, 28, 46, 0.08)",
            boxShadow: "0 1px 3px rgba(11, 22, 40, 0.02)",
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <PushPinOutlinedIcon sx={{ fontSize: 16, color: "#C4934A" }} />
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
              PINNED MAXIM
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: "var(--font-newsreader), Georgia, serif",
              fontSize: "0.9375rem",
              fontStyle: "italic",
              lineHeight: 1.45,
              color: "#0B1628",
            }}
          >
            &ldquo;{displayMaxim.quote}&rdquo;
          </Typography>

          <Typography
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.6875rem",
              color: "#8E95A0",
            }}
          >
            {displayMaxim.attribution}
          </Typography>
        </Box>

        {/* 3. Taxonomy & Themes */}
        <Box
          sx={{
            bgcolor: "#FCFBF8",
            borderRadius: 3,
            p: 2,
            border: "1px solid rgba(17, 28, 46, 0.08)",
            boxShadow: "0 1px 3px rgba(11, 22, 40, 0.02)",
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
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
            TAXONOMY &amp; THEMES
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {displayTags.map((tag) => (
              <Box
                key={tag}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 1.5,
                  bgcolor: "#F5F3ED",
                  border: "1px solid rgba(17, 28, 46, 0.08)",
                  color: "#40617E",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                }}
              >
                {tag}
              </Box>
            ))}

            <Box
              component="button"
              type="button"
              onClick={onAddTag}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                px: 1.25,
                py: 0.5,
                borderRadius: 1.5,
                bgcolor: "transparent",
                border: "1px dashed rgba(17, 28, 46, 0.2)",
                color: "#68717C",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: "0.6875rem",
                cursor: "pointer",
                "&:hover": {
                  borderColor: "#0B1628",
                  color: "#0B1628",
                },
              }}
            >
              + add
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Bottom CTA Action Buttons */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 1 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
          onClick={onExportMarkdown}
          sx={{
            height: 42,
            bgcolor: "#0B1628",
            color: "#FCFBF8",
            borderRadius: 2,
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            fontSize: "0.8125rem",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": { bgcolor: "#12243A" },
          }}
        >
          Export Markdown
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<PushPinOutlinedIcon sx={{ fontSize: 18 }} />}
          onClick={onPinEntry}
          sx={{
            height: 42,
            bgcolor: "#FFFFFF",
            borderColor: "rgba(17, 28, 46, 0.12)",
            color: "#0B1628",
            borderRadius: 2,
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            fontSize: "0.8125rem",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              bgcolor: "#F7F5EF",
              borderColor: "rgba(17, 28, 46, 0.25)",
            },
          }}
        >
          Pin Entry
        </Button>
      </Box>
    </Box>
  );
}
