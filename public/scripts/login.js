
console.log("login page");

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');


// login

// user123
// password123

const loginButton = document.getElementById("loginButton");
loginButton.addEventListener("click", () => {
  // console.log("login click")

  const username = usernameInput.value;
  const password = passwordInput.value;

  if(loginInputChech(username,password)){
    loginUser(username, password);
  }

});

const loginInputChech = (username, password) => {

  if(username == "" || password == "")
  {
    showError("Enter a username and password");
    return false;
  }
  else
  {
    return true;
  }
}

const showError = (errorMsg) => {
  errorMessage.textContent = (`Error: ${errorMsg}`);

  if(errorMessage.classList.contains("hide") == true) {
    errorMessage.classList.toggle("hide");  
  }
}

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
      showError(`Failed to log in: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error logging in:', error);
    showError(`Error logging in: ${error}`);

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

    // go to my profile page
    window.location.href = '/profile';

  }
  else{
      console.log(response);
  }
}


// register

const registerButton = document.getElementById("registerButton");
registerButton.addEventListener("click", () => {
  // console.log("register click")

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
      showError(`Failed to add user: ${response.statusText}`);

    }
  } catch (error) {
    console.error('Error adding user:', error);
    showError(`Error adding user: ${error}`);

  }
};


