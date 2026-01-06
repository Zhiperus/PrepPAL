declare namespace Express {
  export interface Request {
    token?: string;
    userId?: string;
    role?: 'citizen' | 'admin' | 'super_admin';
    lguId?: string | null;
  }
}
