"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

interface TechCardProps {
  title: string;
  category: string;
  description: string;
  status: "Configured" | "Ready";
  icon?: React.ReactNode;
}

export default function TechCard({
  title,
  category,
  description,
  status,
  icon,
}: TechCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
            {category}
          </Typography>
          <Chip
            label={status}
            color={status === "Configured" ? "primary" : "success"}
            size="small"
            variant="outlined"
          />
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          {icon && <Box sx={{ display: "flex", color: "primary.main" }}>{icon}</Box>}
          <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}
