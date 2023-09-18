console.log("other bookshelf");

const containerDiv = document.getElementById("containerDiv");
const noUserContainerDiv = document.getElementById("noUserContainerDiv");
const bookshelfOwner = document.getElementById("bookshelfOwner");
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

  if(bookshelfData.privacy == "private")
  {
    console.log("Bookshelf is private - limited content to render");

  }
  else{
    console.log("Bookshelf is public - more content to render");

  }

  // render content that is limited by array length




 } 


const toggleNoUserFound = () => {
    containerDiv.style.display = "none";
    noUserContainerDiv.style.display = "block";
}