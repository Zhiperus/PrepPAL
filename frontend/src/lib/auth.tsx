import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '@repo/shared/dist/schemas/auth.schema';
import type { User } from '@repo/shared/dist/schemas/user.schema';
import Cookies from 'js-cookie';
import { configureAuth } from 'react-query-auth';
import { Navigate, useLocation } from 'react-router';

import { api } from './api-client';
import { MOCK_USER_PROFILE } from './mockData';

import { paths } from '@/config/paths';


// api call definitions for auth (types, schemas, requests):
// these are not part of features as this is a module shared across features

export const forgotPassword = (data: { email: string }) => {
  return api.post('/auth/forgot-password', data);
};

export const resetPassword = (data: { password: string; token: string }) => {
  return api.post('/auth/reset-password', data);
};

async function getUser(): Promise<User | null> {
  // return MOCK_USER_PROFILE as unknown as User;
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return null;
    }
    throw error;
  }
}

const logout = async () => {
  Cookies.remove('token');
  return Promise.resolve();
};

const loginWithEmailAndPassword = async (
  data: LoginRequest,
): Promise<AuthResponse> => {
  const response = (await api.post('/auth/login', data)) as {
    data: AuthResponse;
  };

  if (response.data.token) {
    Cookies.set('token', response.data.token, {
      expires: 7,
      secure: true,
      sameSite: 'strict',
    });
  }

  return response.data;
};

const registerWithEmailAndPassword = async (
  data: RegisterRequest,
): Promise<AuthResponse> => {
  const response = (await api.post('/auth/signup', data)) as {
    data: AuthResponse;
  };
  if (response.data.token) {
    Cookies.set('token', response.data.token, {
      expires: 7,
      secure: true,
      sameSite: 'strict',
    });
  }

  return response.data;
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
