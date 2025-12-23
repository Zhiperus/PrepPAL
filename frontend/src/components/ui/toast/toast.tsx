import { createPortal } from 'react-dom';

type Props = {
  show: boolean;
  message: string;
  type: 'success' | 'error';
};

export default function Toast({ show, message, type }: Props) {
  if (!show) return null;

  return createPortal(
    <div className="toast toast-end toast-bottom animate-in slide-in-from-bottom-5 fade-in z-50 duration-300">
      <div
        className={`alert shadow-lg ${
          type === 'success'
            ? 'alert-success text-white'
            : 'alert-error text-white'
        }`}
      >
        {type === 'success' ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}

        {/* Message Content */}
        <div className="flex flex-col">
          <span className="font-semibold">
            {type === 'success' ? 'Success' : 'Error'}
          </span>
          <span className="text-sm opacity-90">{message}</span>
        </div>
      </div>
    </div>,
    document.getElementById('teleport') as Element,
  );
}
