"use client";

import { useCallback, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { getAllPolls, getUserCreatedPolls, getUserVotedPolls } from "@/lib/api";
import { POLL_LIST_SIZE } from "@/lib/constants";
import { PollResponse } from "@/lib/types";
import { PageLoading } from "./ui/PageLoading";
import { AppButton } from "./ui/AppButton";
import { PollCard } from "./PollCard";

export type PollListSource =
  | { type: "ALL" }
  | { type: "USER_CREATED_POLLS"; username: string }
  | { type: "USER_VOTED_POLLS"; username: string };

interface PollListProps {
  source: PollListSource;
}

export function PollList({ source }: PollListProps) {
  const [polls, setPolls] = useState<PollResponse[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const sourceKey =
    source.type === "ALL" ? "ALL" : `${source.type}:${source.username}`;

  const fetchPage = useCallback(
    async (pageToLoad: number) => {
      if (source.type === "USER_CREATED_POLLS") {
        return getUserCreatedPolls(source.username, pageToLoad, POLL_LIST_SIZE);
      }
      if (source.type === "USER_VOTED_POLLS") {
        return getUserVotedPolls(source.username, pageToLoad, POLL_LIST_SIZE);
      }
      return getAllPolls(pageToLoad, POLL_LIST_SIZE);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sourceKey]
  );

  const loadPage = useCallback(
    async (pageToLoad: number, append: boolean) => {
      setIsLoading(true);
      try {
        const response = await fetchPage(pageToLoad);
        setPolls((prev) => (append ? [...prev, ...response.content] : response.content));
        setPage(response.page);
        setLast(response.last);
      } catch {
        if (!append) setPolls([]);
      } finally {
        setIsLoading(false);
        setLoaded(true);
      }
    },
    [fetchPage]
  );

  useEffect(() => {
    setPolls([]);
    setPage(0);
    setLast(true);
    setLoaded(false);
    loadPage(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey]);

  const handlePollUpdated = (updated: PollResponse) => {
    setPolls((prev) => prev.map((poll) => (poll.id === updated.id ? updated : poll)));
  };

  return (
    <Box>
      {polls.map((poll) => (
        <PollCard key={poll.id} poll={poll} onPollUpdated={handlePollUpdated} />
      ))}

      {loaded && !isLoading && polls.length === 0 ? (
        <Box sx={{ textAlign: "center", color: "text.secondary", marginTop: 4 }}>
          <Typography>No Polls Found.</Typography>
        </Box>
      ) : null}

      {!isLoading && !last ? (
        <Box sx={{ textAlign: "center", marginTop: 2 }}>
          <AppButton appVariant="dashed" onClick={() => loadPage(page + 1, true)}>
            Load more
          </AppButton>
        </Box>
      ) : null}

      {isLoading ? <PageLoading /> : null}
    </Box>
  );
}
