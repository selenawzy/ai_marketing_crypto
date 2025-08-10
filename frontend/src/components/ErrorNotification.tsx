import React, { useEffect } from 'react';

interface ErrorNotificationProps {
  error: string | null;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ 
  error, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (error && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [error, autoClose, duration, onClose]);

  if (!error) return null;

  // Determine error type and styling based on content
  const getErrorStyle = (errorMessage: string) => {
    if (errorMessage.includes('insufficient funds') || errorMessage.includes('balance')) {
      return {
        icon: '💳',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        iconColor: 'text-orange-600',
        buttonColor: 'hover:bg-orange-100'
      };
    }
    if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
      return {
        icon: '🚫',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600',
        buttonColor: 'hover:bg-yellow-100'
      };
    }
    if (errorMessage.includes('network') || errorMessage.includes('chain')) {
      return {
        icon: '🌐',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600',
        buttonColor: 'hover:bg-blue-100'
      };
    }
    if (errorMessage.includes('install') || errorMessage.includes('wallet')) {
      return {
        icon: '👛',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-800',
        iconColor: 'text-purple-600',
        buttonColor: 'hover:bg-purple-100'
      };
    }
    // Default error style
    return {
      icon: '⚠️',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      buttonColor: 'hover:bg-red-100'
    };
  };

  const style = getErrorStyle(error);

  return (
    <div className={`${style.bgColor} ${style.borderColor} border rounded-lg p-4 mb-4 shadow-sm`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${style.iconColor} text-xl mr-3 mt-0.5`}>
          {style.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${style.textColor} mb-1`}>
            {error.includes('insufficient') ? 'Insufficient Balance' :
             error.includes('rejected') ? 'Transaction Cancelled' :
             error.includes('network') ? 'Network Issue' :
             error.includes('install') ? 'Wallet Required' :
             'Error Occurred'}
          </h3>
          <p className={`text-sm ${style.textColor} opacity-90 leading-relaxed`}>
            {error}
          </p>
          
          {/* Helpful suggestions */}
          {error.includes('insufficient') && (
            <div className={`mt-2 text-xs ${style.textColor} opacity-75`}>
              💡 Try getting testnet ETH from a faucet or reducing the transaction amount.
            </div>
          )}
          {error.includes('rejected') && (
            <div className={`mt-2 text-xs ${style.textColor} opacity-75`}>
              💡 You can try the transaction again when ready.
            </div>
          )}
          {error.includes('network') && (
            <div className={`mt-2 text-xs ${style.textColor} opacity-75`}>
              💡 Check your internet connection or try switching networks.
            </div>
          )}
          {error.includes('install') && (
            <div className={`mt-2 text-xs ${style.textColor} opacity-75`}>
              💡 Install MetaMask or Coinbase Wallet to continue.
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ml-2 p-1 rounded-full ${style.buttonColor} transition-colors`}
          title="Close"
        >
          <svg className={`w-4 h-4 ${style.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ErrorNotification;