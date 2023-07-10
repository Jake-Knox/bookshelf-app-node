const express = require('express');
const http = require('http');
var path = require('path');

const app = express();
const server = http.createServer(app);

// const { start } = require('repl');
app.use(express.static(path.join(__dirname, 'public')));


// Database setup
const { MongoClient, ServerApiVersion, Collection } = require('mongodb');
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

// Connect to the MongoDB server
client.connect()
  .then(() => {
    console.log('Connected to MongoDB');

    // Set up route handlers
    app.get('/books', (req, res) => {
      console.log("get books request");
      const db = client.db('bookshelf-db');
      const collection = db.collection('books');
      collection.find().toArray((err, books) => {
        if (err) {
          console.error('Error retrieving books:', err);
          res.sendStatus(500);
        } else {
          res.json(books);
        }
      });
    });

    // start server
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
   });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
~

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
  
//     app.get('/books', (req, res) => {

//       const collection = db.collection('books');
//       collection.find().toArray((err, books) => {
//       if (err) {
//         console.error('Error retrieving books:', err);
//         res.sendStatus(500);
//       } else {
//         res.json(books);
//       }
//       });
//     });


//     // start server
//     const port = process.env.PORT || 3000;
//     server.listen(port, () => {
//     console.log(`Server listening on port ${port}`);
// });
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);

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

