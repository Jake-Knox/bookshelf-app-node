// Create Form Submission
document.getElementById('createForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const isbn = document.getElementById('isbn').value;
    
    console.log("create");
    // Perform your create book logic using fetch or other methods
    // ...
  });
  
  // Read Form Submission
  document.getElementById('readForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission
    const isbn = document.getElementById('readIsbn').value;
    
    console.log("read");
    // Perform your read book logic using fetch or other methods
    // ...
  });
  
  // Update Form Submission
  document.getElementById('updateForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission
    const isbn = document.getElementById('updateIsbn').value;
    const newTitle = document.getElementById('newTitle').value;
    const newAuthor = document.getElementById('newAuthor').value;
    
    console.log("update");
    // Perform your update book logic using fetch or other methods
    // ...
  });
  
  // Delete Form Submission
  document.getElementById('deleteForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission
    const isbn = document.getElementById('deleteIsbn').value;
    
    console.log("delete");
    // Perform your delete book logic using fetch or other methods
    // ...
  });