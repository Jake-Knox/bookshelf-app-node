console.log("my bookshelf");

// js for added editing features for a user on thier own bookshelf
const bookshelfOwner = document.getElementById("bookshelfOwner");

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchResults = document.getElementById("search-results");
const bookResults = document.getElementById("book-results");

const bookDisplay = document.getElementById("booksDisplay");

const ResultsBtns = document.getElementById("results-btns");
const backBtn = document.getElementById("back-btn");
const addBtn = document.getElementById("add-btn");

const editShelvesContent = document.getElementById("editShelvesContent");
const newShelfNameInput = document.getElementById("newShelfNameInput");
const newShelfPrivacyBtn = document.getElementById("newShelfPrivacyBtn");
const newShelfCreateBtn = document.getElementById("newShelfCreateBtn");
const saveShelvesOrderBtn = document.getElementById("saveShelvesOrderBtn");

const bookshelfOwnerName = bookshelfOwner.value;


let newShelfPrivacy = "public";

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

saveShelvesOrderBtn.addEventListener("click", async () => {

  console.log("save shlves order");

  // Get the container element by its ID
  const editShelvesContent = document.getElementById("editShelvesContent");
  const editShelves = editShelvesContent.getElementsByClassName('edit-shelf-row');
  // Convert HTMLCollection to an array
  const shelvesArray = Array.from(editShelves);

  shelvesData = []
  shelvesArray.forEach(shelf => {
    const _id = shelf.getAttribute('shelf-id');
    shelvesData.push({
      "_id": _id,
      "newOrder": shelvesArray.indexOf(shelf),
    });
  });
  console.log(shelvesData);

  try {
    const response = await fetch('/saveShelvesOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shelvesData }),
    });
    if (response.ok) {
      // alert(response.status);
      // location.reload();
      alertReload();

    } else {
      alert("Error: response?");
      console.error('Failed: ', response.statusText);
    }
  } catch (error) {
    alert("Error: cannot post?");
    console.error('Error: ', error);
  }
});

// change privacy/visibility event
newShelfPrivacyBtn.addEventListener("click", () => {
  newShelfPrivacyBtn.classList.toggle("btn-private");
});

// add new shelf event
newShelfCreateBtn.addEventListener("click", async () => {

  // get data
  const newName = newShelfNameInput.value;
  const newPrivacy = (newShelfPrivacyBtn.classList.contains("btn-private")) ? "private" : "public";

  // console.log(newName);
  // console.log(newPrivacy);

  addShelf(newName, newPrivacy);
});


const searchAPI = async (searchTerm) => {
  try {
    const response = await fetch(`/searchBooks/${searchTerm}`, {
      method: 'GET'
    });

    // response from server
    if (response.ok) {
      const searchData = await response.json();

      // console.log("await response is 'ok'");

      // SWAP THIS OUT WITH DISPLAY DATA
      console.log(`Search length: ${searchData.data.length}`)
      // console.log(searchData.data);

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

      //setup followers
      setupFollowers(bookshelfData.following, bookshelfData.followers)

      //setup books
      setupUserBooks(bookshelfData.books);

      //setup shelves
      setupShelves(bookshelfData.shelves); // comment to stop trying to use db data

    }
    else {
      console.error('Error in response getting user bookshelf:', response.statusText);
    }
  }
  catch (error) {
    console.error('Error in try getting user bookshelf:', error);
  }
}

const setupFollowers = (followingData, followersData) => {
  followingCount.innerHTML = (`<a href="/following/${bookshelfOwnerName}" ><p class="light"><b>${bookshelfData.following.length}</b> Following</p></a>`);
  followersCount.innerHTML = (`<a href="/following/${bookshelfOwnerName}" ><p class="light"><b>${bookshelfData.followers.length}</b> Followers</p></a>`);
}

const setupUserBooks = (booksData) => {
  booksCount.textContent = (`Books: ${booksData.length}`);
  for (let i = 0; i < booksData.length; i++) {
    const newUserBook = createUserBook(booksData[i], i);
    newUserBook.id = (`userBook${i}`);
    newUserBook.classList.add("user-book");
    bookDisplay.appendChild(newUserBook);
  }
}

