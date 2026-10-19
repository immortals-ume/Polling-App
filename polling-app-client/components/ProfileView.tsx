"use client";

import { useEffect, useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { getUserProfile } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { ApiError, UserProfile } from "@/lib/types";
import { PageLoading } from "./ui/PageLoading";
import { UserAvatar } from "./ui/UserAvatar";
import { NotFoundView } from "./NotFoundView";
import { ServerErrorView } from "./ServerErrorView";
import { PollList } from "./PollList";

interface ProfileViewProps {
  username: string;
}

export function ProfileView({ username }: ProfileViewProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setNotFound(false);
    setServerError(false);

    getUserProfile(username)
      .then((response) => {
        if (!isMounted) return;
        setUser(response);
      })
      .catch((error) => {
        if (!isMounted) return;
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
        } else {
          setServerError(true);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [username]);

  if (isLoading) return <PageLoading />;
  if (notFound) return <NotFoundView />;
  if (serverError) return <ServerErrorView />;
  if (!user) return null;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 3 }}>
        <UserAvatar name={user.name} sx={{ width: 64, height: 64, fontSize: 24 }} />
        <Box>
          <Typography variant="h5">{user.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            @{user.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Joined {formatDate(user.joinedAt)}
          </Typography>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} centered sx={{ marginBottom: 2 }}>
        <Tab label={`${user.pollCount} Polls`} />
        <Tab label={`${user.voteCount} Votes`} />
      </Tabs>

      {tab === 0 ? (
        <PollList source={{ type: "USER_CREATED_POLLS", username }} />
      ) : (
        <PollList source={{ type: "USER_VOTED_POLLS", username }} />
      )}
    </Box>
  );
}
