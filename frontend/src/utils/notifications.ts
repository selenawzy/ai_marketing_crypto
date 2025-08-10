// Utility functions for creating beautiful notifications

export const createNotification = (
  message: string, 
  type: 'success' | 'error' | 'warning' | 'info' = 'info',
  duration: number = 5000
) => {
  // Remove existing notifications
  const existing = document.querySelectorAll('.custom-notification');
  existing.forEach(el => el.remove());

  const notification = document.createElement('div');
  notification.className = 'custom-notification';
  
  const styles = {
    success: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      icon: '✅',
      borderColor: '#10b981'
    },
    error: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      icon: '❌',
      borderColor: '#ef4444'
    },
    warning: {
      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
      icon: '⚠️',
      borderColor: '#f59e0b'
    },
    info: {
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      icon: 'ℹ️',
      borderColor: '#3b82f6'
    }
  };

  const style = styles[type];

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${style.background};
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: system-ui, -apple-system, sans-serif;
    font-weight: 500;
    max-width: 400px;
    border-left: 4px solid ${style.borderColor};
    animation: slideInRight 0.3s ease-out;
    cursor: pointer;
    transform: translateZ(0);
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 4px;">
      <span style="font-size: 18px; margin-right: 8px;">${style.icon}</span>
      <strong style="color: white;">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
      <button onclick="this.parentNode.parentNode.remove()" style="margin-left: auto; background: transparent; border: none; color: white; cursor: pointer; font-size: 18px; padding: 2px 6px; border-radius: 50%; opacity: 0.7; hover: opacity: 1;">×</button>
    </div>
    <div style="font-size: 14px; opacity: 0.9; line-height: 1.4; color: white;">
      ${message}
    </div>
  `;

  document.body.appendChild(notification);

  // Auto-remove
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, duration);

  // Click to remove
  notification.addEventListener('click', () => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  });

  return notification;
};

// Specific notification functions
export const showSuccess = (message: string, duration?: number) => 
  createNotification(message, 'success', duration);

export const showError = (message: string, duration?: number) => 
  createNotification(message, 'error', duration);

export const showWarning = (message: string, duration?: number) => 
  createNotification(message, 'warning', duration);

export const showInfo = (message: string, duration?: number) => 
  createNotification(message, 'info', duration);

// CSS animations need to be added to the document
const addNotificationStyles = () => {
  if (document.getElementById('notification-styles')) return;

  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes fadeOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(20px);
      }
    }
    
    .custom-notification:hover {
      transform: scale(1.02);
      transition: transform 0.2s ease;
    }
  `;
  document.head.appendChild(style);
};

// Initialize styles when module loads
if (typeof document !== 'undefined') {
  addNotificationStyles();
}