const setupShelves = (shelvesData) => {
  //shelves setup
  shelvesCount.textContent = (`Shelves: ${shelvesData.length}`);

  // order the shelves correctly
  // sorts data while still using 'shelvesData variable later on'
  const shelvesDataSorted = shelvesData;
  shelvesDataSorted.sort((a, b) => a.order - b.order);

  for (let i = 0; i < shelvesDataSorted.length; i++) {
    shelvesDataSorted[i].books.sort((a, b) => a.order - b.order);
  }
  // console.log(shelvesDataSorted);

  for (let i = 0; i < shelvesData.length; i++) {
    // for every shelf
    const newShelf = createShelf(shelvesData[i]);
    const newShelfBooks = document.createElement("div");
    newShelfBooks.classList.add("shelf-books");
    newShelfBooks.id = (`shelfBooks${i}`);
    newShelfBooks.setAttribute('data-shelf-id', shelvesData[i]._id);
    // 

    for (let j = 0; j < shelvesData[i].books.length; j++) {
      // for every book on shelf i 
      const newBook = createIDShelfBook(shelvesData[i].books[j], shelvesData[i]._id);
      // add the new book the the shelf
      newShelfBooks.appendChild(newBook);
    }
    //add the new shelf to the shelves div
    newShelf.appendChild(newShelfBooks);

    // create and add the save order and search section to each shelf
    const newShelfButtons = createShelfButtons(shelvesData[i], i);
    newShelf.appendChild(newShelfButtons);

    // add shelf to page
    shelves.appendChild(newShelf);

    // add row to edit shelves section at bottom
    const newEditShelfRow = createEditShelfRow(shelvesData[i], i);
    editShelvesContent.appendChild(newEditShelfRow);

  }

  for (let i = 0; i < shelvesData.length; i++) {
    // jQuery to allow sorting by user
    $(`#shelfBooks${i}`).sortable({
      cursor: "move", // Set cursor to indicate draggable
    });
    initAutocomplete(`search${i}`, `add${i}`);

    initRenameShelf(`editShelfName${i}`, `editShelfRename${i}`, shelvesData[i]._id);
  }

  //
  initReorderShelves();

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

  const bookThumbnail = document.createElement("input");
  bookThumbnail.type = "text";
  bookThumbnail.placeholder = "Custom image link";
  bookThumbnail.classList += "input-image-ref";
  bookInfo.appendChild(bookThumbnail);

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
    if (bookThumbnail.value != "") {
      if (hyperlinkRegex.test(bookThumbnail.value)) {
        // console.log("Valid hyperlink!");
        sendData.thumbnail = bookThumbnail.value;
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
        alert(response.message);
        // location.reload();
      } else {
        alert("Error: response?");
        console.error('Failed: ', response.statusText);
      }
    } catch (error) {
      alert("Error: cannot post?");
      console.error('Error: ', error);
    }
  });
  // end of button add click 


  bookInfo.appendChild(bookAddBtn);

  // newResultDiv.innerText = (`${data.author}, ${data.title}`);
  newResultDiv.classList += "book-search-result";

  return newResultDiv;
}

// add book to shelf
const addBookToShelf = async (shelfId, bookData) => {
  try {
    const response = await fetch('/addBookToShelf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shelfId, bookData }),
    });
    if (response.ok) {
      console.log(response);
      alertReload();

    } else {
      console.error('Failed: ', response.statusText);
    }
  } catch (error) {
    console.error('Error: ', error);
  }
}

// delete shelf
const removeBookFromShelf = async (shelfId, bookId) => {
  try {
    const response = await fetch('/removeBookFromShelf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shelfId, bookId }),
    });
    if (response.ok) {
      alertReload();
    } else {
      alert("Error: response?");
      console.error('Failed: ', response.statusText);
    }
  } catch (error) {
    alert("Error: cannot post?");
    console.error('Error: ', error);
  }
}


// element creation

