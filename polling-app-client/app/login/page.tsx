import { Typography } from "@mui/material";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <Typography variant="h4" sx={{ marginBottom: 3 }}>
        Login
      </Typography>
      <LoginForm />
    </>
  );
}
