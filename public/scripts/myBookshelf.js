console.log("my bookshelf");

// js for added editing features for a user on thier own bookshelf

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchResults = document.getElementById("search-results");
const bookResults = document.getElementById("book-results");
const ResultsBtns = document.getElementById("results-btns");
const backBtn = document.getElementById("back-btn");
const addBtn = document.getElementById("add-btn");


searchBtn.addEventListener("click", () => {

    console.log("search btn");
  
  
  });
  
  backBtn.addEventListener("click", () => {
  
    console.log("back btn");
  
  
  });
  
  addBtn.addEventListener("click", () => {
  
    console.log("add btn");
  
    // addBookTest();
  
  });
    
  const addBookTest = async () => {
  
    const test = "test";
  
    try {
      const response = await fetch('/adddabook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test }),
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
  