// overload
const createIDShelfBook = (bookData, shelfObjId) => {
  // used to easily create many BOOKS during page load

  // div for the book
  const newBookDiv = document.createElement("div");
  newBookDiv.classList.add("book-div");
  newBookDiv.setAttribute('book-id', bookData._id);

  const newBookCoverImg = document.createElement("img");
  newBookCoverImg.classList.add("cover-img");
  newBookCoverImg.src = bookData.thumbnail;
  newBookCoverImg.alt = (`Author: ${bookData.author} - Title: ${bookData.title}`);
  newBookCoverImg.setAttribute("book-id", bookData._id);
  newBookCoverImg.setAttribute("shelf-id", shelfObjId);

  //assemble elements
  newBookDiv.appendChild(newBookCoverImg);
  return newBookDiv;
}

// each book in a user's collection
const createUserBook = (data, index) => {
  const newUserBook = document.createElement("div");

  const bookISBN = document.createElement("p");
  bookISBN.innerText = `${data.isbn}`;
  bookISBN.classList += "";
  newUserBook.appendChild(bookISBN);

  const bookTitle = document.createElement("p");
  bookTitle.innerText = `${data.title}`;
  bookTitle.classList += "";
  newUserBook.appendChild(bookTitle);

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = `${data.author}`;
  bookAuthor.classList += "";
  newUserBook.appendChild(bookAuthor);

  return newUserBook;
}

// buttons fo rthe bottom of each shelf
const createShelfButtons = (shelfData, index) => {
  const newShelfButtons = document.createElement("div");
  newShelfButtons.classList.add("shelf-search-container");

  const shelfSaveOrderBtn = document.createElement("button");
  shelfSaveOrderBtn.id = (`save${index}`);
  shelfSaveOrderBtn.classList.add("shelf-save-order-btn");
  shelfSaveOrderBtn.setAttribute('data-shelf-id', shelfData._id);
  shelfSaveOrderBtn.textContent = ("Save Book Order");
  shelfSaveOrderBtn.addEventListener("click", async () => {
    console.log(`save book order, shelf index ${index}`);
    // send to backend

    const shelfId = shelfData._id

    // Get the container element by its ID
    const thisShelfDiv = document.getElementById(`shelfBooks${index}`);
    const booksOnShelf = thisShelfDiv.getElementsByClassName('book-div');
    // Convert HTMLCollection to an array
    const booksArray = Array.from(booksOnShelf);

    booksData = []
    booksArray.forEach(book => {
      const _id = book.getAttribute('book-id');

      booksData.push({
        "_id": _id,
        "newOrder": booksArray.indexOf(book),
      });
    });
    console.log(booksData);

    try {
      const response = await fetch('/saveShelfBooksOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shelfId, booksData }),
      });
      if (response.ok) {
        // alert(response.status);
        // location.reload();
        alertReload();

      } else {
        alert("Error: response?");
        console.error('Failed: ', response.statusText);
      }
    } catch (error) {
      alert("Error: cannot post?");
      console.error('Error: ', error);
    }

  });
  newShelfButtons.appendChild(shelfSaveOrderBtn);

  const shelfSearchInput = document.createElement("input");
  shelfSearchInput.id = (`search${index}`);
  shelfSearchInput.classList.add("shelf-search-input");
  shelfSearchInput.type = "text";
  shelfSearchInput.placeholder = ("Search...");
  newShelfButtons.appendChild(shelfSearchInput);

  const shelfAddBtn = document.createElement("button");
  shelfAddBtn.id = (`add${index}`);
  shelfAddBtn.classList.add("shelf-add-btn");
  // custom attribute for the shelf unique id
  shelfAddBtn.setAttribute('data-shelf-id', shelfData._id);
  shelfAddBtn.textContent = ("+");
  newShelfButtons.appendChild(shelfAddBtn);

  // const inputName = (`search${index}`);
  // const btnName = (`add${index}`);

  return newShelfButtons;
}


