console.log("my bookshelf");

// js for added editing features for a user on thier own bookshelf

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchResults = document.getElementById("search-results");
const bookResults = document.getElementById("book-results");
const ResultsBtns = document.getElementById("results-btns");
const backBtn = document.getElementById("back-btn");
const addBtn = document.getElementById("add-btn");

let bookshelfData = [];

// checks and setup
document.addEventListener('DOMContentLoaded', () => {
  if(checkSession())
  {
    getMyBookshelf()
  }
  else{
    console.log("not logged in")
    // do something here
    // redirect or something
  }   
});


searchBtn.addEventListener("click", () => {

    console.log("search btn");
  
  
  });
  
  backBtn.addEventListener("click", () => {
  
    console.log("back btn");
  
  
  });
  
  addBtn.addEventListener("click", () => {  
    console.log("add btn");


    alert("NOT CONNECTED");

    // editDatabase();
    // alert("Database has been updated");
  
  });
    


// shelves can be added to based on books in collection

// no reading/to read - will be done as default shelves
//

// make changes here
// lets sort the db out now before carrying on

const getMyBookshelf = async () => {
  
  try{
    const response = await fetch('/getMyBookhelf', {
      method: 'GET'
    });

    // response from server
    if (response.ok) {

      const userData = await response.json();  
      console.log("retirved data");

      bookshelfData = userData.data; // used to set up elements and fill shelves
      console.log(userData.data);
  
      setupUserElements(bookshelfData); // comment to stop trying to use db data
      
    }  
    else {
      console.error('Error in response getting user bookshelf:', response.statusText);
    }

  }
  catch (error) {
    console.error('Error in try getting user bookshelf:', error);
  }  
}


const setupUserElements = (dataArray) => {

  const shelvesData = dataArray.shelves;

  console.log(dataArray);

  // display user data setup
  // usernameTitle.textContent = dataArray.username;
  followingCount.textContent = (`Following: ${dataArray.following.length}`);
  followersCount.textContent = (`Following: ${dataArray.followers.length}`);

  // books stuff
  booksCount.textContent = (`Books: ${dataArray.books.length}`);

  //shelves setup
  shelvesCount.textContent = (`Shelves: ${shelvesData.length}`);
  for(let i = 0; i < shelvesData.length; i++)
  {
    // for every shelf
    console.log(`shelf:${i}`);

    const newShelf = createShelf(shelvesData[i]);

    const newShelfBooks = document.createElement("div");
    newShelfBooks.classList.add("shelf-books");

    for(let j = 0; j < shelvesData[i].books.length; j++)
    {
      // for every book on shelf i 
      console.log(`shelf:${i}, book:${j} `);

      const newBook = createShelfBook(shelvesData[i].books[j]);


      // add the new book the the shelf
      newShelfBooks.appendChild(newBook);
    }

    //add the new shelf to the shelves div
    newShelf.appendChild(newShelfBooks);
    shelves.appendChild(newShelf);
  }  
}


// functions for generating content on page

const createCollectionBook = () =>{
  // to show user data about a book before adding to shelf 
  // or showing in "books" collection


}



// USED for hard code adding stuff to database
// To be deleted when all functions to edit db are available to user
const editDatabase = async () => {

  const test = "test";
  const test2 = "test 2";

  try {
    const response = await fetch('/editDatabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test, test2 }),
    });
    if (response.ok) {   
      console.log(response);        
    } else {
      console.error('Failed: ', response.statusText);
    }
  } catch (error) {
    console.error('Error: ', error);
  }
} 

// Using these methods going forward

// add shelf
const addShelf = async (shelfName) => {

  const addShelfName = shelfName;

  try {
    const response = await fetch('/addShelf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ addShelfName }),
    });
    if (response.ok) {   
      console.log(response);        
    } else {
      console.error('Failed: ', response.statusText);
    }
  } catch (error) {
    console.error('Error: ', error);
  }
} 
  
// remove shelf
const removeShelf = async (shelfName) => {

  const removeShelfName = shelfName;

  try {
    const response = await fetch('/removeShelf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ removeShelfName }),
    });
    if (response.ok) {   
      console.log(response);        
    } else {
      console.error('Failed: ', response.statusText);
    }
  } catch (error) {
    console.error('Error: ', error);
  }
} 


// add book to shelf
const addBookToShelf = async (bookName ,shelfName) => {

  const addBookName = bookName;
  const addShelfName = shelfName;

  try {
    const response = await fetch('/removeBookFromShelf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ addBookName, addShelfName }),
    });
    if (response.ok) {   
      console.log(response);        
    } else {
      console.error('Failed: ', response.statusText);
    }
  } catch (error) {
    console.error('Error: ', error);
  }
}


// remove book from shelf
const removeBookFromShelf = async (bookName ,shelfName) => {

  const removeBookName = bookName;
  const removeShelfName = shelfName;

  try {
    const response = await fetch('/removeBookFromShelf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ removeBookName, removeShelfName }),
    });
    if (response.ok) {   
      console.log(response);        
    } else {
      console.error('Failed: ', response.statusText);
    }
  } catch (error) {
    console.error('Error: ', error);
  }
}