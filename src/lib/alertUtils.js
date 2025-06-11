import { writable } from 'svelte/store';

// Alert store to manage global alerts
export const alertStore = writable({
  message: '',
  type: 'info',
  visible: false,
  duration: 4000,
  position: 'bottom-center',
  showIcon: true,
  closeable: true
});

// Helper function to show alerts
function showAlert(message, type = 'info', options = {}) {
  const defaultOptions = {
    duration: 4000,
    position: 'bottom-center',
    showIcon: true,
    closeable: true
  };
  
  const alertOptions = { ...defaultOptions, ...options };
  
  alertStore.set({
    message,
    type,
    visible: true,
    ...alertOptions
  });
}

// Convenience functions for different alert types
export const alerts = {
  // Success alert
  success: (message, options = {}) => {
    showAlert(message, 'success', options);
  },
  
  // Warning alert
  warning: (message, options = {}) => {
    showAlert(message, 'warning', options);
  },
  
  // Error alert
  error: (message, options = {}) => {
    showAlert(message, 'error', options);
  },
  
  // Info alert
  info: (message, options = {}) => {
    showAlert(message, 'info', options);
  },
  
  // Hide current alert
  hide: () => {
    alertStore.update(alert => ({ ...alert, visible: false, message: '' }));
  },
  
  // Custom alert with full control
  custom: (message, type, options = {}) => {
    showAlert(message, type, options);
  }
};

// Backward compatibility - simple functions
export function successAlert(message, duration = 4000) {
  alerts.success(message, { duration });
}

export function warningAlert(message, duration = 4000) {
  alerts.warning(message, { duration });
}

export function errorAlert(message, duration = 4000) {
  alerts.error(message, { duration });
}

export function infoAlert(message, duration = 4000) {
  alerts.info(message, { duration });
}

// Toast-style alerts (short duration, top position)
export const toast = {
  success: (message) => alerts.success(message, { duration: 2000, position: 'top-center' }),
  warning: (message) => alerts.warning(message, { duration: 2000, position: 'top-center' }),
  error: (message) => alerts.error(message, { duration: 2000, position: 'top-center' }),
  info: (message) => alerts.info(message, { duration: 2000, position: 'top-center' })
};

// Notification-style alerts (longer duration, with close button)
export const notify = {
  success: (message) => alerts.success(message, { duration: 6000, position: 'top-right' }),
  warning: (message) => alerts.warning(message, { duration: 6000, position: 'top-right' }),
  error: (message) => alerts.error(message, { duration: 0, position: 'top-right' }), // No auto-hide for errors
  info: (message) => alerts.info(message, { duration: 6000, position: 'top-right' })
};