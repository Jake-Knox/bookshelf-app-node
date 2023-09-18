console.log("register page");

// register

const registerButton = document.getElementById("registerButton");
registerButton.addEventListener("click", () => {

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const password2 = document.getElementById('password2').value;

  if(password == password2){
    addUser(username, password);
  }
  else{
    showError(`Error: Passwords must match`);
  }

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
      registerComplete();
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

const showError = (errorMsg) => {
  errorMessage.textContent = (`Error: ${errorMsg}`);

  if(errorMessage.classList.contains("hide") == true) {
    errorMessage.classList.toggle("hide");  
  }
}