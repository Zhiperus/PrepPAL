import { useNavigate } from 'react-router';
import { RegisterForm } from '@/components/register-form';
import { useRegister } from '@/lib/auth';

export const RegisterRoute = () => {
  const navigate = useNavigate();
  const registering = useRegister(); 

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F4F6] p-4">
      <RegisterForm 
        onSubmit={(values) => {
          registering.mutate(values, {
            onSuccess: () => {
              navigate('/onboarding');
            },
          });
        }}
        isSubmitting={registering.isPending}
      />
    </div>
  );
};

export default RegisterRoute;