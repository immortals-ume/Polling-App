import { Avatar, AvatarProps } from "@mui/material";
import { getAvatarColor } from "@/lib/colors";

export interface UserAvatarProps extends Omit<AvatarProps, "children"> {
  name: string;
}

export function UserAvatar({ name, sx, ...props }: UserAvatarProps) {
  return (
    <Avatar
      sx={{ bgcolor: getAvatarColor(name), fontWeight: 600, ...sx }}
      {...props}
    >
      {name.charAt(0).toUpperCase()}
    </Avatar>
  );
}
