const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

http.createServer((req, res) => {
  let filePath = path.join(__dirname, decodeURIComponent(req.url.split('?')[0]));
  if (filePath === path.join(__dirname, '/') || filePath === __dirname) {
    filePath = path.join(__dirname, 'login.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}).listen(8080, () => {
  console.log('Servidor rodando em http://localhost:8080/login.html');
});
