"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Box, Stack, Typography } from "@mui/material";
import { login } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useNotify } from "@/lib/notify";
import { ApiError } from "@/lib/types";
import { AppButton } from "./ui/AppButton";
import { AppTextField } from "./ui/AppTextField";

export function LoginForm() {
  const { login: onLogin } = useAuth();
  const notify = useNotify();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await login({ usernameOrEmail, password });
      await onLogin(response.accessToken);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        notify.error({
          message: "Polling App",
          description: "Your Username or Password is incorrect. Please try again!",
        });
      } else {
        notify.error({
          message: "Polling App",
          description: "Sorry! Something went wrong. Please try again!",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400 }}>
      <Stack spacing={2.5}>
        <AppTextField
          label="Username or Email"
          required
          value={usernameOrEmail}
          onChange={(event) => setUsernameOrEmail(event.target.value)}
        />
        <AppTextField
          label="Password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <AppButton type="submit" size="large" disabled={submitting}>
          Login
        </AppButton>
        <Typography variant="body2">
          Or <Link href="/signup">register now!</Link>
        </Typography>
      </Stack>
    </Box>
  );
}
