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
    try {
        const response = await fetch('/getmybooks', {
          method: 'POST',
        })
        .then(response => response.json())
        .then(data => { 
            
            console.log(data)

            
        });        
      } catch (error) {
        console.error('Error:', error);
      }
  }