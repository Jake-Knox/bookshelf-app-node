console.log("other bookshelf");

const containerDiv = document.getElementById("containerDiv");
const noUserContainerDiv = document.getElementById("noUserContainerDiv");

const bookshelfOwner = document.getElementById("bookshelfOwner");
const ejsData = document.getElementById("ejsData");
const bookshelfOwnerName = bookshelfOwner.value;
const ejsDataVal = ejsData.value;

const privacyNotice = document.getElementById("privacyNotice");
const btnFollow = document.getElementById("btnFollow");

let followingPage = false;
let bookshelfData = [];

// bool
let followingUser;

document.addEventListener('DOMContentLoaded', () => {
  setupFollowButton(bookshelfOwnerName);

  getUserBookshelf(bookshelfOwnerName);
});



const setupFollowButton = async (ownerName) => {
  try {
    const response = await fetch(`/userAFollowingB/${ownerName}`, {
      method: 'GET'
    });
    // response from server
    if (response.ok) {
      const data = await response.json();
      followingPage = data.data;
      console.log("following this page:", followingPage);
    }
    else {
      console.error('Error in try user A following B:', response.statusText);
    }
  }
  catch (error) {
    console.error('Error in try user A following B:', error);
  }

  console.log("Following:", followingPage);

  if (followingPage) {
    // Already following
    btnFollow.textContent = "Unfollow";
    btnFollow.classList.toggle("unfollow");
  }
  else {
    // not following
    btnFollow.textContent = "Follow";
    btnFollow.classList.toggle("follow");
  }
}


const getUserBookshelf = async (ownerName) => {

  try {
    const response = await fetch(`/getUserBookshelf/${ownerName}`, {
      method: 'GET'
    });
    // response from server
    if (response.ok) {
      const userData = await response.json();
      console.log("retirved data");
      bookshelfData = userData.data; // used to set up elements and fill shelves    
      setupUserElements(bookshelfData); // comment to stop trying to use db data
    }
    else {
      console.error('Error in response getting user bookshelf:', response.statusText);
      toggleNoUserFound();
    }
  }
  catch (error) {
    console.error('Error in try getting user bookshelf:', error);
  }
}



const setupUserElements = (bookshelfData) => {
  console.log(bookshelfData);

  // render content that loads no matter what
  usernameTitle.textContent = (bookshelfData.username);



  if (bookshelfData.privacy == "private") {
    // console.log("Bookshelf is private - limited content to render");
    privacyNotice.textContent = ("This Bookshelf is Private");
    followingCount.innerHTML = (`<p class="light"><b>${bookshelfData.following.length}</b> Following</p>`);
    followersCount.innerHTML = (`<p class="light"><b>${bookshelfData.followers.length}</b> Followers</p>`);

    btnFollow.textContent = "Follow";
    btnFollow.classList.add("follow");
  }
  else {
    // console.log("Bookshelf is public - more content to render");

    // send to rigth route
    followingCount.innerHTML = (`<a href="/following/${bookshelfOwnerName}" ><p class="light"><b>${bookshelfData.following.length}</b> Following</p></a>`);
    followersCount.innerHTML = (`<a href="/following/${bookshelfOwnerName}" ><p class="light"><b>${bookshelfData.followers.length}</b> Followers</p></a>`);

    //shelves setup
    shelvesData = bookshelfData.shelves;

    // order the shelves correctly
    const shelvesDataSorted = shelvesData;
    shelvesDataSorted.sort((a, b) => a.order - b.order);

    for (let i = 0; i < shelvesDataSorted.length; i++) {
      shelvesDataSorted[i].books.sort((a, b) => a.order - b.order);
    }

    shelvesCount.textContent = (`Shelves: ${shelvesData.length}`);
    for (let i = 0; i < shelvesData.length; i++) {
      // for every shelf
      // console.log(`shelf:${i}`);

      const newShelf = createShelf(shelvesData[i]);

      const newShelfBooks = document.createElement("div");
      newShelfBooks.classList.add("shelf-books");

      for (let j = 0; j < shelvesData[i].books.length; j++) {
        // for every book on shelf i 
        // console.log(`shelf:${i}, book:${j} `);

        const newBook = createShelfBook(shelvesData[i].books[j]);

        // add the new book the the shelf
        newShelfBooks.appendChild(newBook);
      }

      //add the new shelf to the shelves div
      newShelf.appendChild(newShelfBooks);
      shelves.appendChild(newShelf);

    }
  }
}

const toggleNoUserFound = () => {
  containerDiv.style.display = "none";
  noUserContainerDiv.style.display = "block";
}


btnFollow.addEventListener("click", () => {
  if (btnFollow.classList.contains("follow")) {
    btnFollow.textContent = "Unfollow";
    // send follow to backend
    followShelf();
  }
  else if (btnFollow.classList.contains("unfollow")) {
    btnFollow.textContent = "Follow";
    // send unfollow to backend
    unfollowShelf();
  }

  btnFollow.classList.toggle("follow");
  btnFollow.classList.toggle("unfollow");
});

const toggleFollowBtn = () => {

}


const followShelf = async () => {
  console.log("follow click");
  const followUser = bookshelfOwnerName;

  // send to backend
  try {
    const response = await fetch('/followShelf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ followUser }),
    });
    if (response.ok) {
      // alertReload();
      const data = await response.json();
      const message = data.message;
      alert(message);
      toggleFollowBtn();
    } else {
      alert("Error: response not ok");
      console.error('Failed: ', response.statusText);
    }
  } catch (error) {
    alert("Error: cannot follow user?");
    console.error('Error: ', error);
  }
}

const unfollowShelf = async () => {
  console.log("unfollow click");
  const unfollowUser = bookshelfOwnerName;

  // send to backend
  try {
    const response = await fetch('/unfollowShelf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ unfollowUser }),
    });
    if (response.ok) {
      // alertReload();
      const data = await response.json();
      const message = data.message;
      alert(message);
      toggleFollowBtn();
    } else {
      alert("Error: response not ok");
      console.error('Failed: ', response.statusText);
    }
  } catch (error) {
    alert("Error: cannot unfollow user?");
    console.error('Error: ', error);
  }
}

