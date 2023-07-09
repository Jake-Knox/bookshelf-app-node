const express = require('express');
const http = require('http');
var path = require('path');

const app = express();
const server = http.createServer(app);

// const { start } = require('repl');
app.use(express.static(path.join(__dirname, 'public')));

// start point
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/templates/index.html');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/login.html'));
});

app.get('/bookshelf', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/bookshelf.html'));
});

app.get('/crud', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/crud.html'));
});


const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});