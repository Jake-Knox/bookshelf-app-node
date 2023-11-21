console.log("bookshelf");

// js for all users accessing any bookshelf - loads data from database, nothing editable

const usernameTitle = document.getElementById("usernameTitle");

const followingCount = document.getElementById("followingCount");
const followersCount = document.getElementById("followersCount");

const shelvesCount = document.getElementById("shelvesCount");

const shelves = document.getElementById("shelves");



const checkSession = async () => {
  // cookies or similar to track user
  console.log('session check');

  const response = await fetch('/checkSession', {
    method: 'POST'
  });
  if (response.ok) {
    // Logout successful
    console.log("logged in");
    response.json().then(data => {
      usernameTitle.textContent = data.un; // done here so that user doesn't see change
    });
    return true;
  }
  else {
    console.log(response);
    return false;
  }
}

// page functionality


// generating this is common to both types of view

const createShelf = (shelfData) => {
  // used to easily create many SHELVES during page load

  // div for the shelf
  const newShelfDiv = document.createElement("div");
  newShelfDiv.classList.add("shelf");

  const newShelfName = document.createElement("h2");
  newShelfName.textContent = (`${shelfData.name}`);
  newShelfDiv.appendChild(newShelfName);

  return newShelfDiv;
}

const createShelfBook = (bookData) => {
  // used to easily create many BOOKS during page load

  // div for the book
  const newBookDiv = document.createElement("div");
  newBookDiv.classList.add("book-div");
  newBookDiv.setAttribute('book-id', bookData._id);

  const newBookCoverImg = document.createElement("img");
  newBookCoverImg.classList.add("cover-img");
  newBookCoverImg.src = bookData.thumbnail;
  newBookCoverImg.alt = (`Author: ${bookData.author} - Title: ${bookData.title}`);


  //assemble elements
  newBookDiv.appendChild(newBookCoverImg);

  return newBookDiv;
}