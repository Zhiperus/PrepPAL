import type { OnboardingRequest } from '@repo/shared/dist/schemas/user.schema';
import { useFormContext } from 'react-hook-form';

interface StepHouseholdProps {
  onBack: () => void;
  isSubmitting: boolean;
}

export function StepHousehold({ onBack, isSubmitting }: StepHouseholdProps) {
  const {
    register,
    trigger,
    formState: { errors, isValid },
  } = useFormContext<OnboardingRequest>();

  return (
    <div className="mt-8 w-full">
      <h2 className="mb-6 text-2xl font-bold text-[#2a4263]">
        Household Information
      </h2>

      {/* Phone Number */}
      <fieldset className="fieldset mb-4 w-full">
        <legend className="fieldset-legend text-secondary-custom font-semibold">
          Phone Number
        </legend>
        <input
          type="text"
          placeholder="09xx xxx xxxx"
          className={`input validator bg-primary-container border-container-secondary w-full ${errors.phoneNumber ? 'input-error' : ''}`}
          {...register('phoneNumber')}
        />
        {errors.phoneNumber && (
          <span className="text-error text-sm">
            {errors.phoneNumber.message}
          </span>
        )}
      </fieldset>

      {/* Household Name */}
      <fieldset className="fieldset mb-4 w-full">
        <legend className="fieldset-legend text-secondary-custom font-semibold">
          Household Name
        </legend>
        <input
          type="text"
          placeholder="The PrepPAL Family"
          className={`input validator bg-primary-container border-container-secondary w-full ${errors.householdName ? 'input-error' : ''}`}
          {...register('householdName')}
        />
        {errors.householdName && (
          <span className="text-error text-sm">
            {errors.householdName.message}
          </span>
        )}
      </fieldset>

      {/* Member Count */}
      <fieldset className="fieldset mb-4 w-full">
        <legend className="fieldset-legend text-secondary-custom font-semibold">
          Number of Household Members
        </legend>
        <input
          type="number"
          min="1"
          defaultValue={1}
          className={`input validator bg-primary-container border-container-secondary w-full ${errors.householdInfo?.memberCount ? 'input-error' : ''}`}
          {...register('householdInfo.memberCount', {
            valueAsNumber: true,
            onChange: () => trigger('householdInfo.femaleCount'),
          })}
        />
        {errors.householdInfo?.memberCount && (
          <span className="text-error text-sm">
            {errors.householdInfo.memberCount.message}
          </span>
        )}
      </fieldset>

      {/* Female Members */}
      <fieldset className="fieldset mb-4 w-full">
        <legend className="fieldset-legend text-secondary-custom font-semibold">
          Number of Female Members
        </legend>
        <input
          type="number"
          min="0"
          className={`input validator bg-primary-container border-container-secondary w-full ${errors.householdInfo?.femaleCount ? 'input-error' : ''}`}
          {...register('householdInfo.femaleCount', { valueAsNumber: true })}
        />
        {errors.householdInfo?.femaleCount && (
          <span className="text-error text-sm">
            {errors.householdInfo.femaleCount.message}
          </span>
        )}
      </fieldset>

      <fieldset className="fieldset mb-4 w-full">
        <legend className="fieldset-legend text-secondary-custom font-semibold">
          Number of Pets
        </legend>
        <input
          type="number"
          min="0"
          className="input validator bg-primary-container border-container-secondary w-full"
          {...register('householdInfo.pets', { valueAsNumber: true })}
        />
      </fieldset>

      {/* Buttons */}
      <div className="flex w-full flex-row gap-4 pt-4">
        <button
          type="button"
          className="btn btn-soft flex-1 rounded border border-gray-300 bg-white text-lg text-gray-700 hover:bg-gray-50"
          onClick={onBack}
        >
          Back
        </button>
        <button
          type="submit"
          className="btn btn-soft btn-primary-custom flex-1 rounded text-lg"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? 'Saving...' : 'Done'}
        </button>
      </div>
    </div>
  );
}
