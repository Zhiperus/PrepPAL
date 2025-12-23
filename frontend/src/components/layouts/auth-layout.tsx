import * as React from 'react';
import { FaLongArrowAltLeft } from 'react-icons/fa';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';

import logo from '@/assets/logo.png';
import { paths } from '@/config/paths';
import { useUser } from '@/lib/auth';

type LayoutProps = {
  children: React.ReactNode;
  title?: string;
};

export default function AuthLayout({ children }: LayoutProps) {
  const user = useUser();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  const navigate = useNavigate();

  const isRegister = location.pathname.includes('/register');
  const isLogin = !isRegister;

  React.useEffect(() => {
    if (user.data) {
      console.log(user.data);
      navigate(redirectTo ? redirectTo : paths.app.root.getHref(), {
        replace: true,
      });
    }
  }, [user.data, navigate, redirectTo]);

  return (
    <>
      <div className="bg-bg-page flex min-h-screen items-center justify-center p-4 font-sans">
        {/* MAIN CARD */}
        <div className="bg-bg-primary flex min-h-[616px] w-full max-w-4xl overflow-hidden rounded-3xl shadow-[10px_10px_20px_rgba(0,0,0,0.15)]">
          {/* LEFT SIDE */}
          <div className="flex w-full flex-col justify-start p-8 pt-14 md:w-1/2 md:p-12 md:pt-14">
            <div className="mx-auto w-full max-w-sm">
              {/* Register / Login */}

              <div className="mb-8 flex items-center justify-center text-3xl">
                {/* Login Link */}
                <div>
                  <Link
                    to="/auth/login"
                    className={`transition-colors focus:outline-none ${
                      isLogin
                        ? 'text-text-primary font-bold'
                        : 'text-text-secondary hover:text-text-primary font-normal'
                    }`}
                  >
                    Login
                  </Link>
                </div>

                <span className="text-text-secondary mx-3 font-bold">/</span>

                {/* Register Link */}
                <div>
                  <Link
                    to="/auth/register"
                    className={`transition-colors focus:outline-none ${
                      isRegister
                        ? 'text-text-primary font-bold'
                        : 'text-text-secondary hover:text-text-primary font-normal'
                    }`}
                  >
                    Register
                  </Link>
                </div>
              </div>

              <div className="space-y-6">{children}</div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="relative hidden w-1/2 flex-col items-center justify-start bg-slate-500 p-12 pt-12 md:flex">
            <div className="flex flex-col items-center">
              <img src={logo} alt="PrepPAL Logo" className="mb-4 h-35 w-auto" />
              <h1 className="text-text-primary text-4xl font-bold tracking-wide">
                PrepPAL
              </h1>
            </div>

            {/* Back Link */}
            <div className="absolute bottom-8 left-0 w-full text-center">
              <Link
                to="/"
                className="text-text-secondary hover:text-text-primary flex items-center justify-center gap-2 text-sm transition-colors hover:underline"
              >
                <FaLongArrowAltLeft /> Go back to About section
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
