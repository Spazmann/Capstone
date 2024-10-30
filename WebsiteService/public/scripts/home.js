document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.like-button').forEach(button => {
      button.addEventListener('click', async (event) => {
        const postId = button.getAttribute('data-post-id');
  
        try {
          const response = await fetch(`/post/like/${postId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
  
          if (!response.ok) {
            throw new Error(`Failed to like post with ID: ${postId}`);
          }
  
          const result = await response.json();
  
          // Update the like count only after a successful response
          const likeCountElement = button.querySelector('.like-count');
          if (likeCountElement) {
            let currentLikes = parseInt(likeCountElement.textContent) || 0;
            likeCountElement.textContent = " " + (currentLikes + 1);
          }
  
          // Add the 'liked' class to turn the heart icon red
          button.classList.add('liked');
        } catch (error) {
          console.error("Error liking post:", error);
        }
      });
    });
  });
  