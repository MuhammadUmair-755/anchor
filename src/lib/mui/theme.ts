"use client";

import { createTheme } from "@mui/material/styles";

/**
 * Anchor OS - Editorial Life Command Center Theme
 * Palette: Deep Anchor Navy, Slate Secondary, Warm Ivory Canvas, Mineral Accents
 * Typography: Newsreader (Editorial Serif) + Plus Jakarta Sans (Interface) + JetBrains Mono (Tabular)
 */
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0B1628", // Primary Navy
      light: "#1c2b42",
      dark: "#050b14",
      contrastText: "#FCFBF8",
    },
    secondary: {
      main: "#40617E", // Slate Secondary
      light: "#6D8EAD",
      dark: "#274A65",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F7F5EF", // Canvas Base Ground
      paper: "#FCFBF8", // Surface Card Ground
    },
    text: {
      primary: "#17202B", // Deep Ink Text
      secondary: "#68717C", // Muted Graphite
    },
    divider: "rgba(17, 28, 46, 0.08)", // Hairline borders
    success: {
      main: "#5F9277", // Controlled Sage
      dark: "#3F6853",
      light: "#82b29a",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#C76D68", // Soft Coral
      dark: "#8C3F3B",
      light: "#db918c",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#C4934A", // Warm Ochre
      dark: "#8C6B28",
      light: "#d7ad6f",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#508E8C", // Mineral Teal
      dark: "#00201F",
      light: "#93D2CF",
      contrastText: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: "var(--font-plus-jakarta-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontFamily: "var(--font-newsreader), Georgia, serif",
      fontWeight: 400,
      letterSpacing: "-0.02em",
      color: "#17202B",
    },
    h2: {
      fontFamily: "var(--font-newsreader), Georgia, serif",
      fontWeight: 400,
      letterSpacing: "-0.015em",
      color: "#17202B",
    },
    h3: {
      fontFamily: "var(--font-newsreader), Georgia, serif",
      fontWeight: 500,
      letterSpacing: "-0.01em",
      color: "#17202B",
    },
    h4: {
      fontFamily: "var(--font-newsreader), Georgia, serif",
      fontWeight: 500,
      letterSpacing: "-0.01em",
      color: "#17202B",
    },
    h5: {
      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
      fontWeight: 600,
      letterSpacing: "-0.005em",
      color: "#17202B",
    },
    h6: {
      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
      fontWeight: 600,
      letterSpacing: "0em",
      color: "#17202B",
    },
    body1: {
      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
      fontSize: "0.9375rem", // 15px
      lineHeight: 1.6,
      color: "#17202B",
    },
    body2: {
      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
      fontSize: "0.875rem", // 14px
      lineHeight: 1.5,
      color: "#68717C",
    },
    button: {
      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
    caption: {
      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
      fontSize: "0.75rem",
      color: "#68717C",
    },
    overline: {
      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
      fontSize: "0.6875rem",
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "#68717C",
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F7F5EF",
          color: "#17202B",
          fontFamily: "var(--font-plus-jakarta-sans), -apple-system, BlinkMacSystemFont, sans-serif",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          padding: "8px 16px",
          transition: "all 0.15s ease-in-out",
        },
        contained: {
          backgroundColor: "#0B1628",
          color: "#FCFBF8",
          "&:hover": {
            backgroundColor: "#162338",
          },
        },
        outlined: {
          borderColor: "rgba(11, 22, 40, 0.2)",
          color: "#0B1628",
          "&:hover": {
            borderColor: "#0B1628",
            backgroundColor: "rgba(11, 22, 40, 0.04)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#FCFBF8",
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#FCFBF8",
          borderRadius: 12,
          border: "1px solid rgba(17, 28, 46, 0.08)",
          boxShadow: "0 1px 3px rgba(11, 22, 40, 0.02)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: "0.75rem",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#FFFFFF",
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
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: "1px solid rgba(17, 28, 46, 0.08)",
          boxShadow: "0 12px 32px rgba(11, 22, 40, 0.12)",
          backgroundColor: "#FCFBF8",
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: "#FCFBF8",
          borderTop: "1px solid rgba(17, 28, 46, 0.08)",
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: "#68717C",
          "&.Mui-selected": {
            color: "#0B1628",
          },
        },
      },
    },
  },
});

export default theme;
