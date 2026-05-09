import { writable } from 'svelte/store';

export const alertStore = writable([]);

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


function removeAlert(alertId) {
  alertStore.update(alerts => alerts.filter(alert => alert.id !== alertId));
}


export const alerts = {

  success: (message, options = {}) => {
    return showAlert(message, 'success', options);
  },


  warning: (message, options = {}) => {
    return showAlert(message, 'warning', options);
  },


  error: (message, options = {}) => {
    return showAlert(message, 'error', options);
  },


  info: (message, options = {}) => {
    return showAlert(message, 'info', options);
  },


  hide: (alertId) => {
    if (alertId) {
      removeAlert(alertId);
    }
  },


  hideAll: () => {
    alertStore.set([]);
  },


  remove: (alertId) => {
    removeAlert(alertId);
  },


  clear: () => {
    alertStore.set([]);
  },


  custom: (message, type, options = {}) => {
    return showAlert(message, type, options);
  }
};


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


export const toast = {
  success: (message) => alerts.success(message, { duration: 2000, position: 'top-center' }),
  warning: (message) => alerts.warning(message, { duration: 2000, position: 'top-center' }),
  error: (message) => alerts.error(message, { duration: 2000, position: 'top-center' }),
  info: (message) => alerts.info(message, { duration: 2000, position: 'top-center' })
};


export const notify = {
  success: (message) => alerts.success(message, { duration: 6000, position: 'top-right' }),
  warning: (message) => alerts.warning(message, { duration: 6000, position: 'top-right' }),
  error: (message) => alerts.error(message, { duration: 0, position: 'top-right' }),
  info: (message) => alerts.info(message, { duration: 6000, position: 'top-right' })
};


export const batch = {

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