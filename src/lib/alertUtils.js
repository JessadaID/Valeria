import { writable } from 'svelte/store';

// Alert store to manage multiple global alerts
export const alertStore = writable([]);

// Helper function to show alerts
function showAlert(message, type = 'info', options = {}) {
  const defaultOptions = {
    duration: 4000,
    position: 'bottom-center',
    showIcon: true,
    closeable: true
  };
  
  const alertOptions = { ...defaultOptions, ...options };
  
  const newAlert = {
    id: crypto.randomUUID(),
    message,
    type,
    visible: true,
    timestamp: Date.now(),
    ...alertOptions
  };
  
  alertStore.update(alerts => [...alerts, newAlert]);
  return newAlert.id;
}

// Helper function to remove an alert
function removeAlert(alertId) {
  alertStore.update(alerts => alerts.filter(alert => alert.id !== alertId));
}

// Convenience functions for different alert types
export const alerts = {
  // Success alert
  success: (message, options = {}) => {
    return showAlert(message, 'success', options);
  },
  
  // Warning alert
  warning: (message, options = {}) => {
    return showAlert(message, 'warning', options);
  },
  
  // Error alert
  error: (message, options = {}) => {
    return showAlert(message, 'error', options);
  },
  
  // Info alert
  info: (message, options = {}) => {
    return showAlert(message, 'info', options);
  },
  
  // Hide specific alert by ID
  hide: (alertId) => {
    if (alertId) {
      removeAlert(alertId);
    }
  },
  
  // Hide all alerts
  hideAll: () => {
    alertStore.set([]);
  },
  
  // Remove alert by ID
  remove: (alertId) => {
    removeAlert(alertId);
  },
  
  // Clear all alerts
  clear: () => {
    alertStore.set([]);
  },
  
  // Custom alert with full control
  custom: (message, type, options = {}) => {
    return showAlert(message, type, options);
  }
};

// Backward compatibility - simple functions
export function successAlert(message, duration = 4000) {
  return alerts.success(message, { duration });
}

export function warningAlert(message, duration = 4000) {
  return alerts.warning(message, { duration });
}

export function errorAlert(message, duration = 4000) {
  return alerts.error(message, { duration });
}

export function infoAlert(message, duration = 4000) {
  return alerts.info(message, { duration });
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

// Batch operations for showing multiple alerts
export const batch = {
  // Show multiple alerts with delay between each
  sequence: (alertsArray, delay = 200) => {
    const alertIds = [];
    alertsArray.forEach((alertConfig, index) => {
      setTimeout(() => {
        const id = showAlert(
          alertConfig.message,
          alertConfig.type || 'info',
          alertConfig.options || {}
        );
        alertIds.push(id);
      }, index * delay);
    });
    return alertIds;
  },
  
  // Show multiple alerts immediately
  immediate: (alertsArray) => {
    const alertIds = [];
    alertsArray.forEach(alertConfig => {
      const id = showAlert(
        alertConfig.message,
        alertConfig.type || 'info',
        alertConfig.options || {}
      );
      alertIds.push(id);
    });
    return alertIds;
  }
};