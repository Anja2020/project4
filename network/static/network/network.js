function create_post() {
    // Get required data for POST request
    const text = document.querySelector("#post-text").value;

    // Send POST request to create post
    fetch("/posts", {
        method: "POST",
        body: JSON.stringify({
            text: text,
        }),
    })
        .then((response) => response.json())
        .then((result) => {
            if ("error" in result) {
                document.querySelector("#error").style.display = "block";
                document.querySelector("#error").innerHTML = result.error;
            } else {
                document.querySelector("#error").style.display = "none";
                //load_all_posts();
            }
            // Clear out text field of post form
            document.querySelector("#post-text").value = "";
        });
}


function update_post(event) {

    event.preventDefault();

    post = event.target.dataset.post;
    const editButtons = document.querySelectorAll("#edit");

    editButtons.forEach(button => {
        button.disabled = true;
    });

    const postContent = document.getElementById(post);
    const textBefore = postContent.innerHTML;

    const form = document.createElement("form");
    const alert = `<div id="error-edit" class="alert alert-danger collapse" role="alert"></div>`;
    const textarea = `<textarea id="update-text" class="form-control" >`+ textBefore +`</textarea>`;
    const saveButton = `<input type="submit" class="btn btn-primary" value="Save"/>`;

    form.innerHTML = alert + textarea + saveButton;

    postContent.innerHTML = ""; 
    postContent.appendChild(form);

    form.onsubmit = () => {
        put_post(post, form, postContent, editButtons);
        return false;
    };
}


function put_post(post, form, postContent, editButtons) {
    // Get required data for POST request
    const text = document.querySelector("#update-text").value;
    console.log("test");

    // Send PUT request to create post
    fetch(`/posts/${post}`, {
        method: "PUT",
        body: JSON.stringify({
            text: text,
        }),
    })
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
            if ("error" in result) {
                document.querySelector("#error-edit").style.display = "block";
                document.querySelector("#error-edit").innerHTML = result.error;
            } else {
                form.style.display = "none";
                postContent.innerHTML = text;
                editButtons.forEach(button => {
                    button.disabled = false;
                });
            }
        });
}


function like(event) {

    const postId = event.target.dataset.post;

    fetch( `/posts/${postId}/like`, {
        method: "PUT",
    })
        .then((response) => response.json())
        .then((result) => {
            if ("error" in result) {
                console.log(result);
            } else {
                const likeToggle = event.target

                if (result.liked == "true") {
                    likeToggle.innerHTML = `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-heart" 
                                    fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd"
                                    d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"
                                    />
                                    </svg> Dislike`
                } else {
                    likeToggle.innerHTML = `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-heart-fill" 
                                    fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd"
                                    d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"
                                    />
                                    </svg> Like`
                }

                const likes = document.getElementById('likes-' + postId);
                likes.innerHTML = 'Likes: ' + result.likes;
            }
        });
}


function follow_user(event) {

    const username = event.target.dataset.user;

    // Send POST request to create a Follower
    fetch(`/users/${username}/follow`, {
        method: "POST",
    })
        .then((response) => response.json())
        .then((result) => {
            if ("error" in result) {
                console.log(result);
            } else {
                const unfollowButton = document.querySelector("#unfollow");
                const followers = document.querySelector("#follower");

                event.target.hidden = true;
                unfollowButton.hidden = false;

                // Update number of followers
                follower.innerHTML = `Number of Follower: ${result.length}`;
            }
        });
}


function unfollow_user(event) {

    const username = event.target.dataset.user;

    // Send DELETE request to delete a Follower
    fetch(`/users/${username}/unfollow`, {
        method: "DELETE",
    })
        .then((response) => response.json())
        .then((result) => {
            if ("error" in result) {
                console.log(result);
            } else {
                const followButton = document.querySelector("#follow");
                const followers = document.querySelector("#follower");

                event.target.hidden = true;
                followButton.hidden = false;

                // Update number of followers
                followers.innerHTML = `Number of Followers: ${result.length}`;
            }
        });
}
