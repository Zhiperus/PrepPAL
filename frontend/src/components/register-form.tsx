import { Link, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerInputSchema } from '@/lib/auth';
import { paths } from '@/config/paths';
import { z } from 'zod';

type RegisterValues = z.infer<typeof registerInputSchema>;

type RegisterFormProps = {
  onSubmit: (data: RegisterValues) => void;
  isSubmitting?: boolean;
};

export const RegisterForm = ({ onSubmit, isSubmitting }: RegisterFormProps) => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors } // Extract errors here
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerInputSchema), // Connect the schema here
    defaultValues: {
        teamId: null, // Required by your schema logic
        teamName: null
    }
  });

  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  return (
    <div className="card w-full max-w-md bg-[#F3F4F6] shadow-xl p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* First & Last Name (Required by Schema) */}
        <div className="space-y-2">
            <label className="block text-sm font-bold text-[#2A4263]">Name</label>
            <div className="flex gap-2">
                <input {...register('firstName')} placeholder="First Name" className="input input-bordered w-full bg-white placeholder:text-[#9CA3AF]" />
                <input {...register('lastName')} placeholder="Last Name" className="input input-bordered w-full bg-white placeholder:text-[#9CA3AF]" />
            </div>
        </div>

        {/* Email */}
        <div className="space-y-2"> 
            <label className="block text-sm font-bold text-[#2A4263]">Email</label>
            <div className="form-control">
                <input {...register('email')} type="email" placeholder="Email" className="input input-bordered w-full bg-white ${errors.email ? 'input-error' : ''} placeholder:text-[#9CA3AF]" />
                {errors.email && <span className="text-error text-xs">{errors.email.message}</span>}
            </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
            <label className="block text-sm font-bold text-[#2A4263]">Password</label>
            <div className="form-control">
                <input {...register('password')} type="password" placeholder="Password" className="input input-bordered w-full bg-white placeholder:text-[#9CA3AF]" />
                {errors.password && <span className="text-error text-xs">{errors.password.message}</span>}
            </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
            <label className="block text-sm font-bold text-[#2A4263]">Confirm Password</label>
            <div className="form-control">
                <input {...register('password')} type="password" placeholder="Confirm Password" className="input input-bordered w-full bg-white placeholder:text-[#9CA3AF]" />
                {errors.password && <span className="text-error text-xs">{errors.password.message}</span>}
            </div>
        </div>

        {/* Team Name/ID*/}
        {/* <div className="space-y-2">
            <label className="block text-sm font-bold text-[#2A4263]">Household Information</label>
            <div className="form-control space-y-2">
                <input {...register('teamId')} placeholder="Household ID" className="input input-bordered w-full bg-white ${errors.teamId ? 'input-error' : ''} placeholder:text-[#9CA3AF]" />
                {errors.teamId && <span className="text-error text-xs">Team information is required</span>}

                <input {...register('teamName')} placeholder="Household Name" className="input input-bordered w-full bg-white ${errors.teamName ? 'input-error' : ''} placeholder:text-[#9CA3AF]" />
                {errors.teamName && <span className="text-error text-xs">Team information is required</span>}
            </div>
        </div> */}

        <button type="submit" className="btn btn-primary w-full bg-[#2A4263]" disabled={isSubmitting}>
          {isSubmitting ? 'Registering...' : 'Next'}
        </button>

        <div className="flex items-center justify-center gap-2">
            <p className="text-[#4B5563]">Already have an account?</p>
          <Link to={paths.auth.login.getHref(redirectTo)} className="font-bold text-[#2A4263]">
            Login
          </Link>
        </div>

      <div className="flex items-center my-6 before:flex-1 before:border-t before:border-gray-300 after:flex-1 after:border-t after:border-gray-300 after:ms-4 before:me-4 text-xl text-[#4B5563] font-medium">or</div>

      {/* Facebook Login */}
      <button type="button" disabled={isSubmitting} className="cursor-pointer mt-4 flex w-full items-center justify-center gap-3 rounded-md border border-[#dadce0] bg-[#1877F2] py-2 px-4 text-sm font-bold text-white shadow-sm disabled:opacity-50">
      <img 
        src={facebookLogo}
        alt="" 
        className="h-[20px] w-[20px]" 
      />
      Continue with Facebook
     </button>

      {/* Google Login */}
      <button type="button" disabled={isSubmitting} className="cursor-pointer mt-4 flex w-full items-center justify-center gap-3 rounded-md border border-[#dadce0] bg-white py-2 px-4 text-sm font-bold text-[#757575] shadow-sm disabled:opacity-50">
      <img 
        src={googleLogo}
        alt="" 
        className="h-[18px] w-[18px]" 
      />
      Continue with Google
      </button>
      </form>
    </div>
  );
};