const createEditShelfRow = (shelfData, index) => {
  //
  const shelfName = shelfData.name;

  const newEditShelfRow = document.createElement("div");
  newEditShelfRow.id = (`editShelf${index}`);
  newEditShelfRow.setAttribute('shelf-id', shelfData._id);
  newEditShelfRow.classList.add("edit-shelf-row");

  const rowSpan = document.createElement("span");
  rowSpan.id = (`editShelfName${index}`);
  rowSpan.classList.add("name");
  rowSpan.innerText = shelfName;
  newEditShelfRow.appendChild(rowSpan);

  const rowEditName = document.createElement("button");
  rowEditName.id = (`editShelfRename${index}`);
  rowEditName.classList.add("edit-button");
  newEditShelfRow.appendChild(rowEditName);

  const rowVisibility = document.createElement("button");
  rowVisibility.id = (`editShelfVis${index}`);
  rowVisibility.classList.add("visibility-button");
  // on click
  rowVisibility.addEventListener("click", () => {
    console.log(`visibility click ${shelfData._id}`);
    changeShelfVisibilty(shelfData._id, shelfData.privacy);
  })
  newEditShelfRow.appendChild(rowVisibility);

  const rowDelete = document.createElement("button");
  rowDelete.id = (`editShelfDel${index}`);
  rowDelete.classList.add("delete-button");
  // on click
  rowDelete.addEventListener("click", () => {
    console.log(`delete click ${shelfData._id}`);
    deleteShelf(shelfData._id);
  })
  newEditShelfRow.appendChild(rowDelete);


  return newEditShelfRow;
}

// renaming shelves
const renameShelf = async (shelfObjId, newName) => {
  try {
    const response = await fetch('/shelfRename', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shelfObjId, newName }),
    });
    if (response.ok) {
      alertReload();
    } else {
      alert("Error: response?");
      console.error('Failed: ', response.statusText);
    }
  } catch (error) {
    alert("Error: cannot post?");
    console.error('Error: ', error);
  }
}

// privacy change shelves
const changeShelfVisibilty = async (shelfObjId, currentPrivacy) => {
  const newPrivacy = (currentPrivacy == "public") ? "private" : "public";
  try {
    const response = await fetch('/shelfChangePrivacy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shelfObjId, newPrivacy }),
    });
    if (response.ok) {
      alertReload();
    } else {
      alert("Error: response?");
      console.error('Failed: ', response.statusText);
    }
  } catch (error) {
    alert("Error: cannot post?");
    console.error('Error: ', error);
  }
}

// delete shelf
const deleteShelf = async (shelfObjId) => {
  try {
    const response = await fetch('/shelfDelete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shelfObjId }),
    });
    if (response.ok) {
      alertReload();
    } else {
      alert("Error: response?");
      console.error('Failed: ', response.statusText);
    }
  } catch (error) {
    alert("Error: cannot post?");
    console.error('Error: ', error);
  }
}

// add shelf
const addShelf = async (shelfName, privacy) => {
  try {
    const response = await fetch('/addShelf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shelfName, privacy }),
    });
    if (response.ok) {
      console.log(response);
      alertReload();
    } else {
      console.error('Failed: ', response.statusText);
    }
  } catch (error) {
    console.error('Error: ', error);
  }
}

const alertReload = () => {

  // alert user - reload to see changes
  alert("Your change has been saved.\nReload this page to view changes.");

  // send message
  // alert(`${message}`);

  // reload page?
  // location.reload();
}




//
// jQuery section
//

$(document).ready(function () {
  // jQuery stuff
  // console.log("jquery load");

  $("#searchSlideToggle").click(function () {
    $("#book-search").slideToggle("slow");
    $("#search-results").slideToggle("slow");
  });

  $("#booksCount").click(function () {
    $("#booksDisplay").slideToggle("slow");
  });

  $("#shelvesCount").click(function () {
    $("#shelvesDisplay").slideToggle("slow");
  });

  $("#shelvesEdit").click(function () {
    $("#editShelvesContent").slideToggle("slow");
    $("#editShelvesButtons").slideToggle("slow");
  });

});

