const express = require('express');
const http = require('http');
var path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const server = http.createServer(app);

const { google } = require('googleapis');

app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// const { start } = require('repl');
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const { MongoClient, ServerApiVersion, Collection } = require('mongodb');
const { secretKey, mongodbURI, googleBooksKey } = require('./config.js');

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(mongodbURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// setting up google books api connection
const books = google.books({
  version: 'v1',
  auth: googleBooksKey
});

// Set up session middleware
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 60 * 60 * 1000, // 1 hr
  },
}));

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.isLoggedIn) {
    console.log("logged in true")
    next();
  } else {
    console.log("not logged in")
    res.sendFile(path.join(__dirname, 'public/templates/login.html'));
    // res.status(401).json({ message: 'Unauthorized' });
  }
};


// Connect to the MongoDB server
client.connect()
  .then(() => {

    // all of this code is kept inside the db connection so that the site doesn't have to reconnect. Inefficient?

    console.log('Connected to MongoDB');
    const db = client.db('bookshelf-db');

    // Set up database route handlers
    app.get('/books', (req, res) => {
      // console.log("books request");
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

    

    // login using username and password eg. admin/password123
    app.post('/login', (req, res) => {
      const { username, password } = req.body;
      // Find the user with the given username in the users collection
      db.collection('users').findOne({ username }, (err, user) => {
        if (err) {
          console.error('Error finding user:', err);
          res.sendStatus(500);
        } else if (!user) {
          res.status(401).json({ message: 'User not found' });
        } else {
          // Compare the provided password with the hashed password stored in the user object
          bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
              console.error('Error comparing passwords:', err);
              res.sendStatus(500);
            } else if (result) {
              // Passwords match, authentication successful
              req.session.isLoggedIn = true;
              req.session.username = username;
              console.log('isLoggedIn:', req.session.isLoggedIn);
              console.log('username:', req.session.username);              // res.redirect('/profile');     
              res.status(200).json({ message: 'Authentication successful' });        
            } else {
              // Passwords do not match, authentication failed
              res.status(401).json({ message: 'Invalid username or password' });
            }
          });
        }
      });    
    });

    // 
    app.post('/getmybooks', isAuthenticated, (req, res) => {
      console.log("get my books request")

      let username = req.session.username
     
      // find the username in the books collection
      // send the shelf (and book) data back to the user
      db.collection('users').findOne({ username }, (err, user) => {
        if (err) {
          console.error('Error finding user:', err);
          res.sendStatus(500);
        } else if (!user) {
          console.log("user not found");
          res.status(401).json({ message: 'User not found' });
        } else {
            // User found, send data
            // console.log("data found");
            // console.log(user);
            
            const userData = {
              username: user.username,
              following: user.following,
              followers: user.followers,
              books: user.books,
              shelves: user.shelves,
            }

            res.status(200).json({ data: userData });
        }
      });                
    });

    app.get('/addbook/:isbn', isAuthenticated, (req, res) => {
      const userName = req.params.username;
    
      // look through this, there is a lot to do here.

      // book data is already searched on from front end
      // so no need to search google again
      // make sure front end sends data back if possible/ not to inefficient

      // db.collection('users').findOne({ username }, (err, user) => {
      //   if (err) {
      //     console.error('Error finding user:', err);
      //     res.sendStatus(500);
      //   } else if (!user) {
      //     console.log("user not found");
      //     res.status(401).json({ message: 'User not found' });
      //   } else {
      //       // User found, send data
      //       console.log("data found");
      //       res.status(200).json({ data: user }); 
      //   }
      // });  

      // https://www.penguin.co.uk/books/55906/persuasion-by-jane-austen-intro-and-notes-gillian-beer/9780141439686

      // prep the book data
      const newBook = {
        title: "Persuasion",
        author: "Jane Austen",
        publicationDate: "2003",
        pageCount: "288",
        thumbnail: "https://cdn.penguin.co.uk/dam-assets/books/9780141439686/9780141439686-jacket-large.jpg",
      }

      db.collection('users').updateOne( 
        { username: userName },
        { $push: { books: newBook } }
      );

    });

    app.get('/users/:username', isAuthenticated, (req, res) => {
      const username = req.params.username;
    
      // Find the user based on the provided username
      db.collection('users').findOne({ username }, (err, user) => {
        if (err) {
          console.error('Error finding user:', err);
          res.sendStatus(500);
        } else if (!user) {
          console.log("user not found");
          res.status(401).json({ message: 'User not found' });
        } else {
            // User found, send data
            console.log("data found");
            res.status(200).json({ data: user }); 
        }
      });                
    });



    // register new user - using UN + PW + boiler plate data
    app.post('/register', (req, res) => {
      const { username, password } = req.body;

      // Hash the password using bcrypt
      bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
      console.error('Error hashing password:', err);
      res.sendStatus(500);
      } else {
      // Create a new user object
      const user = {
        "username": username,
        "password": hashedPassword,
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
      }     
      });
    });

    // check that this works
    app.delete('/books/:isbn', (req, res) => {
      const isbn = req.params.isbn;
      console.log("book delete request. ISBN:", isbn);

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

    // Set up database route handlers
    app.get('/books', (req, res) => {
      console.log("books request");
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

    // test to search google for books by title input

    // googleBooksSearchTitle("Pride and Prejudice");
    // googleBooksSearchISBN("9780141439686") // persuasion - austen // doesn't use any '-'

    
    // start server - after db connection
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
   });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
  


// Routes
// start point
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/templates/index.html');
});

