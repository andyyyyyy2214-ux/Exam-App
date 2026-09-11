require('dotenv').config();
const os = require('os');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Detect local LAN IP for cross-device mobile testing
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

// Bind to 0.0.0.0 so mobile devices on the same Wi-Fi can connect
const server = app.listen(PORT, '0.0.0.0', () => {
  const lanIP = getLocalIP();
  console.log(`===================================================`);
  console.log(`🚀 Online Exam Auto-Grading Server running!`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`---------------------------------------------------`);
  console.log(`🖥️  Local:   http://localhost:${PORT}`);
  if (lanIP) {
    console.log(`📱 Mobile:  http://${lanIP}:${PORT}`);
    console.log(`📱 API URL: http://${lanIP}:${PORT}/api/v1`);
  }
  console.log(`🩺 Health:  http://localhost:${PORT}/health`);
  console.log(`===================================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed cleanly.');
  });
});
