import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { usersApi } from '@/api/users';
import { toast } from 'sonner';

// Query keys
export const authKeys = {
  user: ['auth', 'user'] as const,
};

// Get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: usersApi.getCurrent,
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!localStorage.getItem('auth_token'),
  });
};

// Sign in mutation
export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.signIn,
    onSuccess: (data) => {
      if (data.user) {
        queryClient.setQueryData(authKeys.user, data.user);
      }
      toast.success('Signed in successfully!');
    },
    onError: (error: any) => {
      toast.error(`Sign in failed: ${error.message || 'Invalid credentials'}`);
    },
  });
};

// Sign up mutation
export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.signUp,
    onSuccess: (data) => {
      if (data.user) {
        queryClient.setQueryData(authKeys.user, data.user);
      }
      toast.success('Account created! Please check your email to verify your account.');
    },
    onError: (error: any) => {
      toast.error(`Sign up failed: ${error.message || 'Failed to create account'}`);
    },
  });
};

// Sign out mutation
export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.signOut,
    onSuccess: () => {
      queryClient.clear();
      toast.success('Signed out successfully!');
    },
    onError: (error: any) => {
      queryClient.clear();
      toast.error(`Sign out failed: ${error.message}`);
    },
  });
};

// Password reset request mutation
export const usePasswordReset = () => {
  return useMutation({
    mutationFn: (email: string) => {
      return authApi.resetPassword(email);
    },
    onSuccess: () => {
      toast.success('Password reset email sent! Check your inbox.');
    },
    onError: (error: any) => {
      toast.error(`Password reset failed: ${error.message || 'Failed to send reset email'}`);
    },
  });
};

// Password reset confirm mutation
export const usePasswordResetConfirm = () => {
  return useMutation({
    mutationFn: ({ token, newPassword, confirmPassword }: { token: string; newPassword: string; confirmPassword: string }) => {
      return authApi.updatePassword(token, newPassword, confirmPassword);
    },
    onSuccess: () => {
      toast.success('Password reset successfully! You can now sign in.');
    },
    onError: (error: any) => {
      toast.error(`Password reset failed: ${error.message || 'Invalid or expired token'}`);
    },
  });
};

// Email verification mutation
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      toast.success('Email verified successfully!');
    },
    onError: (error: any) => {
      toast.error(`Email verification failed: ${error.message || 'Invalid or expired token'}`);
    },
  });
};

// Resend verification email mutation
export const useResendVerification = () => {
  return useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: () => {
      toast.success('Verification email sent! Check your inbox.');
    },
    onError: (error: any) => {
      toast.error(`Failed to resend verification: ${error.message || 'Please try again later'}`);
    },
  });
};

// Check verification status query
export const useCheckVerificationStatus = () => {
  return useQuery({
    queryKey: ['auth', 'verification-status'],
    queryFn: authApi.checkVerificationStatus,
    retry: false,
    staleTime: 0, // Always fetch fresh status
    enabled: !!localStorage.getItem('auth_token'),
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      return usersApi.changePassword(currentPassword, newPassword);
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to change password: ${error.message || 'Invalid current password'}`);
    },
  });
};

// Toggle 2FA mutation
export const useToggle2FA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) => {
      return usersApi.toggle2FA(enabled);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user, data);
      toast.success(`2FA ${data.two_factor_enabled ? 'enabled' : 'disabled'} successfully!`);
    },
    onError: (error: any) => {
      toast.error(`Failed to toggle 2FA: ${error.message || 'Unknown error'}`);
    },
  });
};
