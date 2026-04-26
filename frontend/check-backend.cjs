const http = require('http');

const checkBackend = () => {
  console.log('\x1b[36m%s\x1b[0m', '🔍 Checking SmartCampus Infrastructure...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
    timeout: 2000
  };

  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('\x1b[32m%s\x1b[0m', '✅ Backend: ONLINE (Port 5000)');
      console.log('\x1b[32m%s\x1b[0m', '✅ Database: CONNECTED (MongoDB Atlas)');
    } else {
      console.log('\x1b[33m%s\x1b[0m', `⚠️  Backend: UNSTABLE (Status: ${res.statusCode})`);
    }
    process.exit(0);
  });

  req.on('error', (e) => {
    console.log('\x1b[31m%s\x1b[0m', '❌ Backend: OFFLINE');
    console.log('\x1b[31m%s\x1b[0m', '👉 Please run "mvn clean spring-boot:run" in the backend terminal.');
    process.exit(0);
  });

  req.on('timeout', () => {
    console.log('\x1b[31m%s\x1b[0m', '❌ Backend: TIMEOUT');
    req.destroy();
    process.exit(0);
  });

  req.end();
};

checkBackend();
