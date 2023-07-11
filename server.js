const express = require('express');
const http = require('http');
var path = require('path');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// const { start } = require('repl');
app.use(express.static(path.join(__dirname, 'public')));


// Database setup
const { MongoClient, ServerApiVersion, Collection } = require('mongodb');
const { mongodbURI } = require('./config.js');
// console.log(mongodbURI);
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
    const db = client.db('bookshelf-db');

    // Set up database route handlers
    app.get('/books', (req, res) => {
      console.log("get books request");
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

    // register new user - using UN + PW + boiler plate data
    app.post('/register', (req, res) => {
      const { username, password } = req.body;
    
      // Create a new user object
      const user = {
        "username": username,
        "password": password,
        "following": [],
        "followers": [],
        "books": [],
        "shelves": [
          {
            "name": "To be read",
            "books": [],
          },
          {
            "name": "Hidden",
            "books": [],
          }
        ]
      };
    
      // Insert the new user into the users collection
      db.collection('users').insertOne(user, (err, result) => {
        if (err) {
          console.error('Error adding user:', err);
          res.sendStatus(500);
        } else {
          console.log('New user added:', result.insertedId);
          res.sendStatus(201);
        }
      });
    });


    // check that this works
    app.delete('/books/:isbn', (req, res) => {
      const isbn = req.params.isbn;
      const db = client.db('bookshelf-db');
      const collection = db.collection('books');      
      // Delete the book entry based on the ISBN
      collection.deleteOne({ isbn: isbn }, (err, result) => {
        if (err) {
          console.error('Error deleting book:', err);
          res.sendStatus(500);
        } else {
          console.log('Book deleted successfully');
          res.sendStatus(200);
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

app.get('/loginPage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/login.html'));
});

app.get('/bookshelf', (req, res) => {
  // const user = req.params.user;
  // res.
  res.sendFile(path.join(__dirname, 'public/templates/bookshelf.html'));
});

app.get('/crud', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/crud.html'));
});

