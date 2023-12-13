console.log("following/followers");

const bookshelfOwner = document.getElementById("bookshelfOwner");
const bookshelfOwnerName = bookshelfOwner.value;
const usernameTitle = document.getElementById("usernameTitle");

const followingList = document.getElementById("followingList");
const followersList = document.getElementById("followersList");


let follows = {
    following: [],
    followers: [],
}


document.addEventListener('DOMContentLoaded', () => {
    //set name
    usernameTitle.textContent = bookshelfOwnerName;

    //
    getFollows(bookshelfOwnerName);

});


const getFollows = async (bookshelfOwnerName) => {
    try {
        const response = await fetch(`/getFollows/${bookshelfOwnerName}`, {
            method: 'GET'
        });
        // response from server
        if (response.ok) {
            const userData = await response.json();

            console.log(userData.data);
            // console.log(userData.data.following);
            // console.log(userData.data.followers);

            follows.following = userData.data.following;
            follows.followers = userData.data.followers;
            // console.log(follows.following);
            // console.log(follows.followers);

            generateFollowLists();
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

const generateFollowLists = () => {
    // console.log(follows.following.length);
    // console.log(follows.followers.length);

    follows.following.forEach(following => {
        // console.log(following);

        const newFollowing = createFollow(following);
        followingList.appendChild(newFollowing);

    });

    follows.followers.forEach(follower => {
        // console.log(follower);

        const newFollower = createFollow(follower);
        followersList.appendChild(newFollower);
    });
};

const createFollow = (followName) => {

    const followItem = document.createElement("li");
    followItem.classList.add("follow-item");

    const followLink = document.createElement("a");
    followLink.href = (`/bookshelf/${followName}`);
    followLink.textContent = (followName);

    followItem.append(followLink);

    return followItem;
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