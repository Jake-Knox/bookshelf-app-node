
console.log("login page");

// login

const loginButton = document.getElementById("loginButton");
loginButton.addEventListener("click", () => {
  console.log("login click")

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  loginUser(username, password);
});

const loginUser = async (username, password) => {
  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {  

      loginComplete();
      
      
    } else {
      console.error('Failed to log in:', response.statusText);
    }
  } catch (error) {
    console.error('Error logging in:', error);
  }
};

const loginComplete = () => {
  // cookies or similar to track user
  console.log('Login successful');

  console.log('session check');
  fetch('/checkSession', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(data => {
      // Handle the response data
      if (data.loggedIn) {
        // User is logged in
        console.log('User is logged in');
      } else {
        // User is not logged in
        console.log('User is not logged in');
      }
    })
    .catch(error => {
      // Handle any errors
      console.error('Error checking session:', error);
    });
}


// register

const registerButton = document.getElementById("registerButton");
registerButton.addEventListener("click", () => {
  console.log("register click")

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  addUser(username, password);
});

const addUser = async (username, password) => {
  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      console.log('User added successfully');
    } else {
      console.error('Failed to add user:', response.statusText);
    }
  } catch (error) {
    console.error('Error adding user:', error);
  }
};


