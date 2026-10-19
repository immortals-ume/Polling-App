export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081/api";
export const ACCESS_TOKEN = "accessToken";

export const POLL_LIST_SIZE = 30;
export const MIN_CHOICES = 2;
export const MAX_CHOICES = 6;
export const POLL_QUESTION_MAX_LENGTH = 140;
export const POLL_CHOICE_MAX_LENGTH = 40;

export const NAME_MIN_LENGTH = 4;
export const NAME_MAX_LENGTH = 40;

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 15;

export const EMAIL_MAX_LENGTH = 40;

export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 20;

export const DEFAULT_POLL_LENGTH_DAYS = 1;
export const DEFAULT_POLL_LENGTH_HOURS = 0;
export const MAX_POLL_LENGTH_DAYS = 7;
export const MAX_POLL_LENGTH_HOURS = 23;
