import apiClient, { setToken, removeToken } from '@/lib/apiClient';
import { LoginCredentials, AuthToken, User, UserSignup } from '@/types/api';

export const authService = {
  // Login with username and password
  login: async (credentials: LoginCredentials): Promise<AuthToken> => {
    const response = await apiClient.post<AuthToken>('/api/auth/token/', credentials);
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  },

  // Signup new user
  signup: async (userData: UserSignup): Promise<User> => {
    const response = await apiClient.post<User>('/api/user/signup/', userData);
    return response.data;
  },

  // Logout - clear token
  logout: (): void => {
    removeToken();
  },

  // Get current user info
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/user/me/');
    return response.data;
  },

  // Get user info (alternative endpoint)
  getUserInfo: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/user/getuserinfo/');
    return response.data;
  },
};
