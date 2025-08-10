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
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        textColor: 'text-orange-300',
        iconColor: 'text-orange-400',
        buttonColor: 'hover:bg-orange-500/20'
      };
    }
    if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
      return {
        icon: '🚫',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        textColor: 'text-yellow-300',
        iconColor: 'text-yellow-400',
        buttonColor: 'hover:bg-yellow-500/20'
      };
    }
    if (errorMessage.includes('network') || errorMessage.includes('chain')) {
      return {
        icon: '🌐',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        textColor: 'text-blue-300',
        iconColor: 'text-blue-400',
        buttonColor: 'hover:bg-blue-500/20'
      };
    }
    if (errorMessage.includes('install') || errorMessage.includes('wallet')) {
      return {
        icon: '👛',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
        textColor: 'text-purple-300',
        iconColor: 'text-purple-400',
        buttonColor: 'hover:bg-purple-500/20'
      };
    }
    // Default error style
    return {
      icon: '⚠️',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-300',
      iconColor: 'text-red-400',
      buttonColor: 'hover:bg-red-500/20'
    };
  };

  const style = getErrorStyle(error);

  return (
    <div className={`${style.bgColor} ${style.borderColor} border rounded-lg p-4 mb-4 shadow-lg backdrop-blur-sm`}>
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