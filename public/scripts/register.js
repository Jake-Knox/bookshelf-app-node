console.log("register page");



// register

const registerButton = document.getElementById("registerButton");
registerButton.addEventListener("click", () => {
  // console.log("register click")

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // start working again here 
  //   addUser(username, password);
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

const registerComplete = () => {
    console.log('Register successful');
  
    window.location.href = '/loginPage';
  }


