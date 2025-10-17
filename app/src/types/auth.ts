export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
  refreshAuth: () => Promise<void>;
}
