import { Box, CircularProgress } from "@mui/material";

export function PageLoading() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        marginTop: 4,
      }}
    >
      <CircularProgress />
    </Box>
  );
}
