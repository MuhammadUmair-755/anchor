"use client";

import { SignUp } from "@clerk/nextjs";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function SignUpPage() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 480,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: { xs: 2, sm: 4 },
      }}
    >
      {/* Sovereign Anchor Brand Monogram & Header */}
      <Box sx={{ mb: 3.5, textAlign: "center" }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            bgcolor: "#0B1628",
            color: "#F7F5EF",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            fontWeight: 700,
            mb: 1.5,
            boxShadow: "0 4px 12px rgba(11, 22, 40, 0.18)",
          }}
        >
          ⚓
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "var(--font-newsreader), Georgia, serif",
            fontWeight: 600,
            color: "#0B1628",
            letterSpacing: "-0.015em",
            lineHeight: 1.2,
          }}
        >
          ANCHOR
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            fontSize: "0.75rem",
            color: "#68717C",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 700,
            mt: 0.5,
          }}
        >
          Executive Life Command Center
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            fontSize: "0.8125rem",
            color: "#75777D",
            mt: 1,
          }}
        >
          Initialize your executive personal ledger and sovereign workspace.
        </Typography>
      </Box>

      {/* Clerk Sign Up Form */}
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: {
              backgroundColor: "#FCFBF8",
              border: "1px solid rgba(17, 28, 46, 0.08)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px -4px rgba(11, 22, 40, 0.08)",
              width: "100%",
            },
            headerTitle: {
              fontFamily: "var(--font-newsreader), Georgia, serif",
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "#0B1628",
            },
            headerSubtitle: {
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.8125rem",
              color: "#68717C",
            },
            socialButtonsBlockButton: {
              borderRadius: "10px",
              border: "1px solid rgba(17, 28, 46, 0.12)",
              backgroundColor: "#FFFFFF",
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#0B1628",
              transition: "all 0.15s ease",
              "&:hover": {
                backgroundColor: "#F7F5EF",
                borderColor: "#0B1628",
              },
            },
            formButtonPrimary: {
              backgroundColor: "#0B1628",
              borderRadius: "10px",
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              textTransform: "none",
              padding: "10px 16px",
              "&:hover": {
                backgroundColor: "#162338",
              },
            },
            formFieldInput: {
              borderRadius: "8px",
              border: "1px solid rgba(17, 28, 46, 0.15)",
              backgroundColor: "#FFFFFF",
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "0.875rem",
            },
            footerActionLink: {
              color: "#40617E",
              fontWeight: 600,
              "&:hover": {
                color: "#0B1628",
              },
            },
          },
        }}
      />
    </Box>
  );
}
