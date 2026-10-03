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
import Slider from "@mui/material/Slider";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import { SovereignGoal } from "@/types/models";

export interface AdjustMilestonesModalProps {
  open: boolean;
  onClose: () => void;
  goals: SovereignGoal[];
  onUpdateGoal: (goalId: string, percentage: number) => Promise<void>;
}

export default function AdjustMilestonesModal({
  open,
  onClose,
  goals,
  onUpdateGoal,
}: AdjustMilestonesModalProps) {
  const [progressMap, setProgressMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    goals.forEach((g) => {
      map[g.id] = g.progressPercentage;
    });
    return map;
  });
  const [saving, setSaving] = useState(false);

  // Sync if modal opens or goals change
  React.useEffect(() => {
    if (open) {
      const map: Record<string, number> = {};
      goals.forEach((g) => {
        map[g.id] = g.progressPercentage;
      });
      setProgressMap(map);
    }
  }, [open, goals]);

  const handleSliderChange = (goalId: string, value: number) => {
    setProgressMap((prev) => ({
      ...prev,
      [goalId]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      for (const goal of goals) {
        const newPct = progressMap[goal.id];
        if (newPct !== undefined && newPct !== goal.progressPercentage) {
          await onUpdateGoal(goal.id, newPct);
        }
      }
      onClose();
    } catch {
      // Handled
    } finally {
      setSaving(false);
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
            <TrackChangesIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography
              component="div"
              variant="h6"
              sx={{
                fontFamily: "var(--font-newsreader), Georgia, serif",
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#1B1C18",
                lineHeight: 1.2,
              }}
            >
              Adjust Strategic Milestones
            </Typography>
            <Typography
              component="div"
              sx={{
                fontSize: "0.6875rem",
                color: "#75777D",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              SOVEREIGN GOALS CALIBRATION
            </Typography>
          </Box>
        </Stack>

        <IconButton size="small" onClick={onClose} sx={{ color: "#75777D" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
        <Typography sx={{ fontSize: "0.8125rem", color: "#45474C" }}>
          Calibrate completion percentages across sovereign goal vectors to re-align cadence tracking.
        </Typography>

        <Stack spacing={3}>
          {goals.map((goal) => {
            const currentVal = progressMap[goal.id] ?? goal.progressPercentage;

            return (
              <Box
                key={goal.id}
                sx={{
                  p: 2,
                  bgcolor: "#FFFFFF",
                  border: "1px solid rgba(197, 198, 205, 0.4)",
                  borderRadius: "8px",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#1B1C18" }}>
                    {goal.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      color: "#111C2E",
                    }}
                  >
                    {currentVal}%
                  </Typography>
                </Box>

                <Slider
                  value={currentVal}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(_, val) => handleSliderChange(goal.id, val as number)}
                  sx={{
                    color: goal.meterColor,
                    "& .MuiSlider-thumb": {
                      bgcolor: goal.meterColor,
                    },
                  }}
                />

                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                  <Typography sx={{ fontSize: "0.6875rem", color: "#75777D" }}>
                    {goal.subtitle}
                  </Typography>
                  <Typography sx={{ fontSize: "0.6875rem", color: "#75777D" }}>
                    Horizon: {goal.targetHorizon}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: "#75777D", textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={<CheckIcon />}
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
          {saving ? "Saving..." : "Save Calibrations"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
