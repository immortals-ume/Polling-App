"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import theme from "@/theme";
import { NotifyProvider } from "@/lib/notify";
import { AuthProvider } from "@/lib/auth-context";
import { AppHeader } from "@/components/AppHeader";
import { Container } from "@mui/material";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotifyProvider>
          <AuthProvider>
            <AppHeader />
            <Container maxWidth="sm" sx={{ paddingY: 4 }}>
              {children}
            </Container>
          </AuthProvider>
        </NotifyProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
