
console.log("login");

// Step 1: Define the authentication endpoint on the server-side

// Step 2: Add event listener to the login button
const loginButton = document.getElementById('loginButton');
loginButton.addEventListener('click', () => {
  // Step 3: Send a request to the authentication endpoint to authenticate the user
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // check that this bit is right
  fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then(response => {
      if (response.ok) {
        // Authentication successful
        console.log('User authenticated');
        // Step 3: Store a token or session information on the client-side
        // e.g., store token in local storage or set a cookie
        // ...

        // Redirect to protected page or perform other actions
        // ...
      } else {
        // Authentication failed
        console.error('Authentication failed');
        // Handle failed authentication, display error message, etc.
      }
    })
    .catch(error => {
      console.error('Error during authentication:', error);
      // Handle error case, display error message, etc.
    });
});

// Step 4: Implement authentication middleware for protected routes on the server-side
// ...

// Step 5: Protect routes using the authentication middleware
// ...