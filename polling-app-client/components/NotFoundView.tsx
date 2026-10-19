"use client";

import { Box, Typography } from "@mui/material";
import Link from "next/link";
import { AppButton } from "./ui/AppButton";

export function NotFoundView() {
  return (
    <Box sx={{ textAlign: "center", marginTop: 8 }}>
      <Typography variant="h1" sx={{ fontSize: 72, fontWeight: 700, color: "text.secondary" }}>
        404
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 3 }}>
        The page you&apos;re looking for was not found.
      </Typography>
      <AppButton size="large" component={Link} href="/">
        Go Back
      </AppButton>
    </Box>
  );
}
