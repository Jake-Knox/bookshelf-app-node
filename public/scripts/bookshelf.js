console.log("bookshelf");

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

    getBooks();
  });

  const getBooks = async () => {

    if(checkSession())
    {
      const response = await fetch('/getmybooks', {
        method: 'POST'
      });
      if (response.ok) {
        // Logout successful
        console.log("logged in at getmybooks response");
        console.log(response.data);
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
      return true;
    }
    else{
        console.log(response);
        return false;
    }
  }