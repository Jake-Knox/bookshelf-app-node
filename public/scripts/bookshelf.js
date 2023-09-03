console.log("bookshelf");

const usernameTitle = document.getElementById("usernameTitle")




document.addEventListener('DOMContentLoaded', () => {
    // fetch('/getmybooks')
    //   .then(response => response.json())
    //   .then(data => {
    //     const shelvesDiv = document.getElementById('shelves');
    //     // const newestBooks = data.slice(0, 5); // Get the newest 5 books

    //     // insert html from books retrieved
    //     data.forEach(datum => {
    //     //   const listItem = document.createElement('li');
    //     //   let bookData = (`${book.isbn} ${book.author} ${book.title}`);
    //     //   listItem.textContent = bookData;
    //     //   bookList.appendChild(listItem);
    //     console.log(datum);
    //     });
    //     })
    // .catch(error => console.error('Error loading books:', error));

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