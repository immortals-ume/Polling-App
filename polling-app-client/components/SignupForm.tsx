"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { checkEmailAvailability, checkUsernameAvailability, signup } from "@/lib/api";
import { useNotify } from "@/lib/notify";
import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "@/lib/constants";
import { AppButton } from "./ui/AppButton";
import { AppTextField } from "./ui/AppTextField";

type FieldStatus = "success" | "error" | "validating" | undefined;

interface Field {
  value: string;
  status: FieldStatus;
  errorMsg: string | null;
}

const emptyField: Field = { value: "", status: undefined, errorMsg: null };

const EMAIL_REGEX = /[^@ ]+@[^@ ]+\.[^@ ]+/;

function validateName(name: string): Pick<Field, "status" | "errorMsg"> {
  if (name.length < NAME_MIN_LENGTH) {
    return { status: "error", errorMsg: `Name is too short (minimum ${NAME_MIN_LENGTH} characters needed)` };
  }
  if (name.length > NAME_MAX_LENGTH) {
    return { status: "error", errorMsg: `Name is too long (maximum ${NAME_MAX_LENGTH} characters allowed)` };
  }
  return { status: "success", errorMsg: null };
}

function validateUsernameFormat(username: string): Pick<Field, "status" | "errorMsg"> {
  if (username.length < USERNAME_MIN_LENGTH) {
    return { status: "error", errorMsg: `Username is too short (minimum ${USERNAME_MIN_LENGTH} characters needed)` };
  }
  if (username.length > USERNAME_MAX_LENGTH) {
    return { status: "error", errorMsg: `Username is too long (maximum ${USERNAME_MAX_LENGTH} characters allowed)` };
  }
  return { status: undefined, errorMsg: null };
}

function validateEmailFormat(email: string): Pick<Field, "status" | "errorMsg"> {
  if (!email) {
    return { status: "error", errorMsg: "Email may not be empty" };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { status: "error", errorMsg: "Email not valid" };
  }
  if (email.length > EMAIL_MAX_LENGTH) {
    return { status: "error", errorMsg: `Email is too long (maximum ${EMAIL_MAX_LENGTH} characters allowed)` };
  }
  return { status: undefined, errorMsg: null };
}

function validatePassword(password: string): Pick<Field, "status" | "errorMsg"> {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { status: "error", errorMsg: `Password is too short (minimum ${PASSWORD_MIN_LENGTH} characters needed)` };
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return { status: "error", errorMsg: `Password is too long (maximum ${PASSWORD_MAX_LENGTH} characters allowed)` };
  }
  return { status: "success", errorMsg: null };
}

export function SignupForm() {
  const router = useRouter();
  const notify = useNotify();
  const [name, setName] = useState<Field>(emptyField);
  const [username, setUsername] = useState<Field>(emptyField);
  const [email, setEmail] = useState<Field>(emptyField);
  const [password, setPassword] = useState<Field>(emptyField);
  const [submitting, setSubmitting] = useState(false);

  const handleUsernameBlur = async () => {
    const formatResult = validateUsernameFormat(username.value);
    if (formatResult.status === "error") {
      setUsername((prev) => ({ ...prev, ...formatResult }));
      return;
    }
    setUsername((prev) => ({ ...prev, status: "validating", errorMsg: null }));
    try {
      const result = await checkUsernameAvailability(username.value);
      setUsername((prev) => ({
        ...prev,
        status: result.available ? "success" : "error",
        errorMsg: result.available ? null : "This username is already taken",
      }));
    } catch {
      setUsername((prev) => ({ ...prev, status: "success", errorMsg: null }));
    }
  };

  const handleEmailBlur = async () => {
    const formatResult = validateEmailFormat(email.value);
    if (formatResult.status === "error") {
      setEmail((prev) => ({ ...prev, ...formatResult }));
      return;
    }
    setEmail((prev) => ({ ...prev, status: "validating", errorMsg: null }));
    try {
      const result = await checkEmailAvailability(email.value);
      setEmail((prev) => ({
        ...prev,
        status: result.available ? "success" : "error",
        errorMsg: result.available ? null : "This email is already registered",
      }));
    } catch {
      setEmail((prev) => ({ ...prev, status: "success", errorMsg: null }));
    }
  };

  const isFormInvalid =
    name.status !== "success" ||
    username.status !== "success" ||
    email.status !== "success" ||
    password.status !== "success";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await signup({
        name: name.value,
        username: username.value,
        email: email.value,
        password: password.value,
      });
      notify.success({
        message: "Polling App",
        description: "Thank you! You're successfully registered. Please login to continue!",
      });
      router.push("/login");
    } catch {
      notify.error({
        message: "Polling App",
        description: "Sorry! Something went wrong. Please try again!",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 420 }}>
      <Stack spacing={2.5}>
        <AppTextField
          label="Full Name"
          placeholder="Your full name"
          value={name.value}
          error={name.status === "error"}
          helperText={name.errorMsg}
          onChange={(event) =>
            setName({ value: event.target.value, ...validateName(event.target.value) })
          }
        />
        <AppTextField
          label="Username"
          placeholder="A unique username"
          value={username.value}
          error={username.status === "error"}
          helperText={
            username.status === "validating" ? "Checking availability..." : username.errorMsg
          }
          onBlur={handleUsernameBlur}
          onChange={(event) =>
            setUsername({ value: event.target.value, ...validateUsernameFormat(event.target.value) })
          }
        />
        <AppTextField
          label="Email"
          type="email"
          placeholder="Your email"
          value={email.value}
          error={email.status === "error"}
          helperText={email.status === "validating" ? "Checking availability..." : email.errorMsg}
          onBlur={handleEmailBlur}
          onChange={(event) =>
            setEmail({ value: event.target.value, ...validateEmailFormat(event.target.value) })
          }
        />
        <AppTextField
          label="Password"
          type="password"
          placeholder="A password between 6 to 20 characters"
          value={password.value}
          error={password.status === "error"}
          helperText={password.errorMsg}
          onChange={(event) =>
            setPassword({ value: event.target.value, ...validatePassword(event.target.value) })
          }
        />
        <AppButton type="submit" size="large" disabled={isFormInvalid || submitting}>
          Sign up
        </AppButton>
        <Typography variant="body2">
          Already registered? <Link href="/login">Login now!</Link>
        </Typography>
      </Stack>
    </Box>
  );
}
