const express = require('express');
const http = require('http');
var path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');

// const ObjectID = require('mongodb').ObjectID;
const { ObjectId } = require('mongodb');

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
    maxAge: 1 * 60 * 60 * 1000, // 1 hr time until timeout
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

const isNumeric = (value) => {
  return /^\d+$/.test(value);
}

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

    // logout
    app.post('/logout', (req, res) => {
      const username = req.session.username
      console.log(`${username} logging out`);

      req.session.isLoggedIn = false;
      req.session.username = undefined;
      res.status(200).json({ message: 'Logout successful' });

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
                "_id": ObjectId(),
                "order": 0,
                "name": "Reading",
                "privacy": "public",
                "books": [],
              },
              {
                "_id": ObjectId(),
                "order": 1,
                "name": "To Be Read",
                "privacy": "public",
                "books": [],
              },
              {
                "_id": ObjectId(),
                "order": 2,
                "name": "Read",
                "privacy": "public",
                "books": [],
              },
              {
                "_id": ObjectId(),
                "order": 3,
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

          if (user.privacy == "public") {
            // console.log("profile is public");
            userData.following = user.following;
            userData.followers = user.followers;

            for (let i = 0; i < user.shelves.length; i++) {
              if (user.shelves[i].privacy == "public") {
                userData.shelves.push(user.shelves[i]);
              }
            }
          }
          else {
            // console.log("profile is private");
          }
          // for each shelf - only add public shelves to userData.shelves array

          res.status(200).json({ data: userData });
        }
      });
    });


    app.get('/userAFollowingB/:username', async (req, res) => {
      const userA = req.session.username;
      const userB = req.params.username

      let isAFollowingB = false;
      if (userA) {
        isAFollowingB = await userAFollowingB(userA, userB);
      }
      else {
        // not logged in
      }
      res.status(200).json({ data: isAFollowingB });
    });

    const userAFollowingB = async (userA, userB) => {
      let contains = false;
      // Fetch the user document
      const user = await db.collection('users').findOne({ username: userA });
      if (!user) {
        console.log("user not found");
        return contains;
      }
      else {
        console.log("user found");
        if (user.following.includes(userB)) {
          console.log("follow found");
          contains = true;
        }
        else {
          console.log("follow not found");
        }
      }
      return contains;
    }



    app.get('/getFollows/:username', (req, res) => {
      // username on page - get their following/followers
      const username = req.params.username;

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
          }
          if (user.privacy == "public") {
            // console.log("profile is public");
            userData.following = user.following;
            userData.followers = user.followers;

            for (let i = 0; i < user.shelves.length; i++) {
              if (user.shelves[i].privacy == "public") {
                userData.shelves.push(user.shelves[i]);
              }
            }
          }
          else {
            // private
          }
          res.status(200).json({ data: userData });
        }
      });
    });

    app.post('/followShelf', isAuthenticated, (req, res) => {
      const userName = req.session.username;
      const followName = req.body.followUser;

      // 2 parts
      // add username to followName's followers
      // add followName to username's following
      console.log(`user ${userName} will now follow ${followName}`);

      // add username to followName's followers list
      db.collection('users').updateOne(
        { username: userName },
        { $push: { following: followName } },
        (err, user) => {
          if (err) {
            console.error('Error finding user:', err);
            res.sendStatus(500);
          } else if (!user) {
            console.log("user not found");
            res.status(401).json({ message: 'User not found' });
          } else {
            // success
            console.log("other-user added to user following")
            // res.status(200).json({ message: 'add successful' });
          }
        }
      );

      // add username to followName's followers list
      db.collection('users').updateOne(
        { username: followName },
        { $push: { followers: userName } },
        (err, user) => {
          if (err) {
            console.error('Error finding user:', err);
            res.sendStatus(500);
          } else if (!user) {
            console.log("user not found");
            res.status(401).json({ message: 'User not found' });
          } else {
            // success
            console.log("user added to other-user followers")
            // res.status(200).json({ message: 'add successful' });
          }
        }
      );
      console.log("following and follower added");
      res.status(200).json({ message: 'add successful' });
    });



    // add a book to user collecion
    app.post('/addBookToUserBooks', isAuthenticated, (req, res) => {
      const userName = req.session.username
      console.log(`Add book to books, user:${userName}`);

      // fontend = sendData // backend = sentData
      // console.log(req.body);

      const sentData = req.body.sendData;
      // console.log(sentData);

      // prep some book data
      const newBook = {
        isbn: sentData.isbn,
        title: sentData.title,
        author: sentData.author,
        publicationDate: sentData.publicationDate,
        pageCount: sentData.pageCount,
        thumbnail: sentData.thumbnail,
      }
      // console.log(newBook);
      // https://www.w3schools.com/nodejs/nodejs_mongodb_update.asp
      db.collection('users').updateOne(
        { username: userName },
        { $push: { books: newBook } },
        (err, user) => {
          if (err) {
            console.error('Error finding user:', err);
            res.sendStatus(500);
          } else if (!user) {
            console.log("user not found");
            res.status(401).json({ message: 'User not found' });
          } else {
            // success
            console.log("book added to user books array")
            res.status(200).json({ message: 'add successful' });
          }
        }
      );
    });

    // add book to shelf
    app.post('/addBookToShelf', isAuthenticated, async (req, res) => {
      const userName = req.session.username
      const { shelfId, bookData } = req.body;
      console.log(`add book to shelf _id:${shelfId}`);
      const shelfObjectId = new ObjectId(shelfId);

      let newBook = bookData;
      let newID = { "_id": ObjectId() };
      newBook._id = newID._id;

      // get the right order num
      newBook.order = await findAvailableBookPos(userName); // needs to change

      // console.log(newBook);

      // send to database
      //find the right user, find the right shelf from _id, push the new book
      db.collection('users').updateOne(
        { username: userName, 'shelves._id': shelfObjectId },
        // { username: userName, 'shelves.name': "Reading" }, // works but don't want to use name
        { $push: { 'shelves.$.books': newBook } },
        (err, user) => {
          if (err) {
            console.error('Error adding book to shelf:', err);
            res.sendStatus(500);
          } else if (!user) {
            console.log("user not found");
            res.status(401).json({ message: 'User not found' });
          } else {
            // success
            console.log("book added to shelf")

            res.status(200).json({ message: 'book added to shelf' });
          }
        }
      );
    });

    const findAvailableBookPos = async (userName, shelfID) => {
      const shelfObjectId = new ObjectId(shelfID);
      // Fetch the user document
      const user = await db.collection('users').findOne({ username: userName });
      if (!user || !user.shelves) {
        return;
      }

      // Find the shelf with the given ID
      const shelf = user.shelves.find(shelf => shelf._id.equals(shelfObjectId));
      if (!shelf) {
        return;
      }

      // Extract all existing positions on the specified shelf
      const existingPositions = shelf.books.map(book => book.order);
      let firstUnusedInteger = 0;
      while (existingPositions.includes(firstUnusedInteger)) {
        firstUnusedInteger++;
      }

      return firstUnusedInteger;
    }



    // remove book from shelf
    app.post('/removeBookFromShelf', isAuthenticated, (req, res) => {
      const userName = req.session.username
      const { shelfId, bookId } = req.body;

      console.log(`remove book ${bookId} from shelf _id:${shelfId}`);


      const shelfObjId = new ObjectId(shelfId); // fix _id
      const bookObjId = new ObjectId(bookId); // fix _id

      // console.log(shelfObjId);
      // console.log(bookObjId);

      // send to database
      db.collection('users').updateOne(
        { username: userName, 'shelves._id': shelfObjId },
        { $pull: { 'shelves.$.books': { _id: bookObjId } } },
        (err, result) => {
          if (err) {
            console.error('Error Deleting shelf:', err);
            res.sendStatus(500);
          } else if (result.modifiedCount === 0) {
            console.log('Shelf not found');
            res.status(404).json({ message: 'Shelf not found' });
          } else {
            // Success
            res.status(200).json({ message: 'Shelves order saved' });
          }
        }
      );
    });


    // save book positions of shelf
    app.post('/saveShelfBooksOrder', isAuthenticated, (req, res) => {
      const userName = req.session.username
      const { shelfId, booksData } = req.body;

      const shelfObjectId = new ObjectId(shelfId);
      console.log(`Save book order on shelf _id:${shelfObjectId}`);
      // console.log(booksData);

      booksData.forEach((updatedBook) => {
        // update the db however many times necesarry with updateOne
        updatedBook._id = new ObjectId(updatedBook._id); // because the _id is weird

        // console.log(updatedBook._id);
        // console.log(updatedBook.newOrder);


        // https://www.mongodb.com/community/forums/t/updating-nested-array-of-objects/173893
        // post about using $[x] and array filters

        // send to database
        db.collection('users').updateOne(
          { username: userName, 'shelves._id': shelfObjectId, 'shelves.books._id': updatedBook._id },
          { $set: { 'shelves.$.books.$[book].order': updatedBook.newOrder } },
          { arrayFilters: [{ 'book._id': updatedBook._id },], },
          (err, result) => {
            if (err) {
              console.error('Error updating book order:', err);
              res.sendStatus(500);
            } else if (result.modifiedCount === 0) {
              console.log('Book not found in the shelf');
              res.status(404).json({ message: 'Book not found in the shelf' });
            } else {
              // Book order updated successfully
              // console.log('Book order updated:', updatedBook._id);
            }
          }
        );
      });
      // success?
      res.status(200).json({ message: 'Books order saved' });
      // console.log(booksData); // testing to show updated objID
    });



    // save shelf orders
    app.post('/saveShelvesOrder', isAuthenticated, (req, res) => {
      const userName = req.session.username
      const { shelvesData } = req.body;
      // console.log(shelvesData);
      console.log(`Save shelves order, user ${userName}`);


      shelvesData.forEach((updatedShelf) => {
        // update the db however many times necesarry with updateOne
        updatedShelf._id = new ObjectId(updatedShelf._id); // because the _id is weird

        // https://www.mongodb.com/community/forums/t/updating-nested-array-of-objects/173893
        // post about using $[x] and array filters

        // send to database
        db.collection('users').updateOne(
          { username: userName, 'shelves._id': updatedShelf._id },
          { $set: { 'shelves.$[shelf].order': updatedShelf.newOrder } },
          { arrayFilters: [{ 'shelf._id': updatedShelf._id },], },

          (err, result) => {
            if (err) {
              console.error('Error updating shelf order:', err);
              res.sendStatus(500);
            } else if (result.modifiedCount === 0) {
              console.log('Shelf not found');
              res.status(404).json({ message: 'Shelf not found' });
            } else {
              // Success
              // console.log('Book order updated:', updatedShelf._id);
            }
          }
        );
      });
      res.status(200).json({ message: 'Shelves order saved' });
      // console.log(booksData); // testing to show updated objID
    });


    // save shelf orders
    app.post('/shelfRename', isAuthenticated, (req, res) => {
      const userName = req.session.username
      const { shelfObjId, newName } = req.body;

      console.log(`Rename shelf:${shelfObjId}`);

      const updatedId = new ObjectId(shelfObjId); // fix _id
      // send to database
      db.collection('users').updateOne(
        { username: userName, 'shelves._id': updatedId },
        { $set: { 'shelves.$[shelf].name': newName } },
        { arrayFilters: [{ 'shelf._id': updatedId },], },
        (err, result) => {
          if (err) {
            console.error('Error updating shelf order:', err);
            res.sendStatus(500);
          } else if (result.modifiedCount === 0) {
            console.log('Shelf not found');
            res.status(404).json({ message: 'Shelf not found' });
          } else {
            // Success
            res.status(200).json({ message: 'Shelves order saved' });
          }
        }
      );
    });

    // save shelf orders
    app.post('/shelfDelete', isAuthenticated, (req, res) => {
      const userName = req.session.username
      const { shelfObjId } = req.body;
      console.log(`Delete shelf:${shelfObjId}`);

      const updatedId = new ObjectId(shelfObjId); // fix _id
      // send to database
      db.collection('users').updateOne(
        { username: userName },
        { $pull: { shelves: { _id: updatedId } } },
        (err, result) => {
          if (err) {
            console.error('Error Deleting shelf:', err);
            res.sendStatus(500);
          } else if (result.modifiedCount === 0) {
            console.log('Shelf not found');
            res.status(404).json({ message: 'Shelf not found' });
          } else {
            // Success
            res.status(200).json({ message: 'Shelves order saved' });
          }
        }
      );
    });


    // save shelf orders
    app.post('/shelfChangePrivacy', isAuthenticated, (req, res) => {
      const userName = req.session.username
      let { shelfObjId, newPrivacy } = req.body;
      console.log(`Chaneg privacy shelf:${shelfObjId}`);
      // privacy : "public" / "private"
      const updatedId = new ObjectId(shelfObjId); // fix _id
      newPrivacy = (newPrivacy == "public" || newPrivacy == "private") ? newPrivacy : "private"; // default to "private" here if front end sends something weird

      // send to database
      db.collection('users').updateOne(
        { username: userName, 'shelves._id': updatedId },
        { $set: { 'shelves.$[shelf].privacy': newPrivacy } },
        { arrayFilters: [{ 'shelf._id': updatedId },], },
        (err, result) => {
          if (err) {
            console.error('Error updating shelf order:', err);
            res.sendStatus(500);
          } else if (result.modifiedCount === 0) {
            console.log('Shelf not found');
            res.status(404).json({ message: 'Shelf not found' });
          } else {
            // Success
          }
        }
      );
      res.status(200).json({ message: 'Shelves order saved' });
    });

    app.post('/addShelf', isAuthenticated, async (req, res) => {
      const userName = req.session.username
      let { shelfName, privacy } = req.body;

      console.log(`Add new shelf:${shelfName}`);
      // get the right order num
      let order = await findAvailableShelfPos(userName); // needs to change
      // setup
      const newShelf = {
        "_id": ObjectId(),
        "order": order,
        "name": shelfName,
        "privacy": privacy,
        "books": [],
      }

      // send to database
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
            // success
            console.log("Shelf added to user shelves")
            res.status(200).json({ message: 'add successful' });
          }
        }
      );
    });

    async function findAvailableShelfPos(userName) {
      // Fetch the user document
      const user = await db.collection('users').findOne({ username: userName });
      // If user or shelves array not found, return or handle accordingly
      if (!user || !user.shelves) {
        return;
      }
      // Extract all existing positions
      const existingPositions = user.shelves.map(shelf => shelf.order);
      // Find the first unused integer
      let firstUnusedInteger = 0;
      while (existingPositions.includes(firstUnusedInteger)) {
        firstUnusedInteger++;
      }
      return firstUnusedInteger;
    }

    //
    app.get('/searchBooks/:search', isAuthenticated, async (req, res) => {
      const searchTerm = req.params.search;
      console.log(`search term :${searchTerm}`);

      let searchData = [];

      if ((searchTerm.length == 13 || searchTerm.length == 10) && isNumeric(searchTerm)) {
        // console.log(`ISBN search for :${searchTerm}`);
        // enough tests to treat as an ISBN-13
        // conduct isbn search
        searchData = await googleBooksSearchISBN(searchTerm);
      }
      else {
        // console.log(`Title search for :${searchTerm}`);
        // treat as a book name search
        searchData = await googleBooksSearchTitle(searchTerm);
      }
      // console.log("search data below -");
      // console.log(searchData);

      // send data back to user
      if (searchData.length != 0) {
        // data found - send it back to user
        console.log("book data found");
        res.status(200).json({ data: searchData });
      }
      else {
        // error, no data found - send error to user
        console.log("book data not found");
        res.status(401).json({ message: 'book data not found' });
      }
    });


    app.get('/users/:username', isAuthenticated, (req, res) => {
      const username = req.params.username;
      console.log(`get user:${username}`);

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

app.get('/community', isAuthenticated, async (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/community.html'));
});

app.get('/bookshelf', isAuthenticated, (req, res) => {

  let urlUsername = req.session.username;
  // Redirect to the user-specific bookshelf route
  res.redirect(`/bookshelf/${urlUsername}`);
});

// CRUD To be removed
app.get('/crud', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/crud.html'));
});

app.get('/profile', isAuthenticated, async (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/profile.html'));
});

app.get('/myFollowing', isAuthenticated, async (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/myFollowing.html'));
});

app.get('/myFollowers', isAuthenticated, async (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/myFollowers.html'));
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
});

app.get('/following/:username', async (req, res) => {

  const urlUsername = req.params.username;
  const userData = "Test data";

  res.render('following', { username: urlUsername, data: userData });
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
const searchBooksObjects = (books, resultsLimit) => {

  let returnData = [];

  const limitedResults = books.slice(0, resultsLimit);
  // Loop through the limited results with index
  limitedResults.forEach((book, index) => {

    const bIsbn = (
      book.volumeInfo.industryIdentifiers?.find((identifier) => identifier.type === 'ISBN_13')?.identifier ||
      book.volumeInfo.industryIdentifiers?.find((identifier) => identifier.type === 'ISBN_10')?.identifier ||
      'Unknown'
    );

    const bTitle = book.volumeInfo.title || 'Unknown';
    const bAuthor = book.volumeInfo.authors ? book.volumeInfo.authors[0] : 'Unknown';
    const bPublicationDate = book.volumeInfo.publishedDate || 'Unknown';
    const bPageCount = book.volumeInfo.pageCount || 'Unknown';

    const bThumbnail = (
      book.volumeInfo.imageLinks?.thumbnail ||
      book.volumeInfo.imageLinks?.smallThumbnail ||
      'Unknown'
    );

    let newBookObj = {
      isbn: bIsbn,
      title: bTitle,
      author: bAuthor,
      publicationDate: bPublicationDate,
      pageCount: bPageCount,
      thumbnail: bThumbnail
    };
    // console.log(newBookObj);
    returnData.push(newBookObj);

  });
  return returnData;
}

const googleBooksSearchTitle = async (searchInput) => {
  return new Promise((resolve, reject) => {

    let returnData = [];
    const resultsLimit = 10

    books.volumes.list({
      q: searchInput,
      maxResults: resultsLimit
    }, (err, response) => {
      if (err) {
        console.error('Error retrieving books:', err);
        reject(err); // Reject the promise if there's an error.
      } else {
        const books = response.data.items;
        // console.log(books);

        if (!Array.isArray(books)) {
          // console.error('No books found for this title: ');
          console.log('No books found for this title: ');
          resolve([]);
        }
        else {
          // generate objects
          returnData = searchBooksObjects(books, resultsLimit);

          // return returnData;
          resolve(returnData); // Resolve the promise with the data.
        }
      }
    });
  });
}

const googleBooksSearchISBN = (searchInput) => {
  return new Promise((resolve, reject) => {

    let returnData = [];
    const resultsLimit = 5

    books.volumes.list({
      q: searchInput,
      maxResults: resultsLimit
    }, (err, response) => {
      if (err) {
        console.error('Error retrieving books:', err);
        reject(err); // Reject the promise if there's an error.
      }
      else {
        const books = response.data.items;
        // console.log(books);

        if (!Array.isArray(books)) {
          // console.error('No books found for this title: ');
          console.log('No books found for this title: ');
          resolve([]);
        }
        else {
          // generate objects
          returnData = searchBooksObjects(books, resultsLimit);

          // return returnData;
          resolve(returnData); // Resolve the promise with the data.
        }
      }
    });
  });
}

