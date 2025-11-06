//NOTE: To add more values along the way
export type User = {
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'USER';
  teamId: string;
  bio: string;
};

export type AuthResponse = {
  jwt: string;
  user: User;
};
