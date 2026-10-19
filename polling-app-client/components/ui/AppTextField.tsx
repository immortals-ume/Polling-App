import { TextField, TextFieldProps } from "@mui/material";

/**
 * Themed text field with the project's default size/margin conventions,
 * so feature forms don't repeat the same props everywhere.
 */
export function AppTextField(props: TextFieldProps) {
  return <TextField fullWidth size="medium" variant="outlined" {...props} />;
}
