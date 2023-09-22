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
const { listenerCount } = require('stream');

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
        "privacy": "public",
        "following": [],
        "followers": [],
        "books": [],
        "shelves": [
          {
            "position": "0",
            "name": "Reading",
            "privacy": "public",
            "books": [],            
          },
          {
            "position": "1",
            "name": "To Be Read",
            "privacy": "public",
            "books": [],            
          },
          {
            "position": "2",
            "name": "Read",
            "privacy": "public",
            "books": [],            
          },
          {
            "position": "3",
            "name": "Hidden",
            "privacy": "private",
            "books": [],           
          },
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


    // 
    // TO BE REPLACED WITH 
    //
    // getUserBookshelf/:username
    //
    app.get('/getMyBookhelf', isAuthenticated, (req, res) => {
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

    app.get('/getUserBookshelf/:username', (req, res) => {
      // console.log("get any user books request - affected by privacy")
      const username = req.params.username;
      // console.log(`getUserBookshelf -${username}`);

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
            let userData = {
              username: user.username,              
              privacy: user.privacy,    
              following: [],   
              followers: [],  
              shelves: [], 
            }

            if(user.privacy == "public")
            {
              // console.log("profile is public");
              userData.following = user.following;
              userData.followers = user.followers;

              for(let i = 0; i < user.shelves.length; i++)
              {
                if(user.shelves[i].privacy == "public"){
                  userData.shelves.push(user.shelves[i]);
                }
              }            
            }
            else{
              // console.log("profile is private");
            }
            // for each shelf - only add public shelves to userData.shelves array
            
            res.status(200).json({ data: userData });
        }
      });                
    });




    // Using during developement
    // TO BE DELETED WHEN NOT NEEDED
    app.post('/editDatabase', isAuthenticated, (req, res) => {
    
      // used to edit db of whoeever is logged in
      const userName = req.session.username
      const { test, test2 } = req.body;
      console.log(`un:${userName}`);
      console.log(`test: ${test}, ${test2}`);

      // prep some book data
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

      // currecly makes a shelf with two books - adds it to users db record

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

 

    // add a book to user collecion

    // remove a book from user collection


    // add a user shelf

    // remove a user's shelf
    app.post('/removeShelf', isAuthenticated, (req, res) => {
      const userName = req.session.username
      const { removeShelfName } = req.body;
      console.log(`un:${userName}`);
      console.log(`remove shelf: ${removeShelfName}`);

      // const shelfName = "Test shelf name";

      //https://www.mongodb.com/docs/manual/reference/operator/update/unset/#mongodb-update-up.-unset
      db.collection('users').updateOne( 
        { username: userName },
        { $pull: { shelves: { name: removeShelfName } } }, //remove bookshelf by name
        (err, user) => {
          if (err) {
            console.error('Error deleting shelf:', err);
            res.sendStatus(500);
          } else if (!user) {
            console.log("user not found");
            res.status(401).json({ message: 'User not found' });
          } else { 
            // success
            
            console.log("Shelf deleted")            

            res.status(200).json({ message: 'remove successful' });
          }
        }
      );
    });


    // Think about this more
    // Should it be add/remove individual books 
    // Or update shelves based on all changes front end - less server calls

    // add book to shelf
    // remove book from shelf
    
    // update shelf

    app.get('/searchBooks/:search', isAuthenticated, (req, res) => {

      const searchTerm = req.params.search;
      console.log(`search term :${searchTerm}`);

      let searchData = [];

      if(searchTerm.length == 13 && isNumeric(searchTerm))
      {
        // enough tests to treat as an ISBN-13
        // conduct isbn search
        searchData = googleBooksSearchISBN(searchTerm);
        
      }
      else{
        // treat as a book name search
        searchData = googleBooksSearchTitle(searchTerm);
       
      }

      console.log("search data below -");      
      console.log(searchData);

      
      // send data back to user
      if(searchData.length != 0){
        // data found - send it back to user
        console.log("data found");
        res.status(200).json({ data: searchData }); 
      }
      else{
        // error, no data found - send error to user
        console.log("book data not found");
        res.status(401).json({ message: 'book data not found' });
      }
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

app.get('/registerPage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/register.html'));
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
app.get('/bookshelf/:username', async (req, res) => {

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

  let returnData = [];

  books.volumes.list({
    q: searchInput,
    maxResults: 1
  }, (err, response) => {
    if (err) {
      console.error('Error retrieving books:', err);
    } else {
      const books = response.data.items;
      // console.log(books);
      // return books;


      for (let i = 0; i < 1; i++) {
        const book = books[i];

        // console.log(book.volumeInfo);

        const bIsbn = book.volumeInfo.industryIdentifiers[0].identifier || 'Unknown';
        const bTitle = book.volumeInfo.title || 'Unknown';
        const bAuthor = book.volumeInfo.authors ? book.volumeInfo.authors[0] : 'Unknown';
        const bPublicationDate = book.volumeInfo.publishedDate || 'Unknown';
        const bPageCount = book.volumeInfo.pageCount || 'Unknown';
        let bThumbnail = "Uknown";
        try{
          bThumbnail = book.volumeInfo.imageLinks.thumbnail;
        }
        catch(err){
          bThumbnail = "Uknown";
          // console.error("no thumbnail:", err);
        }

        let newBookObj = {
          isbn: bIsbn,
          title: bTitle,
          author: bAuthor,
          publicationDate: bPublicationDate,
          pageCount: bPageCount,
          thumbnail: bThumbnail
        };

        // console.log("newBookObj:")
        // console.log(newBookObj);
        
        returnData.push(newBookObj);

        console.log("returnData 1:")
        console.log(returnData);

        return returnData;
      }
      
    }
  });

  // console.log("returnData 2:")
  // console.log(returnData);

}



const googleBooksSearchISBN = (searchInput) => {  

  let returnData = [];

  books.volumes.list({
    q: searchInput,
    maxResults: 1
  }, (err, response) => {
    if (err) {
      console.error('Error retrieving books:', err);
    } 
    else 
    {

      const books = response.data.items;
      // console.log(books);

      const book = books[0];
     
      const bIsbn = book.volumeInfo.isbn || 'Unknown';
      const bTitle = book.volumeInfo.title || 'Unknown';
      const bAuthor = book.volumeInfo.authors ? book.volumeInfo.authors[0] : 'Unknown';
      const bPublicationDate = book.volumeInfo.publishedDate || 'Unknown';
      const bPageCount = book.volumeInfo.pageCount || 'Unknown';
      let bThumbnail = "Uknown";
      try{
        bThumbnail = book.volumeInfo.imageLinks.thumbnail;
      }
      catch(err){
        bThumbnail = "Uknown";
        // console.error("no thumbnail:", err);
      }

      let newBookObj = {
        isbn: bIsbn,
        title: bTitle,
        author: bAuthor,
        publicationDate: bPublicationDate,
        pageCount: bPageCount,
        thumbnail: bThumbnail
      };

      //console.log(newBookObj);
        
      returnData.push(newBookObj);
      // console.log(returnData);

    }
  });

  console.log(returnData);
  return returnData;

}

const isNumeric = (value) => {
  return /^\d+$/.test(value);
}