import type {
  LoginRequest,
  RegisterRequest,
} from '@shared/schemas/auth.schema';
import { configureAuth } from 'react-query-auth';
import { Navigate, useLocation } from 'react-router';
import { z } from 'zod';

import { api } from './api-client';

import { paths } from '@/config/paths';
import type { AuthResponse, User } from '@/types/api';

// api call definitions for auth (types, schemas, requests):
// these are not part of features as this is a module shared across features

export const forgotPassword = (data: { email: string }) => {
  return api.post('/auth/forgot-password', data);
};

export const resetPassword = (data: { password: string; token: string }) => {
  return api.post('/auth/reset-password', data);
};

const getUser = async (): Promise<User> => {
  const response = await api.get('/auth/me');

  return response.data;
};

const logout = (): Promise<void> => {
  return api.post('/auth/logout');
};

const loginWithEmailAndPassword = (
  data: LoginRequest,
): Promise<AuthResponse> => {
  return api.post('/auth/login', data);
};

export const registerInputSchema = z
  .object({
    email: z.string().min(1, 'Required'),
    firstName: z.string().min(1, 'Required'),
    lastName: z.string().min(1, 'Required'),
    password: z.string().min(5, 'Required'),
  })
  .and(
    z
      .object({
        teamId: z.string().min(1, 'Required'),
        teamName: z.null().default(null),
      })
      .or(
        z.object({
          teamName: z.string().min(1, 'Required'),
          teamId: z.null().default(null),
        }),
      ),
  );

const registerWithEmailAndPassword = (
  data: RegisterRequest,
): Promise<AuthResponse> => {
  return api.post('/auth/register', data);
};

const authConfig = {
  userFn: getUser,
  loginFn: async (data: LoginRequest) => {
    const response = await loginWithEmailAndPassword(data);
    return response.user;
  },
  registerFn: async (data: RegisterRequest) => {
    const response = await registerWithEmailAndPassword(data);
    return response.user;
  },
  logoutFn: logout,
};

export const { useUser, useLogin, useLogout, useRegister, AuthLoader } =
  configureAuth(authConfig);

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const location = useLocation();

  if (!user.data) {
    return (
      <Navigate to={paths.auth.login.getHref(location.pathname)} replace />
    );
  }

  return children;
}
