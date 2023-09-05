console.log("bookshelf");

const usernameTitle = document.getElementById("usernameTitle");

// search-input, search-btn, search-results, book-results, results-btns, back-btn, add-btn

const addBtn = document.getElementById("add-btn");




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

          console.log(userData.data);

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
        usernameTitle.textContent = data.un;
      });
      return true;
    }
    else{
        console.log(response);
        return false;
    }
  }

// page functionality