console.log("index");

document.addEventListener('DOMContentLoaded', () => {
    fetch('/books')
      .then(response => response.json())
      .then(data => {
        const bookList = document.getElementById('bookList');
        const newestBooks = data.slice(0, 5); // Get the newest 5 books

        // insert html from books retrieved
        newestBooks.forEach(book => {
          const listItem = document.createElement('li');
          let bookData = (`${book.isbn} ${book.author} ${book.title}`);
          listItem.textContent = bookData;
          bookList.appendChild(listItem);
        });
      })
      .catch(error => console.error('Error loading books:', error));
  });