import { useState } from 'react';
import { useNavigate } from 'react-router';
import { paths } from '@/config/paths';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base-200 p-4">
        <div className=" text-left">
            <h1 className="mb-8 text-3xl font-bold text-primary">
            Help us get to know you better.
            </h1>
            <h2 className="mb-8">
                These information will be used to make your experience more personalized.
            </h2>
        </div>
    </div>
  );
}