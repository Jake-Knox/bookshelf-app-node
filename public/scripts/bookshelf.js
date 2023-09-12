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
  else{
      console.log(response);
      return false;
  }
}

// page functionality


