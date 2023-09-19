console.log("other bookshelf");

const containerDiv = document.getElementById("containerDiv");
const noUserContainerDiv = document.getElementById("noUserContainerDiv");
const bookshelfOwner = document.getElementById("bookshelfOwner");
const privacyNotice = document.getElementById("privacyNotice");

const bookshelfOwnerName = bookshelfOwner.value;

let bookshelfData = [];

document.addEventListener('DOMContentLoaded', () => {

  getUserBookshelf(bookshelfOwnerName);
      
});

const getUserBookshelf = async (ownerName) => {
  
    try{
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



  if(bookshelfData.privacy == "private")
  {
    // console.log("Bookshelf is private - limited content to render");
    privacyNotice.textContent = ("This Bookshelf is Private");

  }
  else{
    // console.log("Bookshelf is public - more content to render");

    followingCount.textContent = (`Following: ${bookshelfData.following.length}`);
    followersCount.textContent = (`Following: ${bookshelfData.followers.length}`);

    // render content that is limited by array length

    //shelves setup
    shelvesData = bookshelfData.shelves;

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
 } 

const toggleNoUserFound = () => {
    containerDiv.style.display = "none";
    noUserContainerDiv.style.display = "block";
}