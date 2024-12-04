document.addEventListener("DOMContentLoaded", () => {
    const followButton = document.querySelector("button.follow");
    const unfollowButton = document.querySelector("button.unfollow");
  
    const handleFollow = async (profileId) => {
      try {
        const response = await fetch(`/profile/follow/${profileId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
  
        if (response.ok) {
          followButton.textContent = "Unfollow";
          followButton.classList.remove("follow");
          followButton.classList.add("unfollow");
          followButton.removeEventListener("click", onFollowClick);
          followButton.addEventListener("click", onUnfollowClick);
        } else {
          console.error("Error following the user.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
  
    const handleUnfollow = async (profileId) => {
      try {
        const response = await fetch(`/profile/unfollow/${profileId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
  
        if (response.ok) {
          unfollowButton.textContent = "Follow";
          unfollowButton.classList.remove("unfollow");
          unfollowButton.classList.add("follow");
          unfollowButton.removeEventListener("click", onUnfollowClick);
          unfollowButton.addEventListener("click", onFollowClick);
        } else {
          console.error("Error unfollowing the user.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
  
    const onFollowClick = (e) => {
      const profileId = e.target.getAttribute("data-profile-id");
      handleFollow(profileId);
    };
  
    const onUnfollowClick = (e) => {
      const profileId = e.target.getAttribute("data-profile-id");
      handleUnfollow(profileId);
    };
  
    if (followButton) followButton.addEventListener("click", onFollowClick);
    if (unfollowButton) unfollowButton.addEventListener("click", onUnfollowClick);
  });
  