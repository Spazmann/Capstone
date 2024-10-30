document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the user's liked posts from the global variable
    const userLikedPosts = window.userLikes || [];
  
    document.querySelectorAll('.like-button').forEach(button => {
      const postId = button.getAttribute('data-post-id');
  
      // Pre-set liked class if postId is in userLikedPosts
      if (userLikedPosts.includes(postId)) {
        button.classList.add('liked');
      }
  
      button.addEventListener('click', async (event) => {
        // Disable the button to prevent spamming
        button.disabled = true;
  
        const isLiked = button.classList.contains('liked');
  
        try {
          // Toggle like/unlike request
          const response = await fetch(`/post/like/${postId}`, {
            method: isLiked ? 'DELETE' : 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
  
          if (!response.ok) {
            throw new Error(`Failed to toggle like for post with ID: ${postId}`);
          }
  
          const result = await response.json();
  
          // Update the like count and button appearance based on response
          const likeCountElement = button.querySelector('.like-count');
          if (likeCountElement) {
            const currentLikes = parseInt(likeCountElement.textContent.trim()) || 0;
            likeCountElement.textContent = isLiked ? ` ${currentLikes - 1}` : ` ${currentLikes + 1}`;
          }
  
          // Toggle the 'liked' class and re-enable the button
          button.classList.toggle('liked');
        } catch (error) {
          console.error("Error toggling like:", error);
        } finally {
          button.disabled = false;
        }
      });
    });
  });
  