console.log("profile page");

const usernameTitle = document.getElementById("usernameTitle")

const logoutBtn = document.getElementById("logoutBtn");

document.addEventListener('DOMContentLoaded', () => {

  checkSession();

});

const checkSession = async () => {
  // cookies or similar to track user
  console.log('session check');

  const response = await fetch('/checkSession', {
    method: 'POST'
  });
  if (response.ok) {
    // Logout successful
    console.log("logged in");
    response.json().then(data => {
      usernameTitle.textContent = data.un;
    });
    return true;
  }
  else {
    console.log(response);
    return false;
  }
}

const setContentUser = (username, following, followers) => {

}

logoutBtn.addEventListener("click", async () => {
  console.log("logout click");

  try {
    const response = await fetch('/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      logoutComplete();
    } else {
      console.error('Failed to log in:', response.statusText);
      showError(`Failed to log in: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error logging in:', error);
    showError(`Error logging in: ${error}`);
  }
})

const logoutComplete = () => {
  alert("Logout Successful, redirecting you now.");
  window.location.href = '/';
}