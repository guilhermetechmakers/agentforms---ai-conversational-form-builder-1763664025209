import { api } from '@/lib/api';
import type { User } from '@/types/auth';

export interface UpdateUserInput {
  full_name?: string;
  avatar_url?: string;
}

export const usersApi = {
  // Get current user
  getCurrent: async (): Promise<User> => {
    return api.get<User>('/users/me');
  },

  // Update user profile
  updateProfile: async (updates: UpdateUserInput): Promise<User> => {
    return api.put<User>('/users/me', updates);
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    return api.get<User>(`/users/${id}`);
  },

  // Get all users (admin only)
  getAll: async (): Promise<User[]> => {
    return api.get<User[]>('/users');
  },

  // Delete user account
  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/users/${id}`);
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    return api.post('/users/me/change-password', { current_password: currentPassword, new_password: newPassword });
  },

  // Enable/disable 2FA
  toggle2FA: async (enabled: boolean): Promise<User> => {
    return api.post<User>(`/users/me/2fa/${enabled ? 'enable' : 'disable'}`, {});
  },

  // Get 2FA setup secret and QR code
  get2FASetup: async (): Promise<{ secret: string; qr_code_url: string; backup_codes: string[] }> => {
    return api.get<{ secret: string; qr_code_url: string; backup_codes: string[] }>('/users/me/2fa/setup');
  },

  // Verify 2FA setup code
  verify2FASetup: async (code: string): Promise<{ verified: boolean; backup_codes?: string[] }> => {
    return api.post<{ verified: boolean; backup_codes?: string[] }>('/users/me/2fa/verify', { code });
  },

  // Get backup codes
  get2FABackupCodes: async (): Promise<{ backup_codes: string[] }> => {
    return api.get<{ backup_codes: string[] }>('/users/me/2fa/backup-codes');
  },
};