// Function to initialize autocomplete
function initAutocomplete(inputId, buttonId) {
  $("#" + inputId).autocomplete({
    source: function (request, response) {
      var term = request.term.toLowerCase();
      var matchingItems = bookshelfData.books.filter(function (item) {
        return item.title.toLowerCase().includes(term) || item.author.toLowerCase().includes(term) || item.isbn.toLowerCase().includes(term);
      });

      // Map the matching items to an array of label and value pairs
      var suggestions = matchingItems.map(function (item) {
        return {
          label: item.title + ", " + item.author + " ISBN:" + item.isbn,
          value: item.isbn // This is what will be inserted into the input field when an item is selected
        };
      });

      response(suggestions);
    },
    minLength: 1, // Minimum characters to trigger autocomplete
    select: function (event, ui) {
      // Log the selected item's name
      // console.log("Selected: " + ui.item.value + " (Name: " + ui.item.label + ")");
    }
  });

  // Function to initialize log button click event
  $("#" + buttonId).on("click", function () {
    var inputValue = $("#" + inputId).val().toLowerCase();

    // Retrieve the data-shelf-id attribute of the clicked button
    var shelfId = $(this).attr('data-shelf-id');

    // Check if the input value matches any of the data values
    if (bookshelfData.books.some(item => item.isbn.toLowerCase() === inputValue)) {
      // console.log(`Button #${buttonId} Clicked: ${inputValue}`);
      // console.log(`Shelf ID: ${shelfId}`);

      let bookData = bookshelfData ? bookshelfData.books.find(book => book.isbn === inputValue) : null;

      const targetShelf = bookshelfData.books.find(shelf => shelf._id === shelfId);
      const newBookPos = (targetShelf ? targetShelf.books.length : 0);

      // get the right book data
      bookData.order = newBookPos;
      bookData.facing = "front";

      console.log(bookData);

      // send to back end
      addBookToShelf(shelfId, bookData);


    } else {
      console.log("Input value does not match any data values.");
    }
  });
}

// jQuery for rename shelf
function initRenameShelf(nameId, renameBtnId, shelfObjId) {
  //
  // Example of handling the "Edit Name" button click
  $("#" + renameBtnId).on("click", function () {
    console.log(`rename click ${shelfObjId}`);
    var $nameElement = $("#" + nameId);
    // console.log($nameElement);
    // console.log('Number of elements found:', $nameElement.length);

    // Check if the name element is currently an input
    if ($nameElement.children().is('input')) {
      // console.log("is input");
      // If it's an input, switch to span
      var newName = $nameElement.children('.name-input').val();
      $nameElement.html('<span class="name">' + newName + '</span>');

      // send to backend
      renameShelf(shelfObjId, newName);

    } else {
      // console.log("is not input");
      // If it's a span, switch to input
      var currentName = $nameElement.text();
      // console.log(currentName);
      $nameElement.html('<input type="text" class="name-input" maxlength="50" value="' + currentName + '">');
    }
  });
}

function initReorderShelves() {
  // similar to the book one
  $("#editShelvesContent").sortable({
    cursor: "move", // Set cursor to indicate draggable
  });
}

// jQuery Context menu
document.addEventListener('DOMContentLoaded', function () {

  let contextMenu; // Declare contextMenu in the outer scope

  document.body.addEventListener('dblclick', function (event) {
    const target = event.target;
    const imageContainer = target.closest('.book-div');

    // Check if the right-click occurred on an image within an image container
    if (target.classList.contains('cover-img')) {
      event.preventDefault();
      event.stopPropagation();
      // console.log("Load context menu");
      const shelfObjID = target.getAttribute("shelf-id");
      const bookObjID = target.getAttribute("book-id")

      contextMenu = document.createElement('ul');
      contextMenu.className += 'contextMenu';

      const listItem = document.createElement('li');
      listItem.innerText = "Remove Book";
      listItem.onclick = function () {
        console.log(`On shelf:${shelfObjID}, remove book:${bookObjID}`);

        // send to back end
        removeBookFromShelf(shelfObjID, bookObjID);

        // cleanup
        contextMenu.remove();
        console.log("Remove context menu after click");
        document.removeEventListener('click', clickHandler);
      };

      // Append the li's  to the ul
      contextMenu.appendChild(listItem);

      // Position the context menu next to the clicked image
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      contextMenu.style.position = 'absolute';
      contextMenu.style.top = mouseY + scrollY + 'px';
      contextMenu.style.left = mouseX + scrollX + 'px';

      imageContainer.appendChild(contextMenu);

      // Remove the context menu when clicked outside
      document.addEventListener("click", clickHandler);
    }
  });

  function clickHandler(event) {
    if (!contextMenu.contains(event.target)) {
      contextMenu.remove();
      console.log("Remove context menu");
      document.removeEventListener('click', clickHandler);
    }
  }
});
