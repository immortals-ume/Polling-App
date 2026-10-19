import { ACCESS_TOKEN, API_BASE_URL, POLL_LIST_SIZE } from "./constants";
import {
  ApiError,
  ApiErrorBody,
  ApiResponse,
  CurrentUser,
  JwtAuthenticationResponse,
  LoginRequest,
  PagedResponse,
  PollRequest,
  PollResponse,
  SignUpRequest,
  UserIdentityAvailability,
  UserProfile,
  VoteRequest,
} from "./types";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN);
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  let json: unknown = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok) {
    throw new ApiError(response.status, (json as ApiErrorBody) || {});
  }

  return json as T;
}

export function getAllPolls(page = 0, size = POLL_LIST_SIZE) {
  return request<PagedResponse<PollResponse>>(
    `${API_BASE_URL}/polls?page=${page}&size=${size}`
  );
}

export function createPoll(pollData: PollRequest) {
  return request<ApiResponse>(`${API_BASE_URL}/polls`, {
    method: "POST",
    body: JSON.stringify(pollData),
  });
}

export function castVote(voteData: VoteRequest) {
  return request<PollResponse>(`${API_BASE_URL}/polls/${voteData.pollId}/votes`, {
    method: "POST",
    body: JSON.stringify(voteData),
  });
}

export function login(loginRequest: LoginRequest) {
  return request<JwtAuthenticationResponse>(`${API_BASE_URL}/auth/signin`, {
    method: "POST",
    body: JSON.stringify(loginRequest),
  });
}

export function signup(signupRequest: SignUpRequest) {
  return request<ApiResponse>(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    body: JSON.stringify(signupRequest),
  });
}

export function checkUsernameAvailability(username: string) {
  return request<UserIdentityAvailability>(
    `${API_BASE_URL}/user/checkUsernameAvailability?username=${encodeURIComponent(username)}`
  );
}

export function checkEmailAvailability(email: string) {
  return request<UserIdentityAvailability>(
    `${API_BASE_URL}/user/checkEmailAvailability?email=${encodeURIComponent(email)}`
  );
}

export function getCurrentUser(): Promise<CurrentUser> {
  if (!getToken()) {
    return Promise.reject(new Error("No access token set."));
  }
  return request<CurrentUser>(`${API_BASE_URL}/user/me`);
}

export function getUserProfile(username: string) {
  return request<UserProfile>(`${API_BASE_URL}/users/${encodeURIComponent(username)}`);
}

export function getUserCreatedPolls(username: string, page = 0, size = POLL_LIST_SIZE) {
  return request<PagedResponse<PollResponse>>(
    `${API_BASE_URL}/users/${encodeURIComponent(username)}/polls?page=${page}&size=${size}`
  );
}

export function getUserVotedPolls(username: string, page = 0, size = POLL_LIST_SIZE) {
  return request<PagedResponse<PollResponse>>(
    `${API_BASE_URL}/users/${encodeURIComponent(username)}/votes?page=${page}&size=${size}`
  );
}
