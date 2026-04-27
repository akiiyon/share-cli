const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();

  // 🔥 PRIORITY: Wi-Fi interface
  if (interfaces['Wi-Fi']) {
    for (let iface of interfaces['Wi-Fi']) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }

  // 🔁 Fallback: any valid LAN IP (excluding ZeroTier)
  for (let name in interfaces) {
    if (name.toLowerCase().includes('zerotier')) continue;

    for (let iface of interfaces[name]) {
      if (
        iface.family === 'IPv4' &&
        !iface.internal &&
        iface.address.startsWith('192.168.')
      ) {
        return iface.address;
      }
    }
  }

  return '127.0.0.1';
}

module.exports = { getLocalIP };