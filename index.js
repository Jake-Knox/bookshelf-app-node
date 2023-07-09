const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Determine the file path of the requested file
  const filePath = path.join(__dirname, 'index.html');

  // Read the content of the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If an error occurs while reading the file, respond with a 500 status code and an error message
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    } else {
      // If the file is successfully read, respond with the file content and set the appropriate Content-Type
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    }
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
