console.log("profile page");

const usernameTitle = document.getElementById("usernameTitle")


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
    else{
        console.log(response);
        return false;
    }
}

const setContentUser = (username, following, followers) => {

}