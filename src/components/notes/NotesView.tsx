"use client";

import React from "react";
import Box from "@mui/material/Box";
import {
  JournalEntry,
  ConsistencyStats,
  PinnedMaxim,
} from "@/types/models";
import NotesSubBar from "./NotesSubBar";
import JournalArchiveColumn from "./JournalArchiveColumn";
import EditorialSanctuary from "./EditorialSanctuary";
import ContextualIntelligenceAside from "./ContextualIntelligenceAside";
import MobileNotesView from "./MobileNotesView";

export interface NotesViewProps {
  entries: JournalEntry[];
  activeEntry: JournalEntry;
  onSelectEntry: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUpdateInquiry?: (answer: string) => void;
  onExportMarkdown: () => void;
  onPinEntry: () => void;
  onContinueWriting: () => void;
  onVoiceMemo?: () => void;
  onAttachment?: () => void;
  consistencyStats?: ConsistencyStats;
  pinnedMaxim?: PinnedMaxim;
  taxonomyTags?: string[];
}

export default function NotesView({
  entries,
  activeEntry,
  onSelectEntry,
  searchQuery,
  onSearchChange,
  onUpdateInquiry,
  onExportMarkdown,
  onPinEntry,
  onContinueWriting,
  onVoiceMemo,
  onAttachment,
  consistencyStats,
  pinnedMaxim,
  taxonomyTags,
}: NotesViewProps) {
  return (
    <Box sx={{ width: "100%", minHeight: "100%" }}>
      {/* 1. MOBILE VIEWPORT (<768px): Dedicated Single-Column Flow */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <MobileNotesView
          entries={entries}
          activeEntry={activeEntry}
          onSelectEntry={onSelectEntry}
          onContinueWriting={onContinueWriting}
          onVoiceMemo={onVoiceMemo}
          onAttachment={onAttachment}
          onMoreActions={onExportMarkdown}
        />
      </Box>

      {/* 2. TABLET & DESKTOP VIEWPORT (>=768px): 3-Column Editorial Sanctuary */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          height: { md: "calc(100vh - 110px)", lg: "calc(100vh - 120px)" },
        }}
      >
        {/* Outer Card Enclosure */}
        <Box
          sx={{
            bgcolor: "#FCFBF8",
            border: "1px solid rgba(17, 28, 46, 0.08)",
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            boxShadow: "0 1px 3px rgba(11, 22, 40, 0.02)",
          }}
        >
          {/* Top Sub-Bar */}
          <NotesSubBar
            onFilterClick={() => {}}
            onSettingsClick={() => {}}
          />

          {/* 3-Column Main Split */}
          <Box
            sx={{
              display: "flex",
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            {/* Column 1: Chronological Archive (320px) */}
            <JournalArchiveColumn
              entries={entries}
              activeId={activeEntry.id}
              onSelectEntry={onSelectEntry}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
            />

            {/* Column 2: Editorial Sanctuary (Fluid flex-1, max-w-3xl) */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <EditorialSanctuary
                entry={activeEntry}
                onUpdateInquiry={onUpdateInquiry}
              />
            </Box>

            {/* Column 3: Contextual Intelligence Aside (320px, visible on lg+) */}
            <Box
              sx={{
                display: { md: "none", lg: "flex" },
                height: "100%",
                overflow: "hidden",
              }}
            >
              <ContextualIntelligenceAside
                entry={activeEntry}
                consistencyStats={consistencyStats}
                pinnedMaxim={pinnedMaxim}
                taxonomyTags={taxonomyTags}
                onExportMarkdown={onExportMarkdown}
                onPinEntry={onPinEntry}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
