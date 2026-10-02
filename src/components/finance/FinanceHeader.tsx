"use client";

import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DownloadIcon from "@mui/icons-material/Download";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

interface FinanceHeaderProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onExportCsv: () => void;
  onOpenAddTransaction: () => void;
}

export default function FinanceHeader({
  selectedMonth,
  onMonthChange,
  onExportCsv,
  onOpenAddTransaction,
}: FinanceHeaderProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const months = [
    { value: "2026-09", label: "September 2026" },
    { value: "2026-08", label: "August 2026" },
    { value: "2026-07", label: "July 2026" },
    { value: "2026-06", label: "June 2026" },
  ];

  const currentLabel =
    months.find((m) => m.value === selectedMonth)?.label || selectedMonth;

  return (
    <Box
      component="section"
      sx={{
        pb: 3,
        borderBottom: "1px solid rgba(17, 28, 46, 0.08)",
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", lg: "flex-end" },
        gap: 3,
      }}
    >
      {/* Title & Philosophy Quote */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#45474C",
            }}
          >
            Executive Ledger
          </Typography>
          <Typography sx={{ color: "#C5C6CD", fontSize: "12px" }}>•</Typography>
          <Typography
            variant="caption"
            sx={{
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#40617E",
            }}
          >
            Q3 Fiscal Cycle
          </Typography>
        </Box>

        <Typography
          variant="h1"
          sx={{
            fontFamily: "var(--font-newsreader), Georgia, serif",
            fontSize: { xs: "28px", sm: "36px" },
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            color: "#1B1C18",
            mt: 0.5,
          }}
        >
          FINANCE
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: "var(--font-newsreader), Georgia, serif",
            fontStyle: "italic",
            fontSize: "17px",
            color: "#45474C",
            mt: 0.5,
          }}
        >
          “Know where your money goes. Control where it goes next.”
        </Typography>
      </Box>

      {/* Trailing Command Actions */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1.5,
          width: { xs: "100%", sm: "auto" },
        }}
      >
        {/* Date Selector */}
        <Button
          variant="outlined"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          startIcon={<CalendarMonthIcon sx={{ fontSize: 18, color: "#75777D" }} />}
          endIcon={<ExpandMoreIcon sx={{ fontSize: 16, color: "#75777D" }} />}
          sx={{
            bgcolor: "#FCFBF8",
            borderColor: "rgba(17, 28, 46, 0.12)",
            color: "#1B1C18",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            px: 2,
            py: 1,
            textTransform: "none",
            "&:hover": {
              bgcolor: "#F0EEE8",
              borderColor: "#75777D",
            },
          }}
        >
          {currentLabel}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={() => setAnchorEl(null)}
          slotProps={{
            paper: {
              sx: {
                bgcolor: "#FCFBF8",
                border: "1px solid rgba(17, 28, 46, 0.1)",
                borderRadius: "8px",
                boxShadow: "0 10px 25px -5px rgba(11,22,40,0.08)",
              },
            },
          }}
        >
          {months.map((m) => (
            <MenuItem
              key={m.value}
              selected={m.value === selectedMonth}
              onClick={() => {
                onMonthChange(m.value);
                setAnchorEl(null);
              }}
              sx={{
                fontSize: "13px",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                py: 1,
              }}
            >
              {m.label}
            </MenuItem>
          ))}
        </Menu>

        {/* CSV Export */}
        <Button
          variant="outlined"
          onClick={onExportCsv}
          startIcon={<DownloadIcon sx={{ fontSize: 18, color: "#75777D" }} />}
          sx={{
            bgcolor: "#FCFBF8",
            borderColor: "rgba(17, 28, 46, 0.12)",
            color: "#1B1C18",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            px: 2,
            py: 1,
            textTransform: "none",
            "&:hover": {
              bgcolor: "#F0EEE8",
              borderColor: "#75777D",
            },
          }}
        >
          Export Ledger (CSV)
        </Button>

        {/* Add Transaction Button */}
        <Button
          variant="contained"
          onClick={onOpenAddTransaction}
          startIcon={<AddCircleIcon sx={{ fontSize: 18 }} />}
          sx={{
            bgcolor: "#111C2E",
            color: "#FFFFFF",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            px: 2.5,
            py: 1,
            textTransform: "none",
            boxShadow: "0 2px 4px rgba(17,28,46,0.15)",
            "&:hover": {
              bgcolor: "#000000",
            },
          }}
        >
          + Add Transaction
        </Button>
      </Box>
    </Box>
  );
}
