import React, { useEffect } from 'react';

interface SuccessNotificationProps {
  message: string | null;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({ 
  message, 
  onClose, 
  autoClose = true, 
  duration = 4000 
}) => {
  useEffect(() => {
    if (message && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, autoClose, duration, onClose]);

  if (!message) return null;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0 text-green-600 text-xl mr-3 mt-0.5">
          ✅
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-green-800 mb-1">
            Success!
          </h3>
          <p className="text-sm text-green-800 opacity-90 leading-relaxed">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-green-100 transition-colors"
          title="Close"
        >
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SuccessNotification;