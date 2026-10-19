export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface JwtAuthenticationResponse {
  accessToken: string;
  tokenType: string;
}

export interface UserSummary {
  id: number;
  username: string;
  name: string;
}

export interface CurrentUser {
  id: number;
  username: string;
  name: string;
}

export interface UserProfile {
  id: number;
  username: string;
  name: string;
  joinedAt: string;
  pollCount: number;
  voteCount: number;
}

export interface UserIdentityAvailability {
  available: boolean;
}

export interface ChoiceResponse {
  id: number;
  text: string;
  voteCount: number;
}

export interface PollResponse {
  id: number;
  question: string;
  choices: ChoiceResponse[];
  createdBy: UserSummary;
  creationDateTime: string;
  expirationDateTime: string;
  expired: boolean;
  selectedChoice?: number | null;
  totalVotes: number;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface ChoiceRequest {
  text: string;
}

export interface PollLength {
  days: number;
  hours: number;
}

export interface PollRequest {
  question: string;
  choices: ChoiceRequest[];
  pollLength: PollLength;
}

export interface VoteRequest {
  pollId: number;
  choiceId: number;
}

/**
 * Spring Boot's default error body (no custom "message" field —
 * see ResponseEntityExceptionHandler / the app's @ResponseStatus exceptions).
 */
export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  error?: string;
  path?: string;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message || body.error || "Something went wrong");
    this.status = status;
    this.body = body;
  }
}
