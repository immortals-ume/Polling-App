"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  FormControlLabel,
  LinearProgress,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { castVote } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useNotify } from "@/lib/notify";
import { formatDateTime, getTimeRemaining } from "@/lib/format";
import { ApiError, ChoiceResponse, PollResponse } from "@/lib/types";
import { AppButton } from "./ui/AppButton";
import { AppCard } from "./ui/AppCard";
import { UserAvatar } from "./ui/UserAvatar";

interface PollCardProps {
  poll: PollResponse;
  onPollUpdated: (poll: PollResponse) => void;
}

function calculatePercentage(poll: PollResponse, choice: ChoiceResponse): number {
  if (poll.totalVotes === 0) return 0;
  return (choice.voteCount * 100) / poll.totalVotes;
}

function getWinningChoice(poll: PollResponse): ChoiceResponse | null {
  return poll.choices.reduce<ChoiceResponse | null>((winner, choice) => {
    if (!winner || choice.voteCount > winner.voteCount) return choice;
    return winner;
  }, null);
}

export function PollCard({ poll, onPollUpdated }: PollCardProps) {
  const { isAuthenticated, logout } = useAuth();
  const notify = useNotify();
  const router = useRouter();
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const hasVotedOrExpired = Boolean(poll.selectedChoice) || poll.expired;
  const winningChoice = poll.expired ? getWinningChoice(poll) : null;

  const handleVoteSubmit = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      notify.info({ message: "Polling App", description: "Please login to vote." });
      return;
    }
    if (selectedChoice === null) return;

    setSubmitting(true);
    try {
      const updatedPoll = await castVote({ pollId: poll.id, choiceId: selectedChoice });
      onPollUpdated(updatedPoll);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout("/login", "You have been logged out. Please login to vote.", "error");
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
    <AppCard>
      <Box sx={{ marginBottom: 2 }}>
        <Box
          component={Link}
          href={`/users/${poll.createdBy.username}`}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
            color: "inherit",
            marginBottom: 1,
          }}
        >
          <UserAvatar name={poll.createdBy.name} sx={{ width: 32, height: 32, fontSize: 14 }} />
          <Typography variant="body2" fontWeight={600}>
            {poll.createdBy.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            @{poll.createdBy.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            &bull; {formatDateTime(poll.creationDateTime)}
          </Typography>
        </Box>
        <Typography variant="h6">{poll.question}</Typography>
      </Box>

      {hasVotedOrExpired ? (
        <Stack spacing={1.5} sx={{ marginBottom: 2 }}>
          {poll.choices.map((choice) => {
            const percent = calculatePercentage(poll, choice);
            const isSelected = poll.selectedChoice === choice.id;
            const isWinner = winningChoice?.id === choice.id;
            return (
              <Box key={choice.id}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 0.5 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {Math.round(percent * 100) / 100}%
                  </Typography>
                  <Typography variant="body2">{choice.text}</Typography>
                  {isSelected ? (
                    <CheckCircleIcon color="primary" fontSize="small" />
                  ) : null}
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={percent}
                  color={isWinner ? "secondary" : "primary"}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            );
          })}
        </Stack>
      ) : (
        <RadioGroup
          value={selectedChoice ?? ""}
          onChange={(event) => setSelectedChoice(Number(event.target.value))}
          sx={{ marginBottom: 1 }}
        >
          {poll.choices.map((choice) => (
            <FormControlLabel
              key={choice.id}
              value={choice.id}
              control={<Radio />}
              label={choice.text}
            />
          ))}
        </RadioGroup>
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {!hasVotedOrExpired ? (
          <AppButton
            size="small"
            disabled={selectedChoice === null || submitting}
            onClick={handleVoteSubmit}
          >
            Vote
          </AppButton>
        ) : null}
        <Typography variant="caption" color="text.secondary">
          {poll.totalVotes} votes
        </Typography>
        <Typography variant="caption" color="text.secondary">
          &bull;
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {poll.expired ? "Final results" : getTimeRemaining(poll.expirationDateTime)}
        </Typography>
      </Box>
    </AppCard>
  );
}
