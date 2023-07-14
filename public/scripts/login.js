
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

const loginComplete = async () => {
  // cookies or similar to track user
  console.log('Login successful');
  console.log('session check');

  const response = await fetch('/checkSession', {
    method: 'POST'
  });
  if (response.ok) {
    // Logout successful
    console.log("logged in");
  }
  else{
      console.log(response);
  }
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


