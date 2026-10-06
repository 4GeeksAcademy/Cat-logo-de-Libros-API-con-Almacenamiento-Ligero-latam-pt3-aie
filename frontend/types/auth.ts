import type { Profile } from "./profile";

export type UserRole = "user" | "admin";

export interface AccessToken {
  access_token: string;
  token_type: "bearer" | string;
}

export interface CurrentUser {
  email: string;
  role: UserRole;
  profile: Profile;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  username: string;
  email: string;
  password: string;
}
