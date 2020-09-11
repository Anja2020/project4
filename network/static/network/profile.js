document.addEventListener("DOMContentLoaded", () => {

    // Show profile of current user
    document.querySelector("#profile-button").addEventListener("click", () => {
        load_profile();
    });

    load_profile();

});

function load_following_posts() {

    const postsContainer = document.querySelector("#posts-list");
    postsContainer.innerHTML = "";

    // Send GET request for a all following posts
    fetch(`/posts/follow`)
        .then((response) => response.json())
        .then((posts) => {
            posts.forEach((post) => {
                display_post(post, postsContainer);
            });
        });
}

function display_post(post, postsContainer) {
    // Create div element for each post and set styling properties
    const card = document.createElement("div");
    card.setAttribute("class", "card border-primary mb-3");

    const cardBody = document.createElement("div");
    cardBody.setAttribute("class", "card-body");

    const editButton = document.createElement("div");
    editButton.setAttribute("class", "btn btn-outline-primary");
    editButton.innerHTML = "Edit";

    const cardTitle = document.createElement("div");
    cardTitle.setAttribute("class", "card-title");
    cardTitle.innerHTML = `<button id="user-link" class="btn btn-link"> ${post.user[1]} </button>`;

    cardTitle.addEventListener("click", () => {
        const username = post.user[1];
        load_profile(username);
        return false;
    });

    const cardText = document.createElement("p");
    cardText.setAttribute("class", "card-text");
    cardText.innerHTML = post.text;

    const likes = document.createElement("div");
    likes.setAttribute = ("id", "liket-count")
    likes.innerHTML = `Likes: ${post.likes.length}`;

    const likeToggle = document.createElement("a");
    likeToggle.setAttribute("class", "btn btn-outline-dark");
    const likeIcon = `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-heart-fill" 
                            fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                            d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"
                            />
                        </svg> Like`;
    likeToggle.innerHTML = likeIcon;
    likeToggle.addEventListener("click", () => {
        create_like(post.id, likes, likeToggle, unlikeToggle);
        return false;
    });

    const unlikeToggle = document.createElement("a");
    unlikeToggle.setAttribute("class", "btn btn-outline-dark");
    const unlikeIcon = `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-heart" 
                            fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                            d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"
                            />
                        </svg> Unlike`;
    unlikeToggle.innerHTML = unlikeIcon;
    unlikeToggle.addEventListener("click", () => {
        delete_like(post.id, likes, likeToggle, unlikeToggle);
        return false;
    });

    likeToggle.style.display = "block";
    unlikeToggle.style.display = "block";
    is_liked(post.id, likeToggle, unlikeToggle);

    cardBody.appendChild(cardTitle);
    cardBody.appendChild(editButton);
    cardBody.appendChild(cardText);
    cardBody.appendChild(likeToggle);
    cardBody.appendChild(unlikeToggle);
    cardBody.appendChild(likes);

    const cardFooter = document.createElement("div");
    cardFooter.setAttribute("class", "card-footer");
    cardFooter.innerHTML = `<small class="text-muted">${post.created_at}</small>`;

    // Append data div elements of a post to its parent div
    card.appendChild(cardBody);
    card.appendChild(cardFooter);

    postsContainer.appendChild(card);
}


function is_liked(postId, likeToggle, unlikeToggle) {
    fetch(`posts/${postId}/liked`)
        .then((response) => response.json())
        .then((result) => {
            if ("error" in result) {
                console.log(result);
            } else {
                if (result.like == "none") {
                    likeToggle.style.display = "block";
                    unlikeToggle.style.display = "none";
                } else {
                    likeToggle.style.display = "none";
                    unlikeToggle.style.display = "block";
                }
            }
        });
}


function create_like(postId, likes, likeToggle, unlikeToggle) {
    // send POST request
    fetch(`/likes`, {
        method: "POST",
        body: JSON.stringify({
            postId: postId
        }),
    })
        .then((response) => response.json())
        .then((result) => {
            if ("error" in result) {
                console.log(result);
            } else {
                likeToggle.style.display = "none";
                unlikeToggle.style.display = "block";
                likes.innerHTML = `Likes: ${result.length}`;
            }
            console.log(result);
        });
}


function delete_like(postId, likes, likeToggle, unlikeToggle) {
    fetch(`likes/delete`, {
        method: "DELETE",
        body: JSON.stringify({
            postId: postId
        }),
    })
        .then((response) => response.json())
        .then((result) => {
            if ("error" in result) {
                console.log(result);
            } else {
                likeToggle.style.display = "block";
                unlikeToggle.style.display = "none";
                likes.innerHTML = `Likes: ${result.length}`;
            }
        });
}


function load_profile(username = "") {
    document.querySelector("#follow").style.display = "none";
    document.querySelector("#unfollow").style.display = "none";


    if (username != "") {
        username = username;
        apiRoute = `users/${username}`;

        document.querySelector("#follow").addEventListener("click", () => {
            follow_user(username);
            return false;
        });
        document.querySelector("#unfollow").addEventListener("click", () => {
            unfollow_user(username);
            return false;
        });

    } else if (username == "") {
        document.querySelector("#user-posts").innerHTML = "";
        apiRoute = "user";
    }

    fetch(apiRoute)
        .then((response) => response.json())
        .then((user) => {
            document.querySelector("#user").innerHTML = user.username;

            if (username != "") {
                is_following(user.username);
            }

            const numberFollower = user.follower.length;
            document.querySelector("#follower").innerHTML = `Number of Followers: ${numberFollower}`;
            const numberFollowings = user.following.length;
            document.querySelector("#following").innerHTML = `Number of Follwings: ${numberFollowings}`;
            console.log("load poasts");
            load_user_posts(user.username);
        });

}


function is_following(username) {
    fetch(`users/${username}/following`)
        .then((response) => response.json())
        .then((result) => {
            if ("error" in result) {
                console.log(result);
            } else {
                if (result.following == "self") {
                    document.querySelector("#follow").style.display = "none";
                    document.querySelector("#unfollow").style.display = "none";
                } else if (result.following == true) {
                    document.querySelector("#follow").style.display = "none";
                    document.querySelector("#unfollow").style.display = "block";
                } else {
                    document.querySelector("#follow").style.display = "block";
                    document.querySelector("#unfollow").style.display = "none";
                }
            }
        });
}


function follow_user(username) {
    // send POST request
    fetch(`/users/${username}/follow`, {
        method: "POST",
    })
        .then((response) => response.json())
        .then((result) => {
            if ("error" in result) {
                console.log(result);
            } else {
                document.querySelector("#follow").style.display = "none";
                document.querySelector("#unfollow").style.display = "block";
                document.querySelector("#follower").innerHTML = `Number of Followers: ${result.length}`;
            }
        });
}


function unfollow_user(username) {
    // send POST request
    fetch(`/users/${username}/unfollow`, {
        method: "DELETE",
    })
        .then((response) => response.json())
        .then((result) => {
            if ("error" in result) {
                console.log(result);
            } else {
                document.querySelector("#follow").style.display = "block";
                document.querySelector("#unfollow").style.display = "none";
                document.querySelector("#follower").innerHTML = `Number of Followers: ${result.length}`;
            }
        });
}


function load_user_posts(username) {
    fetch(`posts/users/${username}`)
        .then((response) => response.json())
        .then((posts) => {
            postsContainer = document.querySelector("#user-posts");

            posts.forEach((post) => {
                display_post(post, postsContainer);
            });
        });
}
