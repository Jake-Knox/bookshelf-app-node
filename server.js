const express = require('express');
const http = require('http');
var path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const server = http.createServer(app);

app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// const { start } = require('repl');
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const { MongoClient, ServerApiVersion, Collection } = require('mongodb');
const { mongodbURI, secretKey } = require('./config.js');

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(mongodbURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
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
    res.status(401).json({ message: 'Unauthorized' });
  }
};


// Connect to the MongoDB server
client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
    const db = client.db('bookshelf-db');

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

    // check session
    app.post('/checkSession', (req, res) => {
      if (req.session.isLoggedIn) {
        res.json({ loggedIn: true });
      } else {
        res.json({ loggedIn: false });
      }
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
              res.status(200).json({ message: 'Authentication successful' });
              req.session.isLoggedIn = true;
              req.session.username = username;
              console.log('isLoggedIn:', req.session.isLoggedIn);
              console.log('username:', req.session.username);              // res.redirect('/profile');             
            } else {
              // Passwords do not match, authentication failed
              res.status(401).json({ message: 'Invalid username or password' });
            }
          });
        }
      });    
    });

    // 
    app.post('/getmybooks', (req, res) => {
      console.log("get my books request")
      let username = req.session.username

      console.log('isLoggedIn:', req.session.isLoggedIn);
      console.log('username:', req.session.username);

      if(req.session.isLoggedIn) {
        console.log("user logged in")

        // find the username in the books collection
        // send the shelf (and book) data back to the user
        db.collection('books').findOne({ username }, (err, user) => {
          if (err) {
            console.error('Error finding user:', err);
            res.sendStatus(500);
          } else if (!user) {
            res.status(401).json({ message: 'User not found' });
          } else {
              // User found, send data
              // res.status(200).json({ message: 'Authentication successful' });                
              console.log(user);
              res.json(user);
          }
        }); 
      }
      else {
        // Not logged in
        console.log("user not logged in")
        res.status(401).json({ message: 'User not logged in' });
      }         
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





// app.get('/profile', isAuthenticated, async (req, res) => {
//   try {
//     // Retrieve the user's data from the database
//     const userId = req.session.userId; // or however you store the user ID

//     // Query the database to retrieve user-specific data
//     const userData = await User.findById(userId)
//       .populate('shelves')
//       .populate({
//         path: 'shelves',
//         populate: {
//           path: 'books'
//         }
//       });

//     // Render the profile page and pass the user's data to the template
//     res.render('profile', { user: userData });
//   } catch (error) {
//     console.error('Error retrieving user data:', error);
//     res.sendStatus(500);
//   }
// });

