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

// Regex
const hyperlinkRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/;

// checks and setup
document.addEventListener('DOMContentLoaded', () => {
  if (checkSession()) {
    getMyBookshelf()
  }
  else {
    console.log("not logged in")
    // do something here
    // redirect or something
  }
});


searchBtn.addEventListener("click", () => {
  console.log("search btn");

  // empty search results div first  
  bookResults.innerHTML = "";

  // send search requets to server for API data
  const searchTerm = searchInput.value;
  searchAPI(searchTerm);


});

const searchAPI = async (searchTerm) => {
  try {
    const response = await fetch(`/searchBooks/${searchTerm}`, {
      method: 'GET'
    });

    // response from server
    if (response.ok) {
      const searchData = await response.json();

      console.log("await response is 'ok'");

      // SWAP THIS OUT WITH DISPLAY DATA
      console.log(`Search length: ${searchData.data.length}`)
      console.log(searchData.data);


      showSearchResults(searchData.data);


    }
    else {
      console.error('Response Error:', response.statusText);
    }
  }
  catch (error) {
    console.error('Get Error:', error);
  }
}




// REMOVED WHEN moved away from static buttons
// backBtn.addEventListener("click", () => {

//   console.log("back btn");


// });

// addBtn.addEventListener("click", () => {
//   console.log("add btn");


//   alert("NOT CONNECTED");

//   // editDatabase();
//   // alert("Database has been updated");

// });



// shelves can be added to based on books in collection

// no reading/to read - will be done as default shelves
//

// make changes here
// lets sort the db out now before carrying on

const getMyBookshelf = async () => {

  try {
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

  // console.log(dataArray);

  // display user data setup
  // usernameTitle.textContent = dataArray.username;
  followingCount.textContent = (`Following: ${dataArray.following.length}`);
  followersCount.textContent = (`Following: ${dataArray.followers.length}`);

  // books stuff
  booksCount.textContent = (`Books: ${dataArray.books.length}`);

  //shelves setup
  shelvesCount.textContent = (`Shelves: ${shelvesData.length}`);
  for (let i = 0; i < shelvesData.length; i++) {
    // for every shelf
    console.log(`shelf:${i}`);

    const newShelf = createShelf(shelvesData[i]);

    const newShelfBooks = document.createElement("div");
    newShelfBooks.classList.add("shelf-books");

    for (let j = 0; j < shelvesData[i].books.length; j++) {
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

//
const showSearchResults = (data) => {

  for (let i = 0; i < data.length; i++) {
    let newResultDiv = createSearchResult(data[i], i);

    bookResults.appendChild(newResultDiv);
  }

}

// to egenrate content when a user searches for a book
const createSearchResult = (data, index) => {

  const newResultDiv = document.createElement("div");

  const bookImg = document.createElement("img");
  bookImg.src = data.thumbnail;
  bookImg.alt = "Thumbnail not found";
  bookImg.classList += "book-search-img";
  newResultDiv.appendChild(bookImg);

  const bookInfo = document.createElement("div");
  bookInfo.classList += "book-search-info";
  newResultDiv.appendChild(bookInfo);

  const bookISBN = document.createElement("p");
  bookISBN.innerText = `${data.isbn}`;
  bookISBN.classList += "";
  bookInfo.appendChild(bookISBN);

  const bookTitle = document.createElement("p");
  bookTitle.innerText = `${data.title}`;
  bookTitle.classList += "";
  bookInfo.appendChild(bookTitle);

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = `${data.author}`;
  bookAuthor.classList += "";
  bookInfo.appendChild(bookAuthor);

  const bookPublicationDate = document.createElement("p");
  bookPublicationDate.innerText = `Published: ${data.publicationDate}`;
  bookPublicationDate.classList += "";
  bookInfo.appendChild(bookPublicationDate);

  const bookPageCount = document.createElement("p");
  bookPageCount.innerText = `Pages: ${data.pageCount}`;
  bookPageCount.classList += "";
  bookInfo.appendChild(bookPageCount);

  const bookThumbmail = document.createElement("input");
  bookThumbmail.type = "text";
  bookThumbmail.placeholder = "Custom image link";
  bookThumbmail.classList += "input-image-ref";
  bookInfo.appendChild(bookThumbmail);

  const bookAddBtn = document.createElement("button");
  bookAddBtn.textContent = "Add";
  bookAddBtn.id = (`addBookBtn${index}`);
  bookAddBtn.classList += "btn-add-search";

  bookAddBtn.addEventListener("click", async () => {
    //send submit and send data based on id's to backend
    let sendData = {
      "isbn": data.isbn,
      "title": data.title,
      "author": data.author,
      "publicationDate": data.publicationDate,
      "pageCount": data.pageCount,
      "thumbnail": data.thumbnail,
    };

    // test for hyperlink input
    if (bookThumbmail.value != "") {
      if (hyperlinkRegex.test(bookThumbmail.value)) {
        // console.log("Valid hyperlink!");
        sendData.thumbnail = bookThumbmail.value;
      } else {
        console.error("Invalid input for image link - using origional image link instead.");
      }
    }

    console.log(sendData);

    // send to backend
    try {
      const response = await fetch('/addBookToUserBooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sendData }),
      });
      if (response.ok) {
        alert("Submitted");
      } else {
        alert("Error: response?");
        console.error('Failed: ', response.statusText);
      }
    } catch (error) {
      alert("Error: cannot post?");
      console.error('Error: ', error);
    }
  });
  bookInfo.appendChild(bookAddBtn);

  // newResultDiv.innerText = (`${data.author}, ${data.title}`);
  newResultDiv.classList += "book-search-result";

  return newResultDiv;
}


const createCollectionBook = () => {
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
const addBookToShelf = async (bookName, shelfName) => {

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
const removeBookFromShelf = async (bookName, shelfName) => {

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
