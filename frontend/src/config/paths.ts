export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },

  auth: {
    register: {
      path: '/auth/register',
      getHref: (redirectTo?: string | null | undefined) =>
        `/auth/register${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    login: {
      path: '/auth/login',
      getHref: (redirectTo?: string | null | undefined) =>
        `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    'forget-password': {
      path: '/auth/forgot-password',
      getHref: (redirectTo?: string | null | undefined) =>
        `/auth/forgot-password${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    'reset-password': {
      path: '/auth/reset-password',
      getHref: (token: string, redirectTo?: string | null | undefined) =>
        `/auth/reset-password?token=${encodeURIComponent(token)}${redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    'verify-email': {
      path: '/auth/verify-email',
      getHref: (token: string, redirectTo?: string | null | undefined) =>
        `/auth/verify-email?token=${encodeURIComponent(token)}${redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
  },

  onboarding: {
    path: '/onboarding',
    getHref: () => '/onboarding',
  },

  'community-feed': {
    path: "/community-feed",
     getHref: () => '/community-feed',
  },

  app: {
    root: {
      path: '/app',
      getHref: () => '/app',
    },
  },
} as const;
