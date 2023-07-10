const express = require('express');
const http = require('http');
var path = require('path');

const app = express();
const server = http.createServer(app);

// Database setup
const { MongoClient, ServerApiVersion } = require('mongodb');
const { mongodbURI } = require('./config.js');
console.log(mongodbURI);
// needs a url in format...
// const uri = "mongodb+srv://admin:<password>@bookshelf-db.lbirmpy.mongodb.net/?retryWrites=true&w=majority";


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(mongodbURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


// const { start } = require('repl');
app.use(express.static(path.join(__dirname, 'public')));


// Routes
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


// start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});