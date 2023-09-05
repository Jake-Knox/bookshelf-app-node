console.log("bookshelf");

const usernameTitle = document.getElementById("usernameTitle");
const followingCount = document.getElementById("followingCount");
const followersCount = document.getElementById("followersCount");

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchResults = document.getElementById("search-results");
const bookResults = document.getElementById("book-results");
const ResultsBtns = document.getElementById("results-btns");
const backBtn = document.getElementById("back-btn");
const addBtn = document.getElementById("add-btn");

const shelvesCount = document.getElementById("shelvesCount");



// loading ititial content

document.addEventListener('DOMContentLoaded', () => {

    getMyBooks();

  });

  const getMyBooks = async () => {

    if(checkSession())
    {
      const response = await fetch('/getmybooks', {
        method: 'POST'
      });
      if (response.ok) {
        // Logout successful
        console.log("logged in at getmybooks response");
        response.json()
        .then(userData => {
          // console.log(data.data);
          console.log("retirved data");

          setupUserElements(userData.data)

          // func to generate content based on database pull 
          // move this to a seprate func

          // const bookList = document.getElementById('bookList');
          // const filterTopFive = data.slice(0, 5); // Get the newest 5 books
  
          // insert html from books retrieved
          // newestBooks.forEach(book => {
          //   const listItem = document.createElement('li');
          //   let bookData = (`${book.isbn} ${book.author} ${book.title}`);
          //   listItem.textContent = bookData;
          //   bookList.appendChild(listItem);
          // });          
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

//shelves setup
shelvesCount.textContent = (`Shelves: ${dataArray.shelves.length}`);
for(let i = 0; i < dataArray.shelves.length; i++)
{
  // for every shelf
  console.log(`shelf:${i}`);

  for(let j = 0; j < dataArray.shelves[i].books; j++)
  {
  // for every book on shelf i 
  console.log(`book:${j} on shelf:${i}`);
  }

}


}