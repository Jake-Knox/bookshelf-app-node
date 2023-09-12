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

// for ejs template stuff
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/templates'));

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
    // console.log("is logged in: true");
    next();
  } else {
    // console.log("is logged in: false");
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
              console.log('username:', req.session.username);              
              res.status(200).json({ message: 'Authentication successful' });
              // res.redirect('/profile'); // redirected from login.js       
            } else {
              // Passwords do not match, authentication failed
              res.status(401).json({ message: 'Invalid username or password' });
            }
          });
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


    app.post('/getUserBookshelf/:username', isAuthenticated, (req, res) => {
      // console.log("get any user books request - affected by privacy")
      const username = req.params.username;

      // Remember to change database entries to account for privacy options
      // REMEMBER CHECKS FOR PRIVACY

      db.collection('users').findOne({ username }, (err, user) => {
        if (err) {
          console.error('Error finding user:', err);
          res.sendStatus(500);
        } else if (!user) {
          console.log("user not found");
          res.status(401).json({ message: 'User not found' });
        } else {
            // User found, send data
            
            const userData = {
              username: user.username,
              following: user.following, // add checks for profile privacy
              followers: user.followers, //
              // books: user.books, // don't pull books, only bookshelves
              shelves: user.shelves, // add checks for individual shelf privacy
            }

            res.status(200).json({ data: userData });
        }
      });                
    });

    // 
    // TO BE REPLACED WITH 
    //
    // getUserBookshelf/:username
    //
    app.post('/getmybooks', isAuthenticated, (req, res) => {
      // console.log("get my books request")

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

    app.post('/removeShelf', isAuthenticated, (req, res) => {
      const userName = req.session.username
      const { removeShelfName } = req.body;
      console.log(`un:${userName}`);
      console.log(`remove: ${removeShelfName}`);

      const shelfName = "Test shelf name";

      //https://www.mongodb.com/docs/manual/reference/operator/update/unset/#mongodb-update-up.-unset
      db.collection('users').updateOne( 
        { username: userName },
        { $pull: { shelves: { name: shelfName } } }, //remove bookshelf by name
        (err, user) => {
          if (err) {
            console.error('Error finding user:', err);
            res.sendStatus(500);
          } else if (!user) {
            console.log("user not found");
            res.status(401).json({ message: 'User not found' });
          } else { 
            // success
            
            console.log("array item deleted")            

            res.status(200).json({ message: 'remove successful' });
          }
        }
      );
    });

    

    app.post('/editDatabase', isAuthenticated, (req, res) => {
    
      // used to edit db of whoeever is logged in
      const userName = req.session.username

      const { test, test2 } = req.body;


      console.log(`un:${userName}`);

      console.log(`test: ${test}, ${test2}`);


      // prep the book data

      const newBook = {
        isbn: "9780141439686",
        title: "Persuasion",
        author: "Jane Austen",
        facing: "front",
        publicationDate: "2003",
        pageCount: "288",
        thumbnail: "https://cdn.penguin.co.uk/dam-assets/books/9780141439686/9780141439686-jacket-large.jpg",
      }

      const newBook2 = {
        isbn: "9780141182674",
        title: "On the Road",
        author: "Jack Kerouac",
        facing: "front",
        publicationDate: "2000",
        pageCount: "320",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1605112490i/2552.jpg",
      }

      const newShelf = {
        position: "0",
        visibilty: "visible",
        name: "Reading",
        books: [ newBook, newBook2 ]
      }

      // https://www.w3schools.com/nodejs/nodejs_mongodb_update.asp
      db.collection('users').updateOne( 
        { username: userName },
        { $push: { shelves: newShelf } }, 
        (err, user) => {
          if (err) {
            console.error('Error finding user:', err);
            res.sendStatus(500);
          } else if (!user) {
            console.log("user not found");
            res.status(401).json({ message: 'User not found' });
          } else { 
            // success?

            console.log("book added to user books array")
            
            console.log(user);

            res.status(200).json({ message: 'add successful' });
          }
        }
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

  let urlUsername = req.session.username;

  // Redirect to the user-specific bookshelf route
  res.redirect(`/bookshelf/${urlUsername}`);
});

app.get('/crud', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/crud.html'));
});

app.get('/profile', isAuthenticated, async (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/profile.html'));
});

// test for user generic pages
app.get('/bookshelf/:username', isAuthenticated, async (req, res) => {

  const urlUsername = req.params.username;
  const loggedInUsername = req.session.username; 

  let userData = "error";

  if (urlUsername === loggedInUsername) {
    // User is viewing their own bookshelf
    userData = "My bookshelf"


    // send them editable page
    res.render('myBookshelf', { username: urlUsername, data: userData });
  } else {
    // User is viewing someone else's bookshelf
    userData = "Someone elses bookshelf"


    // send them read-only page
    res.render('otherBookshelf', { username: urlUsername, data: userData });
  }

  // remove this when different pages are made
  // res.render('user', { username: urlUsername, data: userData });

});

const getUserData = () => {
  const userData = {
    "a": ["one", "two"],
    "b": ["three", "four"],
  }
  return userData;
}


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
        // const title = book.volumeInfo.title || 'Unknown'; // ISBN
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
      // const title = book.volumeInfo.title || 'Unknown'; // ISBN
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