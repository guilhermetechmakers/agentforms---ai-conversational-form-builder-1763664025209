import { api } from '@/lib/api';
import type { AuthResponse, SignInInput, SignUpInput, PasswordResetRequest, PasswordResetConfirm } from '@/types/auth';

export const authApi = {
  // Sign in with email and password
  signIn: async (credentials: SignInInput): Promise<AuthResponse> => {
    const response = await authApi._signInRequest(credentials);
    
    // Store auth token
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  },

  // Internal sign in request (without token storage)
  _signInRequest: async (credentials: SignInInput): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/login', credentials);
  },

  // Sign up with email and password
  signUp: async (credentials: SignUpInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    
    // Optionally store token on signup
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  },

  // Sign out
  signOut: async (): Promise<void> => {
    try {
      await api.post('/auth/logout', {});
    } finally {
      localStorage.removeItem('auth_token');
    }
  },

  // Reset password - send reset email
  resetPassword: async (email: string): Promise<void> => {
    const request: PasswordResetRequest = { email };
    return api.post('/auth/forgot-password', request);
  },

  // Update password with reset token
  updatePassword: async (token: string, newPassword: string, confirmPassword: string): Promise<void> => {
    const request: PasswordResetConfirm = { token, new_password: newPassword, confirm_password: confirmPassword };
    return api.post('/auth/reset-password', request);
  },

  // Refresh auth token
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh', {});
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  },

  // Verify email with token
  verifyEmail: async (token: string): Promise<void> => {
    return api.post('/auth/verify-email', { token });
  },

  // Resend verification email
  resendVerification: async (): Promise<void> => {
    return api.post('/auth/resend-verification', {});
  },

  // OAuth sign in
  signInWithOAuth: (provider: 'google' | 'microsoft'): void => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/${provider}?redirect=${encodeURIComponent(redirectUrl)}`;
  },
};
