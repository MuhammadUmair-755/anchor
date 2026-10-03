"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpenQuickEntry: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/",
    icon: <DashboardIcon sx={{ fontSize: 20 }} />,
  },
  {
    label: "Finance",
    href: "/finance",
    icon: <AccountBalanceWalletIcon sx={{ fontSize: 20 }} />,
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />,
    badge: "5",
  },
  {
    label: "Notes",
    href: "/notes",
    icon: <EditNoteIcon sx={{ fontSize: 20 }} />,
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: <CalendarMonthIcon sx={{ fontSize: 20 }} />,
  },
];

export default function MobileNavDrawer({
  open,
  onClose,
  onOpenQuickEntry,
}: MobileNavDrawerProps) {
  const pathname = usePathname();

  const isNavActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
      sx={{
        display: { xs: "block", lg: "none" },
        "& .MuiDrawer-paper": {
          width: 280,
          boxSizing: "border-box",
          bgcolor: "#FCFBF8",
          color: "#17202B",
          borderRight: "1px solid rgba(17, 28, 46, 0.08)",
          boxShadow: "4px 0 24px rgba(11, 22, 40, 0.12)",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header with Brand Monogram, Title, and Close Button */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(17, 28, 46, 0.06)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: "#0B1628",
                color: "#F7F5EF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                fontWeight: 700,
                boxShadow: "0 2px 6px rgba(11, 22, 40, 0.25)",
              }}
            >
              ⚓
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "var(--font-newsreader), Georgia, serif",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  color: "#0B1628",
                  lineHeight: 1.1,
                }}
              >
                ANCHOR
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#68717C",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Command Center
              </Typography>
            </Box>
          </Box>

          <IconButton
            size="small"
            onClick={onClose}
            aria-label="close drawer"
            sx={{
              color: "#68717C",
              "&:hover": { bgcolor: "rgba(11, 22, 40, 0.06)", color: "#0B1628" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Primary Action Button (+ Quick Entry) */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={onOpenQuickEntry}
            startIcon={<AddIcon />}
            sx={{
              py: 1.2,
              bgcolor: "#0B1628",
              color: "#FCFBF8",
              borderRadius: 2,
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: "none",
              boxShadow: "0 2px 6px rgba(11, 22, 40, 0.18)",
              "&:hover": {
                bgcolor: "#162338",
              },
            }}
          >
            + Quick Entry
          </Button>
        </Box>

        {/* 8 Navigation Items */}
        <Box
          component="nav"
          sx={{
            flex: 1,
            px: 1.5,
            py: 1,
            overflowY: "auto",
          }}
          className="no-scrollbar"
        >
          <Stack spacing={0.5}>
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(item.href);

              return (
                <Box
                  key={item.href}
                  component={Link}
                  href={item.href}
                  onClick={onClose}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.25,
                    borderRadius: 2,
                    textDecoration: "none",
                    color: active ? "#0B1628" : "#68717C",
                    bgcolor: active ? "rgba(11, 22, 40, 0.06)" : "transparent",
                    fontWeight: active ? 600 : 500,
                    fontSize: "0.875rem",
                    transition: "all 0.15s ease",
                    position: "relative",
                    "&:hover": {
                      bgcolor: active ? "rgba(11, 22, 40, 0.08)" : "rgba(11, 22, 40, 0.03)",
                      color: "#0B1628",
                    },
                  }}
                >
                  {/* Active Indicator Accent Bar */}
                  {active && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: "20%",
                        bottom: "20%",
                        width: 3,
                        bgcolor: "#0B1628",
                        borderRadius: "0 3px 3px 0",
                      }}
                    />
                  )}

                  <Box
                    sx={{
                      color: active ? "#0B1628" : "#68717C",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: active ? 600 : 500,
                        color: "inherit",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </Typography>

                    {item.badge && (
                      <Box
                        sx={{
                          px: 1,
                          py: 0.2,
                          bgcolor: active ? "#0B1628" : "rgba(11, 22, 40, 0.08)",
                          color: active ? "#FCFBF8" : "#68717C",
                          borderRadius: "10px",
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                          lineHeight: 1.2,
                        }}
                      >
                        {item.badge}
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>

        {/* User Profile Chip */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid rgba(17, 28, 46, 0.08)",
            bgcolor: "#F7F5EF",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#0B1628",
              color: "#FCFBF8",
              fontSize: "0.8125rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            AV
          </Avatar>
          <Box sx={{ overflow: "hidden" }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#0B1628",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              Alex Vance
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#68717C",
                fontSize: "0.6875rem",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "#5F9277",
                  display: "inline-block",
                }}
              />
              Executive Tier
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
