import { Paper, PaperProps, styled } from "@mui/material";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(2),
}));

export function AppCard(props: PaperProps) {
  return <StyledPaper elevation={1} {...props} />;
}
