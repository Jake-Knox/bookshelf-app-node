console.log("following/followers");

const bookshelfOwner = document.getElementById("bookshelfOwner");
const bookshelfOwnerName = bookshelfOwner.value;

const usernameTitle = document.getElementById("usernameTitle");

const follows = {
    following: [],
    followers: [],
}


document.addEventListener('DOMContentLoaded', () => {
    //set name
    usernameTitle.textContent = bookshelfOwnerName;

    //
    getFollows();

});


const getFollows = async () => {
    try {
        const response = await fetch(`/getFollows/${ownerName}`, {
            method: 'GET'
        });
        // response from server
        if (response.ok) {
            const userData = await response.json();
            // console.log(userData);

            follows.following = userData.following;
            follows.followers = userData.followers;

            console.log(follows.following);
            console.log(follows.followers);



            // bookshelfData = userData.data; // used to set up elements and fill shelves    
            // setupUserElements(bookshelfData); // comment to stop trying to use db data

        }
        else {
            console.error('Error in response getting user bookshelf:', response.statusText);
            toggleNoUserFound();
        }
    }
    catch (error) {
        console.error('Error in try getting user bookshelf:', error);
    }
}

















// for lists
$(document).ready(function () {
    $("#btnFollowing").click(function () {
        // $(".follow-switch-content").animate({ marginLeft: "0%" }, 500);
        $(".following-list").addClass("active-tab-content").removeClass("inactive-tab-content");
        $(".followers-list").addClass("inactive-tab-content").removeClass("active-tab-content");
        $("#btnFollowing").addClass("active-tab").removeClass("inactive-tab");
        $("#btnFollowers").addClass("inactive-tab").removeClass("active-tab");
    });

    $("#btnFollowers").click(function () {
        // $(".follow-switch-content").animate({ marginLeft: "-100%" }, 500);
        $(".following-list").addClass("inactive-tab-content").removeClass("active-tab-content");
        $(".followers-list").addClass("active-tab-content").removeClass("inactive-tab-content");
        $("#btnFollowers").addClass("active-tab").removeClass("inactive-tab");
        $("#btnFollowing").addClass("inactive-tab").removeClass("active-tab");
    });
});