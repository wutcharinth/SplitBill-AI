import React from 'react';
import { RotateCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onReset: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onReset }) => (
  <div className="min-h-screen flex flex-col justify-center items-center p-4 text-center">
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative max-w-md w-full" role="alert">
      <strong className="font-bold">Error:</strong>
      <span className="block sm:inline ml-2">{message}</span>
    </div>
    <button
      onClick={onReset}
      className="mt-6 w-full max-w-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
    >
      <RotateCw size={18} />
      <span>Try Again</span>
    </button>
  </div>
);

export default ErrorMessage;
