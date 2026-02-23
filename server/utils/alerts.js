const alerts = [];

function getAlerts() {
  return alerts;
}

function addAlert(alert) {
  alerts.push(alert);
}

module.exports = { alerts, getAlerts, addAlert };
