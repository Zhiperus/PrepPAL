import { Link, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { paths } from '@/config/paths';

import googleLogo from '../assets/google-logo.svg';
import facebookLogo from '../assets/facebook-logo.svg';

type LoginFormProps = {
  onSuccess: () => void;
};

type LoginValues = {
  email: string;
  password: string;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  const {register, handleSubmit, formState: { errors, isSubmitting }} = useForm<LoginValues>({
    defaultValues: {email: '', password: '',},
  });

  const onSubmit = async (_values: LoginValues) => { //edit _values later (remove _)
    try {
      // await api.login(values); 
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Email */}
        <div>
          <label className="block text-sm font-bold text-[#2A4263]">Email</label>
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            className="mt-1 block w-full rounded-md border border-[#2A4263] p-2 sm:text-sm"
          />

          {errors.email && (
            <p className="mt-1 text-xs text-red-600">
              {errors.email.message}
            </p>
          )} 
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-bold text-[#2A4263]">Password</label>
          <input
            type="password"
            {...register('password', { required: 'Password is required' })}
            className="mt-1 block w-full rounded-md border border-[#2A4263] p-2 sm:text-sm"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.password.message}
              </p>
          )}
        </div>
        
        <div className="mt-4 text-xs flex items-center justify-end text-sm">
          <div>
            <Link
              to={paths.auth.register.getHref(redirectTo)} //to be edited; for forgot password
              className="font-bold text-[#2A4263]"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Login button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer flex w-full justify-center rounded-md border border-transparent bg-[#2A4263] py-2 px-4 text-sm font-bold text-white shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="mt-4 flex items-center justify-end text-sm">
        <p className="text-[#4B5563]">Don't have an account? &nbsp;</p>
        <div>
          <Link
            to={paths.auth.register.getHref(redirectTo)}
            className="font-bold text-[#2A4263]"
          >
            Register
          </Link>
        </div>
      </div>

      <div className="flex items-center my-6 before:flex-1 before:border-t before:border-gray-300 after:flex-1 after:border-t after:border-gray-300 after:ms-4 before:me-4 text-xl text-[#4B5563] font-medium">or</div>
      
      {/* Facebook Login */}
      <button 
        type="button"
        disabled={isSubmitting}
        className="cursor-pointer mt-4 flex w-full items-center justify-center gap-3 rounded-md border border-[#dadce0] bg-[#1877F2] py-2 px-4 text-sm font-bold text-white shadow-sm disabled:opacity-50"
      >
      <img 
        src={facebookLogo}
        alt="" 
        className="h-[20px] w-[20px]" 
      />
      Continue with Facebook
     </button>
    
      {/* Google Login */}
      <button 
        type="button"
        disabled={isSubmitting}
        className="cursor-pointer mt-4 flex w-full items-center justify-center gap-3 rounded-md border border-[#dadce0] bg-white py-2 px-4 text-sm font-bold text-[#757575] shadow-sm disabled:opacity-50"
      >
      <img 
        src={googleLogo}
        alt="" 
        className="h-[18px] w-[18px]" 
      />
      Continue with Google
     </button>
    </div>
  );
};
