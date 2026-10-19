"use client";

import { Button, ButtonProps, styled } from "@mui/material";

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  paddingInline: theme.spacing(2.5),
}));

export type AppButtonVariant = "primary" | "dashed" | "plain";

export interface AppButtonProps extends Omit<ButtonProps, "variant" | "color"> {
  appVariant?: AppButtonVariant;
}

/**
 * Thin, themed wrapper around MUI's Button that maps the old antd
 * "primary" / "dashed" button variants onto MUI's variant+color system,
 * so call sites read the same way the legacy UI did.
 */
export function AppButton({ appVariant = "primary", ...props }: AppButtonProps) {
  if (appVariant === "dashed") {
    return <StyledButton variant="outlined" sx={{ borderStyle: "dashed" }} {...props} />;
  }
  if (appVariant === "plain") {
    return <StyledButton variant="text" {...props} />;
  }
  return <StyledButton variant="contained" color="primary" {...props} />;
}
