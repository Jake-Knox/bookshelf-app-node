console.log("bookshelf");

// js for all users accessing any bookshelf - loads data from database, nothing editable

const usernameTitle = document.getElementById("usernameTitle");

const followingCount = document.getElementById("followingCount");
const followersCount = document.getElementById("followersCount");

const shelvesCount = document.getElementById("shelvesCount");







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

const setupUserElements = (dataArray) => {
  console.log(dataArray);

  // display user data setup
  // usernameTitle.textContent = dataArray.username;
  followingCount.textContent = (`Following: ${dataArray.following.length}`);
  followersCount.textContent = (`Following: ${dataArray.followers.length}`);

  // books stuff
  booksCount.textContent = (`Books: ${dataArray.books.length}`);

  //shelves setup
  shelvesCount.textContent = (`Shelves: ${dataArray.shelves.length}`);
  for(let i = 0; i < dataArray.shelves.length; i++)
  {
    // for every shelf
    console.log(`shelf:${i}`);

    for(let j = 0; j < dataArray.shelves[i].books.length; j++)
    {
    // for every book on shelf i 
    console.log(`book:${j} on shelf:${i}`);
    }

  }
}
