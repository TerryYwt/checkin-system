const http = require('http');

// Try connecting to the internal service
const targetService = process.env.TARGET_SERVICE || 'checkin-system-backend';
const targetPort = process.env.TARGET_PORT || '3000';
const targetPath = process.env.TARGET_PATH || '/api/health';

const options = {
  hostname: `${targetService}.zeabur.internal`,
  port: targetPort,
  path: targetPath,
  method: 'GET',
  timeout: 5000
};

console.log(`Attempting to connect to ${options.hostname}:${options.port}${options.path}...`);

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`BODY: ${data}`);
    console.log('Connection successful!');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
  console.log('Connection failed. Make sure the target service is running and available in the Zeabur internal network.');
});

req.on('timeout', () => {
  console.error('Request timed out');
  req.destroy();
});

req.end();

// Create a simple server to keep the service running
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    status: 'ok',
    message: 'Zeabur internal network test service is running',
    timestamp: new Date().toISOString()
  }));
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Test server running on port ${port}`);
}); 