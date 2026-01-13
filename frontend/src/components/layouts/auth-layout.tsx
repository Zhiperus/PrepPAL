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
      navigate(redirectTo ? redirectTo : paths.app.root.getHref(), {
        replace: true,
      });
    }
  }, [user.data, navigate, redirectTo]);

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-sans">
        {/* MAIN CARD */}
        <div className="flex min-h-[600px] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* LEFT SIDE (Form) */}
          <div className="flex w-full flex-col justify-between p-8 pt-12 md:w-1/2 md:p-12 md:pt-14">
            <div className="mx-auto w-full max-w-sm">
              {/* Register / Login Toggles */}
              <div className="mb-8 flex items-center justify-center text-2xl tracking-wide">
                {/* Login Link */}
                <div>
                  <Link
                    to="/auth/login"
                    className={`transition-colors duration-200 focus:outline-none ${
                      isLogin
                        ? 'border-b-2 border-[#2a4263] pb-1 font-bold text-[#2a4263]'
                        : 'pb-1 font-medium text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Login
                  </Link>
                </div>

                <span className="mx-4 font-light text-gray-300">|</span>

                {/* Register Link */}
                <div>
                  <Link
                    to="/auth/register"
                    className={`transition-colors duration-200 focus:outline-none ${
                      isRegister
                        ? 'border-b-2 border-[#2a4263] pb-1 font-bold text-[#2a4263]'
                        : 'pb-1 font-medium text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Register
                  </Link>
                </div>
              </div>

              <div className="space-y-6">{children}</div>
            </div>

            {/* MOBILE ONLY: Back Link */}
            <div className="mt-8 flex justify-center md:hidden">
              <Link
                to="/"
                className="group inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-[#2a4263]"
              >
                <FaLongArrowAltLeft className="transition-transform group-hover:-translate-x-1" />
                Back to website
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE (Branding - Hidden on Mobile) */}
          <div className="relative hidden w-1/2 flex-col items-center justify-center bg-[#2a4263] text-white md:flex">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(#ffffff 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            ></div>

            <div className="z-10 flex flex-col items-center p-12 text-center">
              <div className="mb-6 rounded-full border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
                <img src={logo} alt="PrepPAL Logo" className="h-28 w-auto" />
              </div>

              <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">
                PrepPAL
              </h1>

              <div className="mb-4 h-1 w-12 rounded-full bg-blue-300/50"></div>

              <p className="max-w-xs text-base leading-relaxed font-medium text-blue-100/90">
                Disaster preparedness and community safety management for
                everyone.
              </p>
            </div>

            {/* DESKTOP ONLY: Back Link */}
            <div className="absolute bottom-8 left-0 z-10 w-full text-center">
              <Link
                to="/"
                className="group inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-200 uppercase transition-colors hover:text-white"
              >
                <FaLongArrowAltLeft className="transition-transform group-hover:-translate-x-1" />
                Back to website
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
