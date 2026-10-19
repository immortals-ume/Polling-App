import { Typography } from "@mui/material";
import { SignupForm } from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <>
      <Typography variant="h4" sx={{ marginBottom: 3 }}>
        Sign Up
      </Typography>
      <SignupForm />
    </>
  );
}
