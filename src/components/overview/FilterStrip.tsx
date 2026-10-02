"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

export interface FilterStripProps {
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  selectedAccount?: string;
  onAccountChange?: (account: string) => void;
  selectedType?: string;
  onTypeChange?: (type: string) => void;
  temporalRange?: "today" | "week" | "month" | "quarter";
  onTemporalRangeChange?: (range: "today" | "week" | "month" | "quarter") => void;
}

export default function FilterStrip({
  selectedMonth = "2026-09",
  onMonthChange,
  selectedCategory = "all",
  onCategoryChange,
  selectedAccount = "all",
  onAccountChange,
  selectedType = "all",
  onTypeChange,
  temporalRange = "month",
  onTemporalRangeChange,
}: FilterStripProps) {
  const handleRangeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRange: "today" | "week" | "month" | "quarter" | null
  ) => {
    if (newRange && onTemporalRangeChange) {
      onTemporalRangeChange(newRange);
    }
  };

  const selectStyle = {
    height: 36,
    bgcolor: "#FCFBF8",
    borderRadius: 2,
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "#17202B",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(17, 28, 46, 0.12)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(17, 28, 46, 0.25)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#0B1628",
      borderWidth: 1.5,
    },
    "& .MuiSelect-select": {
      py: 0.75,
      px: 1.5,
      display: "flex",
      alignItems: "center",
      gap: 0.75,
    },
  };

  return (
    <Box
      component="section"
      aria-label="Filter Controls"
      sx={{
        display: "flex",
        flexWrap: { xs: "nowrap", md: "wrap" },
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        py: 1.5,
        borderBottom: "1px solid rgba(17, 28, 46, 0.08)",
        overflowX: { xs: "auto", md: "visible" },
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {/* Filter Dropdown Selects */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {/* Month Selector */}
        <FormControl size="small">
          <Select
            value={selectedMonth}
            onChange={(e: SelectChangeEvent) => onMonthChange?.(e.target.value)}
            aria-label="Select cycle month"
            sx={selectStyle}
            renderValue={(value) => {
              const labelMap: Record<string, string> = {
                "2026-09": "September 2026",
                "2026-10": "October 2026",
                "2026-08": "August 2026",
              };
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <CalendarMonthIcon sx={{ fontSize: 16, color: "#68717C" }} />
                  <span>{labelMap[value] || value}</span>
                </Box>
              );
            }}
          >
            <MenuItem value="2026-09">September 2026</MenuItem>
            <MenuItem value="2026-10">October 2026</MenuItem>
            <MenuItem value="2026-08">August 2026</MenuItem>
          </Select>
        </FormControl>

        {/* Category Dropdown */}
        <FormControl size="small">
          <Select
            value={selectedCategory}
            onChange={(e: SelectChangeEvent) => onCategoryChange?.(e.target.value)}
            aria-label="Filter by category"
            sx={selectStyle}
          >
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="food_dining">Food & Dining</MenuItem>
            <MenuItem value="housing_utilities">Housing & Base</MenuItem>
            <MenuItem value="shopping_gear">Shopping & Gear</MenuItem>
            <MenuItem value="transport_transit">Transit & Travel</MenuItem>
            <MenuItem value="health_wellness">Health & Fitness</MenuItem>
            <MenuItem value="knowledge_subs">Knowledge & Subs</MenuItem>
          </Select>
        </FormControl>

        {/* Account Dropdown */}
        <FormControl size="small">
          <Select
            value={selectedAccount}
            onChange={(e: SelectChangeEvent) => onAccountChange?.(e.target.value)}
            aria-label="Filter by account"
            sx={selectStyle}
          >
            <MenuItem value="all">All Accounts</MenuItem>
            <MenuItem value="acc-hdfc-4092">Operating Checking ••4092</MenuItem>
            <MenuItem value="acc-vault-0012">Physical Vault ••0012</MenuItem>
            <MenuItem value="acc-tbill-8831">High-Yield Vault ••8831</MenuItem>
            <MenuItem value="acc-amex-1042">Amex Platinum ••1042</MenuItem>
          </Select>
        </FormControl>

        {/* Type Dropdown */}
        <FormControl size="small">
          <Select
            value={selectedType}
            onChange={(e: SelectChangeEvent) => onTypeChange?.(e.target.value)}
            aria-label="Filter by type"
            sx={selectStyle}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="outflow">Debits (Outflow)</MenuItem>
            <MenuItem value="inflow">Credits (Inflow)</MenuItem>
            <MenuItem value="transfer">Transfers</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Fast Temporal Range Switches (MUI ToggleButtonGroup) */}
      <Box sx={{ flexShrink: 0 }}>
        <ToggleButtonGroup
          value={temporalRange}
          exclusive
          onChange={handleRangeChange}
          aria-label="Temporal time range switch"
          size="small"
          sx={{
            bgcolor: "#F0EEE8",
            p: 0.5,
            borderRadius: 2,
            border: "1px solid rgba(17, 28, 46, 0.08)",
            "& .MuiToggleButtonGroup-grouped": {
              border: 0,
              borderRadius: "6px !important",
              px: { xs: 1.5, sm: 2 },
              py: 0.5,
              fontSize: "0.75rem",
              fontWeight: 500,
              textTransform: "capitalize",
              color: "#68717C",
              transition: "all 0.15s ease",
              "&.Mui-selected": {
                bgcolor: "#FCFBF8",
                color: "#0B1628",
                fontWeight: 600,
                boxShadow: "0 1px 3px rgba(11, 22, 40, 0.08)",
              },
              "&:hover": {
                bgcolor: "rgba(252, 251, 248, 0.6)",
                color: "#17202B",
              },
            },
          }}
        >
          <ToggleButton value="today" aria-label="Today">
            Today
          </ToggleButton>
          <ToggleButton value="week" aria-label="Week">
            Week
          </ToggleButton>
          <ToggleButton value="month" aria-label="Month">
            Month
          </ToggleButton>
          <ToggleButton value="quarter" aria-label="Quarter">
            Quarter
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}
