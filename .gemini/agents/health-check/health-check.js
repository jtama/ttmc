
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8081,
  path: '/',
  method: 'GET',
  timeout: 5000 // 5 seconds
};

console.log(`Attempting to connect to http://${options.hostname}:${options.port}...`);

const req = http.request(options, (res) => {
  if (res.statusCode >= 200 && res.statusCode < 300) {
    console.log(`✅ Success! Received status code: ${res.statusCode}. Application is responsive.`);
    process.exit(0);
  } else {
    console.error(`❌ Failure. Received status code: ${res.statusCode}.`);
    process.exit(1);
  }
});

req.on('timeout', () => {
  console.error('❌ Error: Connection timed out after 5 seconds. The application may be down or unresponsive.');
  req.destroy();
  process.exit(1);
});

req.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.error(`❌ Error: Connection refused. Is the application running on port ${options.port}?`);
  } else {
    console.error(`❌ An unexpected error occurred: ${err.message}`);
  }
  process.exit(1);
});

req.end();
