"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EditNoteIcon from "@mui/icons-material/EditNote";

export interface TemporalCadenceLegendProps {
  title?: string;
  cycleRangeText?: string;
}

export default function TemporalCadenceLegend({
  title = "TEMPORAL CADENCE",
  cycleRangeText = "30 Days · Week 36 to Week 40",
}: TemporalCadenceLegendProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        bgcolor: "rgba(245, 243, 237, 0.7)",
        border: "1px solid rgba(197, 198, 205, 0.4)",
        borderRadius: "12px",
        px: { xs: 2, sm: 2.5 },
        py: 1.25,
      }}
    >
      {/* Left Cadence Range Info */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "#40617E",
            }}
          />
          <Typography
            sx={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#45474C",
            }}
          >
            {title}
          </Typography>
        </Stack>

        <Typography sx={{ color: "rgba(197, 198, 205, 0.8)", userSelect: "none" }}>|</Typography>

        <Typography
          sx={{
            fontSize: "0.8125rem",
            color: "#1B1C18",
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
          }}
        >
          {cycleRangeText}
        </Typography>
      </Stack>

      {/* Right Cross-System Legend Icons */}
      <Stack
        direction="row"
        spacing={2.5}
        sx={{
          alignItems: "center",
          fontSize: "0.6875rem",
          color: "#45474C",
          flexWrap: "wrap",
        }}
      >
        {/* Finance Flow indicator */}
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "#3F6853",
            }}
          />
          <Typography sx={{ fontSize: "0.6875rem", color: "inherit" }}>
            Finance Flow
          </Typography>
        </Stack>

        {/* Tasks Check indicator */}
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "#40617E",
            }}
          />
          <Typography sx={{ fontSize: "0.6875rem", color: "inherit" }}>
            Tasks Check
          </Typography>
        </Stack>

        {/* Journal Inscribed indicator */}
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <EditNoteIcon sx={{ fontSize: 15, color: "#75777D" }} />
          <Typography sx={{ fontSize: "0.6875rem", color: "inherit" }}>
            Journal Inscribed
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
