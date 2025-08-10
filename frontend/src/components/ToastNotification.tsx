import React, { useEffect } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastNotificationProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const getToastStyle = (type: string) => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
          border: 'border-green-400'
        };
      case 'warning':
        return {
          icon: '⚠️',
          bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          border: 'border-yellow-400'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
          border: 'border-blue-400'
        };
      default: // error
        return {
          icon: '❌',
          bg: 'bg-gradient-to-r from-red-500 to-pink-500',
          border: 'border-red-400'
        };
    }
  };

  const style = getToastStyle(toast.type);

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full
      ${style.bg} text-white p-4 rounded-lg shadow-lg border ${style.border}
      transform transition-all duration-300 ease-in-out
      animate-slide-in-right
    `}>
      <div className="flex items-start">
        <span className="text-xl mr-3 mt-0.5">{style.icon}</span>
        <div className="flex-1">
          <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Toast container component
interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          style={{ 
            transform: `translateY(${index * 10}px)`,
            zIndex: 1000 - index 
          }}
        >
          <ToastNotification toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration?: number) => {
    const id = Date.now().toString();
    const toast = { id, message, type, duration };
    setToasts(prev => [...prev, toast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
};

export default ToastNotification;