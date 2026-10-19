"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { createPoll } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useNotify } from "@/lib/notify";
import {
  DEFAULT_POLL_LENGTH_DAYS,
  DEFAULT_POLL_LENGTH_HOURS,
  MAX_CHOICES,
  MAX_POLL_LENGTH_HOURS,
  MAX_POLL_LENGTH_DAYS,
  MIN_CHOICES,
  POLL_CHOICE_MAX_LENGTH,
  POLL_QUESTION_MAX_LENGTH,
} from "@/lib/constants";
import { ApiError } from "@/lib/types";
import { AppButton } from "./ui/AppButton";
import { AppTextField } from "./ui/AppTextField";

interface Field {
  text: string;
  status: "success" | "error" | undefined;
  errorMsg: string | null;
}

function validateQuestion(text: string): Pick<Field, "status" | "errorMsg"> {
  if (text.length === 0) {
    return { status: "error", errorMsg: "Please enter your question!" };
  }
  if (text.length > POLL_QUESTION_MAX_LENGTH) {
    return {
      status: "error",
      errorMsg: `Question is too long (maximum ${POLL_QUESTION_MAX_LENGTH} characters allowed)`,
    };
  }
  return { status: "success", errorMsg: null };
}

function validateChoice(text: string): Pick<Field, "status" | "errorMsg"> {
  if (text.length === 0) {
    return { status: "error", errorMsg: "Please enter a choice!" };
  }
  if (text.length > POLL_CHOICE_MAX_LENGTH) {
    return {
      status: "error",
      errorMsg: `Choice is too long (maximum ${POLL_CHOICE_MAX_LENGTH} characters allowed)`,
    };
  }
  return { status: "success", errorMsg: null };
}

const makeEmptyChoice = (): Field => ({ text: "", status: undefined, errorMsg: null });

export function NewPollForm() {
  const router = useRouter();
  const notify = useNotify();
  const { logout } = useAuth();
  const [question, setQuestion] = useState<Field>({ text: "", status: undefined, errorMsg: null });
  const [choices, setChoices] = useState<Field[]>([makeEmptyChoice(), makeEmptyChoice()]);
  const [days, setDays] = useState(DEFAULT_POLL_LENGTH_DAYS);
  const [hours, setHours] = useState(DEFAULT_POLL_LENGTH_HOURS);
  const [submitting, setSubmitting] = useState(false);

  const addChoice = () => setChoices((prev) => [...prev, makeEmptyChoice()]);
  const removeChoice = (index: number) =>
    setChoices((prev) => prev.filter((_, i) => i !== index));

  const updateChoice = (index: number, text: string) => {
    setChoices((prev) =>
      prev.map((choice, i) => (i === index ? { text, ...validateChoice(text) } : choice))
    );
  };

  const isFormInvalid =
    question.status !== "success" || choices.some((choice) => choice.status !== "success");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await createPoll({
        question: question.text,
        choices: choices.map((choice) => ({ text: choice.text })),
        pollLength: { days, hours },
      });
      router.push("/");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout("/login", "You have been logged out. Please login to create a poll.", "error");
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
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 520 }}>
      <Typography variant="h4" sx={{ marginBottom: 3 }}>
        Create Poll
      </Typography>
      <Stack spacing={2.5}>
        <AppTextField
          label="Question"
          placeholder="Enter your question"
          multiline
          minRows={3}
          maxRows={6}
          value={question.text}
          error={question.status === "error"}
          helperText={question.errorMsg}
          onChange={(event) =>
            setQuestion({ text: event.target.value, ...validateQuestion(event.target.value) })
          }
        />

        {choices.map((choice, index) => (
          <Box key={index} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <AppTextField
              placeholder={`Choice ${index + 1}`}
              value={choice.text}
              error={choice.status === "error"}
              helperText={choice.errorMsg}
              onChange={(event) => updateChoice(index, event.target.value)}
            />
            {index >= MIN_CHOICES ? (
              <IconButton aria-label="remove choice" onClick={() => removeChoice(index)} sx={{ marginTop: 0.5 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            ) : null}
          </Box>
        ))}

        <Box>
          <AppButton appVariant="dashed" onClick={addChoice} disabled={choices.length === MAX_CHOICES}>
            + Add a choice
          </AppButton>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ width: { xs: "100%", sm: "auto" } }}>
            Poll length:
          </Typography>
          <Box sx={{ flex: { xs: "1 1 45%", sm: "0 0 120px" } }}>
            <AppTextField
              select
              label="Days"
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
            >
              {Array.from({ length: MAX_POLL_LENGTH_DAYS + 1 }, (_, i) => i).map((i) => (
                <MenuItem key={i} value={i}>
                  {i}
                </MenuItem>
              ))}
            </AppTextField>
          </Box>
          <Box sx={{ flex: { xs: "1 1 45%", sm: "0 0 120px" } }}>
            <AppTextField
              select
              label="Hours"
              value={hours}
              onChange={(event) => setHours(Number(event.target.value))}
            >
              {Array.from({ length: MAX_POLL_LENGTH_HOURS + 1 }, (_, i) => i).map((i) => (
                <MenuItem key={i} value={i}>
                  {i}
                </MenuItem>
              ))}
            </AppTextField>
          </Box>
        </Box>

        <AppButton type="submit" size="large" disabled={isFormInvalid || submitting}>
          Create Poll
        </AppButton>
      </Stack>
    </Box>
  );
}
