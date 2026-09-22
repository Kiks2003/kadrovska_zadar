export interface LoginRequest {
  username: string;
  password: string;
}

export interface Korisnik {
  logged_in: boolean;
  username?: string;
  is_superuser?: boolean;
  git_version?: string;
  app_version?: string;
  permissions?: string[];
}
