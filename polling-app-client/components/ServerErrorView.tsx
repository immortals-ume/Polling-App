"use client";

import { Box, Typography } from "@mui/material";
import Link from "next/link";
import { AppButton } from "./ui/AppButton";

export function ServerErrorView() {
  return (
    <Box sx={{ textAlign: "center", marginTop: 8 }}>
      <Typography variant="h1" sx={{ fontSize: 72, fontWeight: 700, color: "text.secondary" }}>
        500
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 3 }}>
        Oops! Something went wrong at our server. Why don&apos;t you go back?
      </Typography>
      <AppButton size="large" component={Link} href="/">
        Go Back
      </AppButton>
    </Box>
  );
}
