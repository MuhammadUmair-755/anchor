"use client";

import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

export interface NoteEditorProps {
  title: string;
  body: string;
  onTitleChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  dirty: boolean;
  /** True while a new note is being created; blocks a duplicate save. */
  saving: boolean;
  canDelete: boolean;
  onSave: () => void;
  onDelete: () => void;
  onBack: () => void;
}

const UI_FONT = "var(--font-plus-jakarta-sans), sans-serif";
const SERIF = "var(--font-newsreader), Georgia, serif";

export default function NoteEditor({
  title,
  body,
  onTitleChange,
  onBodyChange,
  dirty,
  saving,
  canDelete,
  onSave,
  onDelete,
  onBack,
}: NoteEditorProps) {
  return (
    <Box
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
          e.preventDefault();
          if (dirty && !saving) onSave();
        }
      }}
      sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: { xs: 1.5, md: 3 },
          py: 1.5,
          borderBottom: "1px solid rgba(17, 28, 46, 0.08)",
        }}
      >
        <IconButton onClick={onBack} aria-label="Back to notes" sx={{ display: { md: "none" }, color: "#17202B" }}>
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>
        <Typography sx={{ flex: 1, fontFamily: UI_FONT, fontSize: "0.8125rem", color: dirty ? "#8C3F3B" : "#68717C" }}>
          {dirty ? "Unsaved changes" : "Saved"}
        </Typography>
        {canDelete && (
          <Button onClick={onDelete} sx={{ textTransform: "none", fontFamily: UI_FONT, color: "#8C3F3B" }}>
            Delete
          </Button>
        )}
        <Button
          variant="contained"
          disableElevation
          disabled={!dirty || saving}
          onClick={onSave}
          sx={{
            textTransform: "none",
            fontFamily: UI_FONT,
            bgcolor: "#3F6853",
            "&:hover": { bgcolor: "#345845" },
          }}
        >
          Save
        </Button>
      </Box>

      {/* Fields */}
      <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 2, md: 5 }, py: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: 720, mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          <InputBase
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Title"
            inputProps={{ maxLength: 200, "aria-label": "Note title" }}
            sx={{ fontFamily: SERIF, fontSize: { xs: "1.5rem", md: "2rem" }, fontWeight: 500, color: "#0B1628" }}
          />
          <InputBase
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder="Start writing..."
            multiline
            minRows={14}
            inputProps={{ "aria-label": "Note body" }}
            sx={{ fontFamily: SERIF, fontSize: "1.125rem", lineHeight: 1.75, color: "#17202B", alignItems: "flex-start" }}
          />
        </Box>
      </Box>
    </Box>
  );
}
