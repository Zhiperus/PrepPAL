declare namespace Express {
  export interface Request {
    token?: string;
    userId?: string;
    role?: 'citizen' | 'lgu' | 'super_admin';
    cityCode?: string;
    barangayCode?: string;
  }
}
