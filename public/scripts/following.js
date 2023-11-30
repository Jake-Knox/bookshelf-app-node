console.log("following/followers");

const bookshelfOwner = document.getElementById("bookshelfOwner");
const bookshelfOwnerName = bookshelfOwner.value;


const usernameTitle = document.getElementById("usernameTitle");


document.addEventListener('DOMContentLoaded', () => {
    //set name
    usernameTitle.textContent = bookshelfOwnerName;

});

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