app.get('/loginPage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/login.html'));
});

app.get('/bookshelf', isAuthenticated, (req, res) => {    
  res.sendFile(path.join(__dirname, 'public/templates/bookshelf.html'));
});

app.get('/crud', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/crud.html'));
});

app.get('/profile', isAuthenticated, async (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/profile.html'));
});

// check session
app.post('/checkSession', (req, res) => {
  if (req.session.isLoggedIn) {
    res.status(200).json({ message: 'logged in', un: req.session.username });
  } else {
    res.status(200).json({ message: 'not logged in' });
  }
});


// Google Books API searches

const googleBooksSearchTitle = (searchInput) => {  

  books.volumes.list({
    q: searchInput,
    maxResults: 5
  }, (err, response) => {
    if (err) {
      console.error('Error retrieving books:', err);
    } else {
      const books = response.data.items;
      // console.log(books);
      // return books;

      for (let i = 0; i < 5; i++) {
        const book = books[i];

        // try{
        //   const thumbnail = book.volumeInfo.imageLinks.thumbnail;
        //   console.log("thumbnail:", thumbnail);
        // }
        // catch(err){
        //   console.error("no thumbnail:", err);
        // }

        // Retrieve the author, publication date, and page count
        const title = book.volumeInfo.title || 'Unknown';
        const author = book.volumeInfo.authors ? book.volumeInfo.authors[0] : 'Unknown';
        const publicationDate = book.volumeInfo.publishedDate || 'Unknown';
        const pageCount = book.volumeInfo.pageCount || 'Unknown';
        let thumbnail = "Uknown";
        try{
          thumbnail = book.volumeInfo.imageLinks.thumbnail;
        }
        catch(err){
          console.error("no thumbnail:", err);
        }

        console.log("title:", title);
        console.log("author:", author);
        console.log("publicationDate:", publicationDate);
        console.log("pageCount:", pageCount);
        console.log("thumbnail:", thumbnail);


        console.log(".");
        // console.log(book.volumeInfo);
        console.log(".");
        
      }
    }
  });
}

const googleBooksSearchISBN = (searchInput) => {  

  books.volumes.list({
    q: searchInput,
    maxResults: 1
  }, (err, response) => {
    if (err) {
      console.error('Error retrieving books:', err);
    } else {
      const books = response.data.items;
      // console.log(books);

      const book = books[0];

      // Retrieve the author, publication date, and page count
      const title = book.volumeInfo.title || 'Unknown';
      const author = book.volumeInfo.authors ? book.volumeInfo.authors[0] : 'Unknown';
      const publicationDate = book.volumeInfo.publishedDate || 'Unknown';
      const pageCount = book.volumeInfo.pageCount || 'Unknown';
      let thumbnail = "Uknown";
      try{
        thumbnail = book.volumeInfo.imageLinks.large;
      }
      catch(err){
        console.error("no thumbnail:", err);
      }

      console.log("title:", title);
      console.log("author:", author);
      console.log("publicationDate:", publicationDate);
      console.log("pageCount:", pageCount);
      console.log("thumbnail:", thumbnail);

      console.log(".");
      // console.log(book.volumeInfo);
      console.log(".");

    }
  });
}