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


  app: {
    root: {
      path: '/app',
      getHref: () => '/app',
    },
    dashboard: {
      path: '',
      getHref: () => '/app',
    },
    onboarding: {
      path: 'onboarding',
      getHref: () => '/app/onboarding',
    },
    profile: {
      path: 'profile',
      getHref: () => '/app/profile',
    },
    modules: {
      path: 'modules',
      getHref: () => '/app/modules',
    },
    posts: {
      path: 'posts',
      getHref: () => '/app/posts',
    },
    'community-feed': {
      path: "community-feed",
       getHref: () => '/app/community-feed',
    },
    leaderboard: {
      path: 'leaderboard',
      getHref: () => '/app/leaderboard',
    },
  },
} as const;
