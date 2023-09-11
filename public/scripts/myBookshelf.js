console.log("my bookshelf");

// js for added editing features for a user on thier own bookshelf

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchResults = document.getElementById("search-results");
const bookResults = document.getElementById("book-results");
const ResultsBtns = document.getElementById("results-btns");
const backBtn = document.getElementById("back-btn");
const addBtn = document.getElementById("add-btn");


document.addEventListener('DOMContentLoaded', () => {

  getMyBooks();

});


searchBtn.addEventListener("click", () => {

    console.log("search btn");
  
  
  });
  
  backBtn.addEventListener("click", () => {
  
    console.log("back btn");
  
  
  });
  
  addBtn.addEventListener("click", () => {
  
    console.log("add btn");
  
    // editDatabase();
    // alert("Database has been updated");
    alert("NOT connected to update code");
  
  });
    



// shelves can be added to based on books in collection

// no reading/to read - will be done as default shelves
//

// make changes here
// lets sort the db out now before carrying on

const getMyBooks = async () => {

  if(checkSession())
  {
    const response = await fetch('/getmybooks', {
      method: 'POST'
    });
    if (response.ok) {
      // Logout successful
      // console.log("logged in at getmybooks response");
      response.json()
      .then(userData => {

        // console.log(data.data);
        console.log("retirved data");
        setupUserElements(userData.data);

      });      
    }
    else{
        console.log("something off in getmybooks");
        console.log(response);
    }
  }
  else{
    console.log("not logged in")
    // do something here
    // redirect or something
  }  
}

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
  