"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import EditNoteIcon from "@mui/icons-material/EditNote";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckIcon from "@mui/icons-material/Check";
import { DayInspectorData } from "@/types/models";

export interface DayNexusInspectorProps {
  data: DayInspectorData;
  selectedDateKey: string;
  onToggleTask: (taskId: string) => void;
}

export default function DayNexusInspector({
  data,
  selectedDateKey,
  onToggleTask,
}: DayNexusInspectorProps) {
  const totalTasks = data.tasksDone + data.tasksPending;
  const taskPercentage = totalTasks > 0 ? Math.round((data.tasksDone / totalTasks) * 100) : 0;

  // Selected date short badge label, e.g. "Selected: Sep 11"
  const formattedShortDate = (() => {
    try {
      const parts = selectedDateKey.split("-");
      if (parts.length === 3) {
        const monthNum = parseInt(parts[1], 10);
        const dayNum = parseInt(parts[2], 10);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `Selected: ${monthNames[monthNum - 1]} ${dayNum}`;
      }
    } catch {
      // Fallback
    }
    return `Selected: ${selectedDateKey}`;
  })();

  const formatLedgerAmount = (amt: number) => {
    const sign = amt >= 0 ? "+" : "-";
    return `${sign}Rs. ${Math.abs(amt).toLocaleString()}`;
  };

  return (
    <Box
      sx={{
        bgcolor: "#FCFBF8",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: "12px",
        p: { xs: 2.5, sm: 3 },
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      {/* Header Bar */}
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1.5,
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
            mb: 2,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: "#000000",
              }}
            />
            <Typography
              sx={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#000000",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              }}
            >
              DAY NEXUS INSPECTOR
            </Typography>
          </Stack>

          <Box
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: "4px",
              bgcolor: "#EAE8E2",
              fontSize: "0.6875rem",
              fontWeight: 500,
              color: "#1B1C18",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontFeatureSettings: '"tnum" 1, "zero" 1',
            }}
          >
            {formattedShortDate}
          </Box>
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontFamily: "var(--font-newsreader), Georgia, serif",
            fontSize: "1.375rem",
            fontWeight: 500,
            color: "#1B1C18",
            mb: 0.5,
          }}
        >
          {data.dateTitle}
        </Typography>

        <Typography
          sx={{
            fontSize: "0.8125rem",
            color: "#45474C",
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
          }}
        >
          {data.subtitle}
        </Typography>
      </Box>

      {/* Vectors Container */}
      <Stack spacing={2}>
        {/* Vector 1: TASKS VECTOR */}
        <Box
          sx={{
            p: 1.5,
            bgcolor: "rgba(245, 243, 237, 0.6)",
            borderRadius: "8px",
            border: "1px solid rgba(197, 198, 205, 0.3)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 16, color: "#40617E" }} />
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#1B1C18",
                }}
              >
                TASKS ({data.tasksDone} DONE · {data.tasksPending} PENDING)
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "#40617E",
                fontFeatureSettings: '"tnum" 1, "zero" 1',
              }}
            >
              {taskPercentage}%
            </Typography>
          </Box>

          {/* Interactive Tasks Checklist */}
          <Stack spacing={1}>
            {data.tasksList.map((task) => (
              <Box
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  cursor: "pointer",
                  p: 0.5,
                  borderRadius: "6px",
                  transition: "background-color 0.15s ease",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.03)",
                  },
                }}
              >
                {task.isCompleted ? (
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: "4px",
                      bgcolor: "rgba(95, 146, 119, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#3F6853",
                      flexShrink: 0,
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 13 }} />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: "4px",
                      border: "1.5px solid #75777D",
                      flexShrink: 0,
                    }}
                  />
                )}

                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    color: "#1B1C18",
                    fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                    textDecoration: task.isCompleted ? "line-through" : "none",
                    opacity: task.isCompleted ? 0.65 : 1,
                    fontWeight: task.isCompleted ? 400 : 500,
                    lineHeight: 1.3,
                  }}
                >
                  {task.title}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Vector 2: FINANCIAL LEDGER */}
        <Box
          sx={{
            p: 1.5,
            bgcolor: "rgba(245, 243, 237, 0.6)",
            borderRadius: "8px",
            border: "1px solid rgba(197, 198, 205, 0.3)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16, color: "#40617E" }} />
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#1B1C18",
                }}
              >
                FINANCIAL LEDGER
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: data.ledgerTotal < 0 ? "#8C3F3B" : "#3F6853",
                fontFeatureSettings: '"tnum" 1, "zero" 1',
              }}
            >
              {formatLedgerAmount(data.ledgerTotal)}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(auto-fit, minmax(90px, 1fr))",
                sm:
                  data.ledgerItems.length <= 3
                    ? `repeat(${data.ledgerItems.length || 1}, 1fr)`
                    : "repeat(3, 1fr)",
              },
              gap: 1,
            }}
          >
            {data.ledgerItems.map((item) => (
              <Box
                key={item.category}
                sx={{
                  bgcolor: "#FFFFFF",
                  p: 1,
                  borderRadius: "6px",
                  border: "1px solid rgba(197, 198, 205, 0.3)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.6875rem",
                    color: "#75777D",
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.category}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#1B1C18",
                    fontFeatureSettings: '"tnum" 1, "zero" 1',
                  }}
                >
                  Rs. {item.amount.toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Vector 3: JOURNAL INSCRIPTION */}
        <Box
          sx={{
            p: 1.5,
            bgcolor: "rgba(245, 243, 237, 0.6)",
            borderRadius: "8px",
            border: "1px solid rgba(197, 198, 205, 0.3)",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
            <EditNoteIcon sx={{ fontSize: 16, color: "#40617E" }} />
            <Typography
              sx={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#1B1C18",
              }}
            >
              JOURNAL INSCRIPTION
            </Typography>
          </Stack>

          <Typography
            sx={{
              fontFamily: "var(--font-newsreader), Georgia, serif",
              fontSize: "0.9375rem",
              fontStyle: "italic",
              color: "#1B1C18",
              lineHeight: 1.45,
            }}
          >
            &ldquo;{data.journalQuote}&rdquo;
          </Typography>

          <Box sx={{ mt: 1, textAlign: "right" }}>
            <Typography
              sx={{
                fontSize: "0.625rem",
                color: "#75777D",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontFeatureSettings: '"tnum" 1, "zero" 1',
              }}
            >
              {data.journalTime}
            </Typography>
          </Box>
        </Box>

        {/* Vector 4: GOALS CADENCE CONTRIBUTION */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.5,
            bgcolor: "rgba(95, 146, 119, 0.1)",
            borderRadius: "8px",
            border: "1px solid rgba(95, 146, 119, 0.2)",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <TrendingUpIcon sx={{ fontSize: 18, color: "#3F6853" }} />
            <Typography
              sx={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "#1B1C18",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              }}
            >
              Cadence Velocity Today
            </Typography>
          </Stack>

          <Box
            sx={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#3F6853",
              bgcolor: "#FCFBF8",
              px: 1.25,
              py: 0.25,
              borderRadius: "4px",
              border: "1px solid rgba(95, 146, 119, 0.2)",
              fontFeatureSettings: '"tnum" 1, "zero" 1',
            }}
          >
            {data.cadenceDelta}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
