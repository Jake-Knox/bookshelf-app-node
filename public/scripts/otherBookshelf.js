console.log("other bookshelf");

const containerDiv = document.getElementById("containerDiv");
const noUserContainerDiv = document.getElementById("noUserContainerDiv");

const bookshelfOwner = document.getElementById("bookshelfOwner");
const bookshelfOwnerName = bookshelfOwner.value;

document.addEventListener('DOMContentLoaded', () => {
    if(true)
    {       
        console.log(`Page owner - ${bookshelfOwnerName}`);
        getUserBookshelf(bookshelfOwnerName)
    }
    else{
        console.log("not logged in")
        // do something here
        // redirect or something
    }   
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
        console.log(userData.data);
    
        // setupUserElements(bookshelfData); // comment to stop trying to use db data
        
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

const toggleNoUserFound = () => {
    containerDiv.style.display = "none";
    noUserContainerDiv.style.display = "block";
}