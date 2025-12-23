import * as React from 'react';
import { useState, useEffect } from 'react';
// import { useNavigate, useSearchParams } from 'react-router'; 

import logo from '../../assets/logo.png'; 


// import { Head } from '@/components/seo';
// import { Link } from '@/components/ui/link';
// import { paths } from '@/config/paths';
// import { useUser } from '@/lib/auth';

type LayoutProps = {
  children: React.ReactNode;
  title: string;
};

export const AuthLayout = ({ children, title }: LayoutProps) => {

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  /*
  const user = useUser();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const navigate = useNavigate();

  useEffect(() => {
    if (user.data) {
      navigate(redirectTo ? redirectTo : paths.app.dashboard.getHref(), {
        replace: true,
      });
    }
  }, [user.data, navigate, redirectTo]);
  */


  return (
    <>
     
      <div 
        className="flex min-h-screen items-center justify-center bg-[#E0E7FF] p-4"
        style={{ fontFamily: '"Rubik", sans-serif' }}
      >

        {/* MAIN CARD */}
     
        <div className="flex w-full max-w-4xl min-h-[400px] overflow-hidden rounded-3xl bg-white shadow-[10px_10px_20px_rgba(0,0,0,0.15)]">

          {/* LEFT SIDE */}
          <div className="flex w-full flex-col justify-start p-8 pt-14 md:w-1/2 md:p-12 md:pt-14">
            <div className="mx-auto w-full max-w-sm">

              {/* Register / Login */}
              
              <div className="mb-8 flex items-center justify-center text-3xl">
                
                {/* Register Button */}
                <div className="w-[140px] text-right">
                  <button
                    onClick={() => setAuthMode('register')}
                    className={`focus:outline-none transition-colors ${
                      authMode === 'register'
                        ? 'font-bold text-[#2A4263]'   
                        : 'font-normal text-[#4B5563] hover:text-[#2A4263]' 
                    }`}
                  >
                    Register
                  </button>
                </div>

                <span className="mx-3 font-bold text-[#4B5563]">/</span>

                {/* Login Button */}
                <div className="w-[140px] text-left">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`focus:outline-none transition-colors ${
                      authMode === 'login'
                        ? 'font-bold text-[#2A4263]'   
                        : 'font-normal text-[#4B5563] hover:text-[#2A4263]' 
                    }`}
                  >
                    Login
                  </button>
                </div>

              </div>
              
              <div className="space-y-6">
                {children}
              </div>

            </div>
          </div>

          {/* RIGHT SIDE */}
         
          <div className="hidden w-1/2 flex-col items-center justify-start pt-12 bg-slate-500 p-12 text-white md:flex relative">
            
            <div className="flex flex-col items-center">
               <img src={logo} alt="PrepPAL Logo" className="h-35 w-auto mb-4" />
               <h1 className="text-4xl font-bold tracking-wide text-[#2A4263]">
                 PrepPAL
               </h1>
            </div>

            {/* Back Link */}
            <div className="absolute bottom-8 left-0 w-full text-center">
              <a href="/" className="text-sm text-gray-200 hover:text-white hover:underline flex items-center justify-center gap-2 transition-colors">
                ← Go back to About section
              